import { DynamicForm } from '../aggregates/dynamic-form.aggregate';

export interface FormRepository {
  save(form: DynamicForm): Promise<void>;
  findById(id: string): Promise<DynamicForm | null>;
  findByWorkspaceId(
    workspaceId: string,
    page: number,
    limit: number,
  ): Promise<{ data: DynamicForm[]; total: number }>;
}

export const FORM_REPOSITORY = Symbol('FORM_REPOSITORY');
