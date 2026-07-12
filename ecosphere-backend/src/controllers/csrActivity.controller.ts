import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { CSRActivity } from '../models/CSRActivity';

export const getCSRActivities = asyncHandler(async (req: Request, res: Response) => {
  const { departmentId, dateFrom, dateTo } = req.query;
  const query: any = {};

  if (departmentId) {
    query.departmentId = departmentId;
  }

  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) {
      query.date.$gte = new Date(dateFrom as string);
    }
    if (dateTo) {
      query.date.$lte = new Date(dateTo as string);
    }
  }

  const activities = await CSRActivity.find(query)
    .populate('categoryId')
    .populate('departmentId');
    
  return res.status(200).json(new ApiResponse(200, activities, 'CSR activities fetched successfully'));
});
