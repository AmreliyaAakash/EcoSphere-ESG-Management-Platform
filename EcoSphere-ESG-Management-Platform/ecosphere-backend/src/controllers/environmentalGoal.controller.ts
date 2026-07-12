import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { EnvironmentalGoal } from '../models/EnvironmentalGoal';
import { Department } from '../models/Department';
import { ApiError } from '../utils/ApiError';

export const getEnvironmentalGoals = asyncHandler(async (req: Request, res: Response) => {
  const { departmentId } = req.query;
  const query: any = {};
  if (departmentId) {
    query.departmentId = departmentId;
  }

  const goals = await EnvironmentalGoal.find(query).populate('departmentId');
  return res.status(200).json(new ApiResponse(200, goals, 'Environmental goals fetched successfully'));
});

export const createEnvironmentalGoal = asyncHandler(async (req: Request, res: Response) => {
  let { metric, targetValue, currentValue, departmentId, deadline } = req.body;

  // Fallbacks for optional inputs
  if (!metric) metric = 'Sustainability Goal';
  if (targetValue === undefined || targetValue === '') targetValue = 100;
  if (currentValue === undefined || currentValue === '') currentValue = 0;

  if (!departmentId) {
    const dept = await Department.findOne();
    departmentId = dept ? dept._id : '60d5ec4f1f1f1f1f1f010001';
  }

  const finalDeadline = deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const goal = await EnvironmentalGoal.create({
    metric,
    targetValue,
    currentValue,
    departmentId,
    deadline: finalDeadline
  });

  return res.status(201).json(new ApiResponse(201, goal, 'Environmental goal created successfully'));
});

export const updateEnvironmentalGoal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { metric, targetValue, currentValue, departmentId, deadline } = req.body;

  const goal = await EnvironmentalGoal.findById(id);
  if (!goal) {
    throw new ApiError(404, 'Environmental goal not found');
  }

  if (metric !== undefined) goal.metric = metric || 'Sustainability Goal';
  if (targetValue !== undefined) goal.targetValue = targetValue === '' ? 100 : Number(targetValue);
  if (currentValue !== undefined) goal.currentValue = currentValue === '' ? 0 : Number(currentValue);
  if (departmentId !== undefined && departmentId !== '') goal.departmentId = departmentId;
  if (deadline !== undefined) goal.deadline = deadline ? new Date(deadline) : goal.deadline;

  await goal.save();

  return res.status(200).json(new ApiResponse(200, goal, 'Environmental goal updated successfully'));
});

export const deleteEnvironmentalGoal = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const goal = await EnvironmentalGoal.findByIdAndDelete(id);
  if (!goal) {
    throw new ApiError(404, 'Environmental goal not found');
  }
  return res.status(200).json(new ApiResponse(200, null, 'Environmental goal deleted successfully'));
});
