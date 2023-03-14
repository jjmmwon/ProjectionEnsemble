from dataclasses import dataclass
from typing import Dict, List, Literal, Tuple, Union

import numpy as np
import pandas as pd
from scipy.spatial import procrustes as _procrustes
from sklearn.preprocessing import StandardScaler

from .graph_util import generate_graphs, get_fsm_results
from .models import Point, FSMResult

EmbeddingKey = Literal["0", "1", "c"]


def procrustes(embedding1, embedding2):
    mtx1, mtx2, _ = _procrustes(embedding1, embedding2)
    return StandardScaler().fit_transform(mtx2)


@dataclass
class Result:
    embeddings: List[List[Dict[EmbeddingKey, Union[float, int, str]]]]
    frequent_subgraphs: Dict

    def to_json(self) -> Dict:
        return {
            "embeddings": self.embeddings,
            "FSM": self.frequent_subgraphs,
        }


class EnsembleDR:
    values: np.ndarray
    target: pd.Series

    def __init__(self, df: pd.DataFrame, target: pd.Series) -> None:
        df = df.dropna()

        if (
            not isinstance(df, pd.DataFrame)
            or not isinstance(target, pd.Series)
            or "object" in df.dtypes.values
            or (len(df) != len(target))
        ):
            raise ValueError("Invalid input")

        self.values = df.values
        self.target = target

    def fit(self, embeddings: List[np.ndarray]) -> List[FSMResult]:
        graph_dicts = generate_graphs(embeddings)

        return get_fsm_results(graph_dicts, embeddings)
