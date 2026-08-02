import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { DynamicForm } from '../../../domain/aggregates/dynamic-form.aggregate';
import { FormRepository, FORM_REPOSITORY } from '../../../domain/repositories/form.repository';
import { CreateFormCommand } from './create-form.command';

export class CreateFormHandler {
  constructor(
    @Inject(FORM_REPOSITORY)
    private readonly formRepository: FormRepository,
  ) {}

  async execute(command: CreateFormCommand): Promise<Result<string, DomainError>> {
    const createResult = DynamicForm.create(
      command.tenantId, command.workspaceId, command.name, command.description ?? null, command.schema,
    );
    if (createResult.isFail) return Result.fail(createResult.error);

    const form = createResult.value;
    await this.formRepository.save(form);
    return Result.ok(form.id);
  }
}
