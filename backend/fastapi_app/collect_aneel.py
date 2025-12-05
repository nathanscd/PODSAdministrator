import os
import requests
import pandas as pd

BASE_OUTPUT = os.path.join(os.path.dirname(__file__), "processed")

DATASETS = [
    "geracao",
    "indicadores-de-distribuicao",
    "sird"
]

def ensure_output():
    if not os.path.exists(BASE_OUTPUT):
        os.makedirs(BASE_OUTPUT)

def get_resources(dataset):
    api = f"https://dadosabertos.aneel.gov.br/api/3/action/package_show?id={dataset}"
    r = requests.get(api, timeout=20).json()

    if not r.get("success"):
        print(f"Erro: dataset {dataset} não encontrado")
        return []

    return r["result"]["resources"]

def download_resource(res):
    url = res["url"]
    name = res["name"] or res["id"]

    if not (url.endswith(".csv") or url.endswith(".xls") or url.endswith(".xlsx")):
        return None

    print(f"Baixando: {name}")
    output = os.path.join(BASE_OUTPUT, name)

    r = requests.get(url, timeout=40)
    with open(output, "wb") as f:
        f.write(r.content)

    return output

def clean_file(path):
    print(f"Processando: {path}")

    ext = path.split(".")[-1].lower()

    try:
        if ext == "csv":
            df = pd.read_csv(path, sep=";", encoding="latin-1")
        else:
            df = pd.read_excel(path)
    except:
        print("Erro ao abrir arquivo, pulando.")
        return

    df.columns = [c.strip().replace(" ", "_") for c in df.columns]
    out = path.replace("." + ext, "_clean.csv")
    df.to_csv(out, index=False)

    print(f"Limpo: {out}")
    return out

def run():
    ensure_output()

    final_files = []

    for dataset in DATASETS:
        print(f"\nDataset: {dataset}")
        resources = get_resources(dataset)

        for res in resources:
            local = download_resource(res)
            if local:
                clean = clean_file(local)
                if clean:
                    final_files.append(clean)

    print("\nArquivos gerados:")
    for f in final_files:
        print(" -", f)

if __name__ == "__main__":
    run()
