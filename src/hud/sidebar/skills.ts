import {
    R,
    dataToDatasetString,
    elementDataset,
    getActionIcon,
    getItemWithSourceId,
    getSetting,
    getTranslatedSkills,
    hasItemWithSourceId,
    htmlClosest,
    isInstanceOf,
    localize,
    promptDialog,
    signedInteger,
    templateLocalize,
} from "foundry-pf2e";
import { PF2eHudSidebar, SidebarContext, SidebarName, SidebarRenderOptions } from "./base";

const FOLLOW_THE_EXPERT = "Compendium.pf2e.actionspf2e.Item.tfa4Sh7wcxCEqL29";
const FOLLOW_THE_EXPERT_EFFECT = "Compendium.pf2e.other-effects.Item.VCSpuc3Tf3XWMkd3";

const UNTRAINED_IMPROVISATION = "Compendium.pf2e.feats-srd.Item.9jGaBxLUtevZYcZO";

const ACTION_IMAGES: Record<string, string> = {
    lore: "systems/pf2e/icons/spells/divine-decree.webp",
    treatWounds: "systems/pf2e/icons/spells/delay-affliction.webp",
    "recall-knowledge": "systems/pf2e/icons/spells/brain-drain.webp",
    "learn-a-spell": "systems/pf2e/icons/equipment/adventuring-gear/writing-set.webp",
    "identify-magic": "systems/pf2e/icons/equipment/adventuring-gear/magnifying-glass.webp",
};

const SHARED_ACTIONS = {
    "recall-knowledge": {
        cost: 1,
        uuid: "Compendium.pf2e.actionspf2e.Item.1OagaWtBpVXExToo",
    },
    "decipher-writing": {
        trained: true,
        uuid: "Compendium.pf2e.actionspf2e.Item.d9gbpiQjChYDYA2L",
    },
    "identify-magic": {
        trained: true,
        uuid: "Compendium.pf2e.actionspf2e.Item.eReSHVEPCsdkSL4G",
    },
    "learn-a-spell": {
        trained: true,
        uuid: "Compendium.pf2e.actionspf2e.Item.Q5iIYCFdqJFM31GW",
    },
    subsist: {
        uuid: "Compendium.pf2e.actionspf2e.Item.49y9Ec4bDii8pcD3",
    },
} satisfies Record<string, Omit<RawSkillAction, "actionId">>;

