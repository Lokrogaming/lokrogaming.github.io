"""Fetch published changelog entries from AutoChangelog and write them
into changelog.json + changelog-{en,fr,it,es,tr,la}.json.

Two sources (selected via CHANGELOG_SOURCE, default "rss"):

  api — AutoChangelog REST API (Pro/Team + approval).
         Required secret:  AUTOCHANGELOG_API_KEY
         Optional vars:    AUTOCHANGELOG_OWNER (default Lokrogaming)
                           AUTOCHANGELOG_REPO  (default lokrogaming.github.io)

  rss — Public RSS feed of the changelog. No key, no approval, works
        on the Free plan. Defaults to the LOKRO feed; override via
        CHANGELOG_RSS_URL var.
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
DEFAULT_RSS_URL = "https://autochangelog.com/changelog/lokrogaming/lokrogaming-github-io.rss"
SOURCE = os.environ.get("CHANGELOG_SOURCE", "rss").strip().lower() or "rss"
RSS_URL = os.environ.get("CHANGELOG_RSS_URL", "").strip() or DEFAULT_RSS_URL
OWNER = os.environ.get("AUTOCHANGELOG_OWNER", "Lokrogaming") or "Lokrogaming"
REPO = os.environ.get("AUTOCHANGELOG_REPO", "lokrogaming.github.io") or "lokrogaming.github.io"
API_KEY = os.environ.get("AUTOCHANGELOG_API_KEY", "")
LANG_SUFFIXES = ["", "-en", "-fr", "-it", "-es", "-tr", "-la"]
MAX_ENTRIES = 50
VERSION_RE = re.compile(r"[vV]?(\d+\.\d+\.\d+(?:[-.][0-9A-Za-z.-]+)*)")


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


def strip_tags(html):
    text = re.sub(r"<[^>]+>", " ", html or "")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def fetch_rss(url):
    """Load entries from the public RSS feed. No authentication needed."""
    if not url:
        print("::error::CHANGELOG_RSS_URL is missing. Set it as a repository variable (Settings > Secrets and variables > Actions > Variables) to the feed URL from the AutoChangelog dashboard.")
        sys.exit(1)
    req = urllib.request.Request(url, headers={"User-Agent": "lokro-changelog-sync/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            root = ET.fromstring(res.read())
    except Exception as e:
        print("::error::Could not load RSS feed: " + str(e))
        sys.exit(1)
    channel = root.find("channel")
    items = channel.findall("item") if channel is not None else root.findall(".//item")
    out = []
    for it in items[:MAX_ENTRIES]:
        title = (it.findtext("title") or "").strip()
        link = (it.findtext("link") or "").strip()
        guid = (it.findtext("guid") or "").strip()
        pub = (it.findtext("pubDate") or "").strip()
        try:
            date = parsedate_to_datetime(pub).date().isoformat() if pub else ""
        except Exception:
            date = ""
        desc = (it.findtext("description") or "").strip()
        content = ""
        for tag in ("{http://purl.org/rss/1.0/modules/content/}encoded", "encoded"):
            el = it.find(tag)
            if el is not None and el.text:
                content = el.text.strip()
                break
        summary = strip_tags(desc)
        if len(summary) > 300:
            summary = summary[:300].rsplit(" ", 1)[0] + " …"
        m = VERSION_RE.search(title)
        out.append(
            {
                "id": guid or link or title,
                "slug": "",
                "title": title,
                "version": m.group(1) if m else "",
                "date": date,
                "summary": summary,
                "content_html": content,
                "tags": [c.text.strip() for c in it.findall("category") if c.text and c.text.strip()],
                "url": link,
            }
        )
    out.sort(key=lambda x: x.get("date", ""), reverse=True)
    return out


def write_files(entries):
    for suffix in LANG_SUFFIXES:
        path = "src/JSON/changelog" + suffix + ".json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(entries, f, ensure_ascii=False, indent=2)
            f.write("\n")
    print("Wrote " + str(len(entries)) + " entries to " + str(len(LANG_SUFFIXES)) + " files.")


def fetch_api():
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
        return []

    full = []
    for e in entries[:MAX_ENTRIES]:
        detail = api_get("/projects/" + OWNER + "/" + REPO + "/entries/" + str(e.get("id")))
        full.append(slim(detail.get("entry", e)))
    full.sort(key=lambda x: x.get("date", ""), reverse=True)
    return full


def main():
    if SOURCE not in ("api", "rss"):
        print("::error::CHANGELOG_SOURCE must be 'api' or 'rss', got '" + SOURCE + "'.")
        sys.exit(1)
    full = fetch_rss(RSS_URL) if SOURCE == "rss" else fetch_api()

    if not full:
        print("Source returned zero published entries – local files left untouched.")
        return

    write_files(full)


if __name__ == "__main__":
    main()
