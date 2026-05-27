import {
  Controller,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Logger,
  Query
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import {
  API_DESC_QUERY_PARTNERS_RAW,
  API_DESC_PARTNERS_LOGIN,
  API_DESC_SEARCH_PARTNERS_NAMES
} from './partners.controller.swagger.desc';
import { PartnersService } from './partners.service';

@Controller('/api/partners')
@ApiTags('Partners controller')
export class PartnersController {
  private readonly logger = new Logger(PartnersController.name);

  constructor(private readonly partnersService: PartnersService) {}

  /**
   * Escapes a value for safe embedding inside an XPath string literal.
   * - No single quotes  → wrap in single quotes: 'value'
   * - No double quotes  → wrap in double quotes: "value"
   * - Both quote types  → use concat() to avoid unescapable characters
   */
  private escapeXPathString(value: string): string {
    // Strip null bytes and ASCII control characters that can prematurely
    // terminate an XPath string literal and allow injection of XPath operators.
    const sanitized = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    if (!sanitized.includes("'")) {
      return `'${sanitized}'`;
    } else if (!sanitized.includes('"')) {
      return `"${sanitized}"`;
    } else {
      const parts = sanitized.split("'");
      const escapedParts = parts.map(part => `'${part}'`);
      return `concat(${escapedParts.join(`, "'", `)})``;
    }
  }

  // **** This is a general XPATH injection EP - Will accept anything ****
  @Get('query')
  @ApiQuery({
    name: 'xpath',
    type: 'string',
    example: '/partners/partner/name',
    required: true
  })
  @Header('content-type', 'text/xml')
  @ApiOperation({
    description: API_DESC_QUERY_PARTNERS_RAW
  })
  @ApiOkResponse({
    type: String
  })
  async queryPartnersRaw(@Query('xpath') xpath: string): Promise<string> {
    this.logger.debug(`Getting partners with xpath expression "${xpath}"`);

    try {
      return this.partnersService.getPartnersProperties(xpath);
    } catch (err) {
      throw new HttpException(
        `Failed to load XML using XPATH. Details: ${err}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // **** This is a boolean based XPATH injection EP ****
  @Get('partnerLogin')
  @ApiQuery({
    name: 'username',
    type: 'string',
    example: 'walter100',
    required: true
  })
  @ApiQuery({
    name: 'password',
    type: 'string',
    example: 'Heisenberg123',
    required: true
  })
  @Header('content-type', 'text/xml')
  @ApiOperation({
    description: API_DESC_PARTNERS_LOGIN
  })
  @ApiOkResponse({
    type: String
  })
  async partnerLogin(
    @Query('username') username: string,
    @Query('password') password: string
  ): Promise<string> {
    this.logger.debug(
      `Trying to login partner with username ${username} using password ${password}`
    );

    try {
      const safeUsername = this.escapeXPathString(username);
      const safePassword = this.escapeXPathString(password);
      const xpath = `//partners/partner[username/text()=${safeUsername} and password/text()=${safePassword}]/*`;
      const xmlStr = this.partnersService.getPartnersProperties(xpath);

      // Check if account's data contains any information - If not, the login failed!
      if (
        !(xmlStr && xmlStr.includes('password') && xmlStr.includes('wealth'))
      ) {
        throw new Error('Login attempt failed!');
      }

      return xmlStr;
    } catch (err) {
      const errStr = err.toString();
      const errorMessage = errStr.includes('Unterminated string literal')
        ? 'Error in XPath expression'
        : errStr;

      throw new HttpException(
        `Access denied to partner's account. ${errorMessage}`,
        HttpStatus.FORBIDDEN
      );
    }
  }

  // **** This is a string based XPATH injection EP ****
  @Get('searchPartners')
  @ApiQuery({
    name: 'keyword',
    type: 'string',
    example: 'Walter',
    required: true
  })
  @Header('content-type', 'text/xml')
  @ApiOperation({
    description: API_DESC_SEARCH_PARTNERS_NAMES
  })
  @ApiOkResponse({
    type: String
  })
  async searchPartners(@Query('keyword') keyword: string): Promise<string> {
    this.logger.debug(`Searching partner names by the keyword "${keyword}"`);

    try {
      const safeKeyword = this.escapeXPathString(keyword);
      const xpath = `//partners/partner/name[contains(., ${safeKeyword})]`;
      return this.partnersService.getPartnersProperties(xpath);
    } catch (err) {
      const errStr = err.toString();
      const errorMessage =
        errStr.includes('XPath parse error') ||
        errStr.includes('Unterminated string literal')
          ? 'Error in XPath expression'
          : errStr;

      throw new HttpException(
        `Couldn't find partners. ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}