const SKILLS: RawSkill[] = [
    {
        slug: "perception",
        actions: [
            {
                actionId: "seek",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.BlAOM2X92SI6HMtJ",
            },
            {
                actionId: "sense-motive",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.1xRFPTFtWtGJ9ELw",
            },
        ],
    },
    {
        slug: "acrobatics",
        actions: [
            {
                actionId: "balance",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.M76ycLAqHoAgbcej",
            },
            {
                actionId: "tumble-through",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.21WIfSu7Xd7uKqV8",
            },
            {
                actionId: "maneuver-in-flight",
                trained: true,
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.Qf1ylAbdVi1rkc8M",
            },
            {
                actionId: "squeeze",
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.kMcV8e5EZUxa6evt",
            },
        ],
    },
    {
        slug: "arcana",
        actions: [
            "recall-knowledge",
            {
                actionId: "borrow-arcane-spell",
                trained: true,
                label: "sf2e-hud.actions.borrowArcaneSpell",
                uuid: "Compendium.pf2e.actionspf2e.Item.OizxuPb44g3eHPFh",
            },
            "decipher-writing",
            "identify-magic",
            "learn-a-spell",
        ],
    },
    {
        slug: "athletics",
        actions: [
            {
                actionId: "climb",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.pprgrYQ1QnIDGZiy",
            },
            {
                actionId: "force-open",
                cost: 1,
                map: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.SjmKHgI7a5Z9JzBx",
            },
            {
                actionId: "grapple",
                cost: 1,
                map: true,
                agile: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.PMbdMWc2QroouFGD",
            },
            {
                actionId: "high-jump",
                cost: 2,
                uuid: "Compendium.pf2e.actionspf2e.Item.2HJ4yuEFY1Cast4h",
            },
            {
                actionId: "long-jump",
                cost: 2,
                uuid: "Compendium.pf2e.actionspf2e.Item.JUvAvruz7yRQXfz2",
            },
            {
                actionId: "reposition",
                cost: 1,
                map: true,
                agile: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.lOE4yjUnETTdaf2T",
            },
            {
                actionId: "shove",
                cost: 1,
                map: true,
                agile: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.7blmbDrQFNfdT731",
            },
            {
                actionId: "swim",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.c8TGiZ48ygoSPofx",
            },
            {
                actionId: "trip",
                cost: 1,
                map: true,
                agile: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.ge56Lu1xXVFYUnLP",
            },
            {
                actionId: "disarm",
                cost: 1,
                map: true,
                agile: true,
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.Dt6B1slsBy8ipJu9",
            },
        ],
    },
    {
        slug: "crafting",
        actions: [
            "recall-knowledge",
            {
                actionId: "repair",
                uuid: "Compendium.pf2e.actionspf2e.Item.bT3skovyLUtP22ME",
            },
            {
                actionId: "craft",
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.rmwa3OyhTZ2i2AHl",
            },
            {
                actionId: "identify-alchemy",
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.Q4kdWVOf2ztIBFg1",
            },
        ],
    },
    {
        slug: "computers",
        actions: [
            {
                actionId: "access-infosphere",
                uuid: "Compendium.starfinder-field-test-for-pf2e.actions.Item.Yn4jLPVWVE1vtAaF",
                label: "SF2E.Actions.AccessInfosphere.Title"
            },
            "decipher-writing",
            {
                actionId: "disable-device",
                cost: 2,
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.cYdz2grcOcRt4jk6",
                label: "SF2E.Actions.PlotCourse.Title"
            },
            {
                actionId: "hack",
                trained: true,
                uuid: "Compendium.starfinder-field-test-for-pf2e.actions.Item.RF8xNJ8QsMwogerB",
                label: "SF2E.Actions.Hack.Title"
            },
            {
                actionId: "program",
                trained: true,
                uuid: "Compendium.starfinder-field-test-for-pf2e.actions.Item.9zvazWNY5tKbMFnC",
                label: "SF2E.Actions.Program.Title"
            },
            "recall-knowledge"
        ]
    },
    {
        slug: "deception",
        actions: [
            {
                actionId: "create-a-diversion",
                cost: 1,
                variants: ["distracting-words", "gesture", "trick"],
                uuid: "Compendium.pf2e.actionspf2e.Item.GkmbTGfg8KcgynOA",
            },
            {
                actionId: "impersonate",
                uuid: "Compendium.pf2e.actionspf2e.Item.AJstokjdG6iDjVjE",
            },
            {
                actionId: "lie",
                uuid: "Compendium.pf2e.actionspf2e.Item.ewwCglB7XOPLUz72",
            },
            {
                actionId: "feint",
                cost: 1,
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.QNAVeNKtHA0EUw4X",
            },
        ],
    },
    {
        slug: "diplomacy",
        actions: [
            {
                actionId: "bonMot",
                cost: 1,
                uuid: "Compendium.pf2e.feats-srd.Item.0GF2j54roPFIDmXf",
                useInstance: true,
            },
            {
                actionId: "gather-information",
                uuid: "Compendium.pf2e.actionspf2e.Item.plBGdZhqq5JBl1D8",
            },
            {
                actionId: "make-an-impression",
                uuid: "Compendium.pf2e.actionspf2e.Item.OX4fy22hQgUHDr0q",
            },
            {
                actionId: "request",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.DCb62iCBrJXy0Ik6",
            },
        ],
    },
    {
        slug: "intimidation",
        actions: [
            {
                actionId: "coerce",
                uuid: "Compendium.pf2e.actionspf2e.Item.tHCqgwjtQtzNqVvd",
            },
            {
                actionId: "demoralize",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.2u915NdUyQan6uKF",
            },
        ],
    },
    {
        slug: "medicine",
        actions: [
            {
                actionId: "administer-first-aid",
                cost: 2,
                variants: ["stabilize", "stop-bleeding"],
                rollOption: "administer-first-aid",
                uuid: "Compendium.pf2e.actionspf2e.Item.MHLuKy4nQO2Z4Am1",
            },
            "recall-knowledge",
            {
                actionId: "treat-disease",
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.TC7OcDa7JlWbqMaN",
            },
            {
                actionId: "treat-poison",
                cost: 1,
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.KjoCEEmPGTeFE4hh",
            },
            {
                actionId: "treatWounds",
                label: "PF2E.Actions.TreatWounds.Label",
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.1kGNdIIhuglAjIp9",
            },
        ],
    },
    {
        slug: "nature",
        actions: [
            {
                actionId: "command-an-animal",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.q9nbyIF0PEBqMtYe",
            },
            "recall-knowledge",
            {
                actionId: "treatWounds",
                trained: true,
                label: "PF2E.Actions.TreatWounds.Label",
                uuid: "Compendium.pf2e.feats-srd.Item.WC4xLBGmBsdOdHWu",
                useInstance: true,
            },
            "identify-magic",
            "learn-a-spell",
        ],
    },
    {
        slug: "occultism",
        actions: ["recall-knowledge", "decipher-writing", "identify-magic", "learn-a-spell"],
    },
    {
        slug: "performance",
        actions: [
            {
                actionId: "perform",
                cost: 1,
                variants: [
                    "acting",
                    "comedy",
                    "dance",
                    "oratory",
                    "singing",
                    "keyboards",
                    "percussion",
                    "strings",
                    "winds",
                ],
                uuid: "Compendium.pf2e.actionspf2e.Item.EEDElIyin4z60PXx",
            },
        ],
    },
    {
        slug: "piloting",
        actions: [
            {
                actionId: "drive",
                trained: true,
                uuid: "Compendium.starfinder-field-test-for-pf2e.actions.Item.OxF2dvUCdTYHrnIm",
                label: "SF2E.Actions.Drive.Title",
                variants:[
                    "drive1",
                    "drive2",
                    "drive3"
                ]
            },
            {
                actionId: "navigate",
                trained: true,
                uuid: "Compendium.starfinder-field-test-for-pf2e.actions.Item.hsUKPqTdAvWwsqH2",
                label: "SF2E.Actions.Navigate.Title"
            },
            {
                actionId: "plot-course",
                trained: true,
                uuid: "Compendium.starfinder-field-test-for-pf2e.actions.Item.LXqcXRayK58inaKo",
                label: "SF2E.Actions.PlotCourse.Title"
            },
            "recall-knowledge",
            {
                actionId: "run-over",
                cost: 1,
                trained: true,
                uuid: "Compendium.starfinder-field-test-for-pf2e.actions.Item.FisNbAu9pdMnz6vF",
                label: "SF2E.Actions.RunOver.Title"
            },
            {
                actionId: "stop",
                cost: 1,
                trained: true,
                uuid: "Compendium.starfinder-field-test-for-pf2e.actions.Item.3oL5ap2Qb00Saaz9",
                label: "SF2E.Actions.Stop.Title"
            },
            {
                actionId: "stunt",
                cost: 1,
                trained: true,
                uuid: "Compendium.starfinder-field-test-for-pf2e.actions.Item.ailFBRjKuGCOAsCR",
                label: "SF2E.Actions.Stunt.Title",
                variants: [
                    "back-off",
                    "evade",
                    "flip-and-burn",
                    "barrel-roll",
                    "flyby",
                    "drift",
                    "turn-in-place"
                ]
            },
            {
                actionId: "take-control",
                cost: 1,
                trained: true,
                uuid: "Compendium.starfinder-field-test-for-pf2e.actions.Item.9Msf0P33UR5mNRuz",
                label: "SF2E.Actions.TakeControl.Title"
            },
        ]
    },
    {
        slug: "religion",
        actions: ["recall-knowledge", "decipher-writing", "identify-magic", "learn-a-spell"],
    },
    {
        slug: "society",
        actions: [
            "recall-knowledge",
            "subsist",
            {
                actionId: "create-forgery",
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.ftG89SjTSa9DYDOD",
            },
            "decipher-writing",
        ],
    },
    {
        slug: "stealth",
        actions: [
            {
                actionId: "avoid-notice",
                uuid: "Compendium.pf2e.actionspf2e.Item.IE2nThCmoyhQA0Jn",
            },
            {
                actionId: "conceal-an-object",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.qVNVSmsgpKFGk9hV",
            },
            {
                actionId: "hide",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.XMcnh4cSI32tljXa",
            },
            {
                actionId: "sneak",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.VMozDqMMuK5kpoX4",
            },
        ],
    },
    {
        slug: "survival",
        actions: [
            {
                actionId: "sense-direction",
                uuid: "Compendium.pf2e.actionspf2e.Item.fJImDBQfqfjKJOhk",
            },
            "subsist",
            {
                actionId: "cover-tracks",
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.SB7cMECVtE06kByk",
            },
            {
                actionId: "track",
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.EA5vuSgJfiHH7plD",
            },
        ],
    },
    {
        slug: "thievery",
        actions: [
            {
                actionId: "palm-an-object",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.ijZ0DDFpMkWqaShd",
            },
            {
                actionId: "steal",
                cost: 1,
                uuid: "Compendium.pf2e.actionspf2e.Item.RDXXE7wMrSPCLv5k",
            },
            {
                actionId: "disable-device",
                cost: 2,
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.cYdz2grcOcRt4jk6",
            },
            {
                actionId: "pick-a-lock",
                cost: 2,
                trained: true,
                uuid: "Compendium.pf2e.actionspf2e.Item.2EE4aF4SZpYf0R6H",
            },
        ],
    },
];

