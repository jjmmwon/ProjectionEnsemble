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
            "init": self.initialization,
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
        return {}


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
            "i": self.id,
            "x": round(self.x, 3),
            "y": round(self.y, 3),
            "l": self.label,
        }

    def __csv__(self):
        return f"{self.id},{round(self.x,3)},{round(self.y,3)},{self.label}"


@dataclass
class FSMResult:
    k: int
    min_support: int
    subgraphs: List[List[int]]
    contour_coords: List[List[List[Tuple[float, float]]]]

    def __dict__(self):
        return {
            "k": self.k,
            "ms": self.min_support,
            "subgs": self.subgraphs,
            "coords": self.contour_coords,
        }


@dataclass
class DRResult:
    embedding: List[Point]
    hyper_parameters: Union[TSNEHParams, UMAPHParams]

    def __dict__(self):
        return {
            "embedding": "i,x,y,l\n" + "\n".join([p.__csv__() for p in self.embedding]),
            "hprams": self.hyper_parameters.__dict__(),
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
