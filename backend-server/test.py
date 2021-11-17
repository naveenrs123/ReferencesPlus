# Code to read text from a raw URL.
from flask import jsonify
import json
import urllib.request

url: str = "https://github.com/angular/angular/raw/aef63e7ae53c62b3fba33a5066060966b506ba7c/.circleci/config.yml"
url2 = "https://raw.githubusercontent.com/angular/angular/45e4e60fd6b8ae30a18368ac613f8f8ff4da3718/packages/router/src/create_router_state.ts"
url3 = "https://raw.githubusercontent.com/jquery/jquery/a684e6ba836f7c553968d7d026ed7941e1a612d8/test/unit/effects.js"
url3_search = "https://api.github.com/repositories/167174/contents/src/attributes/classes.js?ref=a684e6ba836f7c553968d7d026ed7941e1a612d8"


def printFileFromSearch(file_url):
    file = urllib.request.urlopen(file_url)
    json_file = json.loads(file.read())
    printFileFromRaw(json_file["download_url"])

def printFileFromRaw(file_url):
    file = urllib.request.urlopen(file_url)
    count = 0
    for line in file:
        decoded_line: str = "#" + str(count) + " " + line.decode("utf-8")
        # remove the new line character after each line.
        decoded_line = decoded_line[0: len(decoded_line) - 1]
        count += 1
        print(decoded_line)

printFileFromSearch(url3_search)