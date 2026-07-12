import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { Employee } from '../models/Employee';
import { ApiError } from '../utils/ApiError';

export const getEmployees = asyncHandler(async (req: Request, res: Response) => {
  const employees = await Employee.find().populate('departmentId');
  return res.status(200).json(new ApiResponse(200, employees, 'Employees fetched successfully'));
});

export const getEmployeeById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const employee = await Employee.findById(id).populate('departmentId');

  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  return res.status(200).json(new ApiResponse(200, employee, 'Employee fetched successfully'));
});

export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const employees = await Employee.find()
    .sort({ xpBalance: -1 })
    .populate('departmentId');

  const leaderboard = employees.map((emp, index) => ({
    employeeId: emp._id,
    name: emp.name,
    avatarUrl: emp.avatarUrl,
    departmentName: (emp.departmentId as any)?.name || 'Unassigned',
    xp: emp.xpBalance,
    points: emp.pointsBalance,
    rank: index + 1
  }));

  return res.status(200).json(new ApiResponse(200, leaderboard, 'Leaderboard fetched successfully'));
});
