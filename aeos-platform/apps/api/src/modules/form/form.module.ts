import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { FORM_REPOSITORY } from './domain/repositories/form.repository';
import { PrismaFormRepository } from './infrastructure/persistence/prisma-form.repository';
import { CreateFormHandler } from './application/commands/create-form/create-form.handler';
import { SubmitFormHandler } from './application/commands/submit-form/submit-form.handler';
import { FormController } from './presentation/controllers/form.controller';

@Module({
  controllers: [FormController],
  providers: [
    PrismaService,
    { provide: FORM_REPOSITORY, useClass: PrismaFormRepository },
    CreateFormHandler,
    SubmitFormHandler,
  ],
  exports: [FORM_REPOSITORY],
})
export class FormModule {}
