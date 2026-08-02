export class ChangeProjectStatusCommand {
  constructor(
    public readonly projectId: string,
    public readonly action: 'activate' | 'complete' | 'archive',
  ) {}
}
