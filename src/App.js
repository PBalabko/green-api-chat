import React, { useState, useEffect } from 'react';
import './App.css';
import { sendMessage, receiveNotification, deleteNotification } from './api';

function App() {
  const [idInstance, setIdInstance] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const [chatId, setChatId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isChatReady, setIsChatReady] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !chatId.trim()) return;

    const formattedChatId = chatId.includes('@') ? chatId : `${chatId}@c.us`;

    try {
      await sendMessage(idInstance, apiToken, formattedChatId, message);
      setMessages((prev) => [...prev, { text: message, type: 'outgoing' }]);
      setMessage('');
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Не удалось отправить сообщение. Проверьте данные.');
    }
  };

  useEffect(() => {
    if (!isConnected || !isChatReady) return;

    let isActive = true;

    const pollMessages = async () => {
      while (isActive) {
        try {
          const data = await receiveNotification(idInstance, apiToken);

          if (data && data.body) {
            const type = data.body.typeWebhook;
            const text = data.body.messageData?.textMessageData?.textMessage;

            if (text) {
              if (type === 'incomingMessageReceived') {
                setMessages((prev) => [...prev, { text, type: 'incoming' }]);
              } else if (type === 'outgoingMessageReceived') {
                setMessages((prev) => [...prev, { text, type: 'outgoing' }]);
              }
            }

            await deleteNotification(idInstance, apiToken, data.receiptId);
          }
        } catch (error) {
          console.error('Ошибка получения:', error);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };

    pollMessages();

    return () => {
      isActive = false;
    };
  }, [isConnected, isChatReady, idInstance, apiToken]);

  if (!isConnected) {
    return (
      <div className="container">
        <h1>Вход в GREEN-API</h1>
        <input
          type="text"
          placeholder="idInstance"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
        />
        <input
          type="text"
          placeholder="apiTokenInstance"
          value={apiToken}
          onChange={(e) => setApiToken(e.target.value)}
        />
        <button onClick={() => setIsConnected(true)}>Войти</button>
      </div>
    );
  }

  if (!isChatReady) {
    return (
      <div className="container">
        <h1>Создать чат</h1>
        <input
          type="text"
          placeholder="Номер получателя (например, 79991234567)"
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
        />
        <button onClick={() => setIsChatReady(true)}>Начать чат</button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <h2>Чат с {chatId}</h2>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.type === 'outgoing' ? 'outgoing' : 'incoming'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Введите сообщение..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Отправить</button>
      </div>
    </div>
  );
}

export default App;