const SKILL_ACTIONS_UUIDS = R.pipe(
    SKILLS,
    R.flatMap((rawSkill) => rawSkill.actions),
    R.map((action) => (typeof action === "object" ? action.uuid : undefined)),
    R.concat(Object.values(SHARED_ACTIONS).map((action) => action.uuid)),
    R.filter(R.isTruthy),
    R.unique()
);

function prepareStatisticAction(
    statistic: string | undefined,
    rawAction: SharedAction | RawSkillAction
) {
    const [actionId, action]: [string, Omit<RawSkillAction, "actionId">] =
        typeof rawAction === "string"
            ? [rawAction, SHARED_ACTIONS[rawAction]]
            : [rawAction.actionId, rawAction];

    const actionKey = game.pf2e.system.sluggify(actionId, { camel: "bactrian" });
    const label = game.i18n.localize(action.label ?? `PF2E.Actions.${actionKey}.Title`);
    actionLabels[actionId] = label;

    const variants: ActionVariant[] | MapVariant[] | undefined = (() => {
        if (action.map) {
            return [
                {
                    label: game.i18n.localize("PF2E.Roll.Normal"),
                },
                {
                    map: 1,
                    agile: action.agile,
                    label: getMapLabel(1, !!action.agile),
                },
                {
                    map: 2,
                    agile: !!action.agile,
                    label: getMapLabel(2, !!action.agile),
                },
            ] satisfies MapVariant[];
        }

        return action.variants?.map((slug) => {
            return {
                slug,
                label: getSkillVariantName(actionId, slug),
            } satisfies ActionVariant;
        });
    })();

    const dataset: SkillActionDataset = {
        actionId,
        statistic: statistic,
        itemUuid: action.uuid,
        option: action.rollOption,
    };

    const filterValues = variants?.map((variant) => variant.label) ?? [];
    filterValues.unshift(label);

    return {
        ...action,
        variants,
        actionId,
        label,
        dataset,
        filterValue: filterValues.join("|"),
        dragImg:
            ACTION_IMAGES[actionId] ??
            game.pf2e.actions.get(actionId)?.img ??
            getActionIcon(action.cost ?? null),
    } satisfies PreparedSkillAction;
}

