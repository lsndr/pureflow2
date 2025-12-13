import { Injectable, Logger } from '@nestjs/common';
import { Readable, Stream } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import { CloudProvidersMetaData } from './cloud.providers.metadata';
import { R_OK } from 'constants';
import axios from 'axios';
import { URL } from 'url';

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
      // Validate URL against allowed domains
      const allowedDomains = [
        CloudProvidersMetaData.GOOGLE,
        CloudProvidersMetaData.AWS,
        CloudProvidersMetaData.AZURE,
        CloudProvidersMetaData.DIGITAL_OCEAN
      ];

      try {
        const url = new URL(file);
        const isValidDomain = allowedDomains.some(domain => url.hostname.endsWith(domain));

        if (!isValidDomain) {
          throw new Error('Access to the specified URL is not allowed');
        }

        // Additional check to ensure the URL path is valid
        if (!url.pathname || url.pathname === '/') {
          throw new Error('Invalid URL path');
        }
      } catch (err) {
        throw new Error('Invalid URL');
      }

      // Fetch content using axios
      const response = await axios.get(file, { responseType: 'arraybuffer' });
      const content = response.data;

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

  async deleteFile(file: string): Promise<boolean> {
    if (file.includes('..') || path.isAbsolute(file)) {
      throw new Error('Invalid file path');
    }
    if (file.startsWith('http')) {
      throw new Error('cannot delete file from this location');
    } else {
      file = path.resolve(process.cwd(), file);
      await fs.promises.unlink(file);
      return true;
    }
  }
}