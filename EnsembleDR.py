from TSNE import TSNE
from UMAP import UMAP
from GraphGen import GraphGenerator
from FSM import FSM
from Procrustes import Procrustes
import numpy as np
import pandas as pd
import json
from typing import List, Tuple, Union, Dict

class EnsembleDR:
    def __init__(self) -> None:
        self.hyperparameters = [] 
        self.embeddings = []
        self.embedding_dicts = []
        
    def load_data(self, title:str, class_col:str) -> Tuple[np.ndarray, List] :
        data = pd.read_csv(f"./static/data/{title}.csv")
        data = data.dropna()

        data_dict = dict(data.dtypes)
        for k, v in data_dict.items():
            if class_col and k == class_col:
                continue
            if v == np.object0:
                data = data.drop(k, axis=1)
            if "Unnamed" in k:
                data = data.drop(k, axis=1)

        if class_col:
            if class_col in data.columns:
                target = data[class_col]
                data = data.drop(class_col, axis=1)
            else:
                print("There is no class column") 
        return data.values, target
        
    def method_to_hpram(self, method:str) -> None:
        tsneHpram = {"perp":[15,30,45],
                     "lr10":[200,500, "auto"],
                     "lr20":[200,500,800,"auto"]}
        umapHpram = {"n_neighbors":[5, 15, 30, 50, 100],
                     "min_dist":[0.1, 0.25, 0.5, 0.8]}
        
        if(method=="tsne10"):
            self.DR = "t-SNE"
            self.hyperparameters = [("random", p, lr) 
                                    for p in tsneHpram['perp']
                                    for lr in tsneHpram['lr10']]
            self.hyperparameters.append(("pca", 30, "auto"))
        elif(method=="tsne20"):
            self.DR = "t-SNE"
            self.hyperparameters = [("random", p, lr) 
                                    for p in tsneHpram['perp']
                                    for lr in tsneHpram['lr20']]
            self.hyperparameters += [("pca", tsneHpram["perp"][i], lr)
                                     for i in range(1,3)
                                     for lr in tsneHpram['lr20']]
        elif(method=="umap10"):
            self.DR = "UMAP"
            self.hyperparameters = [(umapHpram["n_neighbors"][n], umapHpram["min_dist"][m]) 
                                    for n in range(3)
                                    for m in range(3)]
            self.hyperparameters.append((50,0.1))
        elif(method=="umap20"):
            self.DR = "UMAP"
            self.hyperparameters = [(umapHpram["n_neighbors"][n], umapHpram["min_dist"][m]) 
                                    for n in range(5)
                                    for m in range(4)]
        return
        

    def run_tsne(self,
                 data:np.ndarray,
                 init:str,
                 perp:int,
                 lr:Union[float, str],
                 target:Union[np.ndarray, List]
                 ) -> np.ndarray:
        tsne = TSNE()
        embedding= tsne.fit(data=data, init=init, perplexity=perp, learning_rate=lr)

        if(len(self.embeddings)):
            embedding = Procrustes().run(self.embeddings[0], embedding)
        self.embeddings.append(embedding)
        self.embedding_dicts.append(
                self.embedding_to_json(
                    method = "t-SNE",
                    hyperparameter= {
                        "init":init,
                        "perp":perp,
                        "lr": lr,
                    },
                    embedding = embedding,
                    target = list(target)
                )
            )
        return embedding

    def run_umap(self,
                 data:np.ndarray,
                 n_neighbors:int,
                 min_dist:float,
                 target:Union[np.ndarray, List] 
                 ) -> np.ndarray:
        umap = UMAP()
        embedding= umap.fit(data=data, n_neighbors=n_neighbors, min_dist=min_dist)

        if(len(self.embeddings)):
            embedding = Procrustes().run(self.embeddings[0], embedding)
        self.embeddings.append(embedding)
        self.embedding_dicts.append(
                self.embedding_to_json(
                    method = "UMAP",
                    hyperparameter= {
                        "n_neighbors":n_neighbors,
                        "min_dist":min_dist,
                    },
                    embedding = embedding,
                    target = list(target)
                )
            )
        return embedding
        
    def fit(self, method:str, data:np.ndarray, target:Union[np.ndarray, list, pd.DataFrame, None]=None) -> Tuple[List, Dict]:
        self.method_to_hpram(method)
        # embed data
        if(self.DR=="t-SNE"):
            for init, perp, lr in self.hyperparameters:
                self.run_tsne(data=data,init=init, perp=perp, lr=lr, target=target)
        else:
            for n_neighbors, min_dist in self.hyperparameters:
                self.run_umap(data=data, n_neighbors=n_neighbors,min_dist=min_dist)
        
        # generate graph
        gg = GraphGenerator(embeddings=self.embeddings)
        self.graph_dict = gg.run()
        
        # run FSM
        fsm = FSM(graph_dict=self.graph_dict)
        frequent_subgraphs = fsm.run()
        
        self.embeddings = [{'0':list(e.T[0]), '1':list(e.T[1]), 'c':list(target)} for e in self.embeddings]
        
        
        with open('./static/result/embeddings.json','w') as json_file:
            json.dump(self.embeddings, json_file)
        
        self.embeddings_dicts = {"embedding":self.embedding_dicts}
        self.embeddings_dicts.update(frequent_subgraphs)
        
        with open('./static/result/result.json', 'w') as json_file:
            json.dump(self.embeddings_dicts, json_file)
        return self.embeddings_dicts
    
    def embedding_to_json(self,
                          method:str,
                          hyperparameter:Dict,
                          embedding:np.ndarray,
                          target:Union[np.ndarray, List]
                          ) -> Dict:
        result = {
            "method":method,
            "hyperparameter": hyperparameter,
            "embedding":[{
                            "idx": i,
                            "0": float(embedding[i][0]),
                            "1": float(embedding[i][1]),
                            "class": target[i]
                        } for i in range(embedding.shape[0])
                        ]
        }

        return result