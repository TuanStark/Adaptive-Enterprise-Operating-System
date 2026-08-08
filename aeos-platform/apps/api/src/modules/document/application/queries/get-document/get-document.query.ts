export class GetDocumentQuery {
  constructor(
    public readonly documentId: string,
    public readonly workspaceId: string,
  ) {}
}
