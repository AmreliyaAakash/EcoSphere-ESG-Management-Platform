import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { Reward } from '../models/Reward';
import { Employee } from '../models/Employee';
import { RewardRedemption } from '../models/RewardRedemption';
import { ApiError } from '../utils/ApiError';
import { createNotification } from '../services/notification.service';

export const getRewards = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const query: any = {};

  if (status) {
    query.status = status;
  }

  const rewards = await Reward.find(query);
  return res.status(200).json(new ApiResponse(200, rewards, 'Rewards fetched successfully'));
});

export const redeemReward = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const employeeId = req.user?._id;

  if (!employeeId) {
    throw new ApiError(401, 'Unauthorized request');
  }

  let updatedPointsBalance = 0;
  let remainingStock = 0;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // 1. Lock and load the Reward and the Employee inside the session
      const reward = await Reward.findById(id).session(session);
      if (!reward) {
        throw new ApiError(404, 'Reward not found');
      }

      const employee = await Employee.findById(employeeId).session(session);
      if (!employee) {
        throw new ApiError(404, 'Employee not found');
      }

      // 2. Validate reward.status === 'ACTIVE', reward.stock > 0, and employee.points >= reward.pointsCost
      if (reward.status !== 'ACTIVE') {
        throw new ApiError(400, 'Reward is not active');
      }

      if (reward.stock <= 0) {
        throw new ApiError(400, 'Reward is out of stock');
      }

      const pointsCost = reward.pointsRequired;
      if (employee.pointsBalance < pointsCost) {
        throw new ApiError(400, 'Insufficient points balance');
      }

      // 3. Decrement reward.stock by 1 and save
      reward.stock -= 1;
      await reward.save({ session });

      // 4. Deduct reward.pointsCost from employee.points and save
      employee.pointsBalance -= pointsCost;
      await employee.save({ session });

      // 5. Insert a RewardRedemption document linking employee + reward + timestamp
      await RewardRedemption.create([{
        employeeId: employee._id,
        rewardId: reward._id,
        pointsSpent: pointsCost,
        redeemedAt: new Date()
      }], { session });

      // 6. Create a REWARD_REDEEMED notification
      await createNotification(
        employee._id.toString(),
        'REWARD_REDEEMED',
        `You have successfully redeemed the reward: ${reward.name}`
      );

      updatedPointsBalance = employee.pointsBalance;
      remainingStock = reward.stock;
    });
  } finally {
    await session.endSession();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        pointsBalance: updatedPointsBalance,
        stock: remainingStock
      },
      'Reward redeemed successfully'
    )
  );
});
