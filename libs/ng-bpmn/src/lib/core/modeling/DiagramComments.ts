export interface DiagramComment {
  author: string;
  text: string;
}

export interface DiagramComments {
  getComments(element: unknown): DiagramComment[];
  addComment(element: unknown, comment: DiagramComment): void;
  removeComment(element: unknown, comment: DiagramComment): void;
  collapseAll(): void;
  events: {
    ADDED: string;
    REMOVED: string;
    UPDATED: string;
    TOGGLED: string;
  };
}
