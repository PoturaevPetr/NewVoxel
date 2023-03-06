from webApplication import app

import random, string
import datetime


@app.context_processor
def example():
    def randomString(stringLength=10):
        letters = string.ascii_lowercase
        return ''.join(random.choice(letters) for i in range(stringLength))
    return dict(randomString = randomString)