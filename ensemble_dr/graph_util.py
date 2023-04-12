from dataclasses import dataclass
from itertools import combinations
from typing import Dict, List, Tuple, Union
import json
import time


import networkx as nx
import numpy as np
from sklearn.neighbors import NearestNeighbors
from shapely import concave_hull
from shapely.geometry import LinearRing, MultiPoint, Polygon

from .models import FSMResult
from .presets import preset_k, preset_min_support


def get_distance_matrices(embeddings: List[np.ndarray]) -> List[np.ndarray]:
    """
    embeddings: List[np.ndarray] shape (N, 2)
    """
    distance_matrices = []
    for embedding in embeddings:
        N = embedding.shape[0]
        distance_matrix = np.zeros((N, N))
        distance_matrix: np.ndarray = (
            np.sum(np.square(embedding), axis=1)
            + (np.sum(np.square(embedding), axis=1)).reshape(-1, 1)
            - 2 * np.matmul(embedding, embedding.T)
        )
        distance_matrices.append(distance_matrix)
    return distance_matrices


def generate_graphs(embeddings: List[np.ndarray]) -> Dict[int, List[nx.Graph]]:
    """
    embeddings: List[np.ndarray] shape (N, 2)
    """
    N = embeddings[0].shape[0]
    k_graphs = {k: [nx.Graph() for _ in range(len(embeddings))] for k in preset_k}

    for k, graph_list in k_graphs.items():
        for i, graph in enumerate(graph_list):
            graph.add_nodes_from(list(range(N)))

    print("generate graphs Start")
    s = time.time()
    for i, embedding in enumerate(embeddings):
        nbrs = NearestNeighbors(
            n_neighbors=(preset_k[-1] + 1), algorithm="ball_tree"
        ).fit(embedding)
        _, indices = nbrs.kneighbors(embedding)
        print(f"generate graphs {i + 1}/{len(embeddings)}")
        for k, graphs in k_graphs.items():
            graphs[i].add_edges_from(
                [
                    (int(r), int(indices[r][j]))
                    for r in range(N)
                    for j in range(1, k + 1)
                ]
            )
    e = time.time()
    with open("./mnist_time.json", "r") as f:
        time_stamp = json.load(f)
    with open("./mnist_time.json", "w") as f:
        time_stamp["generate_graphs"] = f"{e - s:.5f} sec"
        json.dump(time_stamp, f)

    return k_graphs


def get_concave_hull(
    embedding: np.ndarray, indices: List[int]
) -> List[Tuple[float, float]]:
    """
    embedding: np.ndarray shape (N, 2)
    indices: List[int]
    """
    if len(indices) < 4:
        return []

    return list(
        [
            (float(c[0]), float(c[1]))
            for c in concave_hull(
                MultiPoint(
                    [(float(embedding[i][0]), float(embedding[i][1])) for i in indices]
                ),
                ratio=0.2,
            )
            .buffer(0.1)
            .exterior.coords
        ]
    )


def get_frequent_subgraphs(graphs: List[nx.Graph], min_support: int) -> List[List[int]]:
    union_graph = nx.Graph()

    for graph in graphs:
        union_graph = nx.compose(union_graph, graph)

    for edge in union_graph.edges:
        union_graph.edges[edge]["support"] = 0

        for graph in graphs:
            if graph.has_edge(*edge):
                union_graph.edges[edge]["support"] += 1

    for edge in union_graph.edges:
        if union_graph.edges[edge]["support"] < min_support:
            union_graph.remove_edge(*edge)

    return [list(c) for c in nx.connected_components(union_graph) if len(c) > 3]


def get_fsm_results(
    graphs: Dict[int, List[nx.Graph]], embeddings: List[np.ndarray]
) -> List[FSMResult]:
    result = []
    s = time.time()
    for k in preset_k:
        for ms in preset_min_support:
            subgraphs = get_frequent_subgraphs(graphs[k], ms)
            subgraphs.sort(key=lambda x: len(x), reverse=True)
            contour_coords = [
                [
                    get_concave_hull(embeddings[i], subgraphs[j])
                    for j in range(len(subgraphs))
                ]
                for i in range(len(embeddings))
            ]
            result.append(FSMResult(k, ms, subgraphs, contour_coords))
    e = time.time()
    with open("./mnist_time.json", "r") as f:
        time_stamp = json.load(f)
    with open("./mnist_time.json", "w") as f:
        time_stamp["get_FSM"] = f"{e - s:.5f} sec"
        json.dump(time_stamp, f)

    return result