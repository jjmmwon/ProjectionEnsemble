from TSNE import TSNE
from GraphGen import GraphGenerator
from FSM import FSM
from Procrustes import Procrustes
import os
import glob
import json

class EnsembleDR:
    def __init__(self,
                 uid,
                 title,
                 class_col,
                 perplexity,
                 iteration,
                 learning_rate,
                 min_supports,
                 k=5,
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
        self.min_supports = min_supports
        self.k = k

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
        tsne.run()

    def generate_graph(self):
        gg = GraphGenerator(uid = self.uid,
                            data_title=self.title,
                            perplexity=self.perplexity,
                            iteration=self.iteration,
                            learning_rate=self.learning_rate,
                            k=self.k)
        gg.run()
        

    def run_FSM(self):
        fsm = FSM(graph_title=self.title, perplexity=self.perplexity, iteration=self.iteration, learning_rate=self.learning_rate, min_supports=self.min_supports, k=self.k)
        self.FSMresults = fsm.run()
        

    def run_procrustes(self):
        p = Procrustes(title = self.title, perplexity = self.perplexity, iteration = self.iteration, learning_rate = self.learning_rate)
        self.DRresults = p.run()
        
    def resultToJson(self):
        self.DRresults.update(self.FSMresults)

    def run(self):
        self.embeddings = self.run_DR()
        self.generate_graph()
        self.run_FSM()
        self.run_procrustes()
        self.resultToJson()
        return self.DRresults


def main():
    path = "/home/myeongwon/mw_dir/FS_TSNE/data/breast_cancer.csv"
    ensembleDR = EnsembleDR(path=path, class_col='diagnosis', pca_iter=1, random_iter=2, perplexity=20, iteration=300, learning_rate=-1, min_supports=[1,2], k=5)
    ensembleDR.run()

    # csv_files = glob.glob("/home/myeongwon/mw_dir/FS_TSNE/result/breast_cancer/*.csv")
    # print(csv_files)
    

if __name__ =="__main__":
    main()



# dirs = glob.glob('/home/myeongwon/mw_dir/FS_TSNE/result/*')
# for dir in dirs:
#     data = dir[dir.rfind('/')+1:]
#     print(dir +':')
#     fsm9 = FSM(data, min_supports=9)
#     fsm9.run()
#     fsm8 = FSM(data, min_supports=8)
#     fsm8.run()
#     fsm7 = FSM(data, min_supports=7)
#     fsm7.run()
#     fsm6 = FSM(data, min_supports=6)
#     fsm6.run()


# from TSNE import TSNE

# HPram = {"Perplexity" : [15, 30, 45], "Iteration" : [500, 750, 1000], "Learning_Rate" : [200, 800, -1]}

# hpram = [(p, i, lr) for p in HPram['Perplexity'] for i in HPram['Iteration'] for lr in HPram['Learning_Rate'] ]

# tsne = TSNE(file_path='/home/myeongwon/mw_dir/FS_TSNE/data/fashion-mnist.csv', data_title='F-MNIST',class_col='label')
# for p, i, lr in hpram:
#     tsne.run(perplexity=p, max_iter=i, learning_rate=lr)