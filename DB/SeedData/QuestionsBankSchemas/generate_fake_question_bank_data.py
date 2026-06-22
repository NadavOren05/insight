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
        "name": "קל",
        "description": "בודק זיכרון בסיסי או מיומנות ישירה מהכיתה.",
        "sort_order": 1,
    },
    {
        "code": "medium",
        "name": "בינוני",
        "description": "דורש יישום של המיומנות במצב מוכר.",
        "sort_order": 2,
    },
    {
        "code": "hard",
        "name": "קשה",
        "description": "דורש הסבר, העברה או חשיבה בכמה שלבים.",
        "sort_order": 3,
    },
]

QUESTION_TYPES = [
    {
        "code": "mcq",
        "name": "רב ברירה",
        "description": "התלמיד/ה בוחר/ת תשובה אחת מתוך כמה אפשרויות.",
    },
    {
        "code": "open_answer",
        "name": "תשובה פתוחה",
        "description": "התלמיד/ה כותב/ת תשובה קצרה בטקסט חופשי.",
    },
    {
        "code": "true_false",
        "name": "נכון או לא נכון",
        "description": "התלמיד/ה מחליט/ה אם הטענה נכונה או לא נכונה.",
    },
]

MCQ_BANK_BY_TOPIC = {
    "שברים": [
        ("איזה שבר שווה ל-1/2?", "2/4", ["1/3", "2/4", "3/5", "4/7"]),
        ("מה המכנה המשותף הקטן ביותר של 1/3 ו-1/6?", "6", ["3", "6", "9", "12"]),
        ("כמה זה 1/4 + 1/4?", "1/2", ["1/4", "1/2", "2/8", "3/4"]),
        ("איזה שבר גדול יותר: 2/3 או 1/3?", "2/3", ["1/3", "2/3", "1/6", "2/6"]),
        ("מה התוצאה של 3/4 - 1/4?", "1/2", ["1/4", "1/2", "2/4", "1"]),
        ("איזה שבר שווה ל-3/6?", "1/2", ["1/2", "2/3", "3/4", "1/6"]),
        ("כמה רבעים יש בשלם אחד?", "4", ["2", "3", "4", "8"]),
        ("מהו 1/2 מתוך 10?", "5", ["2", "4", "5", "10"]),
        ("איזה שבר קטן יותר: 1/5 או 1/2?", "1/5", ["1/5", "1/2", "2/5", "5/2"]),
        ("מה המכנה המשותף הקטן ביותר של 1/4 ו-1/8?", "8", ["4", "8", "12", "16"]),
        ("איזה שבר שווה ל-4/8?", "1/2", ["1/4", "1/2", "3/8", "4/6"]),
        ("כמה זה 2/5 + 1/5?", "3/5", ["2/10", "3/5", "3/10", "1/5"]),
        ("איזה שבר גדול יותר: 3/4 או 2/4?", "3/4", ["1/4", "2/4", "3/4", "4/4"]),
        ("מה התוצאה של 5/6 - 2/6?", "3/6", ["2/6", "3/6", "5/12", "7/6"]),
        ("איזה שבר שווה ל-2/8 לאחר צמצום?", "1/4", ["1/2", "1/4", "2/4", "4/8"]),
    ],
    "גיאומטריה": [
        ("כמה צלעות יש למלבן?", "4", ["3", "4", "5", "6"]),
        ("איזו צורה כוללת שלוש צלעות?", "משולש", ["ריבוע", "משולש", "מלבן", "מחומש"]),
        ("מה מאפיין ריבוע?", "כל הצלעות שוות", ["יש לו צלע אחת", "כל הצלעות שוות", "אין לו זוויות", "יש לו חמש צלעות"]),
        ("כמה זוויות יש במשולש?", "3", ["2", "3", "4", "5"]),
        ("איזו צורה היא עיגול?", "צורה ללא צלעות ישרות", ["צורה עם שלוש צלעות", "צורה ללא צלעות ישרות", "צורה עם ארבע פינות", "צורה עם חמש צלעות"]),
        ("במלבן, אילו צלעות שוות?", "הצלעות הנגדיות", ["כל הצלעות תמיד שונות", "הצלעות הנגדיות", "רק צלע אחת", "אין צלעות שוות"]),
        ("איזה גוף תלת ממדי נראה כמו קופסה?", "תיבה", ["כדור", "תיבה", "חרוט", "גליל"]),
        ("מהו קו ישר?", "קו שאינו מתעקל", ["קו שאינו מתעקל", "קו מעגלי", "נקודה אחת", "זווית בלבד"]),
        ("איזו זווית קטנה מזווית ישרה?", "זווית חדה", ["זווית קהה", "זווית שטוחה", "זווית חדה", "זווית מלאה"]),
        ("כמה צלעות יש למחומש?", "5", ["4", "5", "6", "8"]),
        ("מה מודדים בהיקף?", "את אורך המסגרת", ["את שטח הפנים", "את אורך המסגרת", "את המשקל", "את מספר הצבעים"]),
        ("מה מודדים בשטח?", "כמה מקום הצורה מכסה", ["כמה מקום הצורה מכסה", "כמה הצורה גבוהה", "כמה הצורה כבדה", "כמה זמן נדרש לצייר"]),
    ],
    "בעיות מילוליות": [
        ("אם לדנה היו 8 עפרונות והיא קיבלה עוד 5, כמה עפרונות יש לה?", "13", ["3", "12", "13", "15"]),
        ("בכיתה יש 24 תלמידים. 6 יצאו לספרייה. כמה נשארו בכיתה?", "18", ["16", "18", "20", "30"]),
        ("יואב חילק 12 מדבקות שווה בשווה בין 3 חברים. כמה קיבל כל חבר?", "4", ["3", "4", "6", "9"]),
        ("בכל קופסה יש 5 כדורים. כמה כדורים יש ב-4 קופסאות?", "20", ["9", "15", "20", "25"]),
        ("נועה קראה 7 עמודים ביום ראשון ו-9 ביום שני. כמה עמודים קראה יחד?", "16", ["14", "16", "18", "19"]),
        ("בחנות היו 30 מחברות ונמכרו 11. כמה מחברות נשארו?", "19", ["11", "18", "19", "41"]),
        ("אם 5 ילדים קיבלו 2 תפוחים כל אחד, כמה תפוחים חולקו?", "10", ["7", "10", "12", "15"]),
        ("רכבת יצאה ב-8:00 והנסיעה נמשכה שעתיים. מתי הגיעה?", "10:00", ["9:00", "10:00", "11:00", "12:00"]),
        ("בשקית יש 18 סוכריות. מחלקים אותן בין 6 ילדים. כמה יקבל כל ילד?", "3", ["2", "3", "6", "12"]),
        ("מיכל קנתה 3 ספרים במחיר 10 שקלים כל אחד. כמה שילמה?", "30", ["13", "20", "30", "40"]),
        ("אם היו 14 פרחים וקטפו 4, כמה נשארו?", "10", ["8", "10", "14", "18"]),
        ("איזו פעולה מתאימה למילה 'נשארו' בבעיה?", "חיסור", ["חיבור", "חיסור", "כפל", "השוואת צבעים"]),
    ],
    "הבנת הנקרא": [
        ("מה כדאי לעשות לפני שעונים על שאלה על טקסט?", "לקרוא את הטקסט בעיון", ["לנחש מיד", "לדלג על הכותרת", "לקרוא את הטקסט בעיון", "לענות לפי זיכרון בלבד"]),
        ("מהו רעיון מרכזי?", "המסר העיקרי של הטקסט", ["פרט קטן", "שם הכותב", "המסר העיקרי של הטקסט", "מספר העמוד"]),
        ("איזו מילה עוזרת לזהות סיבה?", "כי", ["אבל", "כי", "גם", "או"]),
        ("מה עושים כשמופיעה מילה לא מוכרת?", "בודקים לפי ההקשר", ["מוחקים אותה", "בודקים לפי ההקשר", "מתעלמים מכל המשפט", "מסיימים לקרוא"]),
        ("מהי כותרת טובה?", "כותרת שמרמזת על נושא הטקסט", ["כותרת אקראית", "כותרת שמרמזת על נושא הטקסט", "כותרת ארוכה תמיד", "כותרת עם מספר בלבד"]),
        ("מהו פרט תומך?", "מידע שמחזק את הרעיון המרכזי", ["שם של צבע", "מידע שמחזק את הרעיון המרכזי", "שאלה בלי תשובה", "מילה באנגלית"]),
        ("איזו שאלה בודקת רצף אירועים?", "מה קרה אחר כך?", ["מי כתב?", "מה קרה אחר כך?", "כמה אותיות?", "איזה צבע?"]),
        ("מה פירוש להסיק מסקנה?", "להבין משהו שלא נאמר במפורש", ["להעתיק משפט", "להבין משהו שלא נאמר במפורש", "לספור מילים", "לקרוא רק כותרת"]),
        ("מה כדאי לסמן בזמן קריאה?", "מידע חשוב", ["כל מילה", "מידע חשוב", "רווחים בלבד", "מספרי שורות בלבד"]),
        ("איזו תשובה טובה לשאלה על טקסט?", "תשובה שמבוססת על הטקסט", ["תשובה בלי קשר", "תשובה שמבוססת על הטקסט", "תשובה הכי קצרה תמיד", "תשובה באנגלית בלבד"]),
        ("מה עוזר לזהות דמות מרכזית?", "מי מופיע ופועל לאורך הטקסט", ["מי מופיע רק פעם אחת", "מי מופיע ופועל לאורך הטקסט", "המילה הארוכה ביותר", "סימני הפיסוק"]),
        ("מה עושים אחרי קריאת פסקה קשה?", "חוזרים וקוראים שוב לאט", ["מדלגים עליה", "חוזרים וקוראים שוב לאט", "סוגרים את הספר", "משנים את הכותרת"]),
    ],
    "מבנה כתיבה": [
        ("מה צריך להופיע בתחילת תשובה מנומקת?", "טענה ברורה", ["סיכום בלבד", "טענה ברורה", "רשימת צבעים", "שאלה חדשה"]),
        ("איזה חלק מחזק טענה?", "נימוק", ["ניחוש", "נימוק", "כותרת בלבד", "מספר עמוד"]),
        ("מהו משפט פתיחה טוב?", "משפט שמציג את הרעיון", ["משפט לא קשור", "משפט שמציג את הרעיון", "מילה אחת בלבד", "סימן שאלה"]),
        ("מה כדאי לעשות בסוף פסקה?", "לסכם את הרעיון", ["להתחיל נושא אחר בלי קשר", "לסכם את הרעיון", "למחוק את הנימוק", "להוסיף תרגיל חשבון"]),
        ("איזו מילת קישור מתאימה להוספת רעיון?", "בנוסף", ["לכן", "בנוסף", "אבל", "לפני"]),
        ("איזו מילת קישור מתאימה למסקנה?", "לכן", ["לכן", "גם", "או", "אולי"]),
        ("מה הופך תשובה לברורה?", "סדר הגיוני בין המשפטים", ["הרבה סימני קריאה", "סדר הגיוני בין המשפטים", "בלי רווחים", "משפטים אקראיים"]),
        ("מהו נימוק טוב?", "הסבר שתומך בטענה", ["מילה לא קשורה", "הסבר שתומך בטענה", "ציור בלבד", "תאריך"]),
        ("מה כדאי לבדוק לפני שמגישים תשובה?", "שהמשפטים קשורים לשאלה", ["רק את צבע העיפרון", "שהמשפטים קשורים לשאלה", "כמה שורות יש", "אם יש מספרים"]),
        ("מה תפקיד הדוגמה?", "להמחיש את ההסבר", ["להחליף את הטענה", "להמחיש את ההסבר", "לסיים בלי נימוק", "לבלבל את הקורא"]),
        ("מהי פסקה?", "קבוצת משפטים סביב רעיון אחד", ["מילה אחת", "קבוצת משפטים סביב רעיון אחד", "רק כותרת", "רשימת מספרים"]),
        ("איזו תשובה עדיפה?", "תשובה עם טענה ונימוק", ["תשובה עם טענה ונימוק", "תשובה בלי הסבר", "תשובה אקראית", "תשובה רק של מילה אחת"]),
    ],
}


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


