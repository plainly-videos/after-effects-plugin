#!/bin/bash

# Check if the script is called with a version argument
if [ $# -ne 1 ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

# Validate the version argument format (major.minor.patch)
if ! [[ $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid version format. Please use major.minor.patch format (e.g., 1.2.3)."
  exit 1
fi

# Assign the version argument to a variable
new_version="$1"

updateVersion() {
    if [ "$(uname)" = "Darwin" ]; then
        # macOs
        sed -i "" "$1" "$2"
    else
        # linux
        sed -i "$1" "$2"
    fi
}

# Update the version field in the package.json files
updateVersion "s/\"version\": \".*\"/\"version\": \"$new_version\"/" ./package.json
updateVersion "s/\"version\": \".*\"/\"version\": \"$new_version\"/" plainly-aescripts/package.json
updateVersion "s/\"version\": \".*\"/\"version\": \"$new_version\"/" plainly-plugin/package.json

# Update the version in .env files
updateVersion "s/PLUGIN_BUNDLE_VERSION=.*$/PLUGIN_BUNDLE_VERSION=$new_version/" plainly-plugin/.env.development
updateVersion "s/PLUGIN_BUNDLE_VERSION=.*$/PLUGIN_BUNDLE_VERSION=$new_version/" plainly-plugin/.env.production
updateVersion "s/PLUGIN_BUNDLE_VERSION=.*$/PLUGIN_BUNDLE_VERSION=$new_version/" plainly-plugin/.env.test

# Update the version in manifest.xml
updateVersion "s/ExtensionBundleVersion=\".*\"/ExtensionBundleVersion=\"$new_version\"/" ./CSXS/manifest.xml
updateVersion "s/Id=\"com.plainlyvideos.after-effects-plugin.Panel\" Version=\".*\"/Id=\"com.plainlyvideos.after-effects-plugin.Panel\" Version=\"$new_version\"/" ./CSXS/manifest.xml

echo "Version updated to $new_version"
