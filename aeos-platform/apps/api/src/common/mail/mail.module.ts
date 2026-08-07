import { Module, Global } from '@nestjs/common';
import { MAIL_SERVICE } from './application/ports/mail.service.interface';
import { NodemailerService } from './infrastructure/adapters/nodemailer.service';

@Global()
@Module({
  providers: [
    {
      provide: MAIL_SERVICE,
      useClass: NodemailerService,
    },
  ],
  exports: [MAIL_SERVICE],
})
export class MailModule {}
