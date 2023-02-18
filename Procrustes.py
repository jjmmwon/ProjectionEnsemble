import numpy as np
from scipy.spatial import procrustes

class Procrustes:
    def __init__(self, embeddings, title):
        self.embeddings = embeddings
        self.title = title
        
        self.data = []
        self.data_len = None
    
    def preprocess(self):
        for e in self.embeddings:
            self.data_len = len(e["embedding"])
            self.data.append({
                "idx": [i for i in range(self.data_len)],
                "0": e["embedding"][0].to_list(),
                "1": e["embedding"][1].to_list(),
                "class": (["None" for _ in range(self.data_len)]
                            if "class" not in e["embedding"].columns 
                            else e["embedding"]["class"].to_list())
            })


    def translation_and_scaling(self):
        for d in self.data:
            x, y= np.array(d["0"]), np.array(d["1"])
            
            x = x - x.mean()
            y = y - y.mean()

            s = x**2 + y**2
            s = np.sqrt(s.sum()/len(x))
            x /= s
            y /= s

            d["Points"]["0"] = list(x)
            d["Points"]["1"] = list(y)
            
    def procrustes(self):
        mtx1 = np.stack((np.array(self.data[0]["0"]), np.array(self.data[0]["1"])), axis=1)

        for i, d in enumerate(self.data):
            if i == 0:
                continue
            mtx2 = np.stack((np.array(d["0"]), np.array(d["1"])), axis=1)
            mtx1, mtx2, disparity = procrustes(mtx1, mtx2)
    
            mtx2 = mtx2.T
            d["0"] = list(mtx2[0])
            d["1"] = list(mtx2[1])

        mtx1 = mtx1.T
        self.data[0]["0"] = list(mtx1[0])
        self.data[0]["1"] = list(mtx1[1])

    def save_result(self):
        for i, d in enumerate(self.embeddings):
            d["embedding"] = [
                {
                    "idx": j,
                    "0": self.data[i]["0"][j],
                    "1": self.data[i]["1"][j],
                    "class": self.data[i]["class"][j]
                } for j in range(self.data_len)
            ]
        result = {"DR": self.embeddings}
        
        return result

    def run(self):
        self.preprocess()
        self.procrustes()
        return self.save_result()
