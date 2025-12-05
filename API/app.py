import requests
from bs4 import BeautifulSoup

urls = [
    "https://www.eneldistribuicao.com.br/",
    "https://www.coelba.com.br/",
    "https://www.cpfl.com.br/"
]

for url in urls:
    html = requests.get(url).text
    soup = BeautifulSoup(html, "html.parser")
    titles = soup.find_all("h2")

    print(f"Novidades em {url}:")
    for t in titles:
        print("-", t.get_text().strip())
