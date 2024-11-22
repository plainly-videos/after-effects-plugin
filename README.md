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
1. Create a new folder named `com.plainlyvideos.ae-plugin` in the following directory:
  * **Windows**: `C:\Users\%USERNAME%\AppData\Roaming\Adobe\CEP\extensions`
  * **MacOS**: `/Library/Application Support/Adobe/CEP/extensions/`
2. Clone this repository into the newly created folder:
```bash
git clone https://github.com/plainly-videos/after-effects-plugin.git
```
3. Install dependencies and build the project:
```bash
npm run install && npm run build
```
4. Open Adobe After Effects, navigate to **Window -> Extensions**, and select **Plainly Plugin** to start the extension.

### Project structure
The plugin is built using Vite, Node.js, and React. Below is an overview of the project's key components:
* `CSXS/manifest.xml` - Defines the [extension configuration](https://github.com/Adobe-CEP/Getting-Started-guides?tab=readme-ov-file#2-configure-your-extension-in-manifestxml)
* `src/lib`           - Contains [Adobe CEP library files](https://github.com/Adobe-CEP/CEP-Resources/tree/master/CEP_11.x)
* `src/jsx`           - Holds ExtendScripts files
* `.debug`            - File for debugging the extension

### Debugging
To debug the plugin:
* Ensure the extension is active in Adobe After Effects.
* Open your browser and navigate to `http://localhost:8088/`.
* Access the Plainly plugin interface for debugging.

#### Notes:
* If you make changes to the `manifest.xml` file, restart Adobe After Effects.
* Run `npm run build` after making changes to the code, then refresh the page at `http://localhost:8088/`.
* For UI development:
  * Comment out `Node.js`-related code to avoid conflicts.
  * Use `npm run dev` for an easier browser-based development experience.

## Additional Resources
For a comprehensive guide to Adobe CEP development, refer to the [Getting Started guides](https://github.com/Adobe-CEP/Getting-Started-guides)
