import { NestFactory } from '@nestjs/core';
import { AppModule } from './apps/api/src/app.module';
import { ReactToMessageHandler, ReactToMessageCommand } from './apps/api/src/modules/message/application/commands/react-to-message/react-to-message.handler';
import { PrismaService } from '@aeos/database';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const reactHandler = app.get(ReactToMessageHandler);
  const prisma = app.get(PrismaService);

  const lastMessage = await prisma.chatMessage.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (!lastMessage) {
    console.log("No messages found");
    return;
  }

  console.log("Adding reaction to message:", lastMessage.id, "by user", lastMessage.senderId);

  const result = await reactHandler.execute(
    new ReactToMessageCommand(lastMessage.id, lastMessage.senderId, "🚀")
  );

  console.log("ReactHandler result:", result.isSuccess ? "SUCCESS" : "FAILED", result.error);

  const verify = await prisma.messageReaction.findMany({
    where: { messageId: lastMessage.id }
  });
  console.log("Verified DB Reactions:", verify);
  
  await app.close();
}

bootstrap().catch(console.error);
