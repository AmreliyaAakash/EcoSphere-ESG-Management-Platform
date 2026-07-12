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

export const createDepartment = asyncHandler(async (req: Request, res: Response) => {
  let { name, code, headEmployeeId, parentDepartmentId, status } = req.body;

  if (!name) name = 'General Department';
  if (!code) code = `DEPT-${Date.now().toString().slice(-4)}`;

  const dept = await Department.create({
    name,
    code,
    headEmployeeId: headEmployeeId || undefined,
    parentDepartmentId: parentDepartmentId || undefined,
    status: status || 'ACTIVE',
    employeeCount: 0
  });

  return res.status(201).json(new ApiResponse(201, dept, 'Department created successfully'));
});

export const updateDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, code, headEmployeeId, parentDepartmentId, status } = req.body;

  const dept = await Department.findById(id);
  if (!dept) {
    throw new ApiError(404, 'Department not found');
  }

  if (name !== undefined) dept.name = name || 'General Department';
  if (code !== undefined) dept.code = code || dept.code;
  dept.headEmployeeId = headEmployeeId || undefined;
  dept.parentDepartmentId = parentDepartmentId || undefined;
  if (status !== undefined) dept.status = status;

  await dept.save();

  return res.status(200).json(new ApiResponse(200, dept, 'Department updated successfully'));
});

export const deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const dept = await Department.findByIdAndDelete(id);
  if (!dept) {
    throw new ApiError(404, 'Department not found');
  }
  return res.status(200).json(new ApiResponse(200, null, 'Department deleted successfully'));
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

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  let { name, type, status } = req.body;
  if (!name) name = 'General Category';
  if (!type) type = 'CSR_ACTIVITY';

  let category;
  if (type === 'CSR_ACTIVITY') {
    category = await CSRCategory.create({ name, status: status || 'ACTIVE' });
  } else if (type === 'CHALLENGE') {
    category = await ChallengeCategory.create({ name, status: status || 'ACTIVE' });
  } else {
    throw new ApiError(400, 'Invalid category type (must be CSR_ACTIVITY or CHALLENGE)');
  }

  return res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, status } = req.body;

  let category = await CSRCategory.findById(id);
  if (category) {
    if (name !== undefined) category.name = name || 'General Category';
    if (status !== undefined) category.status = status;
    await category.save();
  } else {
    category = await ChallengeCategory.findById(id);
    if (category) {
      if (name !== undefined) category.name = name || 'General Category';
      if (status !== undefined) category.status = status;
      await category.save();
    } else {
      throw new ApiError(404, 'Category not found');
    }
  }

  return res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  let deleted = await CSRCategory.findByIdAndDelete(id);
  if (!deleted) {
    deleted = await ChallengeCategory.findByIdAndDelete(id);
  }

  if (!deleted) {
    throw new ApiError(404, 'Category not found');
  }

  return res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
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
