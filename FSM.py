import os
import glob
import json
import argparse

import snap
import numpy as np
from tqdm import tqdm

class FSM:
    def __init__(self,
                 graphs,
                 graph_title,
                 min_supports=8,
                 k=5):
                 
        self.graphs = graphs
        self.count = len(graphs)
        self.graph_title = graph_title
        self.path = f'./static/result/{graph_title}/'
        self.min_supports = min_supports
        self.k = k

        self.data_len = len(graphs)
        self.node_len = self.graphs[0].GetNodes()

        self.mother_graph = None
        
        self.FS_set = []
        self.adjacency_list = None

        self.results = []
        
    # def load_dirs(self):
    #     path = self.dir_path
    #     if self.perplexity != -1:
    #         path += 'perplexity_' + str(self.perplexity) + '_'
    #     else:
    #         path += '*'
    #     if self.iteration!= -1:
    #         path += 'max_iter_' + str(self.iteration) + '_'
    #     else:
    #         path += '*'
    #     if self.learning_rate!= -1:
    #         if self.learning_rate == 0:
    #             path += 'learning_rate_auto_'
    #         else:
    #             path += 'learning_rate_' + str(self.learning_rate) + '_'
    #     else:
    #         path += '*'
        
    #     self.dirs = glob.glob(path)   

    def load_graphs(self):
        # graph를 snap.py에서 제공하는 graph 형식으로 load
        if self.learning_rate == -1:
            self.learning_rate = "auto"
        self.path = self.path + f'perplexity_{self.perplexity}_max_iter_{self.iteration}_learning_rate_{self.learning_rate}_/'
        graph_path = self.path + '*.graph'
        
        graph_files = glob.glob(graph_path)
        graph_files.sort()
        self.count = len(graph_files)
        print(self.count)

        for graph_file in graph_files:
            FIn = snap.TFIn(graph_file)
            graph = snap.TUNGraph.Load(FIn)
            self.graph_set.append(graph)

        # for i, graph in enumerate(self.graph_set):
        #     print(i, graph.IsEdge(8, 15)) # 그래프 노드 개수

    def generate_mother_graph(self):
        """
        graph의 모든 edge를 포함하는 mother graph 생성
        """
        self.mother_graph = snap.TUNGraph.New()
        for i in range(self.node_len):
            self.mother_graph.AddNode(i)

        for graph in self.graphs:
            for edge in graph.Edges():
                self.mother_graph.AddEdge(edge.GetSrcNId(),edge.GetDstNId())

    def detect_frequent_edge(self):
        """
        mother_graph의 모든 edge를 반복하며 min_supports 이상 나타나는 edge만 남겨둔다.
        """
        del_edges = []
        for edge in self.mother_graph.Edges():
            count = self.count
            for graph in self.graphs:
                if(not graph.IsEdge(*(edge.GetId()))):
                    count -= 1
                if(count<self.min_sup):
                    del_edges.append(edge.GetId())
                    break

        for del_edge in del_edges:
            self.mother_graph.DelEdge(*del_edge)
    
    def generate_adjacency_list(self):
        """
        mother_graph의 adjacency list 생성
        """
        self.adjacency_list = [[] for _ in range(self.node_len)]
        for edge in self.mother_graph.Edges():
            self.adjacency_list[edge.GetSrcNId()].append(edge.GetDstNId())
            self.adjacency_list[edge.GetDstNId()].append(edge.GetSrcNId())

    def get_subgraph(self):
        """
        frequent edge 정보를 통해 frequent subgraph 나눈다.
        node 반복
            visit == true -> 다음노드
            else
                node의 이웃 subgraph에 포함
                subgraph 안의 node 돌면서 이웃 계속 추가
                모두 visit true일 시 sugraph의 node set을 list로 변경시켜 FS_set에 추가
        """
        visit = [False for _ in range(self.node_len)] 
        
        for node in range(self.node_len):
            if visit[node]:
                continue
            visit[node] = True
            subgraph = set([node])
            subgraph.update(self.adjacency_list[node])
            while(True):
                all_visited, next_node = self.is_all_visited(visit, subgraph)

                if all_visited:
                    break
                subgraph.update(self.adjacency_list[next_node])

            subgraph = (list(subgraph))
            # if len(subgraph) <= 10:
            #     continue
            self.FS_set.append(subgraph)
        
        # subgraph 결과 저장
        result = {}        
        result["Min_support"] = self.min_sup
        result["FS"] = self.FS_set

        self.results.append(result)



    def is_all_visited(self, visit, subgraph):
        """
        모든 node를 방문했는지 확인하고 아닐시 해당 노드 return
        """
        for node in subgraph:
            if not visit[node]:
                visit[node] = True
                return False, node
        return True, None

    def save_FS(self):
        json_path = self.path + f'FSM.json'
        json_data = {"FSM" : self.results}
        # with open(json_path, "w") as json_file:
        #     json.dump(json_data, json_file, indent="\t")
        
        return json_data


    def run(self):
        # self.load_dirs()
        #self.load_graphs()
        for ms in self.min_supports:
            self.min_sup = ms
            self.FS_set = []
            self.generate_mother_graph()        
            self.detect_frequent_edge()
            self.generate_adjacency_list()
            self.get_subgraph()
        return self.save_FS()

def argparsing():
    parser = argparse.ArgumentParser(description="Frequent Subgraph Mining")
    parser.add_argument('--data_title', '-d', help="graph data title for FSM")
    parser.add_argument('--min_supports', '-s', type = int, action = 'store', default = 8, help="min_supports for FSM")
    parser.add_argument('--perplexity', '-P', type = int, action = 'store', default = -1, help="Perplexity")
    parser.add_argument('--max_iter', '-I', type = int, action = 'store', default = -1, help="Iteration")
    parser.add_argument('--learning_rate', '-L', type = int, action = 'store', default = -1, help="Learning Rate ('0' for auto)")

    args = parser.parse_args()
    return args


def main():
    args = argparsing()
    fsm = FSM(args.data_title, perplexity=args.perplexity, iteration=args.max_iter, learning_rate= args.learning_rate, min_supports= args.min_supports)
    fsm.run()

if __name__== "__main__":
    main()
