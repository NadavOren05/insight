from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from random import Random
from typing import Any
from uuid import NAMESPACE_URL, uuid5


BASE_DIR = Path(__file__).resolve().parent
GENERAL_CSV_DIR = BASE_DIR.parent / "GeneralSchemas" / "csv"
CSV_DIR = BASE_DIR / "csv"
SQL_DIR = BASE_DIR / "sql"

NOW = datetime(2026, 6, 22, 12, 0, tzinfo=timezone.utc)

TABLE_ORDER = [
    "question_difficulty_levels",
    "question_types",
    "questions",
    "question_options",
    "generated_exams",
    "exam_questions",
    "student_answers",
]

HEADERS = {
    "question_difficulty_levels": [
        "id",
        "code",
        "name",
        "description",
        "sort_order",
        "created_at",
    ],
    "question_types": ["id", "code", "name", "description", "created_at"],
    "questions": [
        "id",
        "topic_id",
        "difficulty_level_id",
        "question_type_id",
        "question_text",
        "correct_answer",
        "metadata_json",
        "source",
        "is_active",
        "created_at",
    ],
    "question_options": [
        "id",
        "question_id",
        "option_text",
        "is_correct",
        "sort_order",
        "created_at",
    ],
    "generated_exams": [
        "id",
        "student_id",
        "recommendation_id",
        "target_topic_id",
        "title",
        "generation_reason",
        "status",
        "created_at",
        "completed_at",
    ],
    "exam_questions": [
        "id",
        "exam_id",
        "question_id",
        "sort_order",
        "points",
        "created_at",
    ],
    "student_answers": [
        "id",
        "exam_question_id",
        "student_id",
        "answer_text",
        "selected_option_id",
        "is_correct",
        "score",
        "answered_at",
        "created_at",
    ],
}

DIFFICULTY_LEVELS = [
    {
        "code": "easy",
        "name": "Easy",
        "description": "Checks basic recall or a direct classroom skill.",
        "sort_order": 1,
    },
    {
        "code": "medium",
        "name": "Medium",
        "description": "Requires applying the skill in a familiar situation.",
        "sort_order": 2,
    },
    {
        "code": "hard",
        "name": "Hard",
        "description": "Requires explanation, transfer, or multi-step reasoning.",
        "sort_order": 3,
    },
]

QUESTION_TYPES = [
    {
        "code": "mcq",
        "name": "Multiple choice",
        "description": "Student selects one answer from several options.",
    },
    {
        "code": "open_answer",
        "name": "Open answer",
        "description": "Student writes a short free-text answer.",
    },
    {
        "code": "true_false",
        "name": "True or false",
        "description": "Student decides whether a statement is true or false.",
    },
]


def stable_id(name: str) -> str:
    return str(uuid5(NAMESPACE_URL, f"edtech-question-bank-seed:{name}"))


def timestamp(offset_days: int = 0) -> str:
    return (NOW + timedelta(days=offset_days)).isoformat()


def read_csv(table: str) -> list[dict[str, str]]:
    path = GENERAL_CSV_DIR / f"{table}.csv"
    if not path.exists():
        raise FileNotFoundError(
            f"Missing dependency CSV: {path}. Generate GeneralSchemas seed data first."
        )

    with path.open("r", newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def sql_literal(value: Any) -> str:
    if value is None or value == "":
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, int) or isinstance(value, float):
        return str(value)
    text = str(value).replace("'", "''")
    return f"'{text}'"


def write_csv(table: str, rows: list[dict[str, Any]]) -> None:
    CSV_DIR.mkdir(parents=True, exist_ok=True)
    path = CSV_DIR / f"{table}.csv"
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=HEADERS[table], extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def write_sql(table: str, rows: list[dict[str, Any]]) -> None:
    SQL_DIR.mkdir(parents=True, exist_ok=True)
    columns = HEADERS[table]
    path = SQL_DIR / f"{table}.sql"
    with path.open("w", encoding="utf-8") as file:
        file.write(f"-- Generated fake data for {table}. Regenerate with generate_fake_question_bank_data.py.\n")
        if not rows:
            file.write(f"-- No rows generated for {table}.\n")
            return

        file.write(f"INSERT INTO {table} ({', '.join(columns)})\nVALUES\n")
        values = []
        for row in rows:
            values.append("    (" + ", ".join(sql_literal(row.get(column)) for column in columns) + ")")
        file.write(",\n".join(values))
        file.write("\nON CONFLICT (id) DO UPDATE SET\n")
        updates = [f"    {column} = EXCLUDED.{column}" for column in columns if column != "id"]
        file.write(",\n".join(updates))
        file.write(";\n")


def build_lookup_rows() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    difficulty_rows = [
        {
            "id": stable_id(f"difficulty:{level['code']}"),
            "code": level["code"],
            "name": level["name"],
            "description": level["description"],
            "sort_order": level["sort_order"],
            "created_at": timestamp(),
        }
        for level in DIFFICULTY_LEVELS
    ]
    type_rows = [
        {
            "id": stable_id(f"question_type:{question_type['code']}"),
            "code": question_type["code"],
            "name": question_type["name"],
            "description": question_type["description"],
            "created_at": timestamp(),
        }
        for question_type in QUESTION_TYPES
    ]
    return difficulty_rows, type_rows


