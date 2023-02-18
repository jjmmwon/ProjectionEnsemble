import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from tqdm import tqdm

import os
from sklearn.preprocessing import MinMaxScaler
import argparse
import json

import sys
sys.path.append('/home/myeongwon/mw_dir/FS_TSNE/src/fitsne')

from fast_tsne import fast_tsne

class TSNE:
    def __init__(self, 
                 uid,
                 file_path,
                 data_title,
                 pca_iter = 1,
                 random_iter = 9,
                 perplexity = 30,
                 max_iter=800,
                 learning_rate="auto", 
                 class_col=None):
                     
        self.uid = uid
        self.file_path = file_path
        self.data_title = data_title
        self.pca_iter = pca_iter
        self.random_iter = random_iter
        self.perplexity = perplexity
        self.max_iter = max_iter
        self.learning_rate = learning_rate
        self.class_col = class_col

        self.original_data = None
        self.target = None

        self.embedded_data = None

        self.init = None

        self.embeddings = []
        self.loss = {'pca':[], 'random':[]}


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
                self.target = data[self.class_col]
                data = data.drop(self.class_col, axis=1)
            else:
                print("There is no class column")

        self.original_data = data.values
        self.instances, self.attributes = self.original_data.shape


    def fit(self, init = 'random', return_loss = True):
        """
        Applying FIt-SNE to original data

        """

        self.init = init
        X = self.original_data
        X = MinMaxScaler().fit_transform(X)

        Z = fast_tsne(X, 
            initialization = init,
            return_loss = return_loss,
            perplexity = self.perplexity,
            max_iter = self.max_iter,
            learning_rate = self.learning_rate)

        self.embedded_data , loss = Z
        
    def save_embedded_data(self):
        """
        save embedded data
        """
        path = f'./static/result/{self.data_title}_{self.uid}'
        if not os.path.isdir(path):
            os.mkdir(path)

        self.embedded_data = pd.DataFrame(self.embedded_data)
        if self.target is not None:
            self.embedded_data['class'] = self.target

        hyperparameter = { "init" : self.init,
                           "perplexity": self.perplexity,
                           "iteration": self.max_iter,
                           "learning rate": self.learning_rate,}
        
        self.embeddings.append({"hyperparameter": hyperparameter,
                                "embedding":self.embedded_data})

    def run(self):
        self.preprocess()
        for _ in tqdm(range(self.pca_iter), desc="PCA Iteration"):
            self.fit(init='pca', return_loss = True)
            self.save_embedded_data()

        for _ in tqdm(range(self.random_iter), desc="Random Iteration"):
            self.fit(init = 'random', return_loss = True)
            self.save_embedded_data()
        
        return self.embeddings



def argparsing():
    parser = argparse.ArgumentParser(description="Dimension Reduction using t-SNE and Evaluation")
    parser.add_argument('--file_path', '-f', help="File path to use for Dimension Reduction and Evaluation")
    parser.add_argument('--data_title', '-d', help="Data title for saving file name")
    parser.add_argument('--pca_iter','-p', type= int, default= 1, help='Number of iteration to PCA initalization' )
    parser.add_argument('--random_iter','-r', type= int, default= 10, help='Number of iteration to random initalization' )
    parser.add_argument('--perplexity', '-P', type = int, action = 'store', default = 30, help="Perplexity to use for t-sne")
    parser.add_argument('--max_iter', '-I', type = int, action = 'store', default = 750, help="Iteration to use for t-sne")
    parser.add_argument('--learning_rate', '-L', type = int, action = 'store', default = -1, help="Learning Rate to use for t-sne")
    parser.add_argument('--class_col','-C', default= None, help="Name of class column" )

    args = parser.parse_args()

    return args

def main():
    args = argparsing()

    tsne = TSNE(file_path=args.file_path,
                data_title=args.data_title,
                random_iter = args.random_iter, 
                pca_iter= args.pca_iter, 
                perplexity = args.perplexity, 
                max_iter = args.max_iter, 
                learning_rate = args.learning_rate,
                class_col=args.class_col)

    tsne.run()

if __name__ == '__main__':
    main()











