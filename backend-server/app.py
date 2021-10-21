from flask import Flask, jsonify, render_template
from flask_cors import CORS
import pymongo as mongo
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)

load_dotenv()

pmk = os.environ.get("PRIMARY_MASTER_KEY")
app_name = os.environ.get("COSMOSDB_NAME")

conn_str="mongodb://" + app_name + ":" + pmk + "@" + app_name + ".mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@" + app_name + "@"
#conn_str="mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000"

client = mongo.MongoClient(conn_str, serverSelectionTimeoutMS=2000)

@app.route("/")
def welcome():
    return render_template('index.html');
    
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
    