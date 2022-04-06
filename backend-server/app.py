# region imports
import os
import random
import string
import sys
import urllib.parse
from typing import Any, Dict, List, Type

import pymongo
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, session
from flask_cors import CORS
from github import Github
from github.ContentFile import ContentFile
from github.Repository import Repository
from pymongo import MongoClient
from requests.models import Response
from tree_sitter import Language

import function_parser as fp
import helpers as hp
from function_parser.language_data import LANGUAGE_METADATA
from function_parser.process import DataProcessor


# endregion imports

load_dotenv()

app = Flask(__name__)
CORS(app)

client: Type[MongoClient] = MongoClient(
    os.environ.get("LOCAL_CONNECTION_STRING"))

lang: str = "javascript"
DataProcessor.PARSER.set_language(Language(os.path.join(
    fp.__path__[0], "tree-sitter-languages.so"), lang))


@app.route("/")
def welcome():
    return render_template('index.html')


@app.route("/mongohealth", methods=["GET"])
def mongo():
    try:
        return jsonify(client.server_info())
    except Exception:
        print("Unable to connect to the server.")
        return "Failure :("


@app.route("/insertSession", methods=["GET", "POST"])
def insertSession():
    if (request.get_json() != None):
        json_data: hp.InsertSessionReq = request.get_json()

        sessionsdb: Type[pymongo.database.Database] = client.get_database(
            "sessions")

        collectionName: str = json_data["prDetails"]["userOrOrg"] + \
            json_data["prDetails"]["repository"]

        collection = sessionsdb.get_collection(collectionName)

        id = ""

        """
        This section is commented because proper session management is not required for the study.

        result = collection.replace_one(
            {"sessionDetails.title": json_data["state"]["sessionDetails"]["title"]}, json_data["state"], upsert=True)

        if result.upserted_id != None:
            id = str(result.upserted_id)
        else:
            result = collection.find_one(
                {"sessionDetails.title": json_data["state"]["sessionDetails"]["title"]})
            id = str(result["_id"])

        collection.update_one({"sessionDetails.title": json_data["state"]["sessionDetails"]["title"]}, {
                              "$set": {"sessionDetails.id": id}})
        """

        # Replace this code below with the commented code above for proper session management.
        result = collection.replace_one(
            {"sessionDetails.id": json_data["state"]["sessionDetails"]["id"]}, json_data["state"], upsert=True)

        if result.upserted_id != None:
            id = result.upserted_id
        else:
            result = collection.find_one(
                {"sessionDetails.id": json_data["state"]["sessionDetails"]["id"]})
            id = result["_id"]

        collection.update_one({"_id": id}, {
                              "$set": {"sessionDetails.id": str(id)}})

        return jsonify({"id": str(id)})

    return jsonify({"error": "Missing body."}), 400


@app.route("/checkUnique/<title>", methods=["POST"])
def checkUnique(title):
    if (request.get_json() != None):
        json_data = request.get_json()
        sessions: Type[pymongo.database.Database] = client.get_database(
            "sessions")
        collectionName: str = json_data["prDetails"]["userOrOrg"] + \
            json_data["prDetails"]["repository"]
        collection = sessions.get_collection(collectionName)
        isUnique = collection.count_documents(
            {"sessionDetails.title": title}) == 0
        return jsonify({"isUnique": isUnique})

    return jsonify({"error": "Missing body."}), 400


@app.route("/loadSession/<input>", methods=["POST"])
def loadSession(input):
    if (request.get_json() != None):
        json_data = request.get_json()
        sessions: Type[pymongo.database.Database] = client.get_database(
            "sessions")
        collectionName: str = json_data["userOrOrg"] + \
            json_data["repository"]
        collection = sessions.get_collection(collectionName)
        docs = collection.find(
            {"$or": [{"sessionDetails.title": {"$regex": "{}".format(input)}}, {"sessionDetails.id": {"$regex": "{}".format(input)}}]})
        docsArray = []
        for doc in docs:
            docsArray.append(doc["sessionDetails"])
        return jsonify(docsArray)

    return jsonify({"error": "Missing body."}), 400


