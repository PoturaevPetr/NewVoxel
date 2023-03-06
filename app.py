from config import config
from webApplication import app


if __name__ == "__main__":
    app.run(debug=True, port=config['APP']['port'])
