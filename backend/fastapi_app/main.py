from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .loader import load_all

app = FastAPI(title="API ANEEL Analytics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cache = load_all()

@app.get("/datasets")
def list_all():
    return list(cache.keys())

@app.get("/datasets/{name}")
def get_dataset(name: str):
    if name not in cache:
        raise HTTPException(404, detail="Arquivo não encontrado")
    df = cache[name]
    return df.to_dict(orient="records")

@app.get("/indicadores/perdas")
def indicadores_perdas():
    if "perdas.xlsx" not in cache and "perdas.csv" not in cache:
        raise HTTPException(404, detail="Dataset de perdas não encontrado")

    df = cache.get("perdas.xlsx") or cache.get("perdas.csv")

    df["Score"] = (
        df["Perdas_Nao_Tecnicas"] * 0.5 +
        df["Perdas_Totais"] * 0.3 +
        df["Consumo"] * 0.2
    )

    return df.sort_values("Score", ascending=False).to_dict(orient="records")
@app.get("/")
def root():
    return {"message": "API ANEEL rodando"}