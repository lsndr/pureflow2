import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { API_DESC_CHAT_QUESTION } from './chat.controller.api.desc';
import { ChatMessage } from './api/ChatMessage';

@Controller('/api/chat')
@ApiTags('Chat controller')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/query')
  @ApiOperation({ description: API_DESC_CHAT_QUESTION })
  @ApiBody({
    description: 'A list of messages comprising the conversation so far',
    type: [ChatMessage]
  })
  @ApiOkResponse({
    description: 'Chatbot answer',
    type: String
  })
  async query(@Body() messages: ChatMessage[]): Promise<string> {
    try {
      // Validate and sanitize input messages
      const sanitizedMessages = messages.map(message => ({
        role: message.role,
        content: this.sanitizeInput(message.content)
      }));
      return await this.chatService.query(sanitizedMessages);
    } catch (err) {
      throw new HttpException(
        `Chat API response error: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Enhanced sanitization function to prevent prompt injection
  private sanitizeInput(input: string): string {
    // Remove potentially harmful content and limit input length
    const sanitized = input.replace(/[^\w\s.,!?]/g, '');
    return sanitized.length > 200 ? sanitized.substring(0, 200) : sanitized;
  }
}