def topic_prompt(topic_name: str, difficulty_code: str, question_type_code: str, index: int) -> tuple[str, str]:
    if question_type_code == "mcq":
        if topic_name == "Fractions":
            return "Which fraction is equal to one half?", "2/4"
        if topic_name == "Geometry":
            return "How many sides does a rectangle have?", "4"
        if topic_name == "Vocabulary":
            return "Which word means the same as 'quick'?", "fast"
        return f"Which answer best matches the topic '{topic_name}'?", "the main idea"

    if question_type_code == "true_false":
        if topic_name == "Word problems":
            return "A word problem should be read carefully before choosing the operation.", "true"
        if topic_name == "Grammar":
            return "Every complete sentence should express a full idea.", "true"
        return f"Practicing {topic_name} can help strengthen classroom understanding.", "true"

    if difficulty_code == "hard":
        return f"Explain one strategy a student can use when working on {topic_name}.", "Use a clear step-by-step strategy and check the answer."
    return f"Write a short answer that shows understanding of {topic_name}.", f"A correct answer should use the main idea of {topic_name}."


def build_options(question_id: str, correct_answer: str, question_type_code: str) -> list[dict[str, Any]]:
    if question_type_code == "open_answer":
        return []

    if question_type_code == "true_false":
        options = ["true", "false"]
    elif correct_answer == "2/4":
        options = ["1/3", "2/4", "3/5", "4/6"]
    elif correct_answer == "4":
        options = ["3", "4", "5", "6"]
    elif correct_answer == "fast":
        options = ["quiet", "fast", "late", "small"]
    else:
        options = ["a detail", "the main idea", "an unrelated fact", "a title only"]

    return [
        {
            "id": stable_id(f"option:{question_id}:{sort_order}:{option}"),
            "question_id": question_id,
            "option_text": option,
            "is_correct": option == correct_answer,
            "sort_order": sort_order,
            "created_at": timestamp(),
        }
        for sort_order, option in enumerate(options, start=1)
    ]


def build_questions(
    topics: list[dict[str, str]],
    subjects: list[dict[str, str]],
    questions_per_topic: int,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, list[dict[str, Any]]]]:
    difficulty_by_code = {row["code"]: row["id"] for row in build_lookup_rows()[0]}
    type_by_code = {row["code"]: row["id"] for row in build_lookup_rows()[1]}
    subject_by_id = {row["id"]: row for row in subjects}

    questions: list[dict[str, Any]] = []
    options: list[dict[str, Any]] = []
    questions_by_topic: dict[str, list[dict[str, Any]]] = {}
    difficulty_cycle = ["easy", "medium", "hard"]
    type_cycle = ["mcq", "open_answer", "true_false"]

    for topic in topics:
        subject = subject_by_id[topic["subject_id"]]
        for index in range(questions_per_topic):
            difficulty_code = difficulty_cycle[index % len(difficulty_cycle)]
            question_type_code = type_cycle[index % len(type_cycle)]
            question_text, correct_answer = topic_prompt(
                topic["name"],
                difficulty_code,
                question_type_code,
                index + 1,
            )
            question_id = stable_id(f"question:{topic['id']}:{index + 1}")
            metadata = {
                "topic_name": topic["name"],
                "subject_id": topic["subject_id"],
                "subject_name": subject["name"],
                "seed_version": "2026-06-22",
            }
            row = {
                "id": question_id,
                "topic_id": topic["id"],
                "difficulty_level_id": difficulty_by_code[difficulty_code],
                "question_type_id": type_by_code[question_type_code],
                "question_text": question_text,
                "correct_answer": correct_answer,
                "metadata_json": json.dumps(metadata, separators=(",", ":")),
                "source": "human_created" if index == 0 else "imported",
                "is_active": True,
                "created_at": timestamp(),
                "_question_type_code": question_type_code,
            }
            questions.append(row)
            questions_by_topic.setdefault(topic["id"], []).append(row)
            options.extend(build_options(question_id, correct_answer, question_type_code))

    for question in questions:
        question.pop("_question_type_code")

    return questions, options, questions_by_topic


