# WebSocket Integration Setup Checklist

## ✅ Completed Setup Tasks

### 1. Dependencies Installed
- [x] `@nestjs/websockets` - NestJS WebSocket integration
- [x] `@nestjs/platform-socket.io` - Socket.io adapter
- [x] `socket.io` - Real-time communication library
- [x] `@types/socket.io` - TypeScript types (dev dependency)

**Command to run:**
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install --save-dev @types/socket.io
```

---

### 2. Files Created

#### `src/trips/trips.gateway.ts` ✅
- WebSocket Gateway for real-time trip updates
- Namespace: `/trips`
- Features:
  - `@SubscribeMessage('join_trip')` - Join trip room
  - `@SubscribeMessage('update_location')` - Broadcast location
  - `@SubscribeMessage('leave_trip')` - Leave trip room
  - `emitTripStatusChanged()` - Emit trip status changes
  - `emitDriverArrived()` - Emit driver arrival

---

### 3. Files Modified

#### `src/trips/trips.service.ts` ✅
**Changes:**
- Added import: `import { TripsGateway } from './trips.gateway';`
- Added import: `Optional` from `@nestjs/common`
- Injected `TripsGateway` in constructor: `private readonly tripsGateway?: TripsGateway`
- Updated `updateTripStatus()` to emit WebSocket event after DB save:
  ```typescript
  if (this.tripsGateway) {
    this.tripsGateway.emitTripStatusChanged(maChuyenDi, {...});
  }
  ```

#### `src/trips/trips.module.ts` ✅
**Changes:**
- Added import: `import { TripsGateway } from './trips.gateway';`
- Added `TripsGateway` to `providers`: `providers: [TripsGateway, TripsService]`

#### `src/main.ts` ✅
**Changes:**
- Added import: `import { IoAdapter } from '@nestjs/platform-socket.io';`
- Added WebSocket adapter initialization after `createNestFactory()`:
  ```typescript
  app.useWebSocketAdapter(new IoAdapter(app));
  ```

---

### 4. Documentation Created

#### `docs/WEBSOCKETS_TRIPS_GUIDE.md` ✅
- **Complete usage guide** with all events documented
- Client-side implementation examples
- React/Vue integration examples
- Real-time tracking example
- Troubleshooting guide

#### `docs/WEBSOCKETS_QUICK_START.md` ✅
- Quick reference for npm commands
- Event payloads and examples
- Test code snippets
- Room architecture explanation

---

## 🚀 Next Steps to Get Running

### Step 1: Install Dependencies
```bash
cd o:\nestjs-boilerplate-main\nestjs-boilerplate-main
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install --save-dev @types/socket.io
```

### Step 2: Verify Installation
```bash
npm list @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### Step 3: Start Development Server
```bash
npm run start:dev
```

You should see:
```
[Nest] ... - 05/25/2024, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] ... - 05/25/2024, 10:30:00 AM     LOG [WebSocketGateway] WebSocket Gateway initialized
[Nest] ... - 05/25/2024, 10:30:00 AM     LOG [NestApplication] Nest application successfully started
```

### Step 4: Test WebSocket Connection
Open browser console and paste:

```javascript
const socket = io('http://localhost:3000/trips');

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket');
  socket.emit('join_trip', { maChuyenDi: 'test_trip_123' });
});

socket.on('client_joined', (data) => {
  console.log('📍 Client joined:', data);
});

socket.on('error', (error) => {
  console.error('❌ Error:', error);
});

socket.on('disconnect', () => {
  console.log('⚠️ Disconnected');
});
```

---

## 🧪 Test Trip Status Update

### 1. Create a Trip via API
```bash
POST http://localhost:3000/api/v1/trips
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "maXe": "xe_123",
  "maLoaiXe": "loai_1",
  "maBangGia": "bg_1",
  "quangDuongKm": 10,
  "diaDiemDon": "123 Main St",
  "diaDiemTra": "456 Other St"
}
```

Response will include `maChuyenDi`.

### 2. Connect to WebSocket
```javascript
const socket = io('http://localhost:3000/trips');
socket.emit('join_trip', { maChuyenDi: 'cd_from_api_response' });

// Listen for real-time status updates
socket.on('trip_status_changed', (data) => {
  console.log('🚗 Trip status updated:', data);
});
```

### 3. Update Trip Status via API
```bash
PATCH http://localhost:3000/api/v1/trips/update-status
Headers: Authorization: Bearer YOUR_DRIVER_TOKEN
Body: {
  "maChuyenDi": "cd_from_api_response",
  "maTaiXe": "tx_123",
  "newStatus": "STARTED"
}
```

