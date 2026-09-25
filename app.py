"""
JobNetWork — Artha.link job fetcher & WhatsApp formatter
----------------------------------------------------------
Pipeline:
    Artha API -> fetch -> filter -> dedup -> format message -> review -> post
"""

import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("ARTHA_API_KEY")
BASE_URL = "https://api.artha.link/api/v1"

HEADERS = {"X-API-Key": API_KEY}

# File used to remember which job URLs we've already posted, so re-runs don't repeat them.
SEEN_JOBS_FILE = "seen_jobs.json"

# Emojis by keyword found in the job title — used to make the WhatsApp message scannable.
TITLE_EMOJI_RULES = [
    ("intern", "🎓"),
    ("data", "📊"),
    ("developer", "💻"),
    ("engineer", "⚙️"),
    ("designer", "🎨"),
    ("marketing", "📣"),
    ("sales", "🤝"),
    ("hr", "🧑‍💼"),
]
DEFAULT_EMOJI = "🚀"


def fetch_jobs(limit=25, location="IN", sort_by="newest"):
    """Fetch raw job listings from the Artha API."""
    params = {"limit": limit, "location": location, "sort_by": sort_by}
    response = requests.get(f"{BASE_URL}/jobs", headers=HEADERS, params=params)

    if response.status_code != 200:
        raise RuntimeError(f"Artha API error {response.status_code}: {response.text}")

    return response.json()["data"]["items"]


def debug_print_job_fields():
    """
    One-off helper: prints every field Artha returns for a single job,
    so you can see if there's a real experience/level field to filter on
    (rather than guessing from the title).
    """
    jobs = fetch_jobs(limit=1)
    if jobs:
        print(json.dumps(jobs[0], indent=2))
    else:
        print("No jobs returned.")


def load_seen_urls():
    if os.path.exists(SEEN_JOBS_FILE):
        with open(SEEN_JOBS_FILE, "r") as f:
            return set(json.load(f))
    return set()


def save_seen_urls(urls):
    with open(SEEN_JOBS_FILE, "w") as f:
        json.dump(sorted(urls), f, indent=2)


# Titles containing these are almost never fresher/intern-suitable — used to
# exclude senior roles when fresher_only=True.
SENIOR_EXCLUDE_KEYWORDS = [
    "senior", "sr.", "sr ", "lead", "manager", "head", "director",
    "principal", "architect", "vp", "vice president", "chief",
    "president", "staff engineer", "avp", "gm ", "general manager",
    "9+ yr", "10+ yr", "8+ yr", "7+ yr", "6+ yr", "5+ yr",
]

# Titles containing these are strong positive signals for entry-level/intern roles.
FRESHER_INCLUDE_KEYWORDS = [
    "fresher", "intern", "internship", "graduate", "trainee",
    "junior", "entry level", "entry-level", "associate", "0-1 yr",
    "0-2 yr", "1-2 yr",
]


def is_fresher_friendly(job):
    """
    Heuristic since Artha's job objects (as fetched here) don't expose a
    numeric experience field: exclude clearly senior titles, and treat
    everything else as fresher-friendly unless it screams senior.
    If you find a real experience field via debug_print_job_fields(),
    swap this to use it directly — it'll be far more accurate.
    """
    title = (job.get("title") or "").lower()

    if any(k in title for k in SENIOR_EXCLUDE_KEYWORDS):
        return False

    return True


def filter_jobs(jobs, keywords=None, cities=None, job_types=None, fresher_only=False):
    """
    Keep jobs matching ANY of the given keywords (title/company match)
    AND (if provided) matching city/job_type filters.
    All filters are optional — pass None/False to skip a filter.
    """
    filtered = []
    for job in jobs:
        title = (job.get("title") or "").lower()
        city = (job.get("city") or "").lower()
        job_type = (job.get("job_type") or "").lower()

        if keywords:
            if not any(k.lower() in title for k in keywords):
                continue

        if cities:
            if not any(c.lower() in city for c in cities):
                continue

        if job_types:
            if not any(t.lower() in job_type for t in job_types):
                continue

        if fresher_only and not is_fresher_friendly(job):
            continue

        filtered.append(job)

    return filtered


def dedupe_jobs(jobs, seen_urls):
    """Remove jobs whose apply URL we've already posted before."""
    fresh = []
    for job in jobs:
        url = job.get("url")
        if url and url not in seen_urls:
            fresh.append(job)
    return fresh


def emoji_for_title(title):
    title_lower = title.lower()
    for keyword, emoji in TITLE_EMOJI_RULES:
        if keyword in title_lower:
            return emoji
    return DEFAULT_EMOJI


def format_whatsapp_message(jobs):
    """Turn a list of job dicts into a ready-to-post WhatsApp message."""
    if not jobs:
        return None

    lines = ["🚀 *New Job Opportunities*", ""]

    for job in jobs:
        title = job.get("title", "Untitled role")
        company = job.get("company", "Unknown company")
        city = job.get("city") or "Location N/A"
        url = job.get("url", "")

        emoji = emoji_for_title(title)
        lines.append(f"{emoji} {title} — {company} | {city}")
        lines.append(f"🔗 Apply: {url}")
        lines.append("")

    lines.append("📌 Check eligibility before applying.")
    return "\n".join(lines)


def run(limit=50, keywords=None, cities=None, job_types=None, fresher_only=False):
    if not API_KEY:
        raise RuntimeError("ARTHA_API_KEY not found — check your .env file.")

    seen_urls = load_seen_urls()

    raw_jobs = fetch_jobs(limit=limit)
    filtered = filter_jobs(
        raw_jobs, keywords=keywords, cities=cities, job_types=job_types,
        fresher_only=fresher_only,
    )
    fresh = dedupe_jobs(filtered, seen_urls)

    message = format_whatsapp_message(fresh)

    if message:
        print(message)
        # Mark these as seen only after generating the message — so a crash
        # before review doesn't silently drop jobs.
        seen_urls.update(job["url"] for job in fresh if job.get("url"))
        save_seen_urls(seen_urls)
    else:
        print("No new jobs matched your filters this run.")

    return message


if __name__ == "__main__":
    # Run this once if you want to see every field Artha returns for a job
    # (useful for checking if a real experience-level field exists):
    # debug_print_job_fields()

    # Freshers + interns, all roles (tech and non-tech), any city.
    run(
        limit=50,
        keywords=None,          # no role restriction — tech + non-tech both
        cities=None,            # city is not a constraint
        job_types=None,         # e.g. ["internship", "full-time"]
        fresher_only=True,      # excludes senior/lead/manager-type titles
    )
