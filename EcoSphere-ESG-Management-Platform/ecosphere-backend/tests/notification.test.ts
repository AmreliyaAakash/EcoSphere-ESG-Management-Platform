import { Request, Response } from 'express';
import { getNotifications, readNotification, readAllNotifications } from '../src/controllers/notification.controller';
import { Notification } from '../src/models/Notification';
import { ApiError } from '../src/utils/ApiError';

jest.mock('../src/models/Notification');

describe('Notification Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;
  let responseStatus: number;
  let nextMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    responseData = null;
    responseStatus = 0;
    nextMock = jest.fn();
    mockResponse = {
      status: jest.fn().mockImplementation((code) => {
        responseStatus = code;
        return mockResponse;
      }) as any,
      json: jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      }) as any,
    };
  });

  describe('getNotifications', () => {
    it('should fetch paginated notifications and return unreadCount', async () => {
      mockRequest = {
        query: { page: '1', limit: '10' },
        user: { _id: 'user123' }
      };

      const mockFind = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ message: 'Notif 1', read: false }])
      };

      (Notification.find as jest.Mock).mockReturnValue(mockFind);
      (Notification.countDocuments as jest.Mock)
        .mockResolvedValueOnce(1) // total count
        .mockResolvedValueOnce(5); // unreadCount

      await getNotifications(mockRequest as Request, mockResponse as Response, nextMock);

      expect(responseStatus).toBe(200);
      expect(responseData.data.notifications).toHaveLength(1);
      expect(responseData.data.unreadCount).toBe(5);
    });
  });

  describe('readNotification', () => {
    it('should mark a notification as read and return updated doc', async () => {
      mockRequest = {
        params: { id: 'notif123' },
        user: { _id: 'user123' }
      };

      const mockNotif = { _id: 'notif123', read: true };
      (Notification.findOneAndUpdate as jest.Mock).mockResolvedValue(mockNotif);

      await readNotification(mockRequest as Request, mockResponse as Response, nextMock);

      expect(responseStatus).toBe(200);
      expect(responseData.data.read).toBe(true);
    });

    it('should pass ApiError (404) to next() if notification is not found', async () => {
      mockRequest = {
        params: { id: 'notif123' },
        user: { _id: 'user123' }
      };

      (Notification.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

      await readNotification(mockRequest as Request, mockResponse as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(expect.any(ApiError));
      expect(nextMock.mock.calls[0][0].statusCode).toBe(404);
    });
  });

  describe('readAllNotifications', () => {
    it('should mark all notifications as read', async () => {
      mockRequest = {
        user: { _id: 'user123' }
      };

      (Notification.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 3 });

      await readAllNotifications(mockRequest as Request, mockResponse as Response, nextMock);

      expect(responseStatus).toBe(200);
      expect(responseData.data.modifiedCount).toBe(3);
    });
  });
});
