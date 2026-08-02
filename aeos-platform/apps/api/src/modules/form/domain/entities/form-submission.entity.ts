import { Entity } from '@aeos/shared-kernel';
import { generateId } from '@aeos/common';

export interface FormSubmissionProps {
  id: string;
  formId: string;
  submitterId: string;
  data: Record<string, any>;
  createdAt: Date;
}

export class FormSubmission extends Entity<string> {
  private _formId: string;
  private _submitterId: string;
  private _data: Record<string, any>;

  private constructor(props: FormSubmissionProps) {
    super(props.id, props.createdAt);
    this._formId = props.formId;
    this._submitterId = props.submitterId;
    this._data = props.data;
  }

  get formId(): string { return this._formId; }
  get submitterId(): string { return this._submitterId; }
  get data(): Record<string, any> { return this._data; }

  static create(formId: string, submitterId: string, data: Record<string, any>): FormSubmission {
    return new FormSubmission({
      id: generateId(), formId, submitterId, data, createdAt: new Date(),
    });
  }

  static fromPersistence(props: FormSubmissionProps): FormSubmission {
    return new FormSubmission(props);
  }
}