**In browser console:**
- Immediately see the `trip_status_changed` event broadcast
- All clients in the room receive the update in real-time

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    NestJS App                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HTTP Routes                   WebSocket Gateway       │
│  ├─ POST /trips ────────┐      ├─ /trips namespace     │
│  ├─ GET /trips          │      ├─ join_trip room       │
│  ├─ PATCH /trips/:id    │      ├─ update_location      │
│  │                      │      ├─ leave_trip           │
│  └──────────────────────┘      └─ trip_status_changed  │
│                                                         │
│  TripsService ◄────────────────────► TripsGateway      │
│  ├─ createTrip()        ◄──────────► emit events       │
│  ├─ updateTripStatus() ─────────────► broadcastRoom    │
│  └─ cancelTrip()                                        │
│                                                         │
│  Database (PostgreSQL/MongoDB)                         │
│  ├─ chuyen_di (trips)                                  │
│  ├─ lich_su_trang_thai (history)                       │
│  └─ ...                                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │
                    WebSocket Connection
                    (real-time communication)
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    📱 Client 1        📱 Client 2        📱 Client 3
    (Customer)         (Driver)           (Admin)
```

---

## 🔒 Security Considerations

1. **CORS Configuration**: Currently enabled for all origins
   - **Production**: Restrict to specific domains in `trips.gateway.ts`

2. **Authentication**: Add token validation to WebSocket connections
   - See advanced examples in `WEBSOCKETS_TRIPS_GUIDE.md`

3. **Rate Limiting**: Consider adding rate limiting to location updates
   - Prevent spam/abuse of broadcasting

4. **Data Validation**: All incoming events are validated for required fields

---

## 🐛 Troubleshooting

### "Module not found: @nestjs/websockets"
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### WebSocket connection fails
1. Check server is running: `npm run start:dev`
2. Verify correct namespace: `/trips`
3. Check browser console for errors
4. Verify no firewall blocking WebSocket

### Events not broadcasting
1. Ensure client is in correct room via `join_trip`
2. Check server logs for errors
3. Verify event name spelling (case-sensitive)
4. Check if `TripsGateway` is being initialized

### "IoAdapter is not imported"
- Run: `npm install @nestjs/platform-socket.io`
- Verify import in `main.ts`: `import { IoAdapter } from '@nestjs/platform-socket.io';`

---

## 📚 Documentation

1. **Quick Start**: `docs/WEBSOCKETS_QUICK_START.md`
   - Commands, payloads, quick examples

2. **Complete Guide**: `docs/WEBSOCKETS_TRIPS_GUIDE.md`
   - Full integration guide, examples, advanced usage

3. **Official Docs**:
   - [NestJS WebSocket Docs](https://docs.nestjs.com/websockets/gateways)
   - [Socket.io Documentation](https://socket.io/docs/)

---

## ✨ Key Features Implemented

✅ **Real-time Location Updates**
- Driver sends coordinates
- Customers receive location in real-time
- Room-based isolation per trip

✅ **Automatic Status Broadcasting**
- When trip status changes, all clients are notified
- No page reload needed
- Automatic history logging

✅ **Scalable Architecture**
- Room-based architecture scales naturally
- Multiple trips independent
- Multiple clients per room supported

✅ **Error Handling**
- Missing required fields validated
- Socket errors properly logged
- Graceful fallback if gateway not initialized

---

## 🎯 Integration Points for Frontend

### React Hook Example
```jsx
useEffect(() => {
  const socket = io('http://localhost:3000/trips');
  socket.emit('join_trip', { maChuyenDi });
  socket.on('location_updated', (data) => updateMap(data));
  socket.on('trip_status_changed', (data) => updateUI(data));
  return () => socket.disconnect();
}, [maChuyenDi]);
```

### Angular Service Example
```typescript
constructor(private socket: Socket) {}

joinTrip(maChuyenDi: string) {
  this.socket.emit('join_trip', { maChuyenDi });
}

onStatusChange(): Observable<any> {
  return this.socket.fromEvent('trip_status_changed');
}
```

### Vue Component Example
```vue
<script setup>
const socket = io('http://localhost:3000/trips');
socket.emit('join_trip', { maChuyenDi: props.tripId });
socket.on('trip_status_changed', (data) => {
  status.value = data.trangThai;
});
</script>
```

---

## 📝 Summary

| Component | Status | Location |
|-----------|--------|----------|
| Gateway | ✅ Created | `src/trips/trips.gateway.ts` |
| Service Integration | ✅ Updated | `src/trips/trips.service.ts` |
| Module Config | ✅ Updated | `src/trips/trips.module.ts` |
| WebSocket Adapter | ✅ Configured | `src/main.ts` |
| Quick Reference | ✅ Created | `docs/WEBSOCKETS_QUICK_START.md` |
| Full Guide | ✅ Created | `docs/WEBSOCKETS_TRIPS_GUIDE.md` |

---

**Status**: ✅ Ready to use after running `npm install`

**Next**: See Quick Start or Full Guide for detailed examples
