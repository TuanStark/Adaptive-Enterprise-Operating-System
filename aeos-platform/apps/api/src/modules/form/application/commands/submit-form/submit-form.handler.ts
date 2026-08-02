import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { FormRepository, FORM_REPOSITORY } from '../../../domain/repositories/form.repository';
import { FormNotActiveError } from '../../../domain/errors/form.errors';

export class SubmitFormCommand {
  constructor(
    public readonly formId: string,
    public readonly submitterId: string,
    public readonly data: Record<string, any>,
  ) {}
}

export class SubmitFormHandler {
  constructor(
    @Inject(FORM_REPOSITORY)
    private readonly formRepository: FormRepository,
  ) {}

  async execute(command: SubmitFormCommand): Promise<Result<void, DomainError>> {
    const form = await this.formRepository.findById(command.formId);
    if (!form) return Result.fail(new NotFoundError('DynamicForm', command.formId));

    if (!form.isActive) {
      return Result.fail(new FormNotActiveError());
    }

    form.submit(command.submitterId, command.data);
    await this.formRepository.save(form);
    return Result.ok(undefined);
  }
}
