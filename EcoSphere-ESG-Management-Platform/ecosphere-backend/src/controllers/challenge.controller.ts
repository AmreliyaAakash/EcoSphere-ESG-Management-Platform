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

export const createChallenge = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, xp, difficulty, categoryId, status, deadline, evidenceRequired } = req.body;
  if (!title || !description || xp === undefined || !difficulty || !categoryId) {
    throw new ApiError(400, 'Title, description, xp, difficulty, and categoryId are required');
  }

  // Set default deadline (30 days from now) if not provided
  const finalDeadline = deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const challenge = await Challenge.create({
    title,
    description,
    xp,
    difficulty,
    categoryId,
    evidenceRequired: evidenceRequired || false,
    status: status || 'ACTIVE',
    deadline: finalDeadline
  });

  return res.status(201).json(new ApiResponse(201, challenge, 'Challenge created successfully'));
});

export const updateChallenge = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, xp, difficulty, categoryId, status, deadline, evidenceRequired } = req.body;

  const challenge = await Challenge.findById(id);
  if (!challenge) {
    throw new ApiError(404, 'Challenge not found');
  }

  if (title !== undefined) challenge.title = title;
  if (description !== undefined) challenge.description = description;
  if (xp !== undefined) challenge.xp = xp;
  if (difficulty !== undefined) challenge.difficulty = difficulty;
  if (categoryId !== undefined) challenge.categoryId = categoryId;
  if (status !== undefined) challenge.status = status;
  if (evidenceRequired !== undefined) challenge.evidenceRequired = evidenceRequired;
  if (deadline !== undefined) challenge.deadline = new Date(deadline);

  await challenge.save();

  return res.status(200).json(new ApiResponse(200, challenge, 'Challenge updated successfully'));
});

export const deleteChallenge = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const challenge = await Challenge.findByIdAndDelete(id);
  if (!challenge) {
    throw new ApiError(404, 'Challenge not found');
  }
  return res.status(200).json(new ApiResponse(200, null, 'Challenge deleted successfully'));
});
