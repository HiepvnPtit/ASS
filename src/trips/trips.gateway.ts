import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { TripsService } from './trips.service';
import { SendMessageDto } from './dto/send-message.dto';

export interface JoinTripPayload {
  maChuyenDi: string;
}

export interface UpdateLocationPayload {
  maChuyenDi: string;
  viDo: number;
  kinhDo: number;
}

export interface TripStatusChangedPayload {
  maChuyenDi: string;
  trangThai: string;
  timestamp: Date;
  [key: string]: any;
}

/**
 * Trips WebSocket Gateway
 *
 * Handles real-time communication for trip operations:
 * - Client joining a trip room
 * - Driver location updates
 * - Trip status changes
 * - Real-time chat messaging
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  },
  namespace: '/trips',
})
export class TripsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(TripsGateway.name);

  constructor(
    @Inject(forwardRef(() => TripsService))
    private readonly tripsService: TripsService,
  ) {}
  private server!: Server;

  /**
   * Initialize WebSocket server
   */
  afterInit(server: Server) {
    this.server = server;
    this.logger.log('WebSocket Gateway initialized');
  }

  /**
   * Handle client connection
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Join Trip Room
   *
   * Client sends 'join_trip' event with maChuyenDi
   * Gateway adds client to room and broadcasts notification
   *
   * @param payload Contains maChuyenDi
   * @param client Socket client
   */
  @SubscribeMessage('join_trip')
  handleJoinTrip(
    @MessageBody() payload: JoinTripPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    const { maChuyenDi } = payload;

    if (!maChuyenDi) {
      client.emit('error', { message: 'maChuyenDi is required' });
      return;
    }

    const roomName = `trip_${maChuyenDi}`;
    void client.join(roomName);

    this.logger.log(`Client ${client.id} joined room: ${roomName}`);

    // Notify others in the room that a new client joined
    this.server.to(roomName).emit('client_joined', {
      clientId: client.id,
      maChuyenDi,
      timestamp: new Date(),
    });
  }

  /**
   * Update Driver Location
   *
   * Driver sends 'update_location' event with maChuyenDi and coordinates
   * Gateway broadcasts location update to all clients in the trip room
   *
   * @param payload Contains maChuyenDi, viDo (latitude), kinhDo (longitude)
   * @param client Socket client (driver)
   */
  @SubscribeMessage('update_location')
  handleUpdateLocation(
    @MessageBody() payload: UpdateLocationPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    const { maChuyenDi, viDo, kinhDo } = payload;

    if (!maChuyenDi || viDo === undefined || kinhDo === undefined) {
      client.emit('error', {
        message: 'maChuyenDi, viDo, and kinhDo are required',
      });
      return;
    }

    const roomName = `trip_${maChuyenDi}`;

    this.logger.debug(
      `Location update for trip ${maChuyenDi}: viDo=${viDo}, kinhDo=${kinhDo}`,
    );

    // Broadcast location update to all clients in the room
    this.server.to(roomName).emit('location_updated', {
      maChuyenDi,
      viDo,
      kinhDo,
      driverId: client.id,
      timestamp: new Date(),
    });
  }

  /**
   * Leave Trip Room
   *
   * Client sends 'leave_trip' event to leave the room
   *
   * @param payload Contains maChuyenDi
   * @param client Socket client
   */
  @SubscribeMessage('leave_trip')
  handleLeaveTrip(
    @MessageBody() payload: JoinTripPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    const { maChuyenDi } = payload;

    if (!maChuyenDi) {
      client.emit('error', { message: 'maChuyenDi is required' });
      return;
    }

    const roomName = `trip_${maChuyenDi}`;
    void client.leave(roomName);

    this.logger.log(`Client ${client.id} left room: ${roomName}`);

    // Notify others in the room
    this.server.to(roomName).emit('client_left', {
      clientId: client.id,
      maChuyenDi,
      timestamp: new Date(),
    });
  }

  /**
   * Emit Trip Status Changed Event
   *
   * Called from TripsService when trip status changes
   * Broadcasts status change to all clients in the trip room
   *
   * @param maChuyenDi Trip ID
   * @param statusData Trip status change data
   */
  emitTripStatusChanged(
    maChuyenDi: string,
    statusData: TripStatusChangedPayload,
  ): void {
    const roomName = `trip_${maChuyenDi}`;

    this.logger.log(
      `Broadcasting trip status change for ${maChuyenDi}: ${statusData.trangThai}`,
    );

    this.server.to(roomName).emit('trip_status_changed', {
      ...statusData,
      timestamp: new Date(),
    });
  }

  /**
   * Emit Driver Arrived Event
   *
   * Called when driver arrives at pickup/dropoff location
   *
   * @param maChuyenDi Trip ID
   * @param locationType 'pickup' | 'dropoff'
   */
  emitDriverArrived(
    maChuyenDi: string,
    locationType: 'pickup' | 'dropoff',
  ): void {
    const roomName = `trip_${maChuyenDi}`;

    this.logger.log(`Driver arrived at ${locationType} for trip ${maChuyenDi}`);

    this.server.to(roomName).emit('driver_arrived', {
      maChuyenDi,
      locationType,
      timestamp: new Date(),
    });
  }

  /**
   * Notify Specific Drivers
   *
   * Public method called from TripsService to emit events to specific drivers
   * without exposing private 'server' property
   *
   * @param driverId Driver ID or room name (e.g., maTaiXe)
   * @param eventName Event name to emit
   * @param data Event payload
   */
  notifyDrivers(driverId: string, eventName: string, data: any): void {
    try {
      this.server.to(driverId).emit(eventName, data);
      this.logger.debug(`Emitted '${eventName}' event to driver ${driverId}`);
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error notifying driver ${driverId}:`, errorMsg);
    }
  }

  /**
   * Handle Send Message Event
   *
   * Client sends 'send_message' event with message payload
   * Gateway saves message to database and broadcasts to all clients in trip room
   *
   * @param payload SendMessageDto containing maChuyenDi, noiDung, loaiTinNhan, mediaUrl
   * @param client Socket client (message sender)
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() payload: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const { maChuyenDi, noiDung, loaiTinNhan, mediaUrl } = payload;

      // Validate required fields
      if (!maChuyenDi || !noiDung) {
        client.emit('error', {
          message: 'maChuyenDi and noiDung are required',
        });
        return;
      }

      // Extract user ID from socket handshake auth (set during connection)
      const nguoiGuiId = (client.handshake as any).auth?.userId;
      if (!nguoiGuiId) {
        client.emit('error', {
          message: 'User authentication required to send message',
        });
        return;
      }

      // Save message to database
      const savedMessage = await this.tripsService.saveMessage(
        maChuyenDi,
        nguoiGuiId,
        noiDung,
        loaiTinNhan || 'text',
        mediaUrl,
      );

      this.logger.log(
        `Message saved for trip ${maChuyenDi} from user ${nguoiGuiId}`,
      );

      // Broadcast new message to all clients in the trip room
      this.emitNewMessage(maChuyenDi, savedMessage);
    } catch (error) {
      this.logger.error('Error handling send_message:', error);
      client.emit('error', {
        message: 'Failed to send message',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Emit New Message Event
   *
   * Broadcasts new chat message to all clients in the trip room
   *
   * @param maChuyenDi Trip ID
   * @param message TinNhan entity with message data
   */
  emitNewMessage(maChuyenDi: string, message: any): void {
    const roomName = `trip_${maChuyenDi}`;

    this.logger.debug(
      `Broadcasting new message for trip ${maChuyenDi}: ${message.noiDung.substring(0, 50)}...`,
    );

    this.server.to(roomName).emit('new_message', {
      id: message.id,
      maChuyenDi: message.maChuyenDi,
      nguoiGuiId: message.nguoiGuiId,
      noiDung: message.noiDung,
      loaiTinNhan: message.loaiTinNhan,
      mediaUrl: message.mediaUrl,
      thoiGianGui: message.thoiGianGui,
      daDoc: message.daDoc,
      timestamp: new Date(),
    });
  }

  /**
   * Get connected clients count in a room
   *
   * @param maChuyenDi Trip ID
   * @returns Number of connected clients in the room
   */
  getConnectedClientsCount(maChuyenDi: string): number {
    const roomName = `trip_${maChuyenDi}`;
    const room = this.server.sockets.adapter.rooms.get(roomName);
    return room ? room.size : 0;
  }
}
