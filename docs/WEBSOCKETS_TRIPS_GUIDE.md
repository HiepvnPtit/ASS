# WebSocket Integration Guide - Trips Real-time

This guide explains how to use the WebSocket (Socket.io) integration for real-time trip updates.

## Installation

The WebSocket libraries have been added to your project:

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install --save-dev @types/socket.io
```

## Architecture

### Gateway: TripsGateway (`src/trips/trips.gateway.ts`)

- **Namespace**: `/trips`
- **CORS**: Enabled for all origins
- **Features**:
  - Join Trip Room
  - Update Driver Location
  - Emit Trip Status Changes
  - Leave Trip Room

### Service Integration

`TripsService` is integrated with `TripsGateway`:
- When trip status is updated via `updateTripStatus()`, the gateway broadcasts `trip_status_changed` event to all clients in the trip room.
- Optional gateway injection allows graceful fallback if WebSocket is not initialized.

## Client-Side Usage

### Socket.io Setup

```javascript
import { io } from 'socket.io-client';

// Connect to the trips namespace
const socket = io('http://localhost:3000/trips', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

socket.on('connect', () => {
  console.log('Connected to trips gateway');
});

socket.on('disconnect', () => {
  console.log('Disconnected from trips gateway');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

### 1. Join Trip Room

**Event**: `join_trip`

**Payload**:
```javascript
{
  maChuyenDi: "cd_12345"  // Trip ID
}
```

**Usage**:
```javascript
socket.emit('join_trip', { maChuyenDi: 'cd_12345' });
```

**Response Events**:
- `client_joined`: Broadcast when a client joins the room
  ```javascript
  {
    clientId: "socket-id",
    maChuyenDi: "cd_12345",
    timestamp: "2024-05-25T10:30:00Z"
  }
  ```

---

### 2. Update Driver Location

**Event**: `update_location`

**Payload**:
```javascript
{
  maChuyenDi: "cd_12345",    // Trip ID
  viDo: 10.7769,             // Latitude
  kinhDo: 106.7009           // Longitude
}
```

**Usage**:
```javascript
socket.emit('update_location', {
  maChuyenDi: 'cd_12345',
  viDo: 10.7769,
  kinhDo: 106.7009
});
```

**Response Events**:
- `location_updated`: Broadcast to all clients in the room
  ```javascript
  {
    maChuyenDi: "cd_12345",
    viDo: 10.7769,
    kinhDo: 106.7009,
    driverId: "socket-id",
    timestamp: "2024-05-25T10:31:00Z"
  }
  ```

---

### 3. Listen to Trip Status Changes

**Event**: `trip_status_changed`

**Payload** (automatically emitted when driver updates trip status via API):
```javascript
{
  maChuyenDi: "cd_12345",
  trangThai: "STARTED",           // Current status
  trangThaiCu: "ACCEPTED",        // Previous status
  thoiGianBatDau: "2024-05-25T10:30:00Z",
  thoiGianKetThuc: null,
  timestamp: "2024-05-25T10:31:00Z"
}
```

**Usage**:
```javascript
socket.on('trip_status_changed', (data) => {
  console.log('Trip status changed:', data);
  // Update UI based on new status
});
```

---

### 4. Leave Trip Room

**Event**: `leave_trip`

**Payload**:
```javascript
{
  maChuyenDi: "cd_12345"  // Trip ID
}
```

**Usage**:
```javascript
socket.emit('leave_trip', { maChuyenDi: 'cd_12345' });
```

**Response Events**:
- `client_left`: Broadcast when a client leaves the room
  ```javascript
  {
    clientId: "socket-id",
    maChuyenDi: "cd_12345",
    timestamp: "2024-05-25T10:32:00Z"
  }
  ```

---

## Trip Status Flow

Valid status transitions:
```
PENDING → ACCEPTED → ARRIVED → STARTED → COMPLETED
```

Each status change is:
1. Saved to database via `LichSuTrangThai` (history)
2. Broadcast via WebSocket to all connected clients in the trip room

---

## Example: Complete Real-time Trip Tracking

```javascript
import { io } from 'socket.io-client';

class TripTracker {
  constructor(tripId) {
    this.tripId = tripId;
    this.socket = io('http://localhost:3000/trips');
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => this.onConnect());
    this.socket.on('disconnect', () => this.onDisconnect());
    this.socket.on('error', (err) => this.onError(err));
    
    // Trip-specific events
    this.socket.on('client_joined', (data) => this.onClientJoined(data));
    this.socket.on('location_updated', (data) => this.onLocationUpdated(data));
    this.socket.on('trip_status_changed', (data) => this.onStatusChanged(data));
    this.socket.on('client_left', (data) => this.onClientLeft(data));
  }

  joinTrip() {
    this.socket.emit('join_trip', { maChuyenDi: this.tripId });
  }

  leaveTrip() {
    this.socket.emit('leave_trip', { maChuyenDi: this.tripId });
  }

  updateLocation(viDo, kinhDo) {
    this.socket.emit('update_location', {
      maChuyenDi: this.tripId,
      viDo,
      kinhDo,
    });
  }

  onConnect() {
    console.log('Connected to trip gateway');
    this.joinTrip();
  }

  onDisconnect() {
    console.log('Disconnected from trip gateway');
  }

  onError(err) {
    console.error('Socket error:', err);
  }

  onClientJoined(data) {
    console.log(`Client ${data.clientId} joined trip ${data.maChuyenDi}`);
  }

  onLocationUpdated(data) {
    console.log(`Driver location: ${data.viDo}, ${data.kinhDo}`);
    // Update map marker
    updateMapMarker({
      lat: data.viDo,
      lng: data.kinhDo,
    });
  }

  onStatusChanged(data) {
    console.log(`Trip status changed: ${data.trangThaiCu} → ${data.trangThai}`);
    // Update UI status indicator
    updateStatusIndicator(data.trangThai);
  }

  onClientLeft(data) {
    console.log(`Client ${data.clientId} left trip ${data.maChuyenDi}`);
  }

  disconnect() {
    this.leaveTrip();
    this.socket.disconnect();
  }
}

// Usage
const tracker = new TripTracker('cd_12345');
tracker.joinTrip();

// Simulate driver location updates (every 5 seconds)
setInterval(() => {
  const lat = 10.7769 + Math.random() * 0.001;
  const lng = 106.7009 + Math.random() * 0.001;
  tracker.updateLocation(lat, lng);
}, 5000);

// Clean up when done
// tracker.disconnect();
```

---

## React Example

```jsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function TripMap({ tripId }) {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('PENDING');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket
    const newSocket = io('http://localhost:3000/trips', {
      reconnection: true,
    });

    newSocket.on('connect', () => {
      newSocket.emit('join_trip', { maChuyenDi: tripId });
    });

    newSocket.on('location_updated', (data) => {
      setLocation({ lat: data.viDo, lng: data.kinhDo });
    });

    newSocket.on('trip_status_changed', (data) => {
      setStatus(data.trangThai);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave_trip', { maChuyenDi: tripId });
      newSocket.disconnect();
    };
  }, [tripId]);

  return (
    <div>
      <div className="status-badge">{status}</div>
      {location && (
        <div className="map">
          <p>Driver Location: {location.lat}, {location.lng}</p>
        </div>
      )}
    </div>
  );
}

export default TripMap;
```

---

## Important Notes

1. **Gateway Initialization**: The gateway is automatically initialized in `TripsModule` and available on `/trips` namespace.

2. **Optional Integration**: The `TripsGateway` is injected as `@Optional()` in `TripsService`, so the service works even if WebSocket is not initialized (useful for non-real-time scenarios).

3. **CORS Enabled**: WebSocket CORS is enabled for all origins. For production, update `trips.gateway.ts`:
   ```typescript
   @WebSocketGateway({
     cors: {
       origin: ['https://yourdomain.com'],
       methods: ['GET', 'POST'],
       credentials: true,
     },
   })
   ```

4. **Error Handling**: Always listen to `error` events on the client side for graceful error handling.

5. **Room Management**: Each trip has its own room named `trip_${maChuyenDi}`. Multiple clients can join the same room.

---

## Troubleshooting

### Connection Issues

- Check if `@nestjs/websockets` and `@nestjs/platform-socket.io` are installed
- Ensure `IoAdapter` is configured in `main.ts`
- Check browser console for connection errors

### Events Not Received

- Verify client is in the correct room by emitting `join_trip` first
- Check network tab in browser DevTools for WebSocket connection
- Ensure event names match exactly (case-sensitive)

### Client Disconnect

- Implement auto-reconnect logic on client side
- Use socket's built-in `reconnection` option
- Listen to `disconnect` event for cleanup

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Create `TripsGateway`
3. ✅ Integrate with `TripsService`
4. ✅ Enable WebSocket in `main.ts`
5. Test real-time updates with a client application
6. Implement custom events as needed
7. Add authentication to WebSocket connections (optional)

---

## Resources

- [NestJS WebSocket Documentation](https://docs.nestjs.com/websockets/gateways)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)
