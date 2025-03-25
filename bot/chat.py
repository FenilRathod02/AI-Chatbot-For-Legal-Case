from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import torch
import json
import random
from model import NeuralNet
from nltk_utils import bag_of_words, tokenize

app = Flask(__name__, template_folder="templates", static_folder="static")

# app = Flask(__name__, template_folder="frontend")  # ✅ Ensure correct template path
CORS(app)

# Load trained model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
data = torch.load("legal_qa_data.pth", map_location=device)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data["all_words"]
tags = data["tags"]
model_state = data["model_state"]

model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

# Load QA responses
with open("legal_qa.json", "r") as f:
    qa_data = json.load(f)

def get_response(tag):
    for intent in qa_data["intents"]:
        if intent["tag"] == tag:
            return random.choice(intent["responses"])
    return "I'm sorry, I don't have an answer for that."

# ✅ Route to render chatbot.html (GET request)
@app.route("/")
def home():
    return render_template("index.html")  # ✅ Ensure chatbot.html exists inside 'frontend/'

@app.route("/login")
def login():
    return render_template("login.html") 

@app.route("/sign_up")
def sign_up():
    return render_template("sign_up.html") 

@app.route("/chatbot")
def chatbot():
    return render_template("chatbot.html") 

# ✅ Separate API route for chatbot (POST request)
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    sentence = data.get("message", "").strip()

    if not sentence:
        return jsonify({"response": "Please enter a valid question."})

    sentence_tokens = tokenize(sentence)
    X = bag_of_words(sentence_tokens, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)
    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]

    if prob.item() > 0.75:
        response = get_response(tag)
    else:
        response = "I'm sorry, I don't have an answer for that."

    return jsonify({"response": response})  # ✅ Return JSON response for chatbot API

if __name__ == "__main__":
    app.run(debug=True)
