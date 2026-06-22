from __future__ import annotations

import argparse
import csv
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from random import Random
from typing import Any
from uuid import NAMESPACE_URL, uuid5


BASE_DIR = Path(__file__).resolve().parent
CSV_DIR = BASE_DIR / "csv"
SQL_DIR = BASE_DIR / "sql"

NOW = datetime(2026, 6, 22, 12, 0, tzinfo=timezone.utc)
BASE_DATE = date(2026, 2, 1)

TABLE_ORDER = [
    "schools",
    "teachers",
    "classes",
    "students",
    "parents",
    "student_parents",
    "subjects",
    "topics",
    "grades",
    "attendance",
    "student_ai_analysis",
    "ai_analysis_topics",
    "recommendations",
    "parent_actions",
]

HEADERS = {
    "schools": ["id", "name", "city", "district", "peripheral_index", "created_at"],
    "teachers": ["id", "full_name", "email", "phone", "school_id", "created_at"],
    "classes": ["id", "school_id", "name", "grade", "homeroom_teacher_id", "created_at"],
    "students": ["id", "full_name", "class_id", "created_at"],
    "parents": ["id", "full_name", "phone", "email", "preferred_language", "created_at"],
    "student_parents": [
        "id",
        "student_id",
        "parent_id",
        "relation_type",
        "is_primary_contact",
        "created_at",
    ],
    "subjects": ["id", "name", "class_id", "teacher_id", "created_at"],
    "topics": ["id", "subject_id", "name", "taught_date", "created_at"],
    "grades": [
        "id",
        "student_id",
        "topic_id",
        "type",
        "score",
        "max_score",
        "date",
        "notes",
        "created_at",
    ],
    "attendance": ["id", "student_id", "topic_id", "date", "status", "created_at"],
    "student_ai_analysis": [
        "id",
        "student_id",
        "generated_at",
        "risk_level",
        "trend",
        "attendance_flag",
        "parent_summary",
        "created_at",
    ],
    "ai_analysis_topics": [
        "id",
        "analysis_id",
        "topic_id",
        "type",
        "confidence_score",
        "created_at",
    ],
    "recommendations": [
        "id",
        "analysis_id",
        "student_id",
        "title",
        "description",
        "recommendation_type",
        "priority",
        "status",
        "created_at",
    ],
    "parent_actions": [
        "id",
        "student_id",
        "parent_id",
        "recommendation_id",
        "action_type",
        "status",
        "completed_at",
        "parent_feedback",
        "created_at",
    ],
}

FIRST_NAMES = [
    "נועה",
    "מאיה",
    "דניאל",
    "תמר",
    "איתן",
    "יעל",
    "עמית",
    "ליאור",
    "רוני",
    "שירה",
    "יונתן",
    "הילה",
]
LAST_NAMES = [
    "כהן",
    "לוי",
    "מזרחי",
    "פרץ",
    "ביטון",
    "אברהם",
    "פרידמן",
    "אזולאי",
]
SUBJECT_TOPICS = {
    "Math": {
        "name": "מתמטיקה",
        "topics": [
            ("Fractions", "שברים"),
            ("Geometry", "גיאומטריה"),
            ("Word problems", "בעיות מילוליות"),
        ],
    },
    "Hebrew": {
        "name": "עברית",
        "topics": [
            ("Reading comprehension", "הבנת הנקרא"),
            ("Writing structure", "מבנה כתיבה"),
            ("Vocabulary", "אוצר מילים"),
        ],
    },
    "English": {
        "name": "אנגלית",
        "topics": [
            ("Vocabulary", "אוצר מילים באנגלית"),
            ("Grammar", "דקדוק באנגלית"),
            ("Short reading", "קריאה קצרה באנגלית"),
        ],
    },
}
GRADE_TYPES = ["quiz", "homework", "exam", "project", "participation"]
ATTENDANCE_STATUSES = ["present", "present", "present", "present", "late", "absent", "excused"]
SCHOOL_CITIES = ["תל אביב", "חיפה", "ירושלים", "באר שבע"]
SCHOOL_DISTRICTS = ["מרכז", "צפון", "ירושלים", "דרום"]
GRADE_LETTERS = {4: "ד", 5: "ה", 6: "ו", 7: "ז", 8: "ח", 9: "ט"}


def stable_id(name: str) -> str:
    return str(uuid5(NAMESPACE_URL, f"edtech-seed:{name}"))


def timestamp(offset_days: int = 0) -> str:
    return (NOW + timedelta(days=offset_days)).isoformat()