def build_exams(
    students: list[dict[str, str]],
    subjects: list[dict[str, str]],
    topics: list[dict[str, str]],
    recommendations: list[dict[str, str]],
    questions_by_topic: dict[str, list[dict[str, Any]]],
    question_options: list[dict[str, Any]],
    exam_count: int,
    seed: int,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    rng = Random(seed)
    topics_by_subject = {topic["id"]: topic for topic in topics}
    subject_by_id = {subject["id"]: subject for subject in subjects}
    topics_by_class: dict[str, list[dict[str, str]]] = {}
    for topic in topics:
        class_id = subject_by_id[topic["subject_id"]]["class_id"]
        topics_by_class.setdefault(class_id, []).append(topic)

    recommendations_by_student: dict[str, list[dict[str, str]]] = {}
    for recommendation in recommendations:
        recommendations_by_student.setdefault(recommendation["student_id"], []).append(recommendation)

    options_by_question: dict[str, list[dict[str, Any]]] = {}
    for option in question_options:
        options_by_question.setdefault(option["question_id"], []).append(option)

    generated_exams: list[dict[str, Any]] = []
    exam_questions: list[dict[str, Any]] = []
    student_answers: list[dict[str, Any]] = []

    for index, student in enumerate(students[:exam_count], start=1):
        class_topics = topics_by_class.get(student["class_id"], [])
        if not class_topics:
            continue

        target_topic = class_topics[(index - 1) % len(class_topics)]
        recommendation = recommendations_by_student.get(student["id"], [""])[0]
        recommendation_id = recommendation["id"] if isinstance(recommendation, dict) else ""
        status = ["generated", "in_progress", "completed", "completed"][index % 4]
        completed_at = timestamp(4) if status == "completed" else ""
        exam_id = stable_id(f"exam:{student['id']}:{target_topic['id']}")
        topic_name = topics_by_subject[target_topic["id"]]["name"]

        generated_exams.append(
            {
                "id": exam_id,
                "student_id": student["id"],
                "recommendation_id": recommendation_id,
                "target_topic_id": target_topic["id"],
                "title": f"{topic_name} Practice Assessment",
                "generation_reason": "Generated from recent learning data and parent-facing recommendations.",
                "status": status,
                "created_at": timestamp(2),
                "completed_at": completed_at,
            }
        )

        for sort_order, question in enumerate(questions_by_topic[target_topic["id"]], start=1):
            exam_question_id = stable_id(f"exam_question:{exam_id}:{question['id']}")
            points = 2 if sort_order == 3 else 1
            exam_questions.append(
                {
                    "id": exam_question_id,
                    "exam_id": exam_id,
                    "question_id": question["id"],
                    "sort_order": sort_order,
                    "points": points,
                    "created_at": timestamp(2),
                }
            )

            if status != "completed":
                continue

            options = options_by_question.get(question["id"], [])
            is_correct = rng.choice([True, True, True, False])
            selected_option_id = ""
            answer_text = question["correct_answer"]
            if options:
                selected = next((option for option in options if option["is_correct"]), options[0])
                if not is_correct:
                    selected = next((option for option in options if not option["is_correct"]), selected)
                selected_option_id = selected["id"]
                answer_text = selected["option_text"]
            elif not is_correct:
                answer_text = "I am not sure yet."

            student_answers.append(
                {
                    "id": stable_id(f"student_answer:{exam_question_id}:{student['id']}"),
                    "exam_question_id": exam_question_id,
                    "student_id": student["id"],
                    "answer_text": answer_text,
                    "selected_option_id": selected_option_id,
                    "is_correct": is_correct,
                    "score": points if is_correct else 0,
                    "answered_at": timestamp(4),
                    "created_at": timestamp(4),
                }
            )

    return generated_exams, exam_questions, student_answers


def generate_data(questions_per_topic: int, exam_count: int, seed: int) -> dict[str, list[dict[str, Any]]]:
    subjects = read_csv("subjects")
    topics = read_csv("topics")
    students = read_csv("students")
    recommendations = read_csv("recommendations")

    difficulty_rows, type_rows = build_lookup_rows()
    questions, options, questions_by_topic = build_questions(
        topics=topics,
        subjects=subjects,
        questions_per_topic=questions_per_topic,
    )
    exams, exam_questions, student_answers = build_exams(
        students=students,
        subjects=subjects,
        topics=topics,
        recommendations=recommendations,
        questions_by_topic=questions_by_topic,
        question_options=options,
        exam_count=exam_count,
        seed=seed,
    )

    return {
        "question_difficulty_levels": difficulty_rows,
        "question_types": type_rows,
        "questions": questions,
        "question_options": options,
        "generated_exams": exams,
        "exam_questions": exam_questions,
        "student_answers": student_answers,
    }


def write_all(rows_by_table: dict[str, list[dict[str, Any]]]) -> None:
    for table in TABLE_ORDER:
        write_csv(table, rows_by_table[table])
        write_sql(table, rows_by_table[table])

    manifest = BASE_DIR / "manifest.txt"
    with manifest.open("w", encoding="utf-8") as file:
        for table in TABLE_ORDER:
            file.write(f"{table}: {len(rows_by_table[table])} rows\n")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate deterministic fake question-bank CSV and SQL seed data.")
    parser.add_argument("--questions-per-topic", type=int, default=3)
    parser.add_argument("--exam-count", type=int, default=12)
    parser.add_argument("--seed", type=int, default=84)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    rows = generate_data(
        questions_per_topic=args.questions_per_topic,
        exam_count=args.exam_count,
        seed=args.seed,
    )
    write_all(rows)
    print(f"Generated question-bank fake data in {CSV_DIR} and {SQL_DIR}.")
    for table in TABLE_ORDER:
        print(f"{table}: {len(rows[table])} rows")


if __name__ == "__main__":
    main()
