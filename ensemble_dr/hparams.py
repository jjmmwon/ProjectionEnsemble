from dataclasses import dataclass
from typing import Literal, Union
from pydantic import BaseModel


@dataclass
class TSNEHParams:
    initialization: Literal["random", "pca"]
    perplexity: int
    learning_rate: Union[int, Literal["auto"]]


class TSNEHParamsBody(BaseModel):
    initialization: Literal["random", "pca"]
    perplexity: int
    learning_rate: Union[int, Literal["auto"]]


@dataclass
class UMAPHParams:
    n_neighbors: int
    min_dist: float


class UMAPHParamsBody(BaseModel):
    n_neighbors: int
    min_dist: float
