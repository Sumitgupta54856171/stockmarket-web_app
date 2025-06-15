declare global {
  namespace JSX {
    interface IntrinsicElements {
      'df-messenger': {
        location?: string;
        'project-id'?: string;
        'agent-id'?: string;
        'language-code'?: string;
        'max-query-length'?: string;
        children?: React.ReactNode;
      };
      'df-messenger-chat-bubble': {
        'chat-title'?: string;
      };
    }
  }
}

export {};