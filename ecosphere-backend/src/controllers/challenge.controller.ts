import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { Challenge } from '../models/Challenge';
import { ApiError } from '../utils/ApiError';

export const getChallenges = asyncHandler(async (req: Request, res: Response) => {
  const { status, difficulty } = req.query;
  const query: any = {};

  if (status) {
    query.status = status;
  }
  if (difficulty) {
    query.difficulty = difficulty;
  }

  const challenges = await Challenge.find(query).populate('categoryId');
  return res.status(200).json(new ApiResponse(200, challenges, 'Challenges fetched successfully'));
});

export const getChallengeById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const challenge = await Challenge.findById(id).populate('categoryId');

  if (!challenge) {
    throw new ApiError(404, 'Challenge not found');
  }

  return res.status(200).json(new ApiResponse(200, challenge, 'Challenge fetched successfully'));
});
