from flask import Flask
from config import config

template_folder = f"{config['APP']['template_folder']}"
app = Flask(__name__, instance_relative_config=True, template_folder=template_folder)
app.config['SECRET_KEY'] = config['APP']['secret_key']
app.jinja_env.add_extension('pypugjs.ext.jinja.PyPugJSExtension')

from webApplication.interface import *