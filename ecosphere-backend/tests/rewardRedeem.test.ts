import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { redeemReward } from '../src/controllers/reward.controller';
import { Reward } from '../src/models/Reward';
import { Employee } from '../src/models/Employee';
import { RewardRedemption } from '../src/models/RewardRedemption';
import { createNotification } from '../src/services/notification.service';
import { ApiError } from '../src/utils/ApiError';

jest.mock('../src/models/Reward');
jest.mock('../src/models/Employee');
jest.mock('../src/models/RewardRedemption');
jest.mock('../src/services/notification.service');

describe('Reward Redemption Concurrency & Transaction', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    nextMock = jest.fn();

    // Mock mongoose sessions
    const mockSession = {
      withTransaction: jest.fn().mockImplementation(async (callback) => {
        return await callback();
      }),
      endSession: jest.fn(),
    };
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession as any);
  });

  it('should successfully redeem when stock and points are valid', async () => {
    mockRequest = {
      params: { id: 'reward123' },
      user: { _id: 'employee123' },
    };

    const mockReward = {
      _id: 'reward123',
      name: 'Eco Mug',
      status: 'ACTIVE',
      stock: 5,
      pointsRequired: 50,
      save: jest.fn().mockResolvedValue(true),
    };

    const mockEmployee = {
      _id: 'employee123',
      pointsBalance: 100,
      save: jest.fn().mockResolvedValue(true),
    };

    (Reward.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(mockReward),
    });

    (Employee.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(mockEmployee),
    });

    let resStatus = 0;
    let resJson: any = null;
    mockResponse = {
      status: jest.fn().mockImplementation((code) => {
        resStatus = code;
        return mockResponse;
      }) as any,
      json: jest.fn().mockImplementation((data) => {
        resJson = data;
        return mockResponse;
      }) as any,
    };

    await redeemReward(mockRequest as Request, mockResponse as Response, nextMock);

    expect(mockReward.stock).toBe(4);
    expect(mockEmployee.pointsBalance).toBe(50);
    expect(RewardRedemption.create).toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalled();
    expect(resStatus).toBe(200);
    expect(resJson.data.stock).toBe(4);
  });

  it('should prevent stock going negative during concurrent redemptions (simulated)', async () => {
    // Shared mock db state
    let databaseStock = 1;
    let databasePoints = 100;

    // Helper to generate mock reward
    const getMockReward = () => ({
      _id: 'reward123',
      name: 'Eco Bottle',
      status: 'ACTIVE',
      get stock() {
        return databaseStock;
      },
      set stock(val) {
        databaseStock = val;
      },
      pointsRequired: 50,
      save: jest.fn().mockImplementation(async function(this: any) {
        return this;
      }),
    });

    const getMockEmployee = () => ({
      _id: 'employee123',
      get pointsBalance() {
        return databasePoints;
      },
      set pointsBalance(val) {
        databasePoints = val;
      },
      save: jest.fn().mockImplementation(async function(this: any) {
        return this;
      }),
    });

    // Mock findById to return fresh instances reflecting the current db state
    (Reward.findById as jest.Mock).mockImplementation(() => ({
      session: jest.fn().mockImplementation(async () => getMockReward()),
    }));

    (Employee.findById as jest.Mock).mockImplementation(() => ({
      session: jest.fn().mockImplementation(async () => getMockEmployee()),
    }));

    const req1 = { params: { id: 'reward123' }, user: { _id: 'employee123' } } as unknown as Request;
    const req2 = { params: { id: 'reward123' }, user: { _id: 'employee123' } } as unknown as Request;

    const next1 = jest.fn();
    const next2 = jest.fn();

    const res1Json = jest.fn();
    const res2Json = jest.fn();

    const res1 = {
      status: jest.fn().mockReturnValue({ json: res1Json }),
    } as any as Response;

    const res2 = {
      status: jest.fn().mockReturnValue({ json: res2Json }),
    } as any as Response;

    // Execute concurrent redemption requests
    await Promise.all([
      redeemReward(req1, res1, next1),
      redeemReward(req2, res2, next2),
    ]);

    // One request should succeed, and one should fail with ApiError (out of stock)
    // databaseStock should be exactly 0, never negative
    expect(databaseStock).toBe(0);

    const hasError1 = next1.mock.calls.length > 0;
    const hasError2 = next2.mock.calls.length > 0;

    // Verify that exactly one succeeded and one failed
    expect(hasError1 !== hasError2).toBe(true);

    const failedNext = hasError1 ? next1 : next2;
    expect(failedNext).toHaveBeenCalledWith(expect.any(ApiError));
    expect(failedNext.mock.calls[0][0].message).toBe('Reward is out of stock');
  });
});
