"""
    Basic flask app to link frontend to database.
"""

import os
import gzip

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request, redirect
from flask_cors import CORS
from pymongo import MongoClient

load_dotenv()

app = Flask(__name__)
CORS(app)

client = MongoClient(os.environ.get("LOCAL_CONNECTION_STRING"))


@app.route("/")
def welcome():
    """ Root path. """
    return redirect("/tlx")


@app.route("/tlx")
def tlx():
    """ tlx survey """
    return render_template('tlx.html')


@app.route("/savetlx", methods=["POST"])
def save_tlx():
    """ Save tlx result. """
    if request.json is not None:
        json_data = request.get_json()
        tlx_db = client.get_database("tlx")
        tlx_col = tlx_db.get_collection("tlx")
        tlx_col.insert_one(json_data)
        return jsonify({"success": True})

    return jsonify({"error": "Missing body"}), 400


@app.route("/insertSession", methods=["POST"])
def insert_session():
    """ Insert a new session or update an existing one. """
    if request.get_json() is not None:
        json_data = request.get_json()

        sessionsdb = client.get_database("sessions")
        collection_name = json_data["prDetails"]["userOrOrg"] + \
            json_data["prDetails"]["repository"]
        collection = sessionsdb.get_collection(collection_name)

        string_events = json_data["state"]["stringEvents"]
        encoded_events = gzip.compress(string_events.encode('utf-8'))
        json_data["state"]["encodedEvents"] = encoded_events

        json_data["state"].pop("stringEvents")

        db_id = ""
        # Replace this code below with the commented code above for proper session management.
        result = collection.replace_one(
            {"sessionDetails.id": json_data["state"]["sessionDetails"]["id"]},
            json_data["state"], upsert=True)

        if result.upserted_id is not None:
            db_id = result.upserted_id
        else:
            result = collection.find_one(
                {"sessionDetails.id": json_data["state"]["sessionDetails"]["id"]})
            db_id = result["_id"]

        collection.update_one(
            {"_id": db_id}, {"$set": {"sessionDetails.id": str(db_id)}})

        return jsonify({"id": str(db_id)})

    return jsonify({"error": "Missing body."}), 400


@app.route("/checkUnique/<title>", methods=["POST"])
def check_unique(title):
    """ Check if a session is unique. NOT USED IN CURRENT IMPLEMENTATION. """

    if request.get_json() is not None:
        json_data = request.get_json()
        sessions = client.get_database("sessions")
        collection_name = json_data["prDetails"]["userOrOrg"] + \
            json_data["prDetails"]["repository"]
        collection = sessions.get_collection(collection_name)
        is_unique = collection.count_documents(
            {"sessionDetails.title": title}) == 0
        return jsonify({"isUnique": is_unique})

    return jsonify({"error": "Missing body."}), 400


@app.route("/loadSession/<session_id>", methods=["POST"])
def load_session(session_id):
    """ Load a session if it exists. """
    if request.get_json() is not None:
        json_data = request.get_json()
        sessions = client.get_database("sessions")
        collection_name = json_data["userOrOrg"] + json_data["repository"]
        collection = sessions.get_collection(collection_name)
        doc = collection.find_one({"sessionDetails.id": session_id})

        if doc is not None:
            if "encodedEvents" in doc:
                byte_events = gzip.decompress(doc["encodedEvents"])
                string_events = bytes.decode(byte_events, "utf-8")

                return_doc = {
                    "events": None,
                    "stringEvents": string_events,
                    "sessionDetails": doc["sessionDetails"],
                    "comments": doc["comments"],
                    "nextCommentId": doc["nextCommentId"]
                }
            else:
                return_doc = {
                    "events": None,
                    "stringEvents": doc["stringEvents"],
                    "sessionDetails": doc["sessionDetails"],
                    "comments": doc["comments"],
                    "nextCommentId": doc["nextCommentId"]
                }

            return jsonify(return_doc)

        return jsonify({})

    return jsonify({"error": "Missing body."}), 400


if __name__ == "__main__":
    app.secret_key = os.environ.get("SECRET_KEY")
    app.debug = True
    app.run()
