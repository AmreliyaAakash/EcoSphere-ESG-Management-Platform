import { ESGConfig } from '../models/ESGConfig';
import { EmissionFactor } from '../models/EmissionFactor';
import { ApiError } from '../utils/ApiError';
import { z } from 'zod';

const manualCo2eSchema = z.number().positive('co2eCalculated must be a positive number');

export const processCarbonTransactionEmission = async (
  quantity: number,
  emissionFactorId: string,
  co2eCalculatedInput?: number
): Promise<number> => {
  // 1. Fetch ESG config
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

  // 2. Fetch Emission Factor
  const factor = await EmissionFactor.findById(emissionFactorId);
  if (!factor) {
    throw new ApiError(404, 'Emission factor not found');
  }

  // 3. Process
  if (config.autoEmissionCalc) {
    return quantity * factor.co2ePerUnit;
  } else {
    if (co2eCalculatedInput === undefined || co2eCalculatedInput === null) {
      throw new ApiError(400, 'co2eCalculated must be manually provided when auto-calculation is disabled');
    }
    const parseResult = manualCo2eSchema.safeParse(co2eCalculatedInput);
    if (!parseResult.success) {
      throw new ApiError(400, 'Invalid co2eCalculated: ' + parseResult.error.issues[0]?.message);
    }
    return co2eCalculatedInput;
  }
};
