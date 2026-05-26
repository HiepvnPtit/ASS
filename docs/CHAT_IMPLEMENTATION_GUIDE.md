# Real-Time Chat Implementation Guide

## Overview

This guide covers the real-time chat feature implementation for trips using WebSocket (Socket.IO) communication. Customers and drivers can exchange messages during a trip in real-time.

## Architecture

### Components

1. **TinNhan Entity** (`src/entities/tin-nhan.entity.ts`)
   - Represents a chat message
   - Stores: sender ID, trip ID, message content, timestamp, message type (text/image/location)
   - Relationships: References ChuyenDi (trip) and NguoiDung (sender)

2. **SendMessageDto** (`src/trips/dto/send-message.dto.ts`)
   - WebSocket payload validation
   - Fields: `maChuyenDi`, `noiDung` (required), `loaiTinNhan`, `mediaUrl` (optional)

3. **TripsService** (`src/trips/trips.service.ts`)
   - `saveMessage()`: Persists message to database
   - `getMessages()`: Retrieves chat history for a trip (sorted by timestamp ascending)

4. **TripsGateway** (`src/trips/trips.gateway.ts`)
   - `@SubscribeMessage('send_message')`: Handles incoming messages
   - `emitNewMessage()`: Broadcasts message to all clients in trip room
   - Room naming: `trip_${maChuyenDi}`

5. **TripsController** (`src/trips/trips.controller.ts`)
   - `GET /trips/{id}/messages`: REST API to retrieve chat history

6. **TripsModule** (`src/trips/trips.module.ts`)
   - Imports TinNhan entity for TypeORM support

## WebSocket Events

### Client → Server

#### Event: `send_message`

**Payload:**
```typescript
{
  maChuyenDi: string;      // Trip ID (required, max 50 chars)
  noiDung: string;         // Message content (required, max 5000 chars)
  loaiTinNhan?: string;    // Message type: 'text', 'image', 'location' (default: 'text')
  mediaUrl?: string;       // URL to media attachment (optional)
}
```

**Example:**
```javascript
socket.emit('send_message', {
  maChuyenDi: 'CD-12345',
  noiDung: 'I am on my way, 5 minutes away',
  loaiTinNhan: 'text'
});
```

**Response on Error:**
```javascript
// On validation error
socket.on('error', (errorPayload) => {
  console.error('Error:', errorPayload.message);
});
```

### Server → Client

#### Event: `new_message`

**Payload:**
```typescript
{
  id: string;              // Message UUID
  maChuyenDi: string;      // Trip ID
  nguoiGuiId: string;      // Sender user ID
  noiDung: string;         // Message content
  loaiTinNhan: string;     // Message type
  mediaUrl?: string;       // Media URL if present
  thoiGianGui: Date;      // Message sent timestamp
  daDoc: boolean;         // Read status
  timestamp: Date;        // Server broadcast timestamp
}
```

**Example:**
```javascript
socket.on('new_message', (message) => {
  console.log(`${message.nguoiGuiId}: ${message.noiDung}`);
  // Update UI with new message
});
```

## REST API Endpoint

### GET /trips/{id}/messages

**Authentication:** JWT Bearer Token required

**Parameters:**
- `id` (path): Trip ID (`maChuyenDi`)

**Response:**
```json
{
  "message": "Messages retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "maChuyenDi": "CD-12345",
      "nguoiGuiId": "ND-67890",
      "noiDung": "I am on my way",
      "loaiTinNhan": "text",
      "mediaUrl": null,
      "thoiGianGui": "2026-05-25T12:30:00.000Z",
      "daDoc": false,
      "createdAt": "2026-05-25T12:30:00.000Z",
      "deletedAt": null
    }
  ],
  "count": 1
}
```

**Example cURL:**
```bash
curl -X GET http://localhost:3000/trips/CD-12345/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Client Implementation

### JavaScript/TypeScript Example

```typescript
import io from 'socket.io-client';

// Connect to WebSocket with authentication
const socket = io('http://localhost:3000/trips', {
  auth: {
    userId: 'ND-12345'  // User ID from JWT token
  }
});

// Join trip room
socket.emit('join_trip', { maChuyenDi: 'CD-12345' });

// Listen for incoming messages
socket.on('new_message', (message) => {
  console.log(`Message from ${message.nguoiGuiId}: ${message.noiDung}`);
  updateChatUI(message);
});

