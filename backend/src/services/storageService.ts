import admin from 'firebase-admin';
import { config } from '../config/firebase';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(config.serviceAccount as admin.ServiceAccount),
    storageBucket: config.storageBucket,
  });
}

const bucket = admin.storage().bucket();

export type UploadFolder = 'songs' | 'posters' | 'avatars' | 'covers' | 'documents';

export interface UploadResult {
  fileName: string;
  filePath: string;
  publicUrl: string;
  size: number;
  contentType: string;
}

class StorageService {
  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    folder: UploadFolder,
    userId: string,
    contentType: string
  ): Promise<UploadResult> {
    try {
      const ext = path.extname(originalName);
      const fileName = `${uuidv4()}${ext}`;
      const filePath = `${folder}/${userId}/${fileName}`;
      const file = bucket.file(filePath);

      await file.save(fileBuffer, {
        metadata: {
          contentType,
          metadata: {
            originalName,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      await file.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      return {
        fileName,
        filePath,
        publicUrl,
        size: fileBuffer.length,
        contentType,
      };
    } catch (error: any) {
      logger.error('Storage uploadFile error', { error: error.message });
      throw new Error('File upload failed');
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await bucket.file(filePath).delete();
      return true;
    } catch (error: any) {
      logger.error('Storage deleteFile error', { error: error.message, filePath });
      return false;
    }
  }

  async getSignedUrl(filePath: string, expiresInMinutes = 60): Promise<string | null> {
    try {
      const [url] = await bucket.file(filePath).getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresInMinutes * 60 * 1000,
      });
      return url;
    } catch (error: any) {
      logger.error('Storage getSignedUrl error', { error: error.message, filePath });
      return null;
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const [exists] = await bucket.file(filePath).exists();
      return exists;
    } catch (error: any) {
      logger.error('Storage fileExists error', { error: error.message, filePath });
      return false;
    }
  }

  async getFileMetadata(filePath: string): Promise<Record<string, any> | null> {
    try {
      const [metadata] = await bucket.file(filePath).getMetadata();
      return metadata;
    } catch (error: any) {
      logger.error('Storage getFileMetadata error', { error: error.message, filePath });
      return null;
    }
  }

  async listFilesInFolder(folder: UploadFolder, userId: string): Promise<string[]> {
    try {
      const [files] = await bucket.getFiles({ prefix: `${folder}/${userId}/` });
      return files.map((f) => f.name);
    } catch (error: any) {
      logger.error('Storage listFilesInFolder error', { error: error.message });
      return [];
    }
  }

  async getUserStorageUsage(userId: string): Promise<number> {
    try {
      const [files] = await bucket.getFiles({ prefix: '' });
      const userFiles = files.filter((f) => f.name.includes(`/${userId}/`));
      const sizes = await Promise.all(
        userFiles.map(async (f) => {
          const [metadata] = await f.getMetadata();
          return parseInt(String(metadata.size || '0'), 10);
        })
      );
      return sizes.reduce((sum, size) => sum + size, 0);
    } catch (error: any) {
      logger.error('Storage getUserStorageUsage error', { error: error.message });
      return 0;
    }
  }

  validateFileType(contentType: string, folder: UploadFolder): boolean {
    const allowedTypes: Record<UploadFolder, string[]> = {
      songs: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'],
      posters: ['image/jpeg', 'image/png', 'image/webp'],
      avatars: ['image/jpeg', 'image/png', 'image/webp'],
      covers: ['image/jpeg', 'image/png', 'image/webp'],
      documents: ['application/pdf'],
    };
    return allowedTypes[folder]?.includes(contentType) || false;
  }

  validateFileSize(sizeInBytes: number, folder: UploadFolder): boolean {
    const maxSizes: Record<UploadFolder, number> = {
      songs: 50 * 1024 * 1024,
      posters: 10 * 1024 * 1024,
      avatars: 5 * 1024 * 1024,
      covers: 10 * 1024 * 1024,
      documents: 20 * 1024 * 1024,
    };
    return sizeInBytes <= (maxSizes[folder] || 10 * 1024 * 1024);
  }
}

export default new StorageService();
