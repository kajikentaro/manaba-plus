import re
import argparse

begin_tag = '<!-- store-info-begin -->'.replace(' ', r'\s*?')
end_tag = '<!-- store-info-end -->'.replace(' ', r'\s*?')

content_regex = re.compile(fr"{begin_tag}\n(.+?)\n{end_tag}", re.DOTALL)

replace_regex = {
    re.compile(r'`(.+)`'): r'\1',
    re.compile(r'\[(.+)\]\(.+\)'): r'\1',
    re.compile('^## ', re.MULTILINE): '⭐ ',
    re.compile('^### ', re.MULTILINE): '● ',
}

parser = argparse.ArgumentParser()
parser.add_argument('-i', '--input', action='append', default=['README.ja.md', 'README.md'], help='input paths')
args = parser.parse_args()

def repl_and_print(text: str):
    for regex, repl in replace_regex.items():
        text = regex.sub(repl, text)

    print(text)

def load(path):
    with open(path, 'r', encoding='utf8') as f:
        contents = f.read()

    matches = content_regex.findall(contents)

    for match in matches:
        repl_and_print(match)

for path in args.input:
    load(path)