import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Employee } from '../models/Employee';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { env } from '../config/env';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await Employee.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const loggedInUser = user.toObject();
  delete loggedInUser.password;

  return res.status(200).json(
    new ApiResponse(200, { user: loggedInUser, token }, 'User logged in successfully')
  );
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  return res.status(200).json(
    new ApiResponse(200, { user: req.user }, 'Current user fetched successfully')
  );
});
