import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { IdentityModule } from '../identity/identity.module';
import { CHANNEL_REPOSITORY } from './domain/repositories/channel.repository';
import { MESSAGE_REPOSITORY } from './domain/repositories/message.repository';
import { PrismaChannelRepository } from './infrastructure/persistence/prisma-channel.repository';
import { PrismaMessageRepository } from './infrastructure/persistence/prisma-message.repository';
import { CreateChannelHandler } from './application/commands/create-channel/create-channel.handler';
import { SendMessageHandler } from './application/commands/send-message/send-message.handler';
import { JoinChannelHandler } from './application/commands/join-channel/join-channel.handler';
import { ReactToMessageHandler } from './application/commands/react-to-message/react-to-message.handler';
import { GetOrCreateDirectChannelHandler } from './application/commands/get-or-create-dm/get-or-create-dm.handler';
import { ChannelController } from './presentation/controllers/channel.controller';
import { ChatGateway } from './presentation/gateways/chat.gateway';
import {
  WorkspaceArchivedEventHandler,
  WorkspaceMemberRemovedEventHandler,
} from './application/events/workspace-events.handler';

@Module({
  imports: [IdentityModule, CqrsModule],
  controllers: [ChannelController],
  providers: [
    PrismaService,
    { provide: CHANNEL_REPOSITORY, useClass: PrismaChannelRepository },
    { provide: MESSAGE_REPOSITORY, useClass: PrismaMessageRepository },
    CreateChannelHandler,
    SendMessageHandler,
    JoinChannelHandler,
    ReactToMessageHandler,
    GetOrCreateDirectChannelHandler,
    ChatGateway,
    WorkspaceArchivedEventHandler,
    WorkspaceMemberRemovedEventHandler,
  ],
  exports: [CHANNEL_REPOSITORY, MESSAGE_REPOSITORY],
})
export class MessageModule {}
