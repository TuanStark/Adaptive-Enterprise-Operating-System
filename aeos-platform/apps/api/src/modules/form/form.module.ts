import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventsModule } from '../../common/events/events.module';
import { PrismaService } from '@aeos/database';
import { FORM_REPOSITORY } from './domain/repositories/form.repository';
import { PrismaFormRepository } from './infrastructure/persistence/prisma-form.repository';
import { CreateFormHandler } from './application/commands/create-form/create-form.handler';
import { SubmitFormHandler } from './application/commands/submit-form/submit-form.handler';
import { FormController } from './presentation/controllers/form.controller';
import { GetFormAnalyticsInternalHandler } from './application/queries/get-form-analytics-internal/get-form-analytics-internal.handler';

@Module({
  imports: [CqrsModule, EventsModule],
  controllers: [FormController],
  providers: [
    PrismaService,
    { provide: FORM_REPOSITORY, useClass: PrismaFormRepository },
    CreateFormHandler,
    SubmitFormHandler,
    GetFormAnalyticsInternalHandler,
  ],
  exports: [FORM_REPOSITORY],
})
export class FormModule {}
