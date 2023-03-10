from flask import Flask, render_template, request, jsonify
from ensembledr import EnsembleDR

import uuid
import json

app = Flask(__name__)


@app.route("/")
def index():
    global uid, class_list
    uid = uuid.uuid4().hex[:8]
    class_list = {
        "breast_cancer": "diagnosis",
        "milknew": "Grade",
        "mobile_price": "price_range",
        "fashion-mnist": "label",
        "diabetes": "Diabetes_012",
    }
    return render_template("index.html")


@app.route("/ensembleDR")
def ensemble_DR():
    """
    input: title:str, method:str
    return: {
        "embedding":list of 10 samples,
        "FSM": [
                {"k":int, "min_support":int, "FS":{"FS0":[], "FS1":[],...}}
                ...
            ]
        }
    """
    with open("./static/result/result.json") as f:
        result = json.load(f)
    return result
    ensemble_dr = EnsembleDR()
    title = request.args.get("title")
    method = request.args.get("method")

    data, target = ensemble_dr.load_data(title=title, class_col=class_list[title])
    result = ensemble_dr.fit(method=method, data=data, target=target)

    return jsonify(result)


if __name__ == "__main__":
    app.run(port=50001, debug=True)
