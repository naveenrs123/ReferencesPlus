## **Overview**
Currently, the backend server acts as a middle-man between the extension and the database. The server takes data captured by the Chrome extension combined with session data, processes it, then stores it in the database. Additionally, the backend server also retrieves sessions from the database and sends it to the Chrome extension.

## **Technical Details**
The backend server is written using **Python** and **Flask** because its easy to get a simple server running and Python provides easy access to various Data Science and ML Libraries that may be useful for future endeavours or developing other features.

The database is a **MongoDB** database hosted on Microsoft Azure.

There is a function_parser library that is copied locally with a few modifications from the original. These changes were done to make the library work with javascript_code correctly and fix some bugs. Unfortunately, it does not appear to be functional. **Use at your own risk!**

Locally, the version of Python used is `3.9.7`.

### **Environment Variables**
Several environment variables are used by the backend server. These are:
- LOCAL_CONNECTION_STRING - Connection string for the mongodb database you are using.
- CLIENT_ID - Client Id provided by GitHub for your OAuth application.
- CLIENT_SECRET - Client secret provided by GitHub for your OAuth application.
- REDIRECT_URI - a URI that GitHub will redirect to during the authorization process.
- [SECRET_KEY](https://flask.palletsprojects.com/en/2.1.x/config/#SECRET_KEY) - used for securely signing the session cookie.

You will need to add a `.env` file to the `backend-server/` directory and populate it with values for the specified environment variables.

### **Deployment**
The backend server and database are deployed on Microsoft Azure. There are some general instructions for how to deploy a Python app [here](https://docs.microsoft.com/en-us/azure/app-service/quickstart-python?tabs=flask%2Cwindows%2Cazure-portal%2Cvscode-deploy%2Cterminal-bash%2Cdeploy-instructions-azportal%2Cdeploy-instructions-zip-azcli&pivots=python-framework-flask) and instructions for how to create a MongoDB database and use it with Python [here](https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb/create-mongodb-python).

### **Setup**
This project makes use of Python's virtual environments. To setup the project for development, enter the following commands into the console.

1. cd backend-server (Go to the backend-server directory)
1. `python -m venv .venv` (Create the virtual environment.)
1. `source .venv/scripts/activate` (Activate the environment.)
1. `pip install --upgrade pip` (OPTIONAL: Upgrade pip).
1. `pip install wheel setuptools` (Useful tools for installing other requirements and local packages.)
1. `pip install -r requirements.txt` (Install requirements + dependencies for main project.)
1. `python setup.py install` (Go to function_parser directory first.) **(SEE NOTE)**
1. `build_grammars` (Command line script to build the tree sitter grammars for the relevant languages) **(SEE NOTE)**

**NOTE:** For various reasons, steps 7 & 8 are not functional. More work needs to be done to refine the function_parser library if you want to pursue code search as a new feature. Alternatively, you will need to find another tool or build one yourself.

To deactivate the venv, you can type `deactivate` in the terminal.