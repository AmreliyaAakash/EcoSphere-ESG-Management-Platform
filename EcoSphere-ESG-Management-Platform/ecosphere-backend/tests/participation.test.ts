import { Request, Response } from 'express';
import { approveChallengeParticipation, rejectChallengeParticipation } from '../src/controllers/challengeParticipation.controller';
import { ChallengeParticipation } from '../src/models/ChallengeParticipation';
import { Challenge } from '../src/models/Challenge';
import { Employee } from '../src/models/Employee';
import { createNotification } from '../src/services/notification.service';
import { checkAndAwardBadges } from '../src/services/badge.service';
import { ApiError } from '../src/utils/ApiError';

jest.mock('../src/models/ChallengeParticipation');
jest.mock('../src/models/Challenge');
jest.mock('../src/models/Employee');
jest.mock('../src/services/notification.service');
jest.mock('../src/services/badge.service');

describe('Challenge Participation Controller', () => {
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

  describe('approveChallengeParticipation', () => {
    it('should pass ApiError (404) to next() if participation record not found', async () => {
      mockRequest = { params: { id: 'p123' }, body: {} };
      (ChallengeParticipation.findById as jest.Mock).mockResolvedValue(null);

      await approveChallengeParticipation(mockRequest as Request, mockResponse as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.any(ApiError));
      expect(nextMock.mock.calls[0][0].statusCode).toBe(404);
    });

    it('should pass ApiError (400) to next() if proof is required but missing', async () => {
      mockRequest = { params: { id: 'p123' }, body: {} };
      const mockParticipation = {
        challengeId: 'c123',
        employeeId: 'e123',
        approval: 'PENDING',
        proofUrl: undefined,
        save: jest.fn(),
      };
      (ChallengeParticipation.findById as jest.Mock).mockResolvedValue(mockParticipation);
      (Challenge.findById as jest.Mock).mockResolvedValue({
        evidenceRequired: true,
        xp: 100,
        title: 'Save Water',
      });

      await approveChallengeParticipation(mockRequest as Request, mockResponse as Response, nextMock);
      expect(nextMock).toHaveBeenCalledWith(expect.any(ApiError));
      expect(nextMock.mock.calls[0][0].statusCode).toBe(400);
      expect(nextMock.mock.calls[0][0].message).toBe('Proof is required before approval');
    });

    it('should approve, award XP and send notification if proof is present or not required', async () => {
      mockRequest = { params: { id: 'p123' }, body: { xpAwarded: 150 } };
      const mockParticipation = {
        challengeId: 'c123',
        employeeId: 'e123',
        approval: 'PENDING',
        proofUrl: 'http://proof.url',
        xpAwarded: 0,
        save: jest.fn().mockResolvedValue(true),
      };
      (ChallengeParticipation.findById as jest.Mock).mockResolvedValue(mockParticipation);
      (Challenge.findById as jest.Mock).mockResolvedValue({
        evidenceRequired: true,
        xp: 100,
        title: 'Save Water',
      });
      const mockEmployee = {
        _id: 'e123',
        xpBalance: 50,
        save: jest.fn().mockResolvedValue(true),
      };
      (Employee.findById as jest.Mock).mockResolvedValue(mockEmployee);

      await approveChallengeParticipation(mockRequest as Request, mockResponse as Response, nextMock);

      expect(mockParticipation.approval).toBe('APPROVED');
      expect(mockParticipation.xpAwarded).toBe(150);
      expect(mockEmployee.xpBalance).toBe(200);
      expect(createNotification).toHaveBeenCalledWith('e123', 'CSR_APPROVED', expect.any(String));
      expect(checkAndAwardBadges).toHaveBeenCalledWith('e123');
      expect(responseStatus).toBe(200);
    });
  });

  describe('rejectChallengeParticipation', () => {
    it('should reject participation and send notification', async () => {
      mockRequest = { params: { id: 'p123' } };
      const mockParticipation = {
        challengeId: 'c123',
        employeeId: 'e123',
        approval: 'PENDING',
        save: jest.fn().mockResolvedValue(true),
      };
      (ChallengeParticipation.findById as jest.Mock).mockResolvedValue(mockParticipation);
      (Challenge.findById as jest.Mock).mockResolvedValue({
        title: 'Save Water',
      });

      await rejectChallengeParticipation(mockRequest as Request, mockResponse as Response, nextMock);

      expect(mockParticipation.approval).toBe('REJECTED');
      expect(createNotification).toHaveBeenCalledWith('e123', 'CSR_REJECTED', expect.any(String));
      expect(responseStatus).toBe(200);
    });
  });
});
