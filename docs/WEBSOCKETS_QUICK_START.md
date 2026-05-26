# WebSocket Integration - Quick Reference

## 🚀 Installation

```bash
# Install required packages
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install --save-dev @types/socket.io
```

## 📋 What Was Set Up

✅ **src/trips/trips.gateway.ts** - WebSocket Gateway
- Namespace: `/trips`
- Join room, update location, leave room
- Broadcasts to room members

✅ **src/trips/trips.service.ts** - Service Integration
- Injects TripsGateway
- Emits events on trip status changes

✅ **src/trips/trips.module.ts** - Module Export
- Added TripsGateway to providers

✅ **src/main.ts** - WebSocket Adapter
- Configured IoAdapter for Socket.io

✅ **docs/WEBSOCKETS_TRIPS_GUIDE.md** - Complete Documentation

## 🔌 Client Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/trips');

socket.on('connect', () => {
  // Join a trip room
  socket.emit('join_trip', { maChuyenDi: 'cd_12345' });
});
```

## 📡 Key Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `join_trip` | Client → Server | Join room for a trip |
| `update_location` | Client → Server | Send driver location |
| `leave_trip` | Client → Server | Leave room |
| `location_updated` | Server → Clients | Broadcast location in room |
| `trip_status_changed` | Server → Clients | Broadcast status change |
| `client_joined` | Server → Clients | Notify when client joins |
| `client_left` | Server → Clients | Notify when client leaves |

## 💬 Payload Examples

### Join Trip
```javascript
socket.emit('join_trip', { 
  maChuyenDi: 'cd_12345' 
});
```

### Update Location
```javascript
socket.emit('update_location', { 
  maChuyenDi: 'cd_12345',
  viDo: 10.7769,
  kinhDo: 106.7009
});
```

### Listen to Status Changes
```javascript
socket.on('trip_status_changed', (data) => {
  console.log(data);
  // {
  //   maChuyenDi: 'cd_12345',
  //   trangThai: 'STARTED',
  //   trangThaiCu: 'ACCEPTED',
  //   timestamp: '2024-05-25T10:31:00Z'
  // }
});
```

## 🏠 Room Architecture

Each trip has its own **room**: `trip_${maChuyenDi}`

```
trip_cd_12345
├── Client 1 (Customer)
├── Client 2 (Driver)
└── Client 3 (Admin monitoring)
```

All events in a room are isolated to that room's members.

## 🔄 Automatic Integration

When a **driver updates trip status** via REST API:

```
POST /trips/update-status
{
  maChuyenDi: 'cd_12345',
  maTaiXe: 'tx_123',
  newStatus: 'STARTED'
}
```

**Automatically triggers WebSocket broadcast** to all clients in `trip_cd_12345` room:

```javascript
{
  event: 'trip_status_changed',
  data: {
    maChuyenDi: 'cd_12345',
    trangThai: 'STARTED',
    trangThaiCu: 'ACCEPTED',
    timestamp: '2024-05-25T10:31:00Z'
  }
}
```

## 🧪 Test WebSocket Connection

1. Start dev server: `npm run start:dev`
2. Open browser console
3. Paste and run:

```javascript
const socket = io('http://localhost:3000/trips');
socket.on('connect', () => console.log('Connected!'));
socket.emit('join_trip', { maChuyenDi: 'test_123' });
socket.on('client_joined', (data) => console.log('Someone joined:', data));
```

## 📖 Full Documentation

See [WEBSOCKETS_TRIPS_GUIDE.md](./WEBSOCKETS_TRIPS_GUIDE.md) for:
- React/Vue integration examples
- Complete real-time tracking example
- Error handling
- Production CORS setup
- Troubleshooting guide

## ⚙️ Configuration

### WebSocket Gateway Config
File: `src/trips/trips.gateway.ts`

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',  // Change for production
    methods: ['GET', 'POST'],
  },
  namespace: '/trips',
})
```

### Update for Production

```typescript
@WebSocketGateway({
  cors: {
    origin: ['https://yourdomain.com'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| WebSocket not connecting | Verify `npm install` completed, check browser console |
| Events not received | Ensure `join_trip` called first, verify room name |
| Connection timeout | Check firewall, CORS settings, server running |
| Packages not found | Run `npm install` again, restart IDE |

## 📝 Status Flow

```
PENDING
   ↓
ACCEPTED (emit event to room)
   ↓
ARRIVED (emit event to room)
   ↓
STARTED (emit event to room)
   ↓
COMPLETED (emit event to room)
```

Each transition is broadcast to all clients in the trip room.

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install @nestjs/websockets @nestjs/platform-socket.io socket.io`
2. ✅ Verify files created in `src/trips/`
3. ✅ Start server: `npm run start:dev`
4. ✅ Test with client code above
5. Integrate into your frontend app
6. Deploy to production with CORS restrictions

---

**Questions?** Check [WEBSOCKETS_TRIPS_GUIDE.md](./WEBSOCKETS_TRIPS_GUIDE.md)
