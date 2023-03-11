from dataclasses import dataclass
from typing import Literal, Union, List, Tuple
from pydantic import BaseModel


@dataclass
class TSNEHParams:
    initialization: Literal["random", "pca"]
    perplexity: int
    learning_rate: Union[int, Literal["auto"]]

    def __dict__(self):
        return {
            "initialization": self.initialization,
            "perplexity": self.perplexity,
            "learning_rate": self.learning_rate,
        }


class TSNEHParamsBody(BaseModel):
    initialization: Literal["random", "pca"]
    perplexity: int
    learning_rate: Union[int, Literal["auto"]]


@dataclass
class UMAPHParams:
    n_neighbors: int
    min_dist: float

    def __dict__(self):
        return {
            "n_neighbors": self.n_neighbors,
            "min_dist": self.min_dist,
        }


class UMAPHParamsBody(BaseModel):
    n_neighbors: int
    min_dist: float


@dataclass
class Point:
    id: int
    x: float
    y: float
    label: Union[str, int]

    def __dict__(self):
        return {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "label": self.label,
        }


@dataclass
class FSMResult:
    k: int
    min_support: int
    subgraphs: List[List[int]]
    contour_coords: List[List[List[Tuple[float, float]]]]

    def __dict__(self):
        return {
            "k": self.k,
            "min_support": self.min_support,
            "subgraphs": self.subgraphs,
            "contour_coords": self.contour_coords,
        }


@dataclass
class DRResult:
    embedding: List[Point]
    hyper_parameters: Union[TSNEHParams, UMAPHParams]

    def __dict__(self):
        return {
            "embedding": [p.__dict__() for p in self.embedding],
            "hyper_parameters": self.hyper_parameters.__dict__(),
        }


@dataclass
class EnsembleDRResult:
    dr_results: List[DRResult]
    fsm_results: List[FSMResult]

    def __dict__(self):
        return {
            "dr_results": [e.__dict__() for e in self.dr_results],
            "fsm_results": [f.__dict__() for f in self.fsm_results],
        }
