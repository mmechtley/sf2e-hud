import { addListenerAll, settingPath, templatePath } from "foundry-pf2e";
import { hud } from "../../main";
import { PF2eHudSidebarActions } from "../sidebar/actions";
import { PF2eHudSidebar, SidebarEvent, SidebarName, SidebarSettings } from "../sidebar/base";
import { PF2eHudSidebarExtras } from "../sidebar/extras";
import { PF2eHudSidebarItems } from "../sidebar/items";
import { PF2eHudSidebarSkills } from "../sidebar/skills";
import { PF2eHudSidebarSpells } from "../sidebar/spells";
import { BaseActorContext, BaseActorRenderOptions, PF2eHudBaseActor } from "./actor";

const CLOSE_SETTINGS = ["closeOnSendToChat", "closeOnSpell", "closeOnSkill"] as const;

function makeAdvancedHUD<C extends abstract new (...args: any[]) => {}>(constructor: C) {
    abstract class PF2eHudAdvanced extends constructor {
        #sidebar: PF2eHudSidebar | null = null;

        abstract get sidebars(): HTMLElement | null;
        abstract get anchor(): AdvancedHudAnchor;

        get partials(): string[] {
            return [
                "stats_header",
                "stats_statistics",
                "stats_infos",
                "stats_speed",
                "stats_level",
                "stats_extras",
                "numbers",
                "slider",
                "sidebars",
                "three-steps",
            ];
        }

        getSettings(this: PF2eHudAdvanced & PF2eHudBaseActor) {
            const parentSettings = PF2eHudBaseActor.prototype.getSettings.call(this);

            const sharedSettings: SettingOptions[] = [
                {
                    key: "sidebarFontSize",
                    type: Number,
                    range: {
                        min: 10,
                        max: 30,
                        step: 1,
                    },
                    default: 14,
                    onChange: () => {
                        this.sidebar?.render();
                    },
                },
                {
                    key: "sidebarHeight",
                    type: Number,
                    range: {
                        min: 50,
                        max: 100,
                        step: 1,
                    },
                    default: 100,
                    onChange: () => {
                        this.sidebar?.render();
                    },
                },
                {
                    key: "multiColumns",
                    type: Number,
                    default: 5,
                    range: {
                        min: 1,
                        max: 5,
                        step: 1,
                    },
                    onChange: () => {
                        this.sidebar?.render();
                    },
                },
                {
                    key: "showAlliance",
                    type: Boolean,
                    default: false,
                    onChange: () => {
                        this.render();
                    },
                },
            ];

            return [
                ...parentSettings,
                ...sharedSettings.map((setting) => {
                    setting.scope = "client";
                    setting.name = settingPath("shared", setting.key, "name");
                    setting.hint = settingPath("shared", setting.key, "hint");

                    return setting;
                }),
            ];
        }

        get sidebar() {
            return this.#sidebar;
        }

        async _preFirstRender(
            context: ApplicationRenderContext,
            options: ApplicationRenderOptions
        ): Promise<void> {
            const thisSuper = constructor.prototype as PF2eHudBaseActor;
            await thisSuper._preFirstRender.call(this, context, options);

            const templates: Set<string> = new Set();

            for (const partial of this.partials) {
                const path = templatePath("partials", partial);
                templates.add(path);
            }

            await loadTemplates(Array.from(templates));
        }

        async _prepareContext(options: BaseActorRenderOptions): Promise<AdvancedContext> {
            const thisSuper = constructor.prototype as PF2eHudBaseActor;
            const context = (await thisSuper._prepareContext.call(
                this,
                options
            )) as AdvancedContext;
            context.partial = (key: string) => templatePath("partials", key);
            return context;
        }

        _onClose(this: PF2eHudAdvanced & PF2eHudBaseActor, options: ApplicationClosingOptions) {
            this.closeSidebar();
            const thisSuper = constructor.prototype as PF2eHudBaseActor;
            thisSuper._onClose.call(this, options);
        }

        abstract closeIf(event: AdvancedHudEvent): boolean;

        eventToSetting(event: AdvancedHudEvent): CloseSetting {
            switch (event) {
                case "cast-spell":
                    return "closeOnSpell";
                case "send-to-chat":
                    return "closeOnSendToChat";
                case "roll-skill":
                    return "closeOnSkill";
            }
        }

        closeSidebar(this: PF2eHudAdvanced & PF2eHudBaseActor) {
            this.#sidebar?.close();
            this.#sidebar = null;

            const sidebarElements = this.sidebars?.querySelectorAll<HTMLElement>("[data-sidebar]");
            for (const sidebarElement of sidebarElements ?? []) {
                sidebarElement.classList.remove("active");
            }
        }

        toggleSidebar(this: PF2eHudAdvanced & PF2eHudBaseActor, sidebar: SidebarName | null) {
            if (this.#sidebar?.key === sidebar) sidebar = null;

            this.closeSidebar();

            if (!sidebar) return;

            const otherHUD = this.key === "token" ? hud.persistent : hud.token;
            otherHUD.closeSidebar();
            otherHUD.close();

            switch (sidebar) {
                case "actions":
                    this.#sidebar = new PF2eHudSidebarActions(this);
                    break;
                case "extras":
                    this.#sidebar = new PF2eHudSidebarExtras(this);
                    break;
                case "items":
                    this.#sidebar = new PF2eHudSidebarItems(this);
                    break;
                case "skills":
                    this.#sidebar = new PF2eHudSidebarSkills(this);
                    break;
                case "spells":
                    this.#sidebar = new PF2eHudSidebarSpells(this);
                    break;
            }

            this.#sidebar.render(true);
        }
    }

    return PF2eHudAdvanced as C & (abstract new (...args: any[]) => IPF2eHudAdvanced);
}

function addSidebarsListeners(hud: IPF2eHudAdvanced, html: HTMLElement) {
    addListenerAll(html, "[data-action='open-sidebar']:not(.disabled)", (event, el) => {
        const sidebar = el.dataset.sidebar as SidebarName;
        const wasActive = el.classList.contains("active");

        hud.toggleSidebar(sidebar);

        const sidebarElements = (el.parentElement as HTMLElement).querySelectorAll<HTMLElement>(
            "[data-sidebar]"
        );

        for (const sidebarElement of sidebarElements) {
            sidebarElement.classList.toggle(
                "active",
                sidebarElement.dataset.sidebar === sidebar && !wasActive
            );
        }
    });
}

type AdvancedHudAnchor = Point & {
    limits?: {
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    };
};

type CloseSetting = (typeof CLOSE_SETTINGS)[number];

type AdvancedHudEvent = SidebarEvent | "send-to-chat";

type AdvancedContext<TActor extends ActorPF2e = ActorPF2e> = BaseActorContext<TActor> & {
    partial: (template: string) => string;
};

interface IPF2eHudAdvanced {
    get partials(): string[];
    get sidebar(): PF2eHudSidebar | null;
    get anchor(): AdvancedHudAnchor;
    get sidebars(): HTMLElement | null;

    _renderSidebarHTML?(innerElement: HTMLElement, sidebar: SidebarName): Promise<void>;
    _onRenderSidebar?(innerElement: HTMLElement): void;
    _updateSidebarPosition?(
        element: HTMLElement,
        center: Point,
        limits: { right: number; bottom: number }
    ): void;

    closeSidebar(): void;
    closeIf(event: AdvancedHudEvent): boolean;
    toggleSidebar(sidebar: SidebarName | null): void;
    eventToSetting(event: AdvancedHudEvent): CloseSetting;
}

type AdvancedHudSettings<TClose extends any> = SidebarSettings &
    Record<CloseSetting, TClose> & {
        showAlliance: boolean;
    };

export { addSidebarsListeners, CLOSE_SETTINGS, makeAdvancedHUD };
export type {
    AdvancedHudAnchor,
    AdvancedHudEvent,
    AdvancedHudSettings,
    CloseSetting,
    IPF2eHudAdvanced,
};
