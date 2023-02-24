from TSNE import TSNE
from UMAP import UMAP
from GraphGen import GraphGenerator
from FSM import FSM
from Procrustes import Procrustes
import json

class EnsembleDR:
    def __init__(self, uid):
        self.uid = uid
        self.embeddings = []

    def run_tsne(self, title, init, perp, lr, iteration, class_col):
        tsne = TSNE(data_title=title,
                    init=init,
                    perplexity=perp,
                    learning_rate=lr,
                    max_iter=iteration,
                    class_col=class_col)

        embedding, target = tsne.run()

        if(len(self.embeddings)):
            embedding = Procrustes().run(self.embeddings[0], embedding)
        
        self.embeddings.append(embedding)

        return self.embedding_to_json(
                    method = "t-SNE",
                    hyperparameter= {
                        "init":init,
                        "perp":perp,
                        "lr": lr,
                        "iter":iteration
                    },
                    embedding = embedding,
                    target = target
                )

    def run_umap(self, title, n_neighbors, min_dist, class_col):
        umap = UMAP(data_title=title,
                    n_neighbors=n_neighbors,
                    min_dist=min_dist,
                    class_col=class_col
                    )
        embedding, target = umap.run()

        if(len(self.embeddings)):
            embedding = Procrustes().run(self.embeddings[0], embedding)
        
        self.embeddings.append(embedding)

        return self.embedding_to_json(
                    method="UMAP",
                    hyperparameter={
                        "n_neighbors":n_neighbors,
                        "min_dist":float(min_dist),
                    },
                    embedding = embedding,
                    target = target
                )
        
    def generate_graph(self):
        gg = GraphGenerator(embeddings=self.embeddings)
        self.graph_dict = gg.run()
        

    def run_FSM(self):
        fsm = FSM(graph_dict=self.graph_dict)
        return fsm.run()

    def run(self):
        self.generate_graph()

        return self.run_FSM()

    def reset(self):
        self.embeddings = []
        self.graph_dict = None


    def embedding_to_json(self, method, hyperparameter, embedding, target=None):
        result = {
            "method":method,
            "hyperparameter": hyperparameter,
            "embedding":[{
                            "idx": i,
                            "0": float(embedding[i][0]),
                            "1": float(embedding[i][1]),
                            "class": "None" if target is None else target[i]
                        } for i in range(embedding.shape[0])
                        ]
        }

        return result



def main():
    path = "/home/myeongwon/mw_dir/FS_TSNE/data/breast_cancer.csv"
    ensembleDR = EnsembleDR(path=path, class_col='diagnosis', pca_iter=1, random_iter=2, perplexity=20, iteration=300, learning_rate=-1, k=5)
    ensembleDR.run()

if __name__ =="__main__":
    main()
