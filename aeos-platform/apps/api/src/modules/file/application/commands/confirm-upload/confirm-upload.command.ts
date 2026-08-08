export class ConfirmUploadCommand {
  constructor(
    public readonly tenantId: string,
    public readonly userId: string,
    public readonly storageKey: string,
    public readonly fileName: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly provider: string,
  ) {}
}
