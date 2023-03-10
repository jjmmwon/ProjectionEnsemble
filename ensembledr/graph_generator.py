from typing import Dict, List
from itertools import combinations

import networkx as nx
import numpy as np

ks = [5, 7, 10, 15, 20]


def generate_graphs(embeddings: List[np.ndarray]) -> Dict[int, nx.Graph]:
    N = embeddings[0].shape[0]
    distance_matrix = np.zeros((N, N))
    distance_matrix: np.ndarray = (
        np.sum(np.square(embeddings[0]), axis=1)
        + (np.sum(np.square(embeddings[0]), axis=1)).reshape(-1, 1)
        - 2 * np.matmul(embeddings[0], embeddings[0].T)
    )

    graph_list = [nx.Graph() for _ in range(len(ks))]
    for graph in graph_list:
        graph.add_nodes_from(list(range(N)))

    for r, row in enumerate(distance_matrix):
        nearest_neighbor = row.argsort()
        for i, graph in enumerate(graph_list):
            graph.add_edges_from(
                [(int(r), int(nearest_neighbor[j])) for j in range(1, ks[i] + 1)]
            )

    return {ks[i]: graph_list[i] for i in range(len(ks))}
