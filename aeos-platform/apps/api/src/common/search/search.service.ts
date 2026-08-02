export interface SearchResult<T> {
  data: T[];
  total: number;
}

export interface SearchQuery {
  tenantId?: string;
  workspaceId?: string;
  query: string;
  page?: number;
  limit?: number;
}

export interface SearchService {
  index(indexName: string, id: string, document: any): Promise<void>;
  search(indexName: string, query: SearchQuery): Promise<SearchResult<any>>;
  remove(indexName: string, id: string): Promise<void>;
}

export const SEARCH_SERVICE = Symbol('SEARCH_SERVICE');
