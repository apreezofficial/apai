
const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

// State variables
let userMessage = null;
let isResponseGenerating = false;
let conversationHistory = [];

// API Configuration
const API_KEY = "AIzaSyDKWGk0HHs2CzHpzYtz-c38dE4HEzHE0MU";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
const md = window.markdownit(); // Markdown Parser

// Load saved chats and theme from local storage
const loadDataFromLocalstorage = () => {
    const savedChats = localStorage.getItem("saved-chats");
    const isLightMode = localStorage.getItem("themeColor") === "light_mode";

    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

    chatContainer.innerHTML = savedChats || "";
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

// Create and return a message element
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Show typing effect for bot response
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
    const words = text.split(" ");
    let currentWordIndex = 0;
    const typingInterval = setInterval(() => {
        textElement.innerHTML += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
            isResponseGenerating = false;
            localStorage.setItem("saved-chats", chatContainer.innerHTML); // Save chats
        }
        chatContainer.scrollTo(0, chatContainer.scrollHeight);
    }, 75);
};

// Fetch AI response from Gemini API
const generateAPIResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text");

    try {
        conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: conversationHistory }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        let apiResponse = data.candidates[0].content.parts[0].text;
        apiResponse = md.render(apiResponse); // Render Markdown

        conversationHistory.push({ role: "model", parts: [{ text: apiResponse }] });

        showTypingEffect(apiResponse, textElement, incomingMessageDiv);
    } catch (error) {
        isResponseGenerating = false;
        textElement.innerHTML = `❌ ${error.message}`;
        incomingMessageDiv.classList.add("error");
    } finally {
        incomingMessageDiv.classList.remove("loading");
    }
};

// Show loading animation before API response
const showLoadingAnimation = () => {
    const html = `<div class="message-content">
      <img class="avatar" src="Gemini.png" alt="Gemini avatar">
      <p class="text"></p>
      <div class="loading-indicator">
        <div class="loading-bar"></div>
        <div class="loading-bar"></div>
        <div class="loading-bar"></div>
      </div>
    </div>`;
    
    const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
    chatContainer.appendChild(incomingMessageDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    generateAPIResponse(incomingMessageDiv);
};

// Copy message to clipboard
const copyMessage = (copyButton) => {
    const messageText = copyButton.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyButton.innerText = "done";
    setTimeout(() => (copyButton.innerText = "content_copy"), 1000);
};

// Handle sending user message
const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if (!userMessage || isResponseGenerating) return;
    
    isResponseGenerating = true;

    const html = `<div class="message-content">
      <img class="avatar" src="user.png" alt="User avatar">
      <p class="text"></p>
    </div>`;

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatContainer.appendChild(outgoingMessageDiv);

    typingForm.reset();
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    setTimeout(showLoadingAnimation, 500);
};

// Toggle between light and dark themes
toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// Delete all chats
deleteChatButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("saved-chats");
        conversationHistory = [];
        loadDataFromLocalstorage();
    }
});

// Handle form submission
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});

// Load chat history on page load
loadDataFromLocalstorage();
