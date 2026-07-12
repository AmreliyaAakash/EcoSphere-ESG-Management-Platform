import { Request, Response } from 'express';
import { getReportPreview, exportReport } from '../src/controllers/report.controller';
import { CarbonTransaction } from '../src/models/CarbonTransaction';
import { ApiError } from '../src/utils/ApiError';

jest.mock('../src/models/CarbonTransaction');

describe('Report Controller', () => {
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
      setHeader: jest.fn(),
    };
  });

  describe('getReportPreview', () => {
    it('should return preview rows for carbon-transactions', async () => {
      mockRequest = {
        params: { type: 'carbon-transactions' }
      };

      const mockFind = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          {
            _id: 'ct123',
            sourceModule: 'TRAVEL',
            quantity: 10,
            co2eCalculated: 4.2,
            departmentId: { name: 'IT' },
            date: new Date('2026-07-12')
          }
        ])
      };
      (CarbonTransaction.find as jest.Mock).mockReturnValue(mockFind);

      await getReportPreview(mockRequest as Request, mockResponse as Response, nextMock);

      expect(responseStatus).toBe(200);
      expect(responseData.data.preview).toHaveLength(1);
      expect(responseData.data.preview[0].departmentName).toBe('IT');
    });

    it('should throw ApiError if report type is invalid', async () => {
      mockRequest = {
        params: { type: 'invalid-type' }
      };

      await getReportPreview(mockRequest as Request, mockResponse as Response, nextMock);

      expect(nextMock).toHaveBeenCalledWith(expect.any(ApiError));
      expect(nextMock.mock.calls[0][0].statusCode).toBe(400);
    });
  });

  describe('exportReport', () => {
    it('should set correct headers for CSV export', async () => {
      mockRequest = {
        params: { type: 'carbon-transactions' },
        query: { format: 'csv' }
      };

      const mockFind = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([
          {
            _id: 'ct123',
            sourceModule: 'TRAVEL',
            quantity: 10,
            co2eCalculated: 4.2,
            departmentId: { name: 'IT' },
            date: new Date('2026-07-12')
          }
        ])
      };
      (CarbonTransaction.find as jest.Mock).mockReturnValue(mockFind);

      const pipeMock = jest.fn();
      mockResponse.setHeader = jest.fn();
      (mockResponse as any).pipe = pipeMock;

      await exportReport(mockRequest as Request, mockResponse as Response, nextMock);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', expect.stringContaining('report-carbon-transactions'));
    });
  });
});
