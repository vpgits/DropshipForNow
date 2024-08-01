import requests
import json
import re

target = ["title", "itemDetailUrl", "imagePath"]

def main(url):
    r = requests.get(url)
    match = re.search(r'data: ({.+})', r.text)
    if match:
        data_str = match.group(1)
        data = json.loads(data_str)
        goal = [data['pageModule'][x] for x in target] + \
            [data['priceModule']['formatedActivityPrice']]
        print(goal)
    else:
        print("No data found in the response.")

userURL = input("Enter URL Here : ")
main(userURL)
