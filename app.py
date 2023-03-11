import json
from typing import Union

import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from ensemble_dr import (
    DRResult,
    EnsembleDR,
    EnsembleDRResult,
    Point,
    TSNEHParams,
    TSNEHParamsBody,
    UMAPHParams,
    UMAPHParamsBody,
    UMAPWrapper,
    TSNEWrapper,
    preset_methods,
    PresetMethodNames,
)


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)


demo_files = {
    "breast_cancer": "diagnosis",
    "milknew": "Grade",
    "mobile_price": "price_range",
    "fashion-mnist": "label",
    "diabetes": "Diabetes_012",
}

app = FastAPI()


@app.get("/v1/preset")
async def v1_preset(title: str, method: PresetMethodNames):
    with open(f"./data/{title}/{method}.json") as f:
        result = json.load(f)
    return result


@app.get("/v2/preset")
async def v2_preset(title: str, method: PresetMethodNames):
    df = pd.read_csv(f"./data/{title}.csv")
    values = df.drop([demo_files[title]], axis=1)
    target = df[demo_files[title]]
    ensemble_dr = EnsembleDR(values, target)

    methods = preset_methods[method]
    drs = []
    if "tsne" in method:
        drs.extend([TSNEWrapper(values.values, hparams) for hparams in preset_methods[method]])  # type: ignore
    elif "umap" in method:
        drs.extend([UMAPWrapper(values.values, hparams) for hparams in preset_methods[method]])  # type: ignore

    dr_results = [
        DRResult(
            [
                Point(i, x=float(row[0]), y=float(row[1]), label=target[i])
                for i, row in enumerate(drs[j])
            ],
            methods[j],
        )
        for j in range(len(drs))
    ]
    fsm_result = ensemble_dr.fit(drs)
    result = EnsembleDRResult(dr_results, fsm_result)
    with open(f"./data/{title}/{method}.json", "w") as f:
        json.dump(result.__dict__(), f, indent=2, cls=NumpyEncoder)

    return result.__dict__()


@app.post("/v1/dr")
async def v1_dr(title: str, method: str, body: Union[TSNEHParamsBody, UMAPHParamsBody]):
    pass


@app.post("/v2/dr")
async def v2_dr(title: str, method: str, body: Union[TSNEHParamsBody, UMAPHParamsBody]):
    pass


app.mount("/", StaticFiles(directory="static", html=True), name="static")
