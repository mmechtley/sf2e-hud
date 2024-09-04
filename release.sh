version_num = $1
if [ -z "$version_num" ]; then
  echo "Specify a version number"
  read version_num
  if [ -z "$version_num"]; then
    exit
  fi
fi
rm -rf releases
mkdir releases
mkdir releases/module
cp module.json releases
cp README.md releases/module/
cp -r lang releases/module/
cp -r scripts releases/module/
cp -r styles releases/module/
cp -r templates releases/module/
sed -e "s/\#{VERSION}\#/$version_num/g" -I '' releases/module.json
cp releases/module.json releases/module/
cd releases
zip -r module.zip module
cd ..
