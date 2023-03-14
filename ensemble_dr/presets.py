from typing import Dict, List, Literal, Union

from .models import TSNEHParams, UMAPHParams

preset_k = [3, 4, 5, 7, 10]
preset_min_support = [6, 7, 8, 9, 10]


preset_params = {
    "tsne": {
        "perplexity": [15, 30, 45],
        "learning_rate": ["auto", 200, 500, 800],
    },
    "umap": {
        "n_neighbors": [5, 15, 30, 50, 100],
        "min_dist": [0.1, 0.25, 0.5, 0.8],
    },
}


PresetMethodNames = Literal["tsne10", "tsne20", "umap10", "umap20"]
preset_methods: Dict[PresetMethodNames, Union[List[TSNEHParams], List[UMAPHParams]]] = {
    "tsne10": [
        TSNEHParams(initialization="random", perplexity=p, learning_rate=lr)
        for p in preset_params["tsne"]["perplexity"]
        for lr in preset_params["tsne"]["learning_rate"][:3]
    ]
    + [TSNEHParams(initialization="pca", perplexity=30, learning_rate="auto")],
    "tsne20": [
        TSNEHParams(initialization="random", perplexity=p, learning_rate=lr)
        for p in preset_params["tsne"]["perplexity"]
        for lr in preset_params["tsne"]["learning_rate"]
    ]
    + [
        TSNEHParams(initialization="pca", perplexity=p, learning_rate=lr)
        for p in preset_params["tsne"]["perplexity"][1:]
        for lr in preset_params["tsne"]["learning_rate"]
    ],
    "umap10": [
        UMAPHParams(n_neighbors=n, min_dist=d)
        for n in preset_params["umap"]["n_neighbors"][:3]
        for d in preset_params["umap"]["min_dist"][:3]
    ]
    + [UMAPHParams(n_neighbors=50, min_dist=0.1)],
    "umap20": [
        UMAPHParams(n_neighbors=n, min_dist=d)
        for n in preset_params["umap"]["n_neighbors"]
        for d in preset_params["umap"]["min_dist"]
    ],
}