const actionLabels: Record<string, string> = {};
function finalizeSkills(actor: ActorPF2e): FinalizedSkill[] {
    const isCharacter = actor.isOfType("character");
    const hideUntrained =
        getSetting("hideUntrainedActions") && !hasItemWithSourceId(actor, UNTRAINED_IMPROVISATION, "feat");
    const hideUntrainedSkills =
        getSetting( "hideUntrainedSkills") && !hasItemWithSourceId(actor, UNTRAINED_IMPROVISATION, "feat");

    const skills = SKILLS.map((raw) => {
        const actions = raw.actions.map((rawAction) => prepareStatisticAction(raw.slug, rawAction));
        let locKey : string = "";
        if(raw.slug === "perception")
            locKey = "PF2E.PerceptionLabel";
        else if(raw.slug === "computers")
            locKey = "SF2E.Skill.Computers";
        else if(raw.slug === "piloting")
            locKey = "SF2E.Skill.Piloting";
        else
            locKey = CONFIG.PF2E.skills[raw.slug].label;

        const label = game.i18n.localize(
            locKey
        );

        const filterValues = actions.map((action) => action.filterValue);
        filterValues.unshift(label);

        return {
            actions,
            slug: raw.slug,
            label,
            filterValue: filterValues.join("|"),
        } satisfies PreparedSkill;
    }).filter((skill) =>{
        const { proficient, modifiers } = actor.getStatistic(skill.slug)!;
        const followingTheExpert = modifiers.find(m => m.slug === "follow-the-expert-proficiency") != null;
        return( proficient || followingTheExpert || !hideUntrainedSkills );
    });

    return skills.map((skill) => {
        const { mod, rank, proficient } = actor.getStatistic(skill.slug)!;
        const rankLabel = game.i18n.localize(`PF2E.ProficiencyLevel${rank ?? 0}`);

        const actions = skill.actions
            .map((action) => {
                const item = action.useInstance
                    ? getItemWithSourceId(actor, action.uuid, "feat")
                    : null;

                if (item) {
                    action.dataset.itemUuid = item.uuid;
                }

                return {
                    ...action,
                    hasInstance: !!item,
                    dataset: dataToDatasetString(action.dataset),
                    proficient: !isCharacter || proficient || !action.trained,
                } satisfies FinalizedSkillAction;
            })
            .filter((action) => {
                if (!isCharacter) {
                    return !action.useInstance && typeof action.condition !== "function";
                }

                return (
                    (!action.trained || !hideUntrained || proficient) &&
                    (!action.useInstance || action.hasInstance) &&
                    (typeof action.condition !== "function" || action.condition(actor))
                );
            });

        return {
            ...skill,
            actions,
            mod,
            rankLabel,
            proficient,
            rank: rank ?? 0,
        } satisfies FinalizedSkill;
    });
}

