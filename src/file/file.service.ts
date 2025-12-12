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

  private isPathSafe(filePath: string): boolean {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    return resolvedPath.startsWith(process.cwd());
  }

  private sanitizePath(filePath: string): string {
    // Remove any file URI scheme
    if (filePath.startsWith('file://')) {
      filePath = filePath.slice(7);
    }
    // Normalize the path to remove any ../ or ./
    return path.normalize(filePath);
  }

  async getFile(file: string): Promise<Stream> {
    this.logger.log(`Reading file: ${file}`);

    file = this.sanitizePath(file);

    if (!this.isPathSafe(file)) {
      throw new Error('Access to this file path is not allowed');
    }

    const resolvedPath = path.resolve(process.cwd(), file);
    await fs.promises.access(resolvedPath, R_OK);

    return fs.createReadStream(resolvedPath);
  }

  async deleteFile(file: string): Promise<boolean> {
    this.logger.log(`Deleting file: ${file}`);

    file = this.sanitizePath(file);

    if (!this.isPathSafe(file)) {
      throw new Error('Access to this file path is not allowed');
    }

    const resolvedPath = path.resolve(process.cwd(), file);
    await fs.promises.unlink(resolvedPath);
    return true;
  }
}