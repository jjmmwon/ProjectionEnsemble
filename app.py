import json
from typing import Union

import numpy as np
import pandas as pd

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware


from projection_ensemble import (
    DRResult,
    ProjectionEnsemble,
    ProjectionEnsembleResult,
    Point,
    TSNEHParams,
    TSNEHParamsBody,
    UMAPHParams,
    UMAPHParamsBody,
    UMAPWrapper,
    TSNEWrapper,
    procrustes,
    preset_methods,
    PresetMethodNames,
)


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)


demo_files = {
    "mnist_50000": "label",
    "mnist_10000": "label",
}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/v1/preset")
async def v1_preset(title: str, method: PresetMethodNames):
    return FileResponse(f"./data/{title}/{method}.json")


@app.get("/v2/preset")
async def v2_preset(title: str, method: PresetMethodNames):
    # generate new embeddings
    df = pd.read_csv(f"./data/{title}.csv")
    values = df.drop([demo_files[title]], axis=1)
    target = df[demo_files[title]]
    projection_ensemble = ProjectionEnsemble(values, target)

    methods = preset_methods[method]
    drs = []

    if "tsne" in method:
        drs.extend([TSNEWrapper(values.values, hparams) for hparams in preset_methods[method]])  # type: ignore
    elif "umap" in method:
        print("UMAP running")
        drs.extend([UMAPWrapper(values.values, hparams) for hparams in preset_methods[method]])  # type: ignore
        print("UMAP done")

    drs = [drs[0]] + [procrustes(drs[0], dr) for dr in drs[1:]]

    np.save(f"./data/{title}/{method}_drs.npy", np.array(drs))
    dr_results = [
        DRResult(
            [
                Point(i, x=float(row[0]), y=float(row[1]), label=str(target[i]))
                for i, row in enumerate(drs[j])
            ],
            methods[j],
        )
        for j in range(len(drs))
    ]
    print("fsm start")
    fsm_result = projection_ensemble.fit(drs)

    result = ProjectionEnsembleResult(dr_results, fsm_result)
    with open(f"./data/{title}/{method}.json", "w") as f:
        json.dump(result.__dict__(), f, cls=NumpyEncoder)

    return result.__dict__()


@app.get("/v3/preset")
async def v3_preset(title: str, method: PresetMethodNames):
    # load embeddings from file
    df = pd.read_csv(f"./data/{title}.csv")
    values = df.drop([demo_files[title]], axis=1)
    target = df[demo_files[title]]
    projection_ensemble = ProjectionEnsemble(values, target)

    methods = preset_methods[method]
    drs = list(np.float16(np.load(f"./data/{title}/{method}_drs.npy")))

    dr_results = [
        DRResult(
            [
                Point(i, x=float(row[0]), y=float(row[1]), label=str(target[i]))
                for i, row in enumerate(drs[j])
            ],
            methods[j],
        )
        for j in range(len(drs))
    ]
    fsm_result = projection_ensemble.fit(drs)
    result = ProjectionEnsembleResult(dr_results, fsm_result)
    with open(f"./data/{title}/{method}_4.json", "w") as f:
        json.dump(result.__dict__(), f, cls=NumpyEncoder)

    return result.__dict__()


@app.post("/v1/dr")
async def v1_dr(title: str, method: str, body: Union[TSNEHParamsBody, UMAPHParamsBody]):
    pass


@app.post("/v2/dr")
async def v2_dr(title: str, method: str, body: Union[TSNEHParamsBody, UMAPHParamsBody]):
    pass


app.mount("/", StaticFiles(directory="dist", html=True), name="dist")
