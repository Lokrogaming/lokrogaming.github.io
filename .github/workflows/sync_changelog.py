"""Fetch published changelog entries from AutoChangelog and write them
into changelog.json + changelog-{en,fr,it,es,tr,la}.json.

Two sources (selected via CHANGELOG_SOURCE, default "api"):

  api — AutoChangelog REST API (Pro/Team + approval).
         Required secret:  AUTOCHANGELOG_API_KEY
         Optional vars:    AUTOCHANGELOG_OWNER (default Lokrogaming)
                           AUTOCHANGELOG_REPO  (default lokrogaming.github.io)

  rss — Public RSS feed of the changelog. No key, no approval, works
        on the Free plan. Required var: CHANGELOG_RSS_URL
        (the feed URL from the AutoChangelog dashboard / public page).
        RSS items provide title/link/date/summary; version numbers are
        parsed from the title when present (e.g. "Release v1.5.2").

A non-empty result overwrites all 7 files (entries appear in their
original language; translate them in the AutoChangelog dashboard if
needed). An empty result leaves local files untouched.
"""
import json
import os
import re
import sys
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime

BASE = "https://autochangelog.com/api/v1"
OWNER = os.environ.get("AUTOCHANGELOG_OWNER", "Lokrogaming") or "Lokrogaming"
REPO = os.environ.get("AUTOCHANGELOG_REPO", "lokrogaming.github.io") or "lokrogaming.github.io"
API_KEY = os.environ.get("AUTOCHANGELOG_API_KEY", "")
LANG_SUFFIXES = ["", "-en", "-fr", "-it", "-es", "-tr", "-la"]
MAX_ENTRIES = 50


def api_get(path, params=None):
    if not API_KEY:
        print("::error::AUTOCHANGELOG_API_KEY secret is missing. Add it under Settings > Secrets > Actions.")
        sys.exit(1)
    url = BASE + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + API_KEY})
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            return json.load(res)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")[:300]
        hints = {
            401: "API key missing/invalid \u2013 check AUTOCHANGELOG_API_KEY secret.",
            403: "API access disabled for this account (Pro/Team + approval required).",
            404: "Project not found \u2013 check AUTOCHANGELOG_OWNER/AUTOCHANGELOG_REPO.",
            429: "Rate limit exceeded \u2013 try again later.",
        }
        print("::error::AutoChangelog API HTTP " + str(e.code) + ": " + hints.get(e.code, body))
        sys.exit(1)


def slim(detail):
    return {
        "id": detail.get("id"),
        "slug": detail.get("slug", ""),
        "title": detail.get("title", ""),
        "version": detail.get("version", ""),
        "date": (detail.get("published_at") or "")[:10],
        "summary": detail.get("summary", ""),
        "content_html": detail.get("content_html", ""),
        "tags": detail.get("tags", []),
        "url": detail.get("url", ""),
    }


def main():
    entries = []
    page = 1
    while True:
        data = api_get(
            "/projects/" + OWNER + "/" + REPO + "/entries",
            {"status": "published", "page": page, "per_page": 100},
        )
        entries.extend(data.get("entries", []))
        paging = data.get("pagination", {})
        if page >= paging.get("total_pages", 1):
            break
        page += 1

    if not entries:
        print("API returned zero published entries \u2013 local files left untouched.")
        return

    full = []
    for e in entries[:MAX_ENTRIES]:
        detail = api_get("/projects/" + OWNER + "/" + REPO + "/entries/" + str(e.get("id")))
        full.append(slim(detail.get("entry", e)))
    full.sort(key=lambda x: x.get("date", ""), reverse=True)

    for suffix in LANG_SUFFIXES:
        path = "changelog" + suffix + ".json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(full, f, ensure_ascii=False, indent=2)
            f.write("\n")
    print("Wrote " + str(len(full)) + " entries to " + str(len(LANG_SUFFIXES)) + " files.")


if __name__ == "__main__":
    main()
