import numpy as np
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

W1 = np.load('W1.npy')
b1 = np.load('b1.npy')
W2 = np.load('W2.npy')
b2 = np.load('b2.npy')

def ReLU(Z):
    return np.maximum(0, Z)

def softmax(Z):
    exp = np.exp(Z - np.max(Z, axis=0, keepdims=True))
    return exp / np.sum(exp, axis=0, keepdims=True)

def forward_prop(W1, b1, W2, b2, X):
    Z1 = W1.dot(X) + b1
    A1 = ReLU(Z1)
    Z2 = W2.dot(A1) + b2
    A2 = softmax(Z2)
    return A2

def get_predictions(A2):
    return np.argmax(A2, 0)

def predict(image):
    X = image.reshape(784, 1)
    
    # Forward prop
    A2 = forward_prop(W1, b1, W2, b2, X)
    
    # Getting the prediction
    prediction = get_predictions(A2)
    
    return int(prediction[0])

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict_digit():
    image_data = request.json['image']
    image_array = np.array(image_data, dtype=np.float32)
    
    print("Input shape:", image_array.shape)
    print("Input min, max:", image_array.min(), image_array.max())
    
    X = image_array.reshape(784, 1)
    
    Z1 = W1.dot(X) + b1
    A1 = ReLU(Z1)
    Z2 = W2.dot(A1) + b2
    A2 = softmax(Z2)
    
    print("A2 shape:", A2.shape)
    print("A2 values:", A2.flatten())
    
    prediction = get_predictions(A2)
    
    return jsonify({'prediction': int(prediction[0])})

if __name__ == '__main__':
    app.run(debug=True)