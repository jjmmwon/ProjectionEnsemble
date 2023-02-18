from TSNE import TSNE
from GraphGen import GraphGenerator
from FSM import FSM
from Procrustes import Procrustes
import json

class EnsembleDR:
    def __init__(self,
                 uid,
                 title,
                 class_col,
                 perplexity,
                 iteration,
                 learning_rate,
                 pca_iter=1,
                 random_iter=9):

        self.uid = uid
        self.title = title
        self.path = f'./static/data/{self.title}.csv'
        self.class_col=class_col
        self.pca_iter=pca_iter
        self.random_iter=random_iter
        self.perplexity = perplexity
        self.iteration = iteration
        self.learning_rate = learning_rate

        self.result = {}
        
    def run_DR(self):
        tsne = TSNE(uid = self.uid,
                    file_path=self.path,
                    data_title=self.title,
                    pca_iter=self.pca_iter,
                    random_iter=self.random_iter,
                    perplexity=self.perplexity,
                    max_iter=self.iteration,
                    learning_rate=self.learning_rate,
                    class_col=self.class_col)

        self.embeddings = tsne.run()

    def generate_graph(self):
        gg = GraphGenerator(uid = self.uid,
                            embeddings=self.embeddings,
                            data_title=self.title
                            )

        self.graph_dict = gg.run()
        

    def run_FSM(self):
        fsm = FSM(graph_dict=self.graph_dict)

        self.fsm_results = fsm.run()
        

    def run_procrustes(self):
        p = Procrustes(embeddings = self.embeddings, title = self.title)
        
        self.DR_results = p.run()

    def run(self):
        self.run_DR()
        self.generate_graph()
        self.run_FSM()
        self.run_procrustes()

        self.DR_results.update(self.fsm_results)

        return self.DR_results


def main():
    path = "/home/myeongwon/mw_dir/FS_TSNE/data/breast_cancer.csv"
    ensembleDR = EnsembleDR(path=path, class_col='diagnosis', pca_iter=1, random_iter=2, perplexity=20, iteration=300, learning_rate=-1, k=5)
    ensembleDR.run()

if __name__ =="__main__":
    main()
