import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

# ✅ Path to your fine-tuned model
model_path = "D:\AI-Chatbot-For-Legal-Case\New_AiBot\Finetune_Model"

# ✅ Load tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_path)

# ✅ Enable 4-bit quantization (Saves Memory)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4"
)

# ✅ Load Model with Low Memory Usage
device = "cuda" if torch.cuda.is_available() else "cpu"
model = AutoModelForCausalLM.from_pretrained(model_path, quantization_config=bnb_config, device_map="auto")

# ✅ Function to Ask the Model
def ask_question(question, max_length=512):
    inputs = tokenizer(question, return_tensors="pt").to(device)
    with torch.no_grad():
        output = model.generate(**inputs, max_length=max_length)
    return tokenizer.decode(output[0], skip_special_tokens=True)

# ✅ Chat Loop
while True:
    question = input("\nYou: ")
    if question.lower() in ["exit", "quit"]:
        print("Chatbot: Goodbye! 👋")
        break
    answer = ask_question(question)
    print("Chatbot:", answer)
