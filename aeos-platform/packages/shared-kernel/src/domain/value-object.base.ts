// packages/shared-kernel/src/domain/value-object.base.ts
// Value Object không có identity. Hai VO bằng nhau nếu cùng giá trị.
// Immutable — props được freeze khi khởi tạo.

export abstract class ValueObject<TProps> {
  protected readonly props: Readonly<TProps>;

  constructor(props: TProps) {
    this.props = Object.freeze(props);
  }

  equals(other?: ValueObject<TProps>): boolean {
    if (!other) return false;
    if (this === other) return true;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
