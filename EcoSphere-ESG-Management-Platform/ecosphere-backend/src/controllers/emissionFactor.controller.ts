import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { EmissionFactor } from '../models/EmissionFactor';
import { ApiError } from '../utils/ApiError';

export const getEmissionFactors = asyncHandler(async (req: Request, res: Response) => {
  const factors = await EmissionFactor.find();
  return res.status(200).json(new ApiResponse(200, factors, 'Emission factors fetched successfully'));
});

export const getEmissionFactorById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const factor = await EmissionFactor.findById(id);
  if (!factor) {
    throw new ApiError(404, 'Emission factor not found');
  }
  return res.status(200).json(new ApiResponse(200, factor, 'Emission factor fetched successfully'));
});

export const createEmissionFactor = asyncHandler(async (req: Request, res: Response) => {
  let { activityType, unit, co2ePerUnit, source } = req.body;

  if (!activityType) activityType = 'General Emission Factor';
  if (!unit) unit = 'kg';
  if (co2ePerUnit === undefined || co2ePerUnit === '') co2ePerUnit = 1.0;
  if (!source) source = 'EPA Benchmark';

  const factor = await EmissionFactor.create({
    activityType,
    unit,
    co2ePerUnit,
    source,
  });
  return res.status(201).json(new ApiResponse(201, factor, 'Emission factor created successfully'));
});

export const updateEmissionFactor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { activityType, unit, co2ePerUnit, source } = req.body;

  const factor = await EmissionFactor.findById(id);
  if (!factor) {
    throw new ApiError(404, 'Emission factor not found');
  }

  if (activityType !== undefined) factor.activityType = activityType || 'General Emission Factor';
  if (unit !== undefined) factor.unit = unit || 'kg';
  if (co2ePerUnit !== undefined) factor.co2ePerUnit = co2ePerUnit === '' ? 1.0 : Number(co2ePerUnit);
  if (source !== undefined) factor.source = source || 'EPA Benchmark';

  await factor.save();

  return res.status(200).json(new ApiResponse(200, factor, 'Emission factor updated successfully'));
});

export const deleteEmissionFactor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const factor = await EmissionFactor.findByIdAndDelete(id);
  if (!factor) {
    throw new ApiError(404, 'Emission factor not found');
  }
  return res.status(200).json(new ApiResponse(200, null, 'Emission factor deleted successfully'));
});
