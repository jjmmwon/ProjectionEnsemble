import os
import numpy as np
import pandas as pd
import umap
from sklearn.preprocessing import StandardScaler

import argparse

class UMAP:
    def __init__(self):
        pass
    
    def fit(self, data: np.ndarray, n_neighbors:int, min_dist:float) -> np.ndarray:
        """
        Applying FIt-SNE to original data

        """
        X = data
        X = StandardScaler().fit_transform(X)

        fit = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist)
        embedding = fit.fit_transform(X)

        embedding = StandardScaler().fit_transform(embedding)
        
        return embedding


def argparsing():
    parser = argparse.ArgumentParser(description="Dimension Reduction using t-SNE and Evaluation")
    parser.add_argument('--data_title', '-d', help="Data title for saving file name")
    parser.add_argument('--n_neighbor', '-n', type = int, action = 'store', default = 15, help="Perplexity to use for t-sne")
    parser.add_argument('--min_dist', '-d', type = float, action = 'store', default = 0.1, help="Iteration to use for t-sne")
    args = parser.parse_args()

    return args












