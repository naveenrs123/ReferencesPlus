#TODO: Improve OAuth2 Flow to include session tokens and make better use of state. 

#region imports
import pymongo as mongo
import urllib.parse
import random
import requests
import string
import sys
import os

from flask import Flask, jsonify, render_template, request, redirect, session
from flask_cors import CORS
from dotenv import load_dotenv
from github import Github
#endregion imports

load_dotenv()

app = Flask(__name__)
CORS(app)

client = mongo.MongoClient(os.environ.get("LOCAL_CONNECTION_STRING"), serverSelectionTimeoutMS=2000)

@app.route("/")
def welcome():
    return render_template('index.html')
    
@app.route("/health", methods=["GET"])
def hello():
    return jsonify(message="Simple server is running.")

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
        headers = { "Accept": "application/json"}
        params = {
            "client_id": os.environ.get("CLIENT_ID"),
            "client_secret": os.environ.get("CLIENT_SECRET"),
            "code": request.args.get("code")
        }
        req = requests.post(token_url, params=params, headers=headers)
        res = req.json()

        if "access_token" in res:
            session['access_token'] = res['access_token']
     
            g = Github(session['access_token'])
            print(g.get_user().name, file=sys.stderr)
            print(g.get_rate_limit().core.limit, file=sys.stderr)

    return redirect("https://www.github.com")

@app.route("/token_callback", methods=["GET", "POST"])
def token_callback():
    return "Successfully authenticated!"

if __name__ == "__main__":
    app.secret_key = "werodgdfbegaegd"
    app.debug = True
    app.run()