export interface Citation {
  uri: string;
  title: string;
}

export interface ChatPart {
  type: 'text' | 'image' | 'citation';
  content: string; // for text and image (data URL)
  citations: Citation[]; // for citation type
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: ChatPart[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export interface ChatHistory {
  [id: string]: ChatSession;
}
