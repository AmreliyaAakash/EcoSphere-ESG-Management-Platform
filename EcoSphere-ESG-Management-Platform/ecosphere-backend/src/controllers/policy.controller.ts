import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { Policy } from '../models/Policy';
import { PolicyAcknowledgement } from '../models/PolicyAcknowledgement';
import { ApiError } from '../utils/ApiError';

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

export const createPolicy = asyncHandler(async (req: Request, res: Response) => {
  let { title, description, category, version, fileUrl } = req.body;

  if (!title) title = 'General ESG Policy';
  if (!description) description = 'Platform governance policy document';
  if (!category) category = 'Governance';
  if (!version) version = '1.0';
  if (!fileUrl) fileUrl = 'https://example.com/policy.pdf';

  const policy = await Policy.create({
    title,
    description,
    category,
    version,
    fileUrl,
    signatureRequired: false
  });

  return res.status(201).json(new ApiResponse(201, policy, 'Policy created successfully'));
});

export const updatePolicy = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, category, version, fileUrl } = req.body;

  const policy = await Policy.findById(id);
  if (!policy) {
    throw new ApiError(404, 'Policy not found');
  }

  if (title !== undefined) policy.title = title || 'General ESG Policy';
  if (description !== undefined) policy.description = description || 'Platform governance policy document';
  if (category !== undefined) policy.category = category || 'Governance';
  if (version !== undefined) policy.version = version || '1.0';
  if (fileUrl !== undefined) policy.fileUrl = fileUrl || 'https://example.com/policy.pdf';

  await policy.save();

  return res.status(200).json(new ApiResponse(200, policy, 'Policy updated successfully'));
});

export const deletePolicy = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const policy = await Policy.findByIdAndDelete(id);
  if (!policy) {
    throw new ApiError(404, 'Policy not found');
  }
  return res.status(200).json(new ApiResponse(200, null, 'Policy deleted successfully'));
});
