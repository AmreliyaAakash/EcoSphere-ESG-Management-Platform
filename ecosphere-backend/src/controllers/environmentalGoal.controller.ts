import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { EnvironmentalGoal } from '../models/EnvironmentalGoal';

export const getEnvironmentalGoals = asyncHandler(async (req: Request, res: Response) => {
  const { departmentId } = req.query;
  const query: any = {};
  if (departmentId) {
    query.departmentId = departmentId;
  }

  const goals = await EnvironmentalGoal.find(query).populate('departmentId');
  return res.status(200).json(new ApiResponse(200, goals, 'Environmental goals fetched successfully'));
});
