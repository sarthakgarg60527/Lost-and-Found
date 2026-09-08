from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image

app = Flask(__name__)

model = tf.keras.applications.MobileNetV2(
    weights="imagenet",
    include_top=False,
    pooling="avg"
)

def extract_features(img):

    img = img.resize((224,224))
    img = np.array(img)

    img = tf.keras.applications.mobilenet_v2.preprocess_input(img)

    img = np.expand_dims(img,axis=0)

    features = model.predict(img)

    return features[0]

def cosine_similarity(a,b):

    return np.dot(a,b)/(np.linalg.norm(a)*np.linalg.norm(b))


@app.route("/match",methods=["POST"])
def match():

    query = request.files['query']
    dataset = request.files.getlist("dataset")

    query_img = Image.open(query)
    query_features = extract_features(query_img)

    scores = []

    for img_file in dataset:

        img = Image.open(img_file)
        features = extract_features(img)

        score = cosine_similarity(query_features,features)

        scores.append(score)

    return jsonify([float(s) for s in scores])


app.run(port=8000)