// Send a message
function sendMessage(text: string) {
  socket.emit('send_message', {
    maChuyenDi: 'CD-12345',
    noiDung: text,
    loaiTinNhan: 'text'
  });
}

// Error handling
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

### React Component Example

```typescript
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

interface Message {
  id: string;
  nguoiGuiId: string;
  noiDung: string;
  thoiGianGui: Date;
  loaiTinNhan: string;
  mediaUrl?: string;
}

export const TripChat: React.FC<{ tripId: string; userId: string }> = ({
  tripId,
  userId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io('http://localhost:3000/trips', {
      auth: { userId },
    });

    // Join trip room
    newSocket.emit('join_trip', { maChuyenDi: tripId });

    // Load initial messages from REST API
    fetch(`/trips/${tripId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setMessages(data.data));

    // Listen for new messages
    newSocket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Error handling
    newSocket.on('error', (error: any) => {
      console.error('Chat error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [tripId, userId]);

  const handleSendMessage = () => {
    if (input.trim()) {
      socket?.emit('send_message', {
        maChuyenDi: tripId,
        noiDung: input,
        loaiTinNhan: 'text',
      });
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.nguoiGuiId === userId ? 'sent' : 'received'}`}>
            <p>{msg.noiDung}</p>
            <small>{new Date(msg.thoiGianGui).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};
```

## Database Schema

```sql
CREATE TABLE tin_nhan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ma_chuyen_di VARCHAR(50) NOT NULL REFERENCES chuyen_di(ma_chuyen_di) ON DELETE CASCADE,
  nguoi_gui_id VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE SET NULL,
  noi_dung TEXT NOT NULL,
  thoi_gian_gui TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  da_doc BOOLEAN NOT NULL DEFAULT FALSE,
  loai_tin_nhan VARCHAR(20) NOT NULL DEFAULT 'text',
  media_url VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_tin_nhan_ma_chuyen_di_thoi_gian ON tin_nhan(ma_chuyen_di, thoi_gian_gui);
CREATE INDEX idx_tin_nhan_ma_chuyen_di_created_at ON tin_nhan(ma_chuyen_di, created_at);
CREATE INDEX idx_tin_nhan_nguoi_gui_id ON tin_nhan(nguoi_gui_id);
```

## Data Flow

```
Client A              Client B
   |                    |
   +-- send_message --> Socket.IO Gateway
                            |
                         Database (save)
                            |
                  +----------+----------+
                  |                     |
             emit to room          emit to room
           (trip_CD-12345)         (trip_CD-12345)
                  |                     |
                  v                     v
            new_message            new_message
                 |                      |
            Update UI              Update UI
```

## Error Handling

1. **Missing Authentication**: Socket must include `userId` in auth
2. **Validation Errors**: Message payload must include required fields (`maChuyenDi`, `noiDung`)
3. **Database Errors**: Caught and broadcast as error event
4. **Trip Not Found**: Service validates trip exists before saving

## Future Enhancements

1. **Message Read Status**: Update `da_doc` when recipient views message
2. **Typing Indicator**: Emit 'user_typing' event when user is composing
3. **Message Edit**: Allow message correction within time window
4. **Message Delete**: Soft delete with tombstone
5. **Image Upload**: Handle image messages with URL generation
6. **Location Sharing**: Real-time GPS location in chat
7. **Message Search**: Full-text search on message content
8. **Chat Notifications**: Push notifications for new messages
9. **Message Reactions**: Emoji reactions to messages
10. **Message Encryption**: End-to-end encryption for privacy

## Testing

### Load Test WebSocket
```bash
npx artillery quick --target http://localhost:3000/trips -d 10 -r 10
```

### Manual Testing
```bash
# Test via curl to fetch message history
curl -X GET http://localhost:3000/trips/CD-12345/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Troubleshooting

1. **Messages not appearing**: Verify userId is passed in socket auth
2. **Connection timeout**: Check WebSocket port is accessible (default 3000)
3. **Database errors**: Run migration script `database.tin-nhan.sql`
4. **Type errors**: Ensure TinNhan entity is imported in TripsModule

## References

- [Socket.IO Documentation](https://socket.io/docs/)
- [NestJS WebSocket Documentation](https://docs.nestjs.com/websockets/gateways)
- [TypeORM Relationships](https://typeorm.io/relations)
