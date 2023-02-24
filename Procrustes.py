import numpy as np
from scipy.spatial import procrustes
from sklearn.preprocessing import StandardScaler

class Procrustes:
    def __init__(self):
        self.mtx1 = None
        self.mtx2 = None
        pass

    def run(self, embedding1, embedding2):
        self.mtx1, self.mtx2, _ = procrustes(embedding1, embedding2)
        self.mtx2 = StandardScaler().fit_transform(self.mtx2)

        return self.mtx2
