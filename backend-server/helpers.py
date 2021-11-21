from urllib.request import urlopen
import json
import sys

def print_file_from_search(file_url):
    file = urlopen(file_url)
    json_file = json.loads(file.read())
    raw_file_to_line_array(json_file["download_url"])


def raw_file_to_line_array(file_url):
    file = urlopen(file_url)
    count = 0
    lines = []
    contents = ""
    for line in file:
        decoded_line = line.decode("utf-8")
        # remove the new line character after each line.
        decoded_line = decoded_line[0: len(decoded_line) - 1]
        #print(decoded_line, file=sys.stderr)
        lines.append(decoded_line)
        contents += decoded_line.strip()
        count += 1

    return {"contents": contents, "lines": lines}

def get_directory(path: str) -> str:
    path_tokens = path.split("/")
    if len(path_tokens) > 1:
        return path_tokens[len(path_tokens) - 2]
    else:
        return ""