// packages/shared-kernel/src/domain/entity.base.ts
// Base class cho mọi Entity trong hệ thống AEOS.
// Entity có identity (id) và lifecycle (createdAt, updatedAt).

export abstract class Entity<TId extends string = string> {
  private readonly _id: TId;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(id: TId, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = updatedAt ?? new Date();
  }

  get id(): TId {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /** So sánh identity — hai Entity bằng nhau nếu cùng id */
  equals(other?: Entity<TId>): boolean {
    if (!other) return false;
    if (this === other) return true;
    return this._id === other._id;
  }

  /** Cập nhật timestamp khi Entity thay đổi */
  protected touch(): void {
    this._updatedAt = new Date();
  }
}
