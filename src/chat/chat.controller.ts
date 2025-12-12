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
      const sanitizedMessages = messages.map(message => this.sanitizeMessage(message));
      return await this.chatService.query(sanitizedMessages);
    } catch (err) {
      throw new HttpException(
        `Chat API response error: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private sanitizeMessage(message: ChatMessage): ChatMessage {
    // Basic sanitization logic to prevent prompt injection
    const sanitizedContent = message.content.replace(/\n/g, ' ').replace(/[^a-zA-Z0-9 .,!?]/g, '');
    return { ...message, content: sanitizedContent };
  }
}