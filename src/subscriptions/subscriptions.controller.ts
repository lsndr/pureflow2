import { Controller, Logger, Post, Query, BadRequestException } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { SWAGGER_DESC_CREATE_SUBSCRIPTION } from './subscriptions.controller.swagger.desc';

@Controller('/api/subscriptions')
@ApiTags('Subscriptions controller')
export class SubscriptionsController {
  private readonly logger = new Logger(SubscriptionsController.name);

  @Post()
  @ApiQuery({
    name: 'email',
    example: 'john.doe@example.com',
    required: true
  })
  @ApiOperation({
    description: SWAGGER_DESC_CREATE_SUBSCRIPTION
  })
  @ApiCreatedResponse({
    description: 'Returns subscribed email'
  })
  async subscribe(@Query('email') email: string): Promise<string> {
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email address');
    }
    this.logger.log(`Subscribed with email ${email}`);
    return email;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  }
}