def fallback_mcq(topic_name: str, index: int) -> tuple[str, str, list[str]]:
    prompts = [
        (
            f"מהו הצעד הראשון שכדאי לבצע כשמתרגלים את הנושא {topic_name}?",
            "לקרוא את ההוראה בעיון",
            ["לקרוא את ההוראה בעיון", "לנחש מיד", "לדלג על השאלה", "לבחור תשובה אקראית"],
        ),
        (
            f"איזו פעולה עוזרת לבדוק הבנה בנושא {topic_name}?",
            "להסביר דוגמה במילים שלי",
            ["להעתיק בלי להבין", "להסביר דוגמה במילים שלי", "לסמן תשובה בלי בדיקה", "להתעלם מהמילים הקשות"],
        ),
        (
            f"מה כדאי לעשות אחרי טעות בנושא {topic_name}?",
            "לבדוק איפה התחיל הקושי",
            ["לעבור הלאה בלי לבדוק", "לבדוק איפה התחיל הקושי", "למחוק את השאלה", "לבחור אותה תשובה שוב"],
        ),
        (
            f"איזו תשובה מראה הבנה טובה בנושא {topic_name}?",
            "תשובה שמבוססת על הסבר",
            ["תשובה שמבוססת על הסבר", "תשובה אקראית", "תשובה בלי קשר לשאלה", "תשובה ריקה"],
        ),
    ]
    return prompts[index % len(prompts)]


