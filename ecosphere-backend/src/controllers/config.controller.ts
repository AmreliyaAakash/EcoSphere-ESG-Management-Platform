import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { Department } from '../models/Department';
import { CSRCategory } from '../models/CSRCategory';
import { ChallengeCategory } from '../models/ChallengeCategory';
import { ESGConfig } from '../models/ESGConfig';
import { ApiError } from '../utils/ApiError';

export const getDepartments = asyncHandler(async (req: Request, res: Response) => {
  const departments = await Department.find()
    .populate('headEmployeeId')
    .populate('parentDepartmentId');
  return res.status(200).json(new ApiResponse(200, departments, 'Departments fetched successfully'));
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const csrCategories = await CSRCategory.find();
  const challengeCategories = await ChallengeCategory.find();
  
  return res.status(200).json(
    new ApiResponse(
      200, 
      { csrCategories, challengeCategories }, 
      'Categories fetched successfully'
    )
  );
});

export const getESGConfig = asyncHandler(async (req: Request, res: Response) => {
  let config = await ESGConfig.findOne();
  if (!config) {
    config = await ESGConfig.create({
      envWeight: 40,
      socialWeight: 30,
      govWeight: 30,
      autoEmissionCalc: true,
      evidenceRequired: true,
      badgeAutoAward: false
    });
  }
  return res.status(200).json(new ApiResponse(200, config, 'ESG Config fetched successfully'));
});

export const updateESGConfig = asyncHandler(async (req: Request, res: Response) => {
  let config = await ESGConfig.findOne();
  if (!config) {
    config = await ESGConfig.create({
      envWeight: 40,
      socialWeight: 30,
      govWeight: 30,
      autoEmissionCalc: true,
      evidenceRequired: true,
      badgeAutoAward: false
    });
  }

  const { envWeight, socialWeight, govWeight, autoEmissionCalc, evidenceRequired, badgeAutoAward } = req.body;

  const mergedEnvWeight = envWeight !== undefined ? envWeight : config.envWeight;
  const mergedSocialWeight = socialWeight !== undefined ? socialWeight : config.socialWeight;
  const mergedGovWeight = govWeight !== undefined ? govWeight : config.govWeight;

  if (mergedEnvWeight + mergedSocialWeight + mergedGovWeight !== 100) {
    throw new ApiError(400, 'Weights must sum to 100');
  }

  if (envWeight !== undefined) config.envWeight = envWeight;
  if (socialWeight !== undefined) config.socialWeight = socialWeight;
  if (govWeight !== undefined) config.govWeight = govWeight;
  if (autoEmissionCalc !== undefined) config.autoEmissionCalc = autoEmissionCalc;
  if (evidenceRequired !== undefined) config.evidenceRequired = evidenceRequired;
  if (badgeAutoAward !== undefined) config.badgeAutoAward = badgeAutoAward;

  await config.save();

  return res.status(200).json(new ApiResponse(200, config, 'ESG Config updated successfully'));
});
