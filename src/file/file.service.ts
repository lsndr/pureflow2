import { Injectable, Logger } from '@nestjs/common';
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

    if (file.startsWith('http://') || file.startsWith('https://')) {
      throw new Error(`URL paths are not allowed: '${file}'`);
    } else if (file.startsWith('/')) {
      await fs.promises.access(file, R_OK);

      return fs.createReadStream(file);
    } else {
      file = path.resolve(process.cwd(), file);

      await fs.promises.access(file, R_OK);

      return fs.createReadStream(file);
    }
  }

  async getCloudProviderFile(providerUrl: string): Promise<Stream> {
    this.logger.log(`Reading cloud provider file: ${providerUrl}`);

    const content = await this.cloudProviders.get(providerUrl);

    if (content) {
      return Readable.from(content);
    } else {
      throw new Error(`no such file or directory, access '${providerUrl}'`);
    }
  }

  async deleteFile(file: string): Promise<boolean> {
    if (file.startsWith('/')) {
      throw new Error('cannot delete file from this location');
    } else if (file.startsWith('http')) {
      throw new Error('cannot delete file from this location');
    } else {
      const resolvedFile = path.resolve(process.cwd(), file);
      try {
        await fs.promises.unlink(resolvedFile);
        return true;
      } catch (err) {
        this.logger.error(err.message);
        throw new Error('Failed to delete file');
      }
    }
  }
}