#!/usr/bin/env python3
"""
HN Scout — Daily Hacker News post finder for karma building.
Searches for relevant posts where Ricardo can comment with value.
Sends results via Telegram.
"""

import json
import time
import urllib.request
from datetime import datetime, timedelta, timezone

# Config
TELEGRAM_BOT_TOKEN = "8491041674:AAGSOc6MwlpH2p6kvCnbg3iFhS1GGZQarkg"
TELEGRAM_CHAT_ID = "6316418389"
HN_USER = "rrojas-nexus"

# Topics relevant to toolnexus.dev and Ricardo's expertise
SEARCH_QUERIES = [
    "developer tools",
    "self-hosted",
    "client-side",
    "web tools online",
    "CSS generator",
    "JSON formatter",
    "privacy tools",
    "open source tools",
    "Show HN",
    "side project",
]

# Minimum thresholds
MIN_POINTS = 8
MAX_AGE_HOURS = 48
MAX_COMMENTS = 80  # Posts with too many comments = your comment gets buried


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "HN-Scout/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


def get_user_karma() -> int:
    try:
        data = fetch_json(f"https://hacker-news.firebaseio.com/v0/user/{HN_USER}.json")
        return data.get("karma", 0)
    except Exception:
        return -1


def search_posts() -> list:
    cutoff = int((datetime.now(timezone.utc) - timedelta(hours=MAX_AGE_HOURS)).timestamp())
    seen_ids = set()
    results = []

    for query in SEARCH_QUERIES:
        try:
            url = (
                f"https://hn.algolia.com/api/v1/search_by_date?"
                f"query={urllib.parse.quote(query)}"
                f"&tags=story"
                f"&hitsPerPage=5"
                f"&numericFilters=points>{MIN_POINTS},num_comments<{MAX_COMMENTS},"
                f"created_at_i>{cutoff}"
            )
            data = fetch_json(url)
            for hit in data.get("hits", []):
                oid = hit.get("objectID")
                if oid in seen_ids:
                    continue
                seen_ids.add(oid)
                results.append({
                    "id": oid,
                    "title": hit.get("title", ""),
                    "url": hit.get("url", ""),
                    "points": hit.get("points", 0),
                    "comments": hit.get("num_comments", 0),
                    "author": hit.get("author", ""),
                    "created": hit.get("created_at", ""),
                    "query": query,
                })
            time.sleep(0.3)  # Be nice to Algolia
        except Exception as e:
            print(f"Error searching '{query}': {e}")

    # Sort by points descending, take top 10
    results.sort(key=lambda x: x["points"], reverse=True)
    return results[:10]


def classify_post(post: dict) -> str:
    """Classify how relevant a post is for commenting."""
    title = post["title"].lower()
    high_value = ["developer tool", "self-host", "client-side", "show hn", "open source tool",
                  "css", "json", "privacy", "side project", "built", "launched"]
    if any(kw in title for kw in high_value):
        return "ALTA"
    return "MEDIA"


def format_message(posts: list, karma: int) -> str:
    date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    lines = [
        f"🔍 *HN Scout — {date}*",
        f"Karma actual: *{karma}* (meta: 20-30 para repostear)",
        f"Posts encontrados: {len(posts)}",
        "",
    ]

    for i, post in enumerate(posts, 1):
        priority = classify_post(post)
        hn_link = f"https://news.ycombinator.com/item?id={post['id']}"
        lines.append(
            f"*{i}. [{priority}]* {post['title']}\n"
            f"   ⬆ {post['points']} pts | 💬 {post['comments']} comments\n"
            f"   🔗 {hn_link}\n"
        )

    lines.append("---")
    lines.append("Abre conversación con NEXUS y di: _\"prepara comments para HN de hoy\"_")

    return "\n".join(lines)


def send_telegram(message: str):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = json.dumps({
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True,
    }).encode()
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read().decode())
            if result.get("ok"):
                print(f"Telegram sent OK — {len(message)} chars")
            else:
                print(f"Telegram error: {result}")
    except Exception as e:
        print(f"Telegram send failed: {e}")


def main():
    import urllib.parse  # noqa: F811

    print(f"[{datetime.now(timezone.utc).isoformat()}] HN Scout starting...")

    karma = get_user_karma()
    print(f"Current karma: {karma}")

    if karma >= 30:
        send_telegram(
            f"🎉 *Karma alcanzado: {karma}!*\n"
            "Ya puedes repostear toolnexus.dev en HN.\n"
            "Dile a NEXUS que prepare el Show HN post."
        )
        return

    posts = search_posts()
    print(f"Found {len(posts)} relevant posts")

    if not posts:
        print("No posts found, skipping Telegram")
        return

    message = format_message(posts, karma)
    send_telegram(message)
    print("Done!")


if __name__ == "__main__":
    main()
