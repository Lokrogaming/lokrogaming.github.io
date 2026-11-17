#!/usr/bin/env python3
import os, re, time

ROOT = '/var/www/lokro.dev'
VERSION = str(int(time.time()))

html_files = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in ('.git', 'node_modules', 'dist')]
    for f in filenames:
        if f.endswith('.html'):
            html_files.append(os.path.join(dirpath, f))

patterns = [
    (r'(href=["\']/assets/site\.css)(\?v=[^"\']*)?["\']', r'\1?v={VERSION}"'),
    (r'(src=["\']/assets/site\.js)(\?v=[^"\']*)?["\']', r'\1?v={VERSION}"'),
]

count = 0
for path in html_files:
    with open(path, 'r', encoding='utf-8') as fh:
        content = fh.read()
    new_content = content
    for pattern, repl in patterns:
        new_content = re.sub(pattern, repl.replace('{VERSION}', VERSION), new_content)
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as fh:
            fh.write(new_content)
        count += 1

print(f"Cache-Buster v{VERSION} auf {count} HTML-Dateien angewendet.")
