// packages/shared-kernel/src/domain/repository.interface.ts
// Repository Interface cơ bản — Domain Layer chỉ biết interface này.
// Infrastructure Layer (Prisma) sẽ implement.

import { AggregateRoot } from './aggregate-root.base';

export interface IRepository<TAggregate extends AggregateRoot<string>> {
  save(aggregate: TAggregate): Promise<void>;
  findById(id: string): Promise<TAggregate | null>;
  exists(id: string): Promise<boolean>;
}

/**
 * Tách Read Repository riêng (Interface Segregation - SOLID "I").
 * Query handlers chỉ cần inject IReadRepository, không cần quyền write.
 */
export interface IReadRepository<TResult> {
  findById(id: string): Promise<TResult | null>;
}
