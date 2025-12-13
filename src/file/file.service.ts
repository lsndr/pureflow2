import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Readable, Stream } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { CloudProvidersMetaData } from './cloud.providers.metadata';
import { R_OK } from 'constants';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private cloudProviders = new CloudProvidersMetaData();

  async getFile(file: string): Promise<Stream> {
    this.logger.log(`Reading file: ${file}`);

    if (file.startsWith('/')) {
      await fs.promises.access(file, R_OK);

      return fs.createReadStream(file);
    } else if (file.startsWith('http')) {
      if (!this.isValidUrl(file)) {
        throw new BadRequestException('Invalid URL');
      }
      const content = await this.cloudProviders.get(file);

      if (content) {
        return Readable.from(content);
      } else {
        throw new Error(`no such file or directory, access '${file}'`);
      }
    } else {
      file = path.resolve(process.cwd(), file);

      await fs.promises.access(file, R_OK);

      return fs.createReadStream(file);
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      // Allow only specific protocols and hostnames
      const allowedProtocols = ['http:', 'https:'];
      const allowedHostnames = ['example.com', 'another-allowed-domain.com'];
      return allowedProtocols.includes(parsedUrl.protocol) &&
             allowedHostnames.includes(parsedUrl.hostname);
    } catch (err) {
      return false;
    }
  }

  async deleteFile(file: string): Promise<boolean> {
    if (file.includes('..')) {
      throw new Error('Invalid file path');
    }
    if (file.startsWith('/')) {
      throw new Error('cannot delete file from this location');
    } else if (file.startsWith('http')) {
      throw new Error('cannot delete file from this location');
    } else {
      file = path.resolve(process.cwd(), file);
      await fs.promises.unlink(file);
      return true;
    }
  }
}