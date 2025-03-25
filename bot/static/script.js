document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;
            
            if (!email || !password) {
                showAlert("Please fill in all fields!", "error");
                return;
            }
            
            showAlert("Login Successful!", "success");
            setTimeout(() => window.location.href = "/chatbot.html", 1000);
             
            //  href = "chatbot.html"
        });
    }

    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const name = document.getElementById("signup-name").value;
            const email = document.getElementById("signup-email").value;
            const password = document.getElementById("signup-password").value;
            
            if (!name || !email || !password) {
                showAlert("Please fill in all fields!", "error");
                return;
            }
            
            showAlert("Signup Successful! Redirecting to login...", "success");
            setTimeout(() => window.location.href = "login.html", 1000);
        });
    }
});

function sendMessage() {
    let input = document.getElementById("user-input").value.trim();
    if (!input) return;
    
    let chatBox = document.getElementById("chat-box");
    appendMessage("user", input);
    
    document.getElementById("user-input").value = "";
    showTypingIndicator();
    
    fetch('http://127.0.0.1:5000/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
    })
    .then(response => response.json())
    .then(data => {
        hideTypingIndicator();
        appendMessage("bot", data.reply);
    })
    .catch(error => {
        hideTypingIndicator();
        appendMessage("bot", "Sorry, an error occurred. Please try again.");
    });
}

function appendMessage(sender, text) {
    let chatBox = document.getElementById("chat-box");
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
    let chatBox = document.getElementById("chat-box");
    let typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.classList.add("message", "bot");
    typingDiv.innerHTML = `<p>Typing...</p>`;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTypingIndicator() {
    let typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
}

function showAlert(message, type) {
    let alertBox = document.createElement("div");
    alertBox.classList.add("alert", type);
    alertBox.innerText = message;
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 3000);
}   


document.addEventListener("DOMContentLoaded", () => {
    const chatBox = document.querySelector(".chat-box");
    const chatInput = document.querySelector(".chat-input input");
    const sendButton = document.querySelector(".chat-input button");

    function appendMessage(sender, message, isLoading = false) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);
        messageDiv.innerHTML = isLoading ? '<span class="loading-spinner"></span> Thinking...' : `<p>${message}</p>`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageDiv;
    }

    function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        appendMessage("user", userMessage);
        chatInput.value = "";

        // Show a loading animation
        const loadingDiv = appendMessage("bot", "", true);

        // Send request to the backend
        fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Server responded with an error");
            }
            return response.json();
        })
        .then(data => {
            loadingDiv.remove(); // Remove loading text
            appendMessage("bot", data.response || "Sorry, I didn't understand that.");
        })
        .catch(error => {
            loadingDiv.remove();
            appendMessage("bot", "Oops! Something went wrong. Try again.");
            console.error("Chatbot Error:", error);
        });
    }

    sendButton.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");

    function appendMessage(sender, message) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add(sender === "User" ? "user-message" : "bot-message");
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    chatForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const message = userInput.value.trim();

        if (message === "") return;

        appendMessage("User", message);
        userInput.value = "";

        fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => response.json())
        .then(data => {
            appendMessage("LegalBot", data.response);
        })
        .catch(error => {
            console.error("Error:", error);
            appendMessage("LegalBot", "Error connecting to server.");
        });
    });
});