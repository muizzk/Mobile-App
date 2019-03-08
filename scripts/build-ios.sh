#!/bin/bash

# variables
cfg="$1"
out_dir="$2"
zip_name="$3"
app_name="MobileApp.app"


# select config
./scripts/select_config.rb "$cfg"

# build
xcodebuild \
    -workspace ios/MobileApp.xcworkspace \
    -scheme MobileApp \
    -configuration Release \
    -sdk iphonesimulator \
    -derivedDataPath ios/build \
    -UseModernBuildSystem=NO \
    -quiet

# zip
cd $out_dir
zip -qr $zip_name $app_name
mv $zip_name $TRAVIS_BUILD_DIR/