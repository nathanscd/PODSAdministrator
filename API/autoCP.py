import requests
import hashlib
import time

urls = {
    "ANEEL_CP": "https://www.aneel.gov.br/consultas-publicas",
    "MME_Portarias": "https://www.gov.br/mme/pt-br/acesso-a-informacao/portarias",
}

memory = {}

def hash_content(content):
    return hashlib.sha256(content.encode()).hexdigest()

while True:
    for name, url in urls.items():
        html = requests.get(url).text
        h = hash_content(html)

        if name not in memory:
            memory[name] = h
        else:
            if memory[name] != h:
                print("Mudança detectada em:", name, "-", url)
                memory[name] = h

    time.sleep(3600)   # roda a cada 1h
