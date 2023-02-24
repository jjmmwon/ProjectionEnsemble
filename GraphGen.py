import numpy as np
import snap
import argparse

class GraphGenerator:
    def __init__(self, embeddings):
        self.embeddings = embeddings
        self.k = [5,7,10,15,20]
        
        self.data = None
        self.graph = None
        self.graph_dict = {k:[] for k in self.k}
        self.dist_matrix = None

    def generate_distance_matrix(self): 
        """
        generate distance matrix
        """
        M = self.data.shape[0]
        self.dist_matrix = np.zeros((M,M))
        self.dist_matrix = np.sum(np.square(self.data), axis=1) + (np.sum(np.square(self.data), axis=1)).reshape(-1,1) - 2*np.matmul(self.data, self.data.T)

    def kNN(self): 
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


    def run(self):
        """
        make distant matrix -> clustering -> save graph
        """
        for e in self.embeddings:
            self.data = e
            self.generate_distance_matrix()
            self.kNN()
        return self.graph_dict
        

def argparsing():
    parser = argparse.ArgumentParser(description="Make kNN Graph from MDP data")
    parser.add_argument('--data', '-d', help="MDP data for making graph")
    parser.add_argument('--clustering', '-c', help="clustering method")
    parser.add_argument('--neighbors', '-k', type = int, action = 'store', default = 5, help="Number of neighbor for graph")
    parser.add_argument('--perplexity', '-P', type = int, action = 'store', default = -1, help="Perplexity")
    parser.add_argument('--max_iter', '-I', type = int, action = 'store', default = -1, help="Iteration")
    parser.add_argument('--learning_rate', '-L', type = int, action = 'store', default = -1, help="Learning Rate ('0' for auto)")

    args = parser.parse_args()
    return args

def main():
    args = argparsing()
    print("Data: "+args.data, "\nNeighbors: "+ str(args.neighbors))

    gmaker = GraphGenerator(args.data, perplexity=args.perplexity, iteration=args.max_iter, learning_rate=args.learning_rate , k = args.neighbors)
    gmaker.run()

if __name__== "__main__":
    main()
