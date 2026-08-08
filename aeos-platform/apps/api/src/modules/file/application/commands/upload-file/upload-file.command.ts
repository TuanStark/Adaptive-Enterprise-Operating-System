export class UploadFileCommand {
  constructor(
    public readonly tenantId: string,
    public readonly uploadedBy: string,
    public readonly buffer: Buffer,
    public readonly fileName: string,
    public readonly mimeType: string,
    public readonly size: number,
  ) {}
}
