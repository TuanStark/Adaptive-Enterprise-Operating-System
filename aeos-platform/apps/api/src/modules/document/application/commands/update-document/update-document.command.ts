export class UpdateDocumentCommand {
  constructor(
    public readonly documentId: string,
    public readonly name?: string,
    public readonly visibility?: string,
  ) {}
}