def slug(value: str) -> str:
    return value.lower().replace(" ", ".").replace("'", "")


def class_name(grade: int, school_index: int, class_index: int) -> str:
    grade_letter = GRADE_LETTERS.get(grade, str(grade))
    return f"כיתה {grade_letter}-{school_index}{class_index}"


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
        file.write(f"-- Generated fake data for {table}. Regenerate with generate_fake_data.py.\n")
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


def generate_data(
    schools_count: int,
    classes_per_school: int,
    students_per_class: int,
    seed: int,
) -> dict[str, list[dict[str, Any]]]:
    rng = Random(seed)
    rows: dict[str, list[dict[str, Any]]] = {table: [] for table in TABLE_ORDER}
    student_context: list[dict[str, Any]] = []
    topic_context: list[dict[str, Any]] = []
    teacher_by_class_subject: dict[tuple[str, str], str] = {}

    for school_index in range(1, schools_count + 1):
        school_id = stable_id(f"school:{school_index}")
        rows["schools"].append(
            {
                "id": school_id,
                "name": f"בית ספר הדגמה אינסייט {school_index}",
                "city": SCHOOL_CITIES[(school_index - 1) % len(SCHOOL_CITIES)],
                "district": SCHOOL_DISTRICTS[(school_index - 1) % len(SCHOOL_DISTRICTS)],
                "peripheral_index": rng.randint(3, 8),
                "created_at": timestamp(),
            }
        )

        school_teacher_ids: list[str] = []
        for teacher_index in range(1, classes_per_school * len(SUBJECT_TOPICS) + 2):
            name = f"{FIRST_NAMES[(teacher_index + school_index) % len(FIRST_NAMES)]} {LAST_NAMES[(teacher_index * 2) % len(LAST_NAMES)]}"
            teacher_id = stable_id(f"teacher:{school_index}:{teacher_index}")
            school_teacher_ids.append(teacher_id)
            rows["teachers"].append(
                {
                    "id": teacher_id,
                    "full_name": name,
                    "email": f"teacher{school_index:02d}{teacher_index:02d}@demo-school.example",
                    "phone": f"+972-50-{school_index:02d}{teacher_index:05d}",
                    "school_id": school_id,
                    "created_at": timestamp(),
                }
            )

        for class_index in range(1, classes_per_school + 1):
            grade = 3 + class_index
            class_id = stable_id(f"class:{school_index}:{class_index}")
            homeroom_teacher_id = school_teacher_ids[class_index - 1]
            rows["classes"].append(
                {
                    "id": class_id,
                    "school_id": school_id,
                    "name": class_name(grade, school_index, class_index),
                    "grade": grade,
                    "homeroom_teacher_id": homeroom_teacher_id,
                    "created_at": timestamp(),
                }
            )

            for subject_index, (subject_key, subject) in enumerate(SUBJECT_TOPICS.items(), start=1):
                teacher_id = school_teacher_ids[(class_index + subject_index) % len(school_teacher_ids)]
                teacher_by_class_subject[(class_id, subject_key)] = teacher_id
                subject_id = stable_id(f"subject:{school_index}:{class_index}:{subject_key}")
                rows["subjects"].append(
                    {
                        "id": subject_id,
                        "name": subject["name"],
                        "class_id": class_id,
                        "teacher_id": teacher_id,
                        "created_at": timestamp(),
                    }
                )

                for topic_index, (topic_key, topic_name) in enumerate(subject["topics"], start=1):
                    taught_date = BASE_DATE + timedelta(days=(class_index * 7) + (topic_index * 10))
                    topic_id = stable_id(f"topic:{school_index}:{class_index}:{subject_key}:{topic_key}")
                    rows["topics"].append(
                        {
                            "id": topic_id,
                            "subject_id": subject_id,
                            "name": topic_name,
                            "taught_date": taught_date.isoformat(),
                            "created_at": timestamp(),
                        }
                    )
                    topic_context.append(
                        {
                            "id": topic_id,
                            "class_id": class_id,
                            "name": topic_name,
                            "subject_key": subject_key,
                            "subject_name": subject["name"],
                            "taught_date": taught_date,
                        }
                    )

            for student_index in range(1, students_per_class + 1):
                student_name = (
                    f"{FIRST_NAMES[(student_index + class_index) % len(FIRST_NAMES)]} "
                    f"{LAST_NAMES[(student_index + school_index) % len(LAST_NAMES)]}"
                )
                student_id = stable_id(f"student:{school_index}:{class_index}:{student_index}")
                rows["students"].append(
                    {
                        "id": student_id,
                        "full_name": student_name,
                        "class_id": class_id,
                        "created_at": timestamp(),
                    }
                )
                student_context.append(
                    {
                        "id": student_id,
                        "name": student_name,
                        "class_id": class_id,
                        "student_index": student_index,
                    }
                )

                for parent_number, relation_type in [(1, "mother"), (2, "father")]:
                    parent_name = (
                        f"{FIRST_NAMES[(student_index + parent_number + 3) % len(FIRST_NAMES)]} "
                        f"{LAST_NAMES[(student_index + school_index) % len(LAST_NAMES)]}"
                    )
                    parent_id = stable_id(f"parent:{school_index}:{class_index}:{student_index}:{parent_number}")
                    rows["parents"].append(
                        {
                            "id": parent_id,
                            "full_name": parent_name,
                            "phone": f"+972-52-{school_index}{class_index}{student_index:02d}{parent_number:03d}",
                            "email": f"parent{school_index:02d}{class_index:02d}{student_index:02d}{parent_number}@parent.example",
                            "preferred_language": "he",
                            "created_at": timestamp(),
                        }
                    )
                    rows["student_parents"].append(
                        {
                            "id": stable_id(f"student_parent:{student_id}:{parent_id}"),
                            "student_id": student_id,
                            "parent_id": parent_id,
                            "relation_type": relation_type,
                            "is_primary_contact": parent_number == 1,
                            "created_at": timestamp(),
                        }
                    )

    topics_by_class: dict[str, list[dict[str, Any]]] = {}
    for topic in topic_context:
        topics_by_class.setdefault(topic["class_id"], []).append(topic)

    for student in student_context:
        student_topics = topics_by_class[student["class_id"]]
        low_score_count = 0
        absence_count = 0

        for topic_index, topic in enumerate(student_topics, start=1):
            score_bias = -18 if student["student_index"] % 5 == 0 and topic_index in [1, 2] else 0
            score = max(35, min(100, rng.randint(68, 98) + score_bias))
            if score < 65:
                low_score_count += 1
            rows["grades"].append(
                {
                    "id": stable_id(f"grade:{student['id']}:{topic['id']}"),
                    "student_id": student["id"],
                    "topic_id": topic["id"],
                    "type": GRADE_TYPES[(topic_index + student["student_index"]) % len(GRADE_TYPES)],
                    "score": score,
                    "max_score": 100,
                    "date": (topic["taught_date"] + timedelta(days=5)).isoformat(),
                    "notes": build_grade_note(score, topic["name"]),
                    "created_at": timestamp(),
                }
            )

            status = ATTENDANCE_STATUSES[(topic_index + student["student_index"] + rng.randint(0, 3)) % len(ATTENDANCE_STATUSES)]
            if student["student_index"] % 7 == 0 and topic_index in [2, 3]:
                status = "absent"
            if status == "absent":
                absence_count += 1
            rows["attendance"].append(
                {
                    "id": stable_id(f"attendance:{student['id']}:{topic['id']}"),
                    "student_id": student["id"],
                    "topic_id": topic["id"],
                    "date": topic["taught_date"].isoformat(),
                    "status": status,
                    "created_at": timestamp(),
                }
            )

        risk_level = min(10, max(1, 2 + low_score_count + absence_count))
        trend = "declining" if risk_level >= 7 else "improving" if risk_level <= 3 else "stable"
        analysis_id = stable_id(f"analysis:{student['id']}")
        rows["student_ai_analysis"].append(
            {
                "id": analysis_id,
                "student_id": student["id"],
                "generated_at": timestamp(1),
                "risk_level": risk_level,
                "trend": trend,
                "attendance_flag": absence_count >= 2,
                "parent_summary": build_parent_summary(student["name"], risk_level, trend),
                "created_at": timestamp(1),
            }
        )

        selected_topics = student_topics[:3]
        for offset, topic in enumerate(selected_topics):
            analysis_type = "weak" if risk_level >= 6 and offset == 0 else "missed" if absence_count >= 2 and offset == 1 else "strong"
            rows["ai_analysis_topics"].append(
                {
                    "id": stable_id(f"analysis_topic:{analysis_id}:{topic['id']}:{analysis_type}"),
                    "analysis_id": analysis_id,
                    "topic_id": topic["id"],
                    "type": analysis_type,
                    "confidence_score": f"{rng.uniform(0.720, 0.960):.3f}",
                    "created_at": timestamp(1),
                }
            )

        primary_parent_id = next(
            row["parent_id"]
            for row in rows["student_parents"]
            if row["student_id"] == student["id"] and row["is_primary_contact"]
        )
        recommendation_specs = build_recommendations(risk_level, absence_count)
        for recommendation_index, recommendation in enumerate(recommendation_specs, start=1):
            recommendation_id = stable_id(f"recommendation:{analysis_id}:{recommendation_index}")
            status = "pending" if recommendation_index == 1 else rng.choice(["pending", "completed", "dismissed"])
            rows["recommendations"].append(
                {
                    "id": recommendation_id,
                    "analysis_id": analysis_id,
                    "student_id": student["id"],
                    "title": recommendation["title"],
                    "description": recommendation["description"],
                    "recommendation_type": recommendation["type"],
                    "priority": recommendation["priority"],
                    "status": status,
                    "created_at": timestamp(1),
                }
            )
            if status != "pending":
                rows["parent_actions"].append(
                    {
                        "id": stable_id(f"parent_action:{recommendation_id}"),
                        "student_id": student["id"],
                        "parent_id": primary_parent_id,
                        "recommendation_id": recommendation_id,
                        "action_type": "practiced_at_home" if status == "completed" else "dismissed",
                        "status": status,
                        "completed_at": timestamp(3) if status == "completed" else "",
                        "parent_feedback": "בוצע תרגול קצר בבית." if status == "completed" else "ההמלצה סומנה כלא רלוונטית כרגע.",
                        "created_at": timestamp(2),
                    }
                )

    return rows