def topic_prompt(topic_name: str, index: int) -> tuple[str, str, list[str]]:
    topic_bank = MCQ_BANK_BY_TOPIC.get(topic_name)
    if topic_bank:
        return topic_bank[index % len(topic_bank)]
    return fallback_mcq(topic_name, index)


def build_options(question_id: str, correct_answer: str, options: list[str]) -> list[dict[str, Any]]:
    normalized_options = list(dict.fromkeys(options))
    if correct_answer not in normalized_options:
        normalized_options.insert(0, correct_answer)

    return [
        {
            "id": stable_id(f"option:{question_id}:{sort_order}:{option}"),
            "question_id": question_id,
            "option_text": option,
            "is_correct": option == correct_answer,
            "sort_order": sort_order,
            "created_at": timestamp(),
        }
        for sort_order, option in enumerate(normalized_options, start=1)
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

    for topic in topics:
        subject = subject_by_id[topic["subject_id"]]
        for index in range(questions_per_topic):
            difficulty_code = difficulty_cycle[index % len(difficulty_cycle)]
            question_type_code = "mcq"
            question_text, correct_answer, option_texts = topic_prompt(topic["name"], index)
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
                "metadata_json": json.dumps(metadata, ensure_ascii=False, separators=(",", ":")),
                "source": "human_created" if index == 0 else "imported",
                "is_active": True,
                "created_at": timestamp(),
                "_question_type_code": question_type_code,
            }
            questions.append(row)
            questions_by_topic.setdefault(topic["id"], []).append(row)
            options.extend(build_options(question_id, correct_answer, option_texts))

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
                "title": f"תרגול בנושא {topic_name}",
                "generation_reason": "נוצר על בסיס נתוני למידה אחרונים והמלצות שמיועדות להורים.",
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
                answer_text = "עדיין לא בטוח/ה"

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
    parser.add_argument("--questions-per-topic", type=int, default=12)
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
