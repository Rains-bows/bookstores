// src/api/ai.js
export const aiChat = (messages) => {
  return fetch('/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify({ messages })
  })
}