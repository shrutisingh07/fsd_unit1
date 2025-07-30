import React, { useState } from 'react';
import './index.css'; // Optional for custom styles

function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: 'bot' },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMessageText = inputMessage;
    const newUserMessage = {
      id: messages.length + 1,
      text: userMessageText,
      sender: 'user',
    };

    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputMessage('');

    const typingMessageId = messages.length + 2;
    setMessages(prevMessages => [
      ...prevMessages,
      { id: typingMessageId, text: "Bot is typing...", sender: 'bot' }
    ]);

    try {
      const chatHistory = [
        { role: "user", parts: [{ text: userMessageText }] }
      ];

      const payload = { contents: chatHistory };
      const apiKey = "AIzaSyDpKhAnzl4f-rD-hcclpKVUjynayfnrSPY"; // ⚠️ Do NOT expose this in production!
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      let botResponseText = "Sorry, I couldn't get a response from the AI.";

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content?.parts?.length > 0
      ) {
        botResponseText = result.candidates[0].content.parts[0].text;
      }

      setMessages(prevMessages => {
        const updatedMessages = prevMessages.filter(msg => msg.id !== typingMessageId);
        return [
          ...updatedMessages,
          { id: updatedMessages.length + 1, text: botResponseText, sender: 'bot' }
        ];
      });
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      setMessages(prevMessages => {
        const updatedMessages = prevMessages.filter(msg => msg.id !== typingMessageId);
        return [
          ...updatedMessages,
          { id: updatedMessages.length + 1, text: "Oops! Something went wrong with the AI.", sender: 'bot' }
        ];
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light p-3">
      <div className="card shadow-lg" style={{ maxWidth: '500px', width: '100%', height: '550px', display: 'flex', flexDirection: 'column' }}>
        <div className="card-header text-center bg-primary text-white py-3">
          <h1 className="h5 mb-0">My Simple Chat (with AI)</h1>
        </div>

        {/* Message display area */}
        <div className="card-body overflow-auto flex-grow-1 d-flex flex-column p-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex mb-2 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className={`p-3 rounded ${msg.sender === 'user' ? 'bg-info text-white' : 'bg-light text-dark border'}`}
                style={{ maxWidth: '70%' }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="card-footer d-flex p-3">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn btn-primary" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
