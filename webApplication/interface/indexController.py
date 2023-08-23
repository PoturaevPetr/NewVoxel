from webApplication import *
from webApplication import app
from flask import jsonify, json, send_from_directory, request
import glob, os, shutil
from webApplication.UMAP.UMAP import UMAPModel
umap = UMAPModel()
from config import config

@app.route('/get_images_folder', methods=["GET"])
def get_images_umap():
    folders = os.listdir("images")
    pictures = {}
    for folder in folders:
        files_counts = len(glob.glob(f"images/{folder}/**/*.jpg", recursive=True) + glob.glob(f"images/{folder}/**/*.png", recursive=True)) 
        pictures[folder] = files_counts
    return jsonify({
        "status": "success",
        "message": "Датасеты загружены",
        "folders": folders,
        "pictures": pictures
    })
@app.route('/get_images_file/<path:folder>', methods=['GET'])
def get_images_file(folder):
    if folder == 'undefined':  
        return jsonify({
        "status": "error",
        "message": "Датасет не найден",
    })
    pic_paths = glob.glob(pathname=f"{config['APP']['images_umap']}/{folder}/**/*.jpg", recursive=True) +  glob.glob(pathname=f"{config['APP']['images_umap']}/{folder}/**/*.png", recursive=True)
    print(pic_paths)
    pictures = [
        {'name': i.split('/')[-1], 'type': i.split('/')[-2]} for i in pic_paths
    ]
    return jsonify({
        "status": "success",
        "message": "Датасет загружен",
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

@app.route('/get_parameters_create_dataset', methods=['GET'])
def get_parameters_create_dataset():
    os.makedirs(config['APP']['folder_new_dataset'], exist_ok=True)
    folders = os.listdir(config['APP']['folder_new_dataset'])
    return jsonify({
        'status': 'success',
        'folders': folders
    })

@app.route('/calculate_umap', methods=['GET'])
def calculate_umap():
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
            umap.init_dataset(path)
            umap.init_umap(metric=metric, n_components=int(n_components), n_neighbors=int(n_neighbors))
            result = umap.generate_json(path_json=path_json)
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

@app.route('/create_dataset', methods=["POST"])
def create_dataset():
    try:
        data = json.loads(request.data)
        images = data['images']
        for img in images:
            if data['type_images'] == img['label_type']:
                path = f"{config['APP']['images_umap']}/{data['folder']}/{img['label_type']}/{img['filename']}" 
                new_path = f"{config['APP']['folder_new_dataset']}/{data['name_dataset']}/{img['label_type']}/{img['filename']}"
                os.makedirs(f"{config['APP']['folder_new_dataset']}", exist_ok=True)
                os.makedirs(f"{config['APP']['folder_new_dataset']}/{data['name_dataset']}/{img['label_type']}", exist_ok=True)
                shutil.copyfile(path, new_path)
        return jsonify({
            'status': 'success',
            'message': f'Создан датасет "{data["name_dataset"]}" с разделом "{data["type_images"]}"'

        })
    except:
        return jsonify({
            'status': 'error',
            'message': 'Ошибка при создании датасета'
        })