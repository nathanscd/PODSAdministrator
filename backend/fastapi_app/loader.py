import os
import pandas as pd

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "processed")

def load_all():
    cache = {}

    if not os.path.exists(DATA_DIR):
        return cache

    for fname in os.listdir(DATA_DIR):
        fpath = os.path.join(DATA_DIR, fname)

        if not os.path.isfile(fpath):
            continue

        if fname.lower().endswith(".csv"):
            try:
                df = pd.read_csv(fpath, encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(fpath, encoding="latin1")
            cache[fname] = df
            print("CSV OK:", fname)

        if fname.lower().endswith(".xlsx") or fname.lower().endswith(".xls"):
            try:
                df = pd.read_excel(fpath)
                cache[fname] = df
            except Exception as e:
                print("erro lendo excel", fname, e)

    return cache