# TEST ROUTE - NOT REQUIRED FOR UI REFERENCING
@app.route("/auth/<user>", methods=["GET"])
def auth(user):
    state: str = "".join(random.choice(string.ascii_letters)
                         for i in range(16))
    session['state'] = state

    auth_url: str = "https://github.com/login/oauth/authorize"
    params: Dict[str, Any] = {
        "client_id": os.environ.get("CLIENT_ID"),
        "redirect_uri": os.environ.get("REDIRECT_URI"),
        "login": user,
        "scope": "repo user",
        "state":  state
    }
    encoded_params: str = urllib.parse.urlencode(params, safe=':/')
    full_auth_url: str = auth_url + "?" + encoded_params
    return redirect(full_auth_url)


# TEST ROUTE - NOT REQUIRED FOR UI REFERENCING
@app.route("/auth_callback", methods=["GET", "POST"])
def auth_callback():
    if "code" in request.args:
        token_url: str = "https://github.com/login/oauth/access_token"
        headers: Dict[str, Any] = {"Accept": "application/json"}
        params: Dict[str, Any] = {
            "client_id": os.environ.get("CLIENT_ID"),
            "client_secret": os.environ.get("CLIENT_SECRET"),
            "code": request.args.get("code")
        }
        req: Type[Response] = requests.post(
            token_url, params=params, headers=headers)
        res: Dict[str, Any] = req.json()

        if "access_token" in res:
            session['access_token'] = res['access_token']
            os.environ["ACCESS_TOKEN"] = res['access_token']

    return redirect("https://www.github.com")


# TEST ROUTE - NOT REQUIRED FOR UI REFERENCING
@app.route("/authenticated", methods=["GET"])
def authenticated():
    authenticated: bool = False
    if os.environ.get("ACCESS_TOKEN") != None:
        authenticated = True
    response: Type[Response] = jsonify({"authenticated": authenticated})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


# TEST ROUTE - NOT REQUIRED FOR UI REFERENCING
@app.route("/func_parser", methods=["GET"])
def func_parser():
    processor: Type[DataProcessor] = DataProcessor(
        language=lang, language_parser=LANGUAGE_METADATA[lang]["language_parser"])
    dependee: str = "documentationjs/documentation"
    definitions: List[Dict[str, Any]] = processor.process_dee(
        dependee, ext=LANGUAGE_METADATA[lang]["ext"])

    return jsonify(definitions)


# TEST ROUTE - NOT REQUIRED FOR UI REFERENCING
@app.route("/github", methods=["GET"])
def github():
    if (session.get("access_token") != None):
        g: Type[Github] = Github(session.get("access_token"))
        repo: Type[Repository] = g.get_repo("naveenrs123/documentation")
        contents: Type[ContentFile] = repo.get_contents("")
        documents: List[Dict[str, Any]] = []

        while contents:
            file_content: Type[ContentFile] = contents.pop(0)
            if file_content.type == "dir":
                contents.extend(repo.get_contents(file_content.path))
            else:
                file_contents: Dict[str, List[str]] = hp.raw_file_to_line_array(
                    file_content.download_url)
                number_of_lines: int = len(file_contents["lines"])
                document: Dict[str, Any] = {
                    "file_name": file_content.name,
                    "path": file_content.path,
                    "parent_directory": hp.get_directory(file_content.path),
                    "sha": file_content.sha,
                    "number_of_lines": number_of_lines,
                    "contents": file_contents["contents"],
                    "lines": file_contents["lines"],
                    "rate_limit": g.get_rate_limit().core.limit
                }
                documents.append(document)

        return jsonify(document)

    return "No access token."


if __name__ == "__main__":
    app.secret_key = os.environ.get("SECRET_KEY")
    app.debug = True
    app.run()