function getStatisticDragDataFromElement(el: HTMLElement) {
    const itemElement = htmlClosest(el, ".item");
    if (!itemElement) return {};

    const { itemUuid, actionId, statistic, option } =
        elementDataset<SkillActionDataset>(itemElement);

    return {
        ...el.dataset,
        type: "Item",
        uuid: itemUuid,
        itemType: "action",
        actorLess: true,
        actionId,
        statistic,
        option,
        isStatistic: true,
    };
}

class PF2eHudSidebarSkills extends PF2eHudSidebar {
    get key(): SidebarName {
        return "skills";
    }

    _getDragData(
        target: HTMLElement,
        baseDragData: Record<string, JSONValue>,
        item: Maybe<ItemPF2e<ActorPF2e>>
    ) {
        return getStatisticDragDataFromElement(target);
    }

    async _prepareContext(options: SidebarRenderOptions): Promise<SkillsContext> {
        const actor = this.actor;
        const parentData = await super._prepareContext(options);
        const skills = finalizeSkills(actor);
        const follow = {
            uuid: FOLLOW_THE_EXPERT,
            active: hasItemWithSourceId(actor, FOLLOW_THE_EXPERT_EFFECT, "effect"),
        };

        const lores = (() => {
            if (!actor.isOfType("creature")) return;

            const list = actor.itemTypes.lore.map((lore): LoreSkill => {
                const slug = getLoreSlug(lore);
                const { mod, rank } = actor.getStatistic(slug)!;

                return {
                    slug,
                    uuid: lore.uuid,
                    rank: rank ?? 0,
                    label: lore.name,
                    modifier: signedInteger(mod),
                    rankLabel: game.i18n.localize(`PF2E.ProficiencyLevel${rank ?? 0}`),
                    dragImg: ACTION_IMAGES.lore,
                };
            });

            const modifierWidth = list.reduce(
                (width, lore) => (lore.modifier.length > width ? lore.modifier.length : width),
                2
            );

            return {
                list,
                modifierWidth,
                filterValue: list.map((lore) => lore.label).join("|"),
            };
        })();

        const data: SkillsContext = {
            ...parentData,
            isCharacter: actor.isOfType("character"),
            follow,
            skills,
            lores,
        };

        return data;
    }

