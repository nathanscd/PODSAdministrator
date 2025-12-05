import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Páginas oficiais da ANEEL que possuem planilhas
TARGET_PAGES = [
    "https://www.gov.br/aneel/pt-br/assuntos/distribuicao/perdas-de-energia",
    "https://www.gov.br/aneel/pt-br/centrais-de-conteudos/relatorios-e-indicadores/distribuicao",
    "https://www.gov.br/aneel/pt-br/centrais-de-conteudos/relatorios-e-indicadores/tarifas-e-informacoes-economico-financeiras"
]

# Extensões que queremos baixar
VALID_EXTENSIONS = (".xls", ".xlsx", ".csv")

# Onde salvar
OUTPUT_DIR = "dados_aneel"

os.makedirs(OUTPUT_DIR, exist_ok=True)


def get_links_from_page(url: str):
    try:
        r = requests.get(url, timeout=15)
        r.raise_for_status()
    except:
        print(f"Erro ao acessar {url}")
        return []

    soup = BeautifulSoup(r.text, "html.parser")
    links = []

    for a in soup.find_all("a", href=True):
        href = a["href"].lower()

        if href.endswith(VALID_EXTENSIONS):
            full_url = urljoin(url, a["href"])
            links.append(full_url)

    return links


def download_file(url: str):
    filename = url.split("/")[-1].split("?")[0]
    output_path = os.path.join(OUTPUT_DIR, filename)

    # Se já existir, não baixa
    if os.path.exists(output_path):
        print(f"[SKIP] {filename} já existe")
        return

    try:
        print(f"[BAIXANDO] {filename}")
        r = requests.get(url, timeout=30)
        r.raise_for_status()

        with open(output_path, "wb") as f:
            f.write(r.content)

        print(f"[OK] Salvo em {output_path}")
    except Exception as e:
        print(f"[ERRO] Não foi possível baixar {url}")
        print(e)


def main():
    all_links = set()

    print("Buscando planilhas nas páginas oficiais da ANEEL...\n")

    for page in TARGET_PAGES:
        print(f"Raspando: {page}")
        links = get_links_from_page(page)
        print(f"Encontrados {len(links)} arquivos\n")

        for link in links:
            all_links.add(link)

    print(f"Total de arquivos encontrados: {len(all_links)}\n")

    for link in all_links:
        download_file(link)


if __name__ == "__main__":
    main()
