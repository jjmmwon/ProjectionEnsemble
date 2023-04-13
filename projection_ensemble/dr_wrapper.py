import numpy as np
import umap

# from fast_tsne import fast_tsne
from sklearn.manifold import TSNE
from sklearn.preprocessing import MinMaxScaler, StandardScaler

from .models import TSNEHParams, UMAPHParams

FAST_TSNE_PATH = "/home/myeongwon/mw_dir/FS_TSNE/src/fitsne"
import sys

sys.path.append(FAST_TSNE_PATH)
from fast_tsne import fast_tsne


import numpy as np


def TSNEWrapper(data: np.ndarray, hparams: TSNEHParams):
    return


# def TSNEWrapper(data: np.ndarray, hparams: TSNEHParams) -> np.ndarray:
#     """
#     Wrapper for TSNE

#     Args:
#         data (np.ndarray): original data
#         hparams (TSNEHParams): hyperparameters for TSNE

#     Returns:
#         np.ndarray: embedding
#     """
#     X = MinMaxScaler().fit_transform(data)
#     Z = TSNE(
#         n_components=hparams.n_components,
#         perplexity=hparams.perplexity,
#         learning_rate=hparams.learning_rate,
#     ).fit_transform(X)
#     return StandardScaler().fit_transform(Z)


# def FastTSNEWrapper(data: np.ndarray, hparams: TSNEHParams):
#     return


def FastTSNEWrapper(data: np.ndarray, hparams: TSNEHParams) -> np.ndarray:
    """
    Wrapper for TSNE

    Args:
        data (np.ndarray): original data
        hparams (TSNEHParams): hyperparameters for TSNE

    Returns:
        np.ndarray: embedding
    """
    X = MinMaxScaler().fit_transform(data)
    Z = fast_tsne(
        X,
        initialization=hparams.initialization,
        perplexity=hparams.perplexity,
        learning_rate=hparams.learning_rate,
    )
    return StandardScaler().fit_transform(Z)


def UMAPWrapper(data: np.ndarray, hparams: UMAPHParams) -> np.ndarray:
    """
    Wrapper for UMAP

    Args:
        data (np.ndarray): original data
        hparams (UMAPHParams): hyperparameters for UMAP

    Returns:
        np.ndarray: embedding
    """
    X = StandardScaler().fit_transform(data)
    fit = umap.UMAP(
        n_neighbors=hparams.n_neighbors, min_dist=hparams.min_dist, init=hparams.init
    )
    embedding = fit.fit_transform(X)
    return StandardScaler().fit_transform(embedding)
