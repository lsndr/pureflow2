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

  private isValidPath(filePath: string): boolean {
    // Define a base directory for file operations
    const baseDir = path.resolve(process.cwd(), 'files');
    const resolvedPath = path.resolve(baseDir, filePath);
    return resolvedPath.startsWith(baseDir);
  }

  private sanitizePath(filePath: string): string {
    // Remove any null bytes and normalize the path
    return path.normalize(filePath.replace(/\0/g, ''));
  }

  async getFile(file: string): Promise<Stream> {
    this.logger.log(`Reading file: ${file}`);

    const sanitizedPath = this.sanitizePath(file);
    if (!this.isValidPath(sanitizedPath)) {
      throw new Error('Invalid file path');
    }

    const resolvedPath = path.resolve(process.cwd(), sanitizedPath);
    await fs.promises.access(resolvedPath, R_OK);

    return fs.createReadStream(resolvedPath);
  }

  async deleteFile(file: string): Promise<boolean> {
    const sanitizedPath = this.sanitizePath(file);
    if (!this.isValidPath(sanitizedPath)) {
      throw new Error('Invalid file path');
    }

    const resolvedPath = path.resolve(process.cwd(), sanitizedPath);
    await fs.promises.unlink(resolvedPath);
    return true;
  }
}