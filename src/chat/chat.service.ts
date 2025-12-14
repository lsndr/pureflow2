import { Injectable } from '@nestjs/common';
import { HttpClientService } from '../httpclient/httpclient.service';
import { ChatMessage } from './api/ChatMessage';

@Injectable()
export class ChatService {
  constructor(private readonly httpClient: HttpClientService) {}

  async query(messages: ChatMessage[]): Promise<string> {
    // Ensure messages are properly formatted and safe
    const formattedMessages = messages.map(message => ({
      role: message.role,
      content: this.formatMessageContent(message.content)
    }));
    return this.httpClient.post('/chat/query', { messages: formattedMessages });
  }

  private formatMessageContent(content: string): string {
    // Further sanitize and format content if necessary
    return content.replace(/\s+/g, ' ').trim();
  }
}