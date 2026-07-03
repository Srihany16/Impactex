import psycopg2
import os

def get_conn():
    return psycopg2.connect(os.getenv("IMPACT_DATABASE_URL"))
