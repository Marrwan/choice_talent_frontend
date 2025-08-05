import React from 'react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  attachments?: Array<{ mimeType: string }>;
}

interface ConversationProps {
  userId: string;
  messages?: Message[];
}

export default function Conversation({ userId, messages = [] }: ConversationProps) {
  return (
    <div className="conversation-container">
      {/* Chat messages UI (placeholder) */}
      <div className="messages-list">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}>{msg.content}</div>
        ))}
      </div>
    </div>
  );
}
