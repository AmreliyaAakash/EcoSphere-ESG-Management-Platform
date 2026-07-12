import { upload } from '../src/middleware/upload.middleware';
import { storageService } from '../src/services/storage.service';

describe('Storage & Uploads Validation', () => {
  it('should successfully return the local relative URL when uploading', async () => {
    const mockFile = {
      filename: 'file-123.pdf',
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
    } as Express.Multer.File;

    const result = await storageService.uploadFile(mockFile);
    expect(result).toBe('/uploads/file-123.pdf');
  });

  it('should have correct upload limits configuration', () => {
    expect((upload as any).limits?.fileSize).toBe(5 * 1024 * 1024);
  });
});
