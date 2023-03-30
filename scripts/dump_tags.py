import argparse
import json
import urllib.parse

from datetime import datetime, timedelta
from pathlib import Path

# Create an arguments parser.
parser = argparse.ArgumentParser(description='Dump hosts info')

parser.add_argument('-d', '--directory', default='hosts', type=str, help='hosts directory path')
parser.add_argument('-m', '--mode', action='store', default='print', type=str, choices=['print', 'url', 'tweet'], help='specify the dump mode')
parser.add_argument('-r', '--range', action='store', type=str, help='date range for url mode like YYYY-MM-DD_YYYY-MM-DD')
parser.add_argument('-t', '--template', action='store', default='template', type=str, help='template for tweet mode')

args = parser.parse_args()

# Parse the date range.
if args.range is not None:
    start_date_str, end_date_str = args.range.split('_')
    
    date_format = '%Y-%m-%d'
    start_date = datetime.strptime(start_date_str, date_format)
    end_date = datetime.strptime(end_date_str, date_format)

    date_strs = []

    for n in range(0, int((end_date - start_date).days), 15):
        current_date = start_date + timedelta(days=n)
        current_date_str = current_date.strftime(date_format)
        date_strs.append(current_date_str)

# Define actions
def dump_url(tags):
    base_url = 'https://twitter.com/search?q={}&src=typed_query'

    for tag in tags:
        for date_str in date_strs:
            query = f"{tag} until:{date_str}"
            quoted_query = urllib.parse.quote(query)

            url = base_url.format(quoted_query)
            print(url)

def dump_tweet(tags):
    if len(tags) == 0:
        return
    
    print(args.template)
    print(' '.join(tags))
    print()

actions = {
    'print': print,
    'url': dump_url,
    'tweet': dump_tweet,
}

action = actions[args.mode]

# Load hosts.
hosts_dir = Path(args.directory)

if not hosts_dir.exists():
    print('Not found: ./hosts')

for host_path in hosts_dir.iterdir():
    with open(host_path, 'r', encoding='utf8') as f:
        obj = json.load(f)

    # Do actions.
    action(obj['tags'])