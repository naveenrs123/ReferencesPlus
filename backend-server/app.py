# TODO: Improve OAuth2 Flow to include session tokens and make better use of state.

# region imports
import pymongo as mongo
import urllib.parse
import random
import requests
import string
import json
import sys
import os

from flask import Flask, jsonify, render_template, request, redirect, session
from flask_cors import CORS
from dotenv import load_dotenv
from github import Github

import function_parser as fp
import pandas as pd
from function_parser.language_data import LANGUAGE_METADATA
from function_parser.process import DataProcessor
from tree_sitter import Language

import helpers as hp
# endregion imports

load_dotenv()

app = Flask(__name__)
CORS(app)

client = mongo.MongoClient(os.environ.get("LOCAL_CONNECTION_STRING"))

lang = "javascript"
DataProcessor.PARSER.set_language(Language(os.path.join(fp.__path__[0], "tree-sitter-languages.so"), lang))


@app.route("/")
def welcome():
    return render_template('index.html')


@app.route("/mongo", methods=["GET"])
def mongo():
    try:
        return jsonify(client.server_info())
    except Exception:
        print("Unable to connect to the server.")
        return "Failure :("


@app.route("/auth/<user>", methods=["GET"])
def auth(user):
    state = "".join(random.choice(string.ascii_letters) for i in range(16))
    session['state'] = state

    auth_url = "https://github.com/login/oauth/authorize"
    params = {
        "client_id": os.environ.get("CLIENT_ID"),
        "redirect_uri": os.environ.get("REDIRECT_URI"),
        "login": user,
        "scope": "repo user",
        "state":  state
    }
    encoded_params = urllib.parse.urlencode(params, safe=':/')
    full_auth_url = auth_url + "?" + encoded_params
    print(full_auth_url, file=sys.stderr)
    return redirect(full_auth_url)


@app.route("/auth_callback", methods=["GET", "POST"])
def auth_callback():
    if "code" in request.args:
        token_url = "https://github.com/login/oauth/access_token"
        headers = {"Accept": "application/json"}
        params = {
            "client_id": os.environ.get("CLIENT_ID"),
            "client_secret": os.environ.get("CLIENT_SECRET"),
            "code": request.args.get("code")
        }
        req = requests.post(token_url, params=params, headers=headers)
        res = req.json()

        if "access_token" in res:
            session['access_token'] = res['access_token']

    return redirect("https://www.github.com")


@app.route("/func_parser", methods=["GET"])
def func_parser():
    processor = DataProcessor(language=lang, language_parser=LANGUAGE_METADATA[lang]["language_parser"])
    dependee = "documentationjs/documentation"
    definitions = processor.process_dee(dependee, ext=LANGUAGE_METADATA[lang]["ext"])
    return jsonify(definitions)


@app.route("/github_test", methods=["GET"])
def github_test():
    if (session.get("access_token") != None):
        g = Github(session.get("access_token"))
        
        repo = g.get_repo("PyGithub/PyGithub")
        contents = repo.get_contents("doc/examples/Branch.rst")
        file_contents = hp.raw_file_to_line_array(contents.download_url)
        number_of_lines = len(file_contents)
        
        document = {
            "file_name": contents.name,
            "path": contents.path,
            "parent_directory": hp.get_directory(contents.path),
            "sha": contents.sha,
            "number_of_lines": number_of_lines,
            "file_contents": file_contents,
            "rate_limit": g.get_rate_limit().core.limit
        }
        return jsonify(document)

    return "No access token."


if __name__ == "__main__":
    app.secret_key = os.environ.get("SECRET_KEY")
    app.debug = True
    app.run() 
    