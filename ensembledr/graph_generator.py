# type: ignore
import numpy as np
import snap
import argparse
from typing import List, Dict

class GraphGenerator:
    def __init__(self, embeddings:List[np.ndarray]) -> None:
        self.embeddings = embeddings
        self.k = [5,7,10,15,20]
        
        self.data = None
        self.graph = None
        self.graph_dict = {k:[] for k in self.k}
        self.dist_matrix = None

    def generate_distance_matrix(self) -> None: 
        """
        generate distance matrix
        """
        M = self.data.shape[0] 
        self.dist_matrix = np.zeros((M,M))
        self.dist_matrix = np.sum(np.square(self.data), axis=1) + (np.sum(np.square(self.data), axis=1)).reshape(-1,1) - 2*np.matmul(self.data, self.data.T)

    def kNN(self) -> None: 
        """
        make graph with k neighbors per each point
        """
        graph_list = [snap.TUNGraph.New() for _ in range(len(self.k))]
        for g in graph_list:
            for i in range(self.dist_matrix.shape[0]):
                g.AddNode(i)
        
        for r, row in enumerate(self.dist_matrix):
            nearest_neighbor = row.argsort()
            for i, k in enumerate(self.k):
                for j in range(1, k+1):
                    graph_list[i].AddEdge(int(r), int(nearest_neighbor[j]))
        
        for i, g in enumerate(graph_list):
            self.graph_dict[self.k[i]].append(g)


    def run(self) -> Dict:
        """
        make distant matrix -> kNN -> save graph
        """
        for e in self.embeddings:
            self.data = e
            self.generate_distance_matrix()
            self.kNN()
        return self.graph_dict
        