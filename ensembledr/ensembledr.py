from dataclasses import dataclass
from typing import Dict, List, Literal, Tuple, Union

import numpy as np
import pandas as pd
from scipy.spatial import procrustes as _procrustes
from sklearn.preprocessing import StandardScaler

from .fsm import FSM
from .graph_generator import generate_graphs

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

        if (not isinstance(df, pd.DataFrame) or not isinstance(target, pd.Series)) or (
            len(df) != len(target)
        ):
            raise ValueError("Invalid input")

        for k, v in dict(df.dtypes).items():
            if v == "object":
                raise ValueError("All columns must be numeric")

        self.values = df.values
        self.target = target

    def fit(self, embeddings: List[np.ndarray]) -> Result:
        embeddings = [
            procrustes(embedding, embeddings[0]) for embedding in embeddings[1:]
        ]

        result: List[List[Dict[EmbeddingKey, Union[float, int, str]]]] = [
            [
                {"0": row[0], "1": row[1], "c": self.target[i]}
                for i, row in enumerate(embedding)
            ]
            for embedding in embeddings
        ]
        graph_dict = generate_graphs(embeddings)
        frequent_subgraphs = FSM(graph_dict=graph_dict).run()

        return Result(embeddings=result, frequent_subgraphs=frequent_subgraphs)
