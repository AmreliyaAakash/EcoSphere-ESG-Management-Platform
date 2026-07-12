export interface IStorageService {
  uploadFile(file: Express.Multer.File): Promise<string>;
}

// TODO: In production, replace local disk storage with a cloud bucket (e.g., S3/Cloudinary)
// This service abstracts the storage location so that controllers/routes do not need to change.
class LocalStorageService implements IStorageService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    // Return relative URL path for accessing static file
    return `/uploads/${file.filename}`;
  }
}

export const storageService = new LocalStorageService();