    async _onClickAction(event: PointerEvent, target: HTMLElement) {
        const actor = this.actor;
        const action = target.dataset.action as SkillActionEvent;

        if (![0, 2].includes(event.button)) return;
        if (event.button === 2 && action !== "roll-statistic-action") return;

        switch (action) {
            case "roll-skill": {
                const { slug } = elementDataset<{ slug: SkillSlug }>(target);
                actor.getStatistic(slug)?.roll({ event });
                this.parentHUD.closeIf("roll-skill");
                break;
            }

            case "roll-statistic-action": {
                rollStatistic(actor, event, getStatisticDataFromElement(target), {
                    requireVariants: event.button === 2,
                    onRoll: () => {
                        this.parentHUD.closeIf("roll-skill");
                    },
                });
                break;
            }

            case "follow-the-expert": {
                const exist = getItemWithSourceId(actor, FOLLOW_THE_EXPERT_EFFECT, "effect");
                if (exist) {
                    return exist.delete();
                }

                const source = (await fromUuid<EffectPF2e>(FOLLOW_THE_EXPERT_EFFECT))?.toObject();
                if (!source) return;

                actor.createEmbeddedDocuments("Item", [source]);

                break;
            }
        }
    }
}

async function rollStatistic(
    actor: ActorPF2e,
    event: MouseEvent,
    { variant, agile, map, option, actionId, statistic, dc }: StatisticData,
    { requireVariants, onRoll }: { requireVariants?: boolean; onRoll?: Function } = {}
) {
    if (actionId === "recall-knowledge" && !statistic) {
        return;
    }

    const action = game.pf2e.actions.get(actionId) ?? game.pf2e.actions[actionId];

    const rollOptions = option ? [`action:${option}`] : undefined;
    if (rollOptions && variant) rollOptions.push(`action:${option}:${variant}`);

    if (actionId === "aid") {
        requireVariants = true;
        dc = 15;
    }

    if (requireVariants) {
        const variants = await getStatisticVariants(actor, actionId, {
            dc,
            statistic,
            agile: map ? agile : undefined,
        });
        if (!variants) return;

        dc = variants.dc;
        agile = variants.agile;
        statistic = variants.statistic;
    }

    const options = {
        event,
        actors: [actor],
        variant,
        rollOptions,
        modifiers: [] as ModifierPF2e[],
        difficultyClass: dc ? { value: dc } : undefined,
    } satisfies Partial<ActionVariantUseOptions> &
        (SingleCheckActionVariantData | SkillActionOptions);

    if (map) {
        const modifier = new game.pf2e.Modifier({
            label: "PF2E.MultipleAttackPenalty",
            modifier: getMapValue(map, agile),
        });
        options.modifiers.push(modifier);
    }

    if (!action) {
        actor.getStatistic(statistic ?? "")?.roll(options);
        return;
    }

    if (isInstanceOf<BaseAction>(action, "BaseAction")) {
        (options as SingleCheckActionVariantData).statistic = statistic;
        action.use(options);
    } else if (action) {
        (options as SkillActionOptions).skill = statistic;
        action(options);
    }

    onRoll?.();
}

let STATISTICS: { value: string; label: string }[] | undefined;
function getStatistics(actor: ActorPF2e) {
    STATISTICS ??= (() => {
        const obj = getTranslatedSkills() as Record<SkillSlug | "perception", string>;

        const arr = R.pipe(
            R.entries(obj),
            R.map(([slug, label]) => ({ value: slug, label }))
        );

        arr.push({ value: "perception", label: game.i18n.localize("PF2E.PerceptionLabel") });

        return arr;
    })();

    const statistics = STATISTICS.slice();

    for (const lore of actor.itemTypes.lore) {
        statistics.push({
            value: getLoreSlug(lore),
            label: lore.name,
        });
    }

    return R.sortBy(statistics, R.prop("label"));
}

function getLoreSlug(lore: LorePF2e) {
    const rawLoreSlug = game.pf2e.system.sluggify(lore.name);
    return /\blore\b/.test(rawLoreSlug) ? rawLoreSlug : `${rawLoreSlug}-lore`;
}

async function getStatisticVariants(
    actor: ActorPF2e,
    actionId: string,
    { dc, statistic, agile }: { dc?: number; statistic?: string; agile?: boolean }
) {
    return promptDialog<{ statistic: string; agile?: boolean; dc?: number }>(
        {
            title: actionLabels[actionId] ?? localize("dialogs.variants.title"),
            content: "dialogs/variants",
            classes: ["pf2e-hud-skills"],
            data: {
                i18n: templateLocalize("dialogs.variants"),
                statistics: getStatistics(actor),
                statistic,
                agile,
                dc,
            },
        },
        { width: 280 }
    );
}

