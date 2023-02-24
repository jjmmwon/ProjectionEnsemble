import os

import numpy as np
import pandas as pd
import umap
from sklearn.preprocessing import StandardScaler

import argparse

class UMAP:
    def __init__(self, 
                 data_title,
                 n_neighbors,
                 min_dist,
                 class_col=None):
                     
        self.file_path = f'./static/data/{data_title}.csv'
        self.data_title = data_title
        self.n_neighbors = n_neighbors
        self.min_dist = min_dist
        self.class_col = class_col

        self.original_data = None
        self.target = None

        self.embedding = None

    def preprocess(self):

        if 'csv' in self.file_path:
            data = pd.read_csv(self.file_path)
        if 'xls' in self.file_path:
            data = pd.read_excel(self.file_path)
        
        data = data.dropna()

        data_dict = dict(data.dtypes)
        for k, v in data_dict.items():
            if self.class_col and k == self.class_col:
                continue
            if v == np.object0:
                data = data.drop(k, axis=1)
            if "Unnamed" in k:
                data = data.drop(k, axis=1)

        if self.class_col:
            if self.class_col in data.columns:
                self.target = list(data[self.class_col])
                data = data.drop(self.class_col, axis=1)
            else:
                print("There is no class column")

        self.original_data = data.values
        self.instances, self.attributes = self.original_data.shape


    def fit(self):
        """
        Applying FIt-SNE to original data

        """

        X = self.original_data
        X = StandardScaler().fit_transform(X)

        fit = umap.UMAP()
        self.embedding = fit.fit_transform(X)

        self.embedding = StandardScaler().fit_transform(self.embedding)

    def run(self):
        self.preprocess()
        self.fit()
        return self.embedding, self.target



def argparsing():
    parser = argparse.ArgumentParser(description="Dimension Reduction using t-SNE and Evaluation")
    parser.add_argument('--data_title', '-d', help="Data title for saving file name")
    parser.add_argument('--n_neighbor', '-n', type = int, action = 'store', default = 15, help="Perplexity to use for t-sne")
    parser.add_argument('--min_dist', '-d', type = float, action = 'store', default = 0.1, help="Iteration to use for t-sne")
    parser.add_argument('--class_col','-C', default= None, help="Name of class column" )

    args = parser.parse_args()

    return args

def main():
    args = argparsing()

    umap = UMAP(data_title=args.data_title,
                n_neighbors = args.n_neighbors, 
                min_dist = args.min_dist,
                class_col=args.class_col)

    umap.run()

if __name__ == '__main__':
    main()











