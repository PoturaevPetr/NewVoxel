from flask import Flask
from config import config
import os
template_folder = f"{config['APP']['template_folder']}"
app = Flask(__name__, instance_relative_config=True, template_folder=template_folder)
app.config['SECRET_KEY'] = config['APP']['secret_key']
app.jinja_env.add_extension('pypugjs.ext.jinja.PyPugJSExtension')

def create_directory():
    os.makedirs(config['APP']['images_umap'], exist_ok=True)
    os.makedirs(config['APP']['json_umap'], exist_ok=True)
    os.makedirs(config['APP']['json_umap'], exist_ok=True)
create_directory()
from webApplication.interface import *