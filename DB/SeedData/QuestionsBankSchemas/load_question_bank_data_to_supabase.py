from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from pathlib import Path
from typing import Any
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


BASE_DIR = Path(__file__).resolve().parent
CSV_DIR = BASE_DIR / "csv"

TABLE_ORDER = [
    "question_difficulty_levels",
    "question_types",
    "questions",
    "question_options",
    "generated_exams",
    "exam_questions",
    "student_answers",
]

INTEGER_COLUMNS = {"sort_order", "points", "score"}
BOOLEAN_COLUMNS = {"is_active", "is_correct"}
JSON_COLUMNS = {"metadata_json"}
NULLABLE_EMPTY_COLUMNS = {
    "recommendation_id",
    "target_topic_id",
    "completed_at",
    "selected_option_id",
    "answer_text",
    "is_correct",
    "score",
    "answered_at",
}


def coerce_value(column: str, value: str) -> Any:
    if value == "" and column in NULLABLE_EMPTY_COLUMNS:
        return None
    if column in INTEGER_COLUMNS and value != "":
        return int(value)
    if column in BOOLEAN_COLUMNS and value != "":
        return value.lower() in {"true", "1", "yes"}
    if column in JSON_COLUMNS and value != "":
        return json.loads(value)
    return value


def read_csv_rows(table: str) -> list[dict[str, Any]]:
    path = CSV_DIR / f"{table}.csv"
    if not path.exists():
        raise FileNotFoundError(f"Missing CSV file: {path}")

    with path.open("r", newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        return [
            {column: coerce_value(column, value) for column, value in row.items()}
            for row in reader
        ]


def chunks(rows: list[dict[str, Any]], size: int) -> list[list[dict[str, Any]]]:
    return [rows[index : index + size] for index in range(0, len(rows), size)]


def supabase_request(
    supabase_url: str,
    api_key: str,
    table: str,
    rows: list[dict[str, Any]],
    mode: str,
) -> None:
    base_url = supabase_url.rstrip("/")
    query = ""
    prefer = "return=minimal"
    if mode == "upsert":
        query = "?" + urlencode({"on_conflict": "id"})
        prefer = "resolution=merge-duplicates,return=minimal"

    request = Request(
        f"{base_url}/rest/v1/{table}{query}",
        data=json.dumps(rows).encode("utf-8"),
        method="POST",
        headers={
            "apikey": api_key,
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Prefer": prefer,
        },
    )

    try:
        with urlopen(request, timeout=60) as response:
            if response.status >= 300:
                raise RuntimeError(f"Supabase returned HTTP {response.status} for {table}")
    except HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Supabase error for {table}: HTTP {error.code} {body}") from error


def load_tables(mode: str, batch_size: int) -> None:
    supabase_url = os.getenv("SUPABASE_URL")
    api_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url:
        raise RuntimeError("SUPABASE_URL is required.")
    if not api_key:
        raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is required. SUPABASE_ANON_KEY can work only if RLS allows inserts.")

    for table in TABLE_ORDER:
        rows = read_csv_rows(table)
        if not rows:
            print(f"{table}: skipped, no rows")
            continue

        for batch in chunks(rows, batch_size):
            supabase_request(supabase_url, api_key, table, batch, mode)
        print(f"{table}: loaded {len(rows)} rows")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Load generated question-bank CSV data into Supabase.")
    parser.add_argument("--mode", choices=["upsert", "insert"], default="upsert")
    parser.add_argument("--batch-size", type=int, default=100)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        load_tables(mode=args.mode, batch_size=args.batch_size)
    except Exception as error:
        print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