function getSkillVariantName(actionId: string, variant: string) {
    const actionKey = game.pf2e.system.sluggify(actionId, { camel: "bactrian" });
    const variantKey = game.pf2e.system.sluggify(variant, { camel: "bactrian" });
    return game.i18n.localize(`PF2E.Actions.${actionKey}.${variantKey}.Title`);
}

function getMapValue(map: 1 | 2, agile = false) {
    map = Number(map) as 1 | 2;
    return map === 1 ? (agile ? -4 : -5) : agile ? -8 : -10;
}

function getMapLabel(map: 1 | 2, agile: boolean) {
    return game.i18n.format("PF2E.MAPAbbreviationLabel", {
        penalty: getMapValue(map, agile),
    });
}

function getStatisticDataFromElement(el: HTMLElement): StatisticData {
    const actionElement = htmlClosest(el, ".item.statistic");
    const { agile, map, variant } = el.dataset as SkillVariantDataset;

    return {
        ...(actionElement?.dataset as SkillActionDataset),
        map: map ? (Number(map) as 1 | 2) : undefined,
        agile: agile === "true",
        variant,
    };
}

interface PF2eHudSidebarSkills {
    get actor(): CreaturePF2e;
}

type StatisticData = SkillActionDataset & {
    map?: 1 | 2;
    variant?: string;
    agile?: boolean;
    dc?: number;
};

type SkillActionEvent = "roll-skill" | "roll-statistic-action" | "follow-the-expert";

type SkillActionDataset = {
    actionId: string;
    itemUuid: string;
    statistic?: SkillSlug | string;
    option?: string;
};

type SkillVariantDataset = {
    variant?: string;
    map?: "1" | "2";
    agile?: StringBoolean;
};

type SharedAction = keyof typeof SHARED_ACTIONS;

type FinalizedSkill = Omit<PreparedSkill, "actions"> & {
    mod: number;
    rank: ZeroToFour;
    rankLabel: string;
    proficient: boolean;
    actions: FinalizedSkillAction[];
};

type FinalizedSkillAction = Omit<PreparedSkillAction, "dataset"> & {
    proficient: boolean;
    dataset: string;
    hasInstance: boolean;
};

type PreparedSkill = {
    slug: string;
    label: string;
    actions: PreparedSkillAction[];
    filterValue: string;
};

type MapVariant = {
    label: string;
    map?: number;
    agile?: boolean;
};

type ActionVariant = {
    slug: string;
    label: string;
};

type PreparedSkillAction = Omit<RawSkillAction, "variants"> & {
    label: string;
    filterValue: string;
    variants: (MapVariant | ActionVariant)[] | undefined;
    dataset: SkillActionDataset;
    dragImg: string;
};

type RawSkillAction = {
    actionId: string;
    uuid: string;
    useInstance?: boolean;
    cost?: ActionCost["type"] | ActionCost["value"];
    map?: true;
    agile?: true;
    label?: string;
    trained?: true;
    variants?: string[];
    rollOption?: string;
    condition?: (actor: ActorPF2e) => boolean;
};

type RawSkill = {
    slug: SkillSlug | "perception" | "piloting" | "computers";
    actions: (SharedAction | RawSkillAction)[];
};

type LoreSkill = {
    modifier: string;
    label: string;
    uuid: string;
    slug: string;
    rank: ZeroToFour;
    rankLabel: string;
    dragImg: string;
};

type SkillsContext = SidebarContext & {
    isCharacter: boolean;
    skills: FinalizedSkill[];
    lores: Maybe<{
        list: LoreSkill[];
        modifierWidth: number;
        filterValue: string;
    }>;
    follow: {
        uuid: string;
        active: boolean;
    };
};

export {
    PF2eHudSidebarSkills,
    ACTION_IMAGES,
    SHARED_ACTIONS,
    SKILL_ACTIONS_UUIDS,
    getLoreSlug,
    getMapLabel,
    getSkillVariantName,
    getStatisticDataFromElement,
    getStatisticDragDataFromElement,
    getStatistics,
    prepareStatisticAction,
    rollStatistic,
};
export type { FinalizedSkillAction, PreparedSkillAction, RawSkillAction, SkillVariantDataset };
