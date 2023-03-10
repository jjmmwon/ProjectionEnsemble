import json
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from ensembledr import EnsembleDR, UMAPWrapper, preset_methods

uid = uuid.uuid4().hex[:8]
class_list = {
    "breast_cancer": "diagnosis",
    "milknew": "Grade",
    "mobile_price": "price_range",
    "fashion-mnist": "label",
    "diabetes": "Diabetes_012",
}

app = FastAPI()


@app.get("/ensembleDR")
async def demo(title: str, method: str):
    with open("./static/result/result.json") as f:
        result = json.load(f)

    # ensemble_dr = EnsembleDR(df.drop(["diagnosis"], axis=1), df["diagnosis"])
    # data = ensemble_dr.values

    # methods = preset_methods["umap10"]
    # umaps = [UMAPWrapper(data, hparams) for hparams in methods]  # type: ignore
    # ensemble_dr.fit(umaps)

    return result


app.mount("/", StaticFiles(directory="static", html=True), name="static")
