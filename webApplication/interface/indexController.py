from webApplication import *
from webApplication import app
from flask import jsonify, json, send_from_directory, request
import glob, os
from webApplication.UMAP.UMAP import UMAPModel
umap = UMAPModel()

@app.route('/get_images_folder', methods=["GET"])
def get_images_umap():
    folders = os.listdir("images")
    return jsonify({
        "status": "success",
        "message": "Датасеты загружены",
        "folders": folders
    })
@app.route('/get_images_file/<path:folder>', methods=['GET'])
def get_images_file(folder):
    if folder == 'undefined':  
        folder = os.listdir(f"{config['APP']['images_umap']}")[0]
    pic_paths = glob.glob(pathname=f"{config['APP']['images_umap']}/{folder}/**", recursive=True)
    pictures = [
        {'name': i.split('\\')[-1], 'type': i.split('\\')[-2]} for i in pic_paths if '.jpg' in i 
    ]
    return jsonify({
        "status": "success",
        "message": "Изображения загружены",
        "pictures": pictures,
        'folder': folder
    })

@app.route('/get_metrics', methods=["GET"])
def get_metrics():
    metrics = ['euclidean', 'manhattan', 'chebyshev', 'minkowski',
           'canberra', 'braycurtis',
           'mahalanobis', 'wminkowski', 'seuclidean',
           'cosine', 'correlation',
           'hamming', 'dice', 'russellrao', 'kulsinski', 'rogerstanimoto', 'sokalmichener', 'sokalsneath', 'yule' 
          ]
    return jsonify({
        'status': 'success',
        'metrics': metrics
    })

@app.route('/img_umap/<path:folder>/<path:type>/<path:name>')
def get_pic(folder, type, name):
    return send_from_directory("." + os.path.join(config['APP']['images_umap'], f"{folder}/{type}"), name)



@app.route('/calculate_umap', methods=['GET'])
def calculate_umap():
    colors = {'HSIL':'red','LSIL':'green', 'NORMA': 'blue'}
    reverce_lables = {'red':'HSIL','green':'LSIL', 'blue': 'Norma'}

    folder = request.args.get('folder')
    if folder == 'undefined':
        folder = os.listdir(f"{config['APP']['images_umap']}")[0]

    metric = request.args.get('metric')
    if metric == 'undefined':
        metric = 'euclidean'

    n_components = request.args.get('n_components')
    if n_components == 'undefined':
        n_components = 2

    n_neighbors = request.args.get('n_neighbors')
    if n_components == 'undefined':
        n_neighbors = 10
    try:
        os.makedirs(config['APP']['json_umap'], exist_ok=True)
    except:
        print(f"Folder {config['APP']['json_umap']} exist ok")
    path_json = f"{config['APP']['json_umap']}/{folder}_{metric}_{n_components}_{n_neighbors}.json"
    
    if os.path.exists(path_json):
        try:
            with open(path_json) as f:
                result = json.load(f)
                return jsonify({
                    "status": "success",
                    'data': result,
                    'message': "Данные UMAP загружены"
                })
        except:
            return jsonify({
                'status': "error",
                'message': "Ошибка загрузки данных UMAP (/umapJson)"
            })
    else:
        path = f"{config['APP']['images_umap']}/{folder}"
        try:
            umap.init_dataset(path, colors=colors)
            umap.init_umap(metric=metric, n_components=int(n_components), n_neighbors=int(n_neighbors))

            reverce_lables = {'red':'HSIL','green':'LSIL', 'blue': 'Norma'}
            result = umap.generate_json(path_json=path_json, reverce_lables=reverce_lables)
            return jsonify({
                "status": "success",
                'data': result,
                'message': "Данные UMAP загружены"
            })
        except:
            return jsonify({
                'status': "error",
                'message': "Ошибка загрузки данных UMAP (/umapJson)"
            })