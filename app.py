import json

import pandas as pd
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from ensemble_dr import (
    EnsembleDR,
    UMAPWrapper,
    preset_methods,
    UMAPHParams,
    TSNEHParams,
    TSNEHParamsBody,
    UMAPHParamsBody,
)

from typing import Union

demo_files = {
    "breast_cancer": "diagnosis",
    "milknew": "Grade",
    "mobile_price": "price_range",
    "fashion-mnist": "label",
    "diabetes": "Diabetes_012",
}

app = FastAPI()


@app.get("/v1/preset")
async def v1_preset(title: str, method: str):
    with open(f"./data/{title}_result.json") as f:
        result = json.load(f)
    return result


@app.get("/v2/preset")
async def v2_preset(title: str, method: str):
    df = pd.read_csv(f"./data/{title}.csv")
    values = df.drop([demo_files[title]], axis=1)
    target = df[demo_files[title]]
    ensemble_dr = EnsembleDR(values, target)

    methods = preset_methods["umap10"]
    umaps = [UMAPWrapper(values.values, hparams) for hparams in methods]  # type: ignore
    result = ensemble_dr.fit(umaps)

    return result.to_json()


@app.post("/v1/dr")
async def v1_dr(title: str, method: str, body: Union[TSNEHParamsBody, UMAPHParamsBody]):
    pass


@app.post("/v2/dr")
async def v2_dr(title: str, method: str, body: Union[TSNEHParamsBody, UMAPHParamsBody]):
    pass


app.mount("/", StaticFiles(directory="static", html=True), name="static")
