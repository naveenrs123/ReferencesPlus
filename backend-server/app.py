from flask import Flask, jsonify, render_template
from flask_cors import CORS
import pymongo as mongo
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)

load_dotenv()

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
    