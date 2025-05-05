export type MessageStatus = 'pending' | 'complete' | 'error';
export interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  status?: MessageStatus;
  reportId?: string;
} 