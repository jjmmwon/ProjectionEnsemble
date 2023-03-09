import numpy as np
import pandas as pd

from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import StandardScaler
from typing import Union

import sys
sys.path.append('/home/myeongwon/mw_dir/FS_TSNE/src/fitsne')

from fast_tsne import fast_tsne

class TSNE:
    def __init__(self):
        pass

    def fit(self, data:np.ndarray, init:str, perplexity:int, learning_rate:Union[float, str]):
        """
        Applying FIt-SNE to original data
        """
        X = MinMaxScaler().fit_transform(data)

        Z = fast_tsne(X, 
            initialization = init,
            perplexity = perplexity,
            learning_rate = learning_rate)

        embedding = StandardScaler().fit_transform(Z)    
        
        return embedding












