# Real-Time Chat - Quick Reference

## WebSocket Connection

```typescript
// Connect to WebSocket gateway
const socket = io('http://localhost:3000/trips', {
  auth: {
    userId: 'ND-12345'  // User ID from JWT
  }
});

// Join a trip room
socket.emit('join_trip', { maChuyenDi: 'CD-12345' });

// Disconnect
socket.disconnect();
```

## Send Message (WebSocket)

**Event:** `send_message`

```bash
# JavaScript/Node.js
socket.emit('send_message', {
  maChuyenDi: 'CD-12345',
  noiDung: 'I am 5 minutes away',
  loaiTinNhan: 'text'
});

# With media URL
socket.emit('send_message', {
  maChuyenDi: 'CD-12345',
  noiDung: 'Check this location',
  loaiTinNhan: 'image',
  mediaUrl: 'https://example.com/image.jpg'
});
```

## Receive Message (WebSocket)

**Event:** `new_message`

```typescript
socket.on('new_message', (message) => {
  console.log('New message:');
  console.log(`From: ${message.nguoiGuiId}`);
  console.log(`Text: ${message.noiDung}`);
  console.log(`Time: ${message.thoiGianGui}`);
  console.log(`Type: ${message.loaiTinNhan}`);
});
```

## Get Chat History (REST API)

**Endpoint:** `GET /trips/{maChuyenDi}/messages`

**cURL:**
```bash
curl -X GET http://localhost:3000/trips/CD-12345/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

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
      "createdAt": "2026-05-25T12:30:00.000Z"
    }
  ],
  "count": 1
}
```

## PowerShell Testing

```powershell
# Store JWT token
$token = "YOUR_JWT_TOKEN"
$tripId = "CD-12345"

# Get chat history
Invoke-WebRequest `
  -Uri "http://localhost:3000/trips/$tripId/messages" `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  } | ConvertFrom-Json | ConvertTo-Json
```

## Room Events

All clients in a trip room receive these events:

| Event | Triggered When | Payload |
|-------|----------------|---------|
| `new_message` | Message sent | Message details |
| `join_trip` | Client joins | Trip info |
| `client_joined` | Any client joins | Client ID, trip ID |
| `location_updated` | Driver location update | Coordinates |
| `trip_status_changed` | Trip status changes | New status |
| `client_left` | Client leaves room | Client ID |
| `driver_arrived` | Driver arrives | Location type |

## Message Types

```typescript
// Text message
{ 
  noiDung: "Hello driver, are you close?",
  loaiTinNhan: "text"
}

// Image message
{ 
  noiDung: "Check my location",
  loaiTinNhan: "image",
  mediaUrl: "https://example.com/photo.jpg"
}

// Location message
{ 
  noiDung: "I'm at this location",
  loaiTinNhan: "location",
  mediaUrl: "https://maps.example.com/...?lat=10.8&lng=106.7"
}
```

## Error Handling

```typescript
// Connection errors
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// Message send errors
socket.on('error', (errorPayload) => {
  console.error('Error:', errorPayload.message);
  // Examples: "maChuyenDi and noiDung are required"
  //           "User authentication required to send message"
  //           "Failed to send message"
});

// Disconnection
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

## Validation Rules

| Field | Type | Max Length | Required | Default |
|-------|------|-----------|----------|---------|
| maChuyenDi | string | 50 | ✓ | - |
| noiDung | string | 5000 | ✓ | - |
| loaiTinNhan | enum | - | ✗ | 'text' |
| mediaUrl | URL | 500 | ✗ | null |

**loaiTinNhan** valid values: `'text'`, `'image'`, `'location'`

## Database Setup

Run the migration:
```bash
# Using psql
psql -U postgres -d your_db_name -f database.tin-nhan.sql

# Or copy and paste the SQL from database.tin-nhan.sql
```

## Performance Notes

- **Indexes**: maChuyenDi + timestamp for fast history retrieval
- **Soft Deletes**: deletedAt column for archival
- **Room Limit**: No built-in limit on messages per trip (handle in frontend)
- **Broadcast**: All room members receive every message instantly

## Common Issues

| Issue | Solution |
|-------|----------|
| Socket connection timeout | Check server is running, port 3000 accessible |
| Auth error on connect | Ensure `userId` in socket auth matches JWT |
| Messages not persisting | Run database migration |
| Type errors | Ensure TinNhan entity in TripsModule.forFeature() |
| Messages not broadcasting | Verify client is in room (join_trip event sent) |

## Next Steps

1. Implement read receipts (mark `da_doc` when recipient views)
2. Add typing indicator (`user_typing` event)
3. Implement message reactions/emojis
4. Add message search functionality
5. Implement message edit/delete
