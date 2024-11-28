# Plainly Videos After Effects Plugin

This repository contains code for the After Effects Plugin created to support [Plainly Videos](https://plainlyvideos.com) users to collaborate with the Plainly platform from within After Effects.

## Plugin features
* **Export zip**: Gather all project assets and fonts, then compress them into a single zip file for easy sharing.

## Development
### Prerequisites
Before running or developing the plugin, ensure you have the following:

* **Node.js**: Version 20.11.1
* **Adobe After Effects**
* [Debugging Unsigned Extensions](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_11.x/Documentation/CEP%2011.1%20HTML%20Extension%20Cookbook.md#debugging-unsigned-extensions)

### Run
To install and run the extension:

1. Clone this repository to a location of your choice
```bash
git clone https://github.com/plainly-videos/after-effects-plugin.git
```
2. Create a symbolic link to the required folder:
**Windows**: Open a Command Prompt as Administrator and run:
```bash
mklink /D "%AppData%\Adobe\CEP\extensions\com.plainlyvideos.after-effects-plugin" "path\to\after-effects-plugin"
```
Replace `path\to\after-effects-plugin` with the path where you cloned the repository.

**MacOS**: Run the following command in the Terminal:
```bash
ln -s /path/to/after-effects-plugin "/Library/Application Support/Adobe/CEP/extensions/com.plainlyvideos.after-effects-plugin"
```
Replace `path\to\after-effects-plugin` with the path where you cloned the repository.
3. Install dependencies and build the project:
```bash
yarn install && yarn build
```
4. Open Adobe After Effects, navigate to **Window -> Extensions**, and select **Plainly plugin** to start the extension.

### Project structure
The plugin is built using Vite, Node.js, and React. Below is an overview of the project's key components:

* `CSXS/manifest.xml` - Defines the [extension configuration](https://github.com/Adobe-CEP/Getting-Started-guides?tab=readme-ov-file#2-configure-your-extension-in-manifestxml)
* `src/`              - Contains the plugin's source code, including the React components and utility functions
* `src/lib`           - Contains [Adobe CEP library files](https://github.com/Adobe-CEP/CEP-Resources/tree/master/CEP_11.x)
* `src/jsx`           - Holds ExtendScripts files
* `src/node`          - Contains Node related source code
* `.debug`            - File for debugging the extension

### Debugging
To debug the plugin:

* Ensure the extension is active in Adobe After Effects.
* `.debug` file must exist in root folder of the project.
* Open your browser and navigate to `http://localhost:8088/`.
* Access the Plainly plugin interface for debugging.

#### Development:
* If you make changes to the `manifest.xml` config file, restart Adobe After Effects.
* Run `yarn build` to build extension for production.
* Run `yarn dev` to work on extension in development mode. After making changes, use **Reload extension** button on UI to see changes.

**NOTE:** When running one of these two commands for the first time `yarn build` or `yarn dev` make sure to restart Adobe After Effects, because `manifest.xml` file is changed for either `production` or `development` mode.

## Additional Resources
For a comprehensive guide to Adobe CEP development, refer to the [Getting Started guides](https://github.com/Adobe-CEP/Getting-Started-guides)
