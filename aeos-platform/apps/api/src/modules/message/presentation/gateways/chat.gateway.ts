import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { SendMessageCommand } from '../../application/commands/send-message/send-message.command';
import { SendMessageHandler } from '../../application/commands/send-message/send-message.handler';

interface TypingPayload {
  channelId: string;
  userId: string;
  userName: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private connectedUsers = new Map<string, { socketId: string; userId: string }>();

  constructor(
    private readonly sendMessageHandler: SendMessageHandler,
  ) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(client.id, { socketId: client.id, userId });
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('channel:join')
  handleJoinChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    client.join(`channel:${data.channelId}`);
    return { event: 'channel:joined', data: { channelId: data.channelId } };
  }

  @SubscribeMessage('channel:leave')
  handleLeaveChannel(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string },
  ) {
    client.leave(`channel:${data.channelId}`);
    return { event: 'channel:left', data: { channelId: data.channelId } };
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; content: string; parentMessageId?: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return { event: 'error', data: { message: 'Not authenticated' } };

    // Simple UUID regex check to prevent DB cast errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.channelId)) {
      console.warn(`[ChatGateway] Invalid channelId format: ${data.channelId}`);
      return { event: 'error', data: { message: 'Invalid channel ID format' } };
    }

    const command = new SendMessageCommand(
      data.channelId,
      user.userId,
      data.content,
      data.parentMessageId ?? null,
    );

    const result = await this.sendMessageHandler.execute(command);
    if (result.isFail) {
      console.error(`[ChatGateway] Failed to send message: ${result.error}`);
      return { event: 'error', data: { message: String(result.error) } };
    }

    const messagePayload = {
      id: result.value,
      channelId: data.channelId,
      senderId: user.userId,
      content: data.content,
      parentMessageId: data.parentMessageId ?? null,
      isPinned: false,
      isEdited: false,
      reactions: [],
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
    };

    // Broadcast to all clients in the channel (including sender)
    this.server.to(`channel:${data.channelId}`).emit('message:received', messagePayload);

    return { event: 'message:sent', data: { id: result.value } };
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingPayload,
  ) {
    client.to(`channel:${data.channelId}`).emit('typing:update', {
      userId: data.userId,
      userName: data.userName,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingPayload,
  ) {
    client.to(`channel:${data.channelId}`).emit('typing:update', {
      userId: data.userId,
      userName: data.userName,
      isTyping: false,
    });
  }
}
