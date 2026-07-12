import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { Badge } from '../models/Badge';

export const getBadges = asyncHandler(async (req: Request, res: Response) => {
  const badges = await Badge.find();
  return res.status(200).json(new ApiResponse(200, badges, 'Badges fetched successfully'));
});
