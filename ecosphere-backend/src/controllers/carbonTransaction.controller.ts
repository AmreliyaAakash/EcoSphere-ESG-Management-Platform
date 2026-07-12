import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { CarbonTransaction } from '../models/CarbonTransaction';

export const getCarbonTransactions = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

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

  const transactions = await CarbonTransaction.find(query)
    .populate('emissionFactorId')
    .populate('departmentId')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await CarbonTransaction.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200, 
      {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, 
      'Carbon transactions fetched successfully'
    )
  );
});
