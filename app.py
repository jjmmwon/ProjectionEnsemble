from flask import Flask, render_template, request, jsonify
from EnsembleDR import EnsembleDR
from TSNE import TSNE
from UMAP import UMAP
from Procrustes import Procrustes
import uuid
import json

app= Flask(__name__)

@app.route("/")
def index():
    global uid, class_list, ensemble_DR
    uid = uuid.uuid4().hex[:8]
    class_list = {'breast_cancer':'diagnosis',
                  'milknew':'Grade',
                  'mobile_price':'price_range',
                  'fashion-mnist':'label',
                  'diabetes':'Diabetes_012'}
    ensemble_DR = EnsembleDR(uid)
    ensemble_DR.load_test()
    
    return render_template("index.html")



@app.route("/tsne")
def tsne():
    title=request.args.get('title')
    init = request.args.get('init')
    perp=int(request.args.get('perp'))
    lr= "auto" if request.args.get('lr')=="auto" else int(request.args.get('lr'))
    iteration=int(request.args.get('iter'))
    i=int(request.args.get('i'))
    return ensemble_DR.test_umap(i)

    return jsonify(
            ensemble_DR.run_tsne(
                title=title,
                init=init,
                perp=perp,
                lr=lr,
                iteration=iteration,
                class_col = class_list[title] if title in class_list else None
            ))


@app.route("/umap")
def umap():
    title=request.args.get('title')
    i=int(request.args.get('i'))
    min_dist = float(request.args.get('minDist'))
    n_neighbors=int(request.args.get('nNeighbors'))
    return ensemble_DR.test_umap(i)


    return jsonify(
            ensemble_DR.run_umap(
                title=title,
                n_neighbors = n_neighbors,
                min_dist = min_dist,
                class_col = class_list[title] if title in class_list else None
            ))


@app.route("/ensembleDR")
def ensembleDR():
    print("ensemble DR running")
    return jsonify(ensemble_DR.test_DR())
    return jsonify(ensemble_DR.run())

@app.route("/reset")
def reset():
    ensemble_DR.reset()


def embedding_to_json(method, hyperparameter, embedding, target=None):
    print(hyperparameter)
    result = {
        "method":method,
        "hyperparameter": hyperparameter,
        "embedding":[{
                        "idx": i,
                        "0": float(embedding[i][0]),
                        "1": float(embedding[i][1]),
                        "class": "None" if target is None else target[i]
                     } for i in range(embedding.shape[0])
                    ]
    }

    return jsonify(result)


if __name__ == "__main__":
    app.run(port=50001, debug=True)