import { Injectable } from '@nestjs/common';
import { HttpClientService } from '../httpclient/httpclient.service';
import { ChatMessage } from './api/ChatMessage';

@Injectable()
export class ChatService {
  constructor(private readonly httpClient: HttpClientService) {}

  async query(messages: ChatMessage[]): Promise<string> {
    // Implement stronger input validation and context management
    const validatedMessages = this.validateAndFilterMessages(messages);
    const response = await this.httpClient.post('/chatbot/query', validatedMessages);
    return this.processResponse(response);
  }

  private validateAndFilterMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.map(message => ({
      role: message.role,
      content: this.filterContent(message.content)
    }));
  }

  private filterContent(content: string): string {
    // Implement stronger filtering logic
    // Remove potentially harmful content and ensure context is maintained
    const forbiddenKeywords = ['napalm', 'explosive', 'weapon'];
    let filteredContent = content;
    forbiddenKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      filteredContent = filteredContent.replace(regex, '[REDACTED]');
    });
    return filteredContent;
  }

  private processResponse(response: any): string {
    // Process the response to ensure no sensitive information is leaked
    // This can include additional checks or transformations
    return response.data;
  }
}