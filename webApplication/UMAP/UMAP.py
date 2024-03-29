from glob import glob
import pandas as pd
# from sklearn.manifold import TSNE
from umap.umap_ import UMAP
import numpy as np
from tqdm import tqdm
import os
from PIL import Image
import json

def reformat_turple_list(im):
    result = list()
    for tup in list(im):
        result.append(tup[1])
    return result


class UMAPModel():
    colors_list = ['red', 'blue', 'green']
    colors = {}
    reverce_lables = {}
    def init_dataset(self, path):
        data = [] 
        types = []
        self.files = list()
        for file_ in tqdm(glob(f'{path}/**/*.jpg') + glob(f'{path}/**/*.png')):
            try:
                file = file_.replace('\\', '/')
                if file.split('/')[-2] not in types:
                    types.append(file.split('/')[-2])

                for t, color in zip(types, self.colors_list[:len(types)]):
                    self.colors[t] = color
                    self.reverce_lables[color] = t


                im = Image.open(file)
                im = im.resize((128, 128), Image.Resampling.LANCZOS)
                pixels = reformat_turple_list(list(im.getdata()))
                color = self.colors[file.split('/')[-2]]
                data.append([color] + pixels)
                self.files.append(os.path.basename(file))
            except:
                print(f'Error {file}')
        self.df = pd.DataFrame(data)
        #print(df)
        self.df.columns = ['label'] + ['a{}'.format(i) for i in range(self.df.shape[1]-1)]
        self.labels = self.df['label'].tolist()

    def init_umap(self, metric=None, n_components=None, n_neighbors=None):
        self.umap = UMAP(metric=metric, n_components=n_components, n_neighbors=n_neighbors)
        embedding_umap = self.umap.fit_transform(self.df.drop('label', axis = 1))

    def generate_json(self, path_json):
        data = list()
        for i, coordinate in enumerate(self.umap.embedding_):
            data.append({
                'x': float(coordinate[0]),
                'y': float(coordinate[1]),
                'file_name': self.files[i],
                'label': self.reverce_lables[self.labels[i]]
            })

        result = {'data': data}

        
        with open(path_json, 'w') as fp:
            json.dump(result, fp)
        return result