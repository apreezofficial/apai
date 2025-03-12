const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;

// API configuration
const API_KEY = "AIzaSyDKWGk0HHs2CzHpzYtz-c38dE4HEzHE0MU"; // Your API key here
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Load conversation history from local storage
let conversationHistory = JSON.parse(localStorage.getItem("conversationHistory")) || [];

const createChatLi = (message, className) => {
  // Create a chat <li> element with passed message and className
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent = className === "outgoing" ? `<p></p>` : `<img src="Screenshot_2025-03-12-09-37-35-88_e5d3893ac03954c6bb675ef2555b879b (1).jpg" class="robot-icon"><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi; // return chat <li> element
}

const isWebsiteCreatorQuestion = (message) => {
  // Check if the message is specifically about the creator of this website
  const websiteKeywords = ["this website", "this platform", "this project", "this site"];
  const creatorKeywords = ["who created", "who made", "who developed", "who built", "who designed"];
  
  // Check if the message contains at least one website keyword AND one creator keyword
  return websiteKeywords.some(websiteKeyword => message.toLowerCase().includes(websiteKeyword)) &&
         creatorKeywords.some(creatorKeyword => message.toLowerCase().includes(creatorKeyword));
}

const generateResponse = async (chatElement) => {
  const messageElement = chatElement.querySelector("p");

  // Add the user's message to the conversation history
  conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });

  // Define the properties and message for the API request
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: conversationHistory, // Send the entire conversation history
    }),
  }

  // Send POST request to API, get response and set the response as paragraph text
  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Get the API response text and update the message element
    const botMessage = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
    messageElement.textContent = botMessage;

    // Add the bot's response to the conversation history
    conversationHistory.push({ role: "assistant", parts: [{ text: botMessage }] });

    // Save the updated conversation history to local storage
    localStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));
  } catch (error) {
    // Handle error
    messageElement.classList.add("error");
    messageElement.textContent = error.message;
  } finally {
    chatbox.scrollTo(0, chatbox.scrollHeight);
  }
}

const handleChat = () => {
  userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
  if (!userMessage) return;

  // Clear the input textarea and set its height to default
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  // Append the user's message to the chatbox
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    // Check if the user's message is specifically about the creator of this website
    if (isWebsiteCreatorQuestion(userMessage)) {
      const creatorResponse = "This website was created by Precious Adedokun, also known as apcodesphere. He's a talented developer who built this platform!";
      chatbox.appendChild(createChatLi(creatorResponse, "incoming"));
      chatbox.scrollTo(0, chatbox.scrollHeight);

      // Add the bot's response to the conversation history
      conversationHistory.push({ role: "assistant", parts: [{ text: creatorResponse }] });
      localStorage.setItem("conversationHistory", JSON.stringify(conversationHistory));
    } else {
      // Display "Thinking..." message while waiting for the response
      const incomingChatLi = createChatLi("Thinking...", "incoming");
      chatbox.appendChild(incomingChatLi);
      chatbox.scrollTo(0, chatbox.scrollHeight);
      generateResponse(incomingChatLi);
    }
  }, 600);
}

// Load conversation history when the page loads
window.addEventListener("load", () => {
  conversationHistory.forEach((message) => {
    const className = message.role === "user" ? "outgoing" : "incoming";
    chatbox.appendChild(createChatLi(message.parts[0].text, className));
  });
  chatbox.scrollTo(0, chatbox.scrollHeight);
});

chatInput.addEventListener("input", () => {
  // Adjust the height of the input textarea based on its content
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // If Enter key is pressed without Shift key and the window 
  // width is greater than 800px, handle the chat
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
