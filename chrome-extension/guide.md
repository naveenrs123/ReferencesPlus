## **Overview**
Currently, the Chrome extension captures web interactions from websites and web applications and embeds them into an existing pull request discussion. Participants in pull request discussions can interact
with these captured interactions and make references to specific elements.

## **Technical Details**
The project is written in **TypeScript** and uses **Webpack** for bundling. External libraries such as **RRWeb** are used to provide additional functionality.

For styling **SASS** is used with `.scss` stylesheets, although the main implemented components do not use it. Instead, the main extension relies on GitHub's Primer design system, which is used in github.com itself and therefore doesn't need to be embedded by us.

Dependencies and versioning information can be found in the `package.json` file.

## **Setup**
To setup the Chrome extension, perform the following steps:

1. cd chrome-extension (Go to the chrome-extension directory)
2. Run `npm run build` for a production environment or `npm run start` for a development environment. The SASS compiler will convert the `.scss` file into a `.css` file, then Webpack will compile the TypeScript files into JavaScript files and create the appropriate bundles. Webpack will also copy additional files as required.
3. Go to chrome://extensions and click "Load Unpacked".
4. Select the `dist` folder within the `chrome-extension` directory.
5. The extension should be usable!

Modify the `package.json` file with additional `npm` scripts as required.

There is a `.prettierrc` file for formatting, a `tsconfig.json` file for compilation options, and a `.eslintrc.json` file for linting and error checking.

The main files are located in the `scripts/` folder, although experiments and other tests are located in `experiments/` folder. The experiments are not stable and require modification and testing to successfully integrate them into the application. **Use at your own risk!**