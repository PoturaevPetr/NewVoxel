from flask import send_from_directory, send_file, redirect, jsonify
from webApplication import app
from  config import config
import os, subprocess

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory(os.path.join(config['APP']['template_folder'], 'static/css'), path)

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory(os.path.join(config['APP']['template_folder'], 'static/js'), path)
