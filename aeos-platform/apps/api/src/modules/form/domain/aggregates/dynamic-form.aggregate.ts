import { AggregateRoot } from '@aeos/shared-kernel';
import { Result } from '@aeos/errors';
import { generateId } from '@aeos/common';
import { InvalidFormSchemaError } from '../errors/form.errors';
import { FormSubmission } from '../entities/form-submission.entity';
import { FormCreatedEvent, FormDeletedEvent } from '../events/form.events';

export interface DynamicFormProps {
  id: string;
  tenantId: string;
  workspaceId: string;
  name: string;
  description: string | null;
  schema: Record<string, any>; // Represents JSON Schema
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  submissions: FormSubmission[];
}

export class DynamicForm extends AggregateRoot<string> {
  private _tenantId: string;
  private _workspaceId: string;
  private _name: string;
  private _description: string | null;
  private _schema: Record<string, any>;
  private _isActive: boolean;
  private _submissions: FormSubmission[];

  private constructor(props: DynamicFormProps) {
    super(props.id, 1, props.createdAt, props.updatedAt);
    this._tenantId = props.tenantId;
    this._workspaceId = props.workspaceId;
    this._name = props.name;
    this._description = props.description;
    this._schema = props.schema;
    this._isActive = props.isActive;
    this._submissions = props.submissions;
  }

  get tenantId(): string { return this._tenantId; }
  get workspaceId(): string { return this._workspaceId; }
  get name(): string { return this._name; }
  get description(): string | null { return this._description; }
  get schema(): Record<string, any> { return this._schema; }
  get isActive(): boolean { return this._isActive; }
  get submissions(): ReadonlyArray<FormSubmission> { return this._submissions; }

  static create(
    tenantId: string, workspaceId: string, name: string,
    description: string | null, schema: Record<string, any>
  ): Result<DynamicForm, InvalidFormSchemaError> {
    if (!schema || typeof schema !== 'object') {
      return Result.fail(new InvalidFormSchemaError());
    }

    const form = new DynamicForm({
      id: generateId(), tenantId, workspaceId, name, description, schema,
      isActive: true, createdAt: new Date(), updatedAt: new Date(), submissions: [],
    });
    form.addDomainEvent(new FormCreatedEvent(form.id, form.workspaceId));
    return Result.ok(form);
  }

  static fromPersistence(props: DynamicFormProps): DynamicForm {
    return new DynamicForm(props);
  }

  updateSchema(newSchema: Record<string, any>): Result<void, InvalidFormSchemaError> {
    if (!newSchema || typeof newSchema !== 'object') {
      return Result.fail(new InvalidFormSchemaError());
    }
    this._schema = newSchema;
    this.touch();
    return Result.ok(undefined);
  }

  toggleActive(isActive: boolean): void {
    this._isActive = isActive;
    this.touch();
  }

  submit(submitterId: string, data: Record<string, any>): void {
    // Basic validation logic could go here based on this._schema
    this._submissions.push(FormSubmission.create(this.id, submitterId, data));
    this.touch();
  }
}
