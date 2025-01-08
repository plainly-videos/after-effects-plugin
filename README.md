# Plainly Videos After Effects Plugin

This repository contains code for the After Effects Plugin created to support [Plainly Videos](https://plainlyvideos.com) users to collaborate with the Plainly platform from within After Effects.

## Plugin features
* **Export zip**: Gather all project assets and fonts, then compress them into a single zip file for easy sharing.

## Installation

### Using ZXP/UXP Installer

1. Download the latest `plainly-plugin.zxp` from the [latest release](https://github.com/plainly-videos/after-effects-plugin/releases/latest).
2. Download [ZXP/UXP Installer](https://aescripts.com/learn/zxp-installer/) developed by *aescripts + aeplugins*. During the installation process make sure to check `Install ZXP/UXP Installer`.
3. Drag & drop `plainly-plugin.zxp` into ZXP/UXP Installer.

### Manual installation
1. Download the latest `plainly-plugin.zxp` from the [latest release](https://github.com/plainly-videos/after-effects-plugin/releases/latest).
2. Run the `Command Prompt / Terminal`, navigate to Unified Plugin Installer Agent application folder, and install the plugin:

   **Windows**: Run in Command Prompt:
   ```bash
   cd "C:\Program Files\Common Files\Adobe\Adobe Desktop Common\RemoteComponents\UPI\UnifiedPluginInstallerAgent"
   UnifiedPluginInstallerAgent.exe /install 'path\to\plainly-plugin.zxp'
   ```
   **MacOS**: Run in Terminal:
   ```bash
   cd "/Library/Application Support/Adobe/Adobe Desktop Common/RemoteComponents/UPI/UnifiedPluginInstallerAgent/UnifiedPluginInstallerAgent.app/Contents/MacOS"
   ./UnifiedPluginInstallerAgent --install '/path/to/plainly-plugin.zxp'
   ```
3. Open Adobe After Effects, navigate to **Window -> Extensions**, and select **Plainly Videos** to start the extension.

> **NOTE**
> 
> The manual installation is successful if the install command outputs similar log entry:
> ```log
> Installing extension with file path = C:\Users\plainly\plainly-plugin.zxp
> Installation Successful for extension with file path = C:\Users\plainly\plainly-plugin.zxp for all users
> ```
> You can read more about the [Unified Plugin Installer Agent](https://helpx.adobe.com/in/creative-cloud/help/working-from-the-command-line.html) and its available commands.

### How to uninstall
If you wish to uninstall the plugin you can do that via **Unified Plugin Installer Agent** or in **Creative Cloud** > **Stock & Marketplace** > **Plugins** > **Manage plugins**

## Development
### Prerequisites
Before running or developing the plugin, ensure you have the following:

* **Node.js**: Version 20.11.1
* **Adobe After Effects**
* Check how to turn on [Debugging Unsigned Extensions](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_11.x/Documentation/CEP%2011.1%20HTML%20Extension%20Cookbook.md#debugging-unsigned-extensions)

### Run
To install and run the extension:

1. Clone this repository to a location of your choice:
   ```bash
   git clone https://github.com/plainly-videos/after-effects-plugin.git
   ```
2. Create a symbolic link to the required folder:

   **Windows**: Run the following command in Powershell:
   ```bash
   "New-Item -Path 'C:\Program Files\Common Files\Adobe\CEP\extensions\com.plainlyvideos.after-effects-plugin' -ItemType SymbolicLink -Value 'full\path\to\after-effects-plugin'"
   ```
   Replace `full\path\to\after-effects-plugin` with the path where you cloned the repository.

   **MacOS**: Run the following command in the Terminal:
   ```bash
   ln -s 'full/path/to/after-effects-plugin' '/Library/Application Support/Adobe/CEP/extensions/com.plainlyvideos.after-effects-plugin'
   ```
   Replace `full/path/to/after-effects-plugin` with the path where you cloned the repository.
3. Install aescripts dependencies and build for production
   ```bash
   cd plainly-aescripts && yarn install && yarn build
   ```
4. Install plugin dependencies and build for production
   ```bash
   cd plainly-plugin && yarn install && yarn build
   ```
5. Open Adobe After Effects, navigate to **Window -> Extensions**, and select **Plainly Videos** to start the extension.

### Package
To prepare extension for signing:

1. While inside `after-effects-plugin` directory, run `package` script
   ```bash
   yarn package
   ```

This script will output a `package` directory, that will consist out of `CSXS/manifest.xml`, `plainly-aescripts/dist` and `plainly-plugin/dist` ready to be signed using a sign tool.

> You can read details about a [ZXPSignCmd tool](https://github.com/Adobe-CEP/Getting-Started-guides/blob/master/Package%20Distribute%20Install/readme.md#package-distribute-install-guide) and its available commands.

### Project structure
The plugin is built using Node.js, React and its bundled with Webpack. Below is an overview of the project's key components:

* `CSXS/manifest.xml` - Defines the [extension configuration](https://github.com/Adobe-CEP/Getting-Started-guides?tab=readme-ov-file#2-configure-your-extension-in-manifestxml)
* `plainly-aescripts/src/` - Houses the scripts executed within After Effects
* `plainly-plugin/src/`              - Contains the plugin's source code, including the React components, Node.js functions, and utility functions
* `plainly-plugin/src/lib`           - Contains [Adobe CEP library files](https://github.com/Adobe-CEP/CEP-Resources/tree/master/CEP_11.x)
* `plainly-plugin/src/jsx`           - Holds ExtendScripts files
* `plainly-plugin/src/node`          - Contains Node related source code
* `.debug`            - File for debugging the extension

### Debugging
To debug the plugin:

* Ensure the extension is active in Adobe After Effects.
* Open your browser and navigate to `http://localhost:8088/`.
* Access the plugin interface for debugging.

### Notes:
* If you make changes to the `manifest.xml` config file, restart Adobe After Effects.
* Run `yarn build` to build extension for production.
* Run `yarn build-test` to build extension for staging.
* Run `yarn dev` to work on extension in development mode. After making changes, use **Reload extension** button on UI to see changes.
* All scripts above exist in both `plainly-aescripts` and `plainly-plugin`.
* Changes in `plainly-aescripts` requires extension to be reopened.

**NOTE:** When running one of these three commands for the first time: `yarn build`, `yarn build-test` or `yarn dev` make sure to restart Adobe After Effects, because `manifest.xml` file is changed for either `production`, `test` or `development` mode.

## Additional Resources
For a comprehensive guide to Adobe CEP development, refer to the [Getting Started guides](https://github.com/Adobe-CEP/Getting-Started-guides)