def build_grade_note(score: int, topic_name: str) -> str:
    if score < 65:
        return f"נדרש תרגול נוסף בנושא {topic_name}."
    if score >= 90:
        return f"הבנה חזקה בנושא {topic_name}."
    return f"ניכרת התקדמות יציבה בנושא {topic_name}."


def build_parent_summary(student_name: str, risk_level: int, trend: str) -> str:
    if risk_level >= 7:
        return f"{student_name} זקוק/ה לתמיכה ממוקדת השבוע. הנתונים מצביעים על קושי לפי ציונים ונוכחות."
    if risk_level <= 3:
        return f"{student_name} מציג/ה סימני למידה חיוביים. כדאי לשמר את השגרה ולעודד תרגול קצר ועקבי."
    return f"{student_name} במצב יציב ברוב הנושאים. חזרה קצרה בבית יכולה לחזק את החומר האחרון שנלמד."


def build_recommendations(risk_level: int, absence_count: int) -> list[dict[str, Any]]:
    recommendations = [
        {
            "title": "חזרה קצרה על נושא אחרון בבית",
            "description": "הקדישו 10 דקות לחזרה על הנושא האחרון ובקשו מהילד/ה להסביר דוגמה אחת במילים שלו/ה.",
            "type": "home_practice",
            "priority": 3,
        }
    ]
    if risk_level >= 6:
        recommendations.append(
            {
                "title": "שיחה קצרה עם המורה",
                "description": "כדאי לפנות למורה כדי להבין איזו מיומנות בכיתה דורשת כרגע את התמיכה המשמעותית ביותר.",
                "type": "teacher_contact",
                "priority": 1,
            }
        )
    if absence_count >= 2:
        recommendations.append(
            {
                "title": "השלמת שיעורים שהוחמצו",
                "description": "בקשו את החומר מהשיעורים שהוחמצו והשלימו פעילות אחת לפני השיעור הבא.",
                "type": "attendance_follow_up",
                "priority": 2,
            }
        )
    return recommendations


def write_all(rows_by_table: dict[str, list[dict[str, Any]]]) -> None:
    for table in TABLE_ORDER:
        write_csv(table, rows_by_table[table])
        write_sql(table, rows_by_table[table])

    manifest = BASE_DIR / "manifest.txt"
    with manifest.open("w", encoding="utf-8") as file:
        for table in TABLE_ORDER:
            file.write(f"{table}: {len(rows_by_table[table])} rows\n")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate deterministic fake CSV and SQL seed data.")
    parser.add_argument("--schools", type=int, default=2)
    parser.add_argument("--classes-per-school", type=int, default=2)
    parser.add_argument("--students-per-class", type=int, default=6)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    rows = generate_data(
        schools_count=args.schools,
        classes_per_school=args.classes_per_school,
        students_per_class=args.students_per_class,
        seed=args.seed,
    )
    write_all(rows)
    print(f"Generated fake data in {CSV_DIR} and {SQL_DIR}.")
    for table in TABLE_ORDER:
        print(f"{table}: {len(rows[table])} rows")


if __name__ == "__main__":
    main()
