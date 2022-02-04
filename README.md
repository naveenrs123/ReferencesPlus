# **PR Referencing**

## A Project to Improve Referencing Features in Github

<br>

## **Backend Server**
The backend server is written using Python and Flask because its easy to get a simple server running and Python provides easy access to various Data Science and ML Libraries that may be useful for future endeavours or developing other features.

### **Setup**
This project makes use of Python's virtual environments. To setup the project for development, enter the following commands into the console.

1. cd backend-server (Go to the backend-server directory)
1. `python -m venv .venv` (Create the virtual environment.)
1. `source .venv/scripts/activate` (Activate the environment.)
1. `pip install --upgrade pip` (OPTIONAL: Upgrade pip).
1. `pip install wheel setuptools` (Useful tools for installing other requirements and local packages.)
1. `pip install -r requirements.txt` (Install requirements + dependencies for main project.)
1. `python setup.py install` (Go to function_parser directory first.)
1. `build_grammars` (Command line script to build the tree sitter grammars for the relevant languages)

## **Chrome Extension**
This Chrome extension provides useful tools for emulation and the creation of richer modes of communication in the context of pull requests. There is a specific emphasis on UI development and web applications, since the tools work with the DOM and browser.

The project is written in **TypeScript** and uses **Webpack** for bundling. External libraries such as **RRWeb** are used to provide additional functionality.

For styling **SASS** is used with *.scss* stylesheets, and can be extended depending on how the project evolves.

### **Setup**
To setup the Chrome extension, perform the following steps:

1. cd chrome-extension (Go to the chrome-extension directory)
2. Run `npm run build` for a production environment or `npm run start` for a development environment. The SASS compiler will convert the `.scss` file into a `.css` file, then Webpack will compile the TypeScript files into JavaScript files and create the appropriate bundles. Webpack will also copy additional files as required.
3. Go to chrome://extensions and click "Load Unpacked".
4. Select the `dist` folder within the `chrome-extension` directory.
5. The extension should be usable!

Modify the `package.json` file with additional `npm` scripts as required.

There is a `.prettierrc` file for formatting and a `tsconfig.json` file for linting and error checking.
