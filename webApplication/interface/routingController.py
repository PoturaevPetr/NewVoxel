from webApplication import *
from webApplication import app
from flask import render_template
from config import config
import os

@app.route('/')
def renderIndex():
    try:
        os.makedirs(config['APP']['images_umap'], exist_ok=True)
        return render_template('index.pug')
    except:
        return render_template('index.pug')