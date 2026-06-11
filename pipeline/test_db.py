import os
from dotenv import load_dotenv
import psycopg

load_dotenv()

with psycopg.connect(os.environ["DATABASE_URL"]) as conn:
    with conn.cursor() as cur:
        cur.execute("select version();")
        version = cur.fetchone()
        print("✅ Connected to:", version[0])

        cur.execute("select count(*) from articles;")
        count = cur.fetchone()
        print(f"📊 Articles in DB: {count[0]}")