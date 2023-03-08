import numpy as np
import pandas as pd

from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import StandardScaler
import argparse

import sys
sys.path.append('/home/myeongwon/mw_dir/FS_TSNE/src/fitsne')

from fast_tsne import fast_tsne

class TSNE:
    def __init__(self, 
                 data_title,
                 init = 'random',
                 perplexity = 30,
                 learning_rate="auto", 
                 class_col=None):
                     
        self.file_path = f'./static/data/{data_title}.csv'
        self.data_title = data_title
        self.init = init
        self.perplexity = perplexity
        self.learning_rate = learning_rate
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


    def fit(self, return_loss = True):
        """
        Applying FIt-SNE to original data

        """

        X = self.original_data
        X = MinMaxScaler().fit_transform(X)

        Z = fast_tsne(X, 
            initialization = self.init,
            return_loss = return_loss,
            perplexity = self.perplexity,
            learning_rate = self.learning_rate)

        self.embedding , loss = Z
        self.embedding = StandardScaler().fit_transform(self.embedding)    

    def run(self):
        self.preprocess()
        self.fit(return_loss = True)

        return self.embedding, self.target



def argparsing():
    parser = argparse.ArgumentParser(description="Dimension Reduction using t-SNE and Evaluation")
    parser.add_argument('--file_path', '-f', help="File path to use for Dimension Reduction and Evaluation")
    parser.add_argument('--data_title', '-d', help="Data title for saving file name")
    parser.add_argument('--init', '-i', help="Initialization to use for t-sne")
    parser.add_argument('--perplexity', '-P', type = int, action = 'store', default = 30, help="Perplexity to use for t-sne")
    parser.add_argument('--learning_rate', '-L', type = int, action = 'store', default = -1, help="Learning Rate to use for t-sne")
    parser.add_argument('--class_col','-C', default= None, help="Name of class column" )

    args = parser.parse_args()

    return args

def main():
    args = argparsing()

    tsne = TSNE(file_path=args.file_path,
                data_title=args.data_title,
                init=args.init,
                perplexity = args.perplexity, 
                learning_rate = args.learning_rate,
                class_col=args.class_col)

    tsne.run()

if __name__ == '__main__':
    main()











