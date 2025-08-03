const micBtn = document.getElementById("micBtn");
const chatbox = document.getElementById("chatbox");

let isListening = false;
let recognition;

// Add message to chat UI
function addMessage(text, sender) {
  const messageElement = document.createElement("div");
  messageElement.className = sender === "user" ? "user-message" : "bot-message";
  messageElement.innerText = `${sender === "user" ? "🧑 You" : "🤖 Gemini AI"}: ${text}`;
  chatbox.appendChild(messageElement);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Start speech recognition
function startListening() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  isListening = true;
  micBtn.innerText = "🛑 Stop Listening";

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    addMessage(transcript, "user");

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: transcript }),
      });

      const data = await res.json();
      if (data.reply) {
        addMessage(data.reply, "gemini");
      } else {
        addMessage("⚠️ No response from Gemini.", "gemini");
      }
    } catch (error) {
      console.error("AI response failed", error);
      addMessage("⚠️ Error getting response from Gemini.", "gemini");
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    addMessage("⚠️ Speech recognition error: " + event.error, "gemini");
    stopListening();
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.innerText = "🎤 Start Listening";
  };
}

// Stop speech recognition
function stopListening() {
  if (recognition) {
    recognition.stop();
  }
  isListening = false;
  micBtn.innerText = "🎤 Start Listening";
}

// Mic button event listener
micBtn.addEventListener("click", () => {
  if (!isListening) {
    startListening();
  } else {
    stopListening();
  }
});
