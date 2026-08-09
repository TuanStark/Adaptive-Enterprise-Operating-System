export class PublishDocumentVersionCommand {
  constructor(
    public readonly documentId: string,
    public readonly fileId: string,
  ) {}
}
