import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { Policy } from '../models/Policy';
import { PolicyAcknowledgement } from '../models/PolicyAcknowledgement';

export const getPolicies = asyncHandler(async (req: Request, res: Response) => {
  const policies = await Policy.find();
  return res.status(200).json(new ApiResponse(200, policies, 'Policies fetched successfully'));
});

export const getPolicyAcknowledgements = asyncHandler(async (req: Request, res: Response) => {
  const acknowledgements = await PolicyAcknowledgement.find()
    .populate('employeeId')
    .populate('policyId');
  return res.status(200).json(new ApiResponse(200, acknowledgements, 'Policy acknowledgements fetched successfully'));
});
