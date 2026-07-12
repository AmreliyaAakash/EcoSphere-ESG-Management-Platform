import { Request, Response } from 'express';
import { getESGConfig, updateESGConfig } from '../src/controllers/config.controller';
import { ESGConfig } from '../src/models/ESGConfig';
import { ApiError } from '../src/utils/ApiError';

jest.mock('../src/models/ESGConfig');

describe('ESG Config Controller', () => {
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

  describe('getESGConfig', () => {
    it('should return default config if none exists', async () => {
      (ESGConfig.findOne as jest.Mock).mockResolvedValue(null);
      const mockCreated = { envWeight: 40, socialWeight: 30, govWeight: 30 };
      (ESGConfig.create as jest.Mock).mockResolvedValue(mockCreated);

      await getESGConfig(mockRequest as Request, mockResponse as Response, nextMock);

      expect(responseStatus).toBe(200);
      expect(responseData.data.envWeight).toBe(40);
    });
  });

  describe('updateESGConfig', () => {
    it('should successfully update config when weights sum to 100', async () => {
      const mockConfig = {
        envWeight: 40,
        socialWeight: 30,
        govWeight: 30,
        save: jest.fn().mockResolvedValue(true)
      };
      (ESGConfig.findOne as jest.Mock).mockResolvedValue(mockConfig);

      mockRequest = {
        body: {
          envWeight: 50,
          socialWeight: 25,
          govWeight: 25,
          badgeAutoAward: true
        }
      };

      await updateESGConfig(mockRequest as Request, mockResponse as Response, nextMock);

      expect(mockConfig.envWeight).toBe(50);
      expect(mockConfig.socialWeight).toBe(25);
      expect(mockConfig.govWeight).toBe(25);
      expect(responseStatus).toBe(200);
    });

    it('should throw ApiError if weights do not sum to 100', async () => {
      const mockConfig = {
        envWeight: 40,
        socialWeight: 30,
        govWeight: 30,
        save: jest.fn().mockResolvedValue(true)
      };
      (ESGConfig.findOne as jest.Mock).mockResolvedValue(mockConfig);

      mockRequest = {
        body: {
          envWeight: 50,
          socialWeight: 20 // sum would be 50 + 20 + 30 = 100, wait: let's do 50 and 20 and govWeight remains 30, sum is 100.
          // Let's set envWeight: 50, socialWeight: 50, govWeight: 50 (sum = 150)
        }
      };

      mockRequest.body = { envWeight: 50, socialWeight: 50 }; // govWeight remains 30, sum = 130

      await updateESGConfig(mockRequest as Request, mockResponse as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(expect.any(ApiError));
      expect(nextMock.mock.calls[0][0].statusCode).toBe(400);
      expect(nextMock.mock.calls[0][0].message).toBe('Weights must sum to 100');
    });
  });
});
