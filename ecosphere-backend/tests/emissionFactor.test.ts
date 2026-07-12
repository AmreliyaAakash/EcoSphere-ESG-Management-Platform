import { processCarbonTransactionEmission } from '../src/services/emission.service';
import { ESGConfig } from '../src/models/ESGConfig';
import { EmissionFactor } from '../src/models/EmissionFactor';
import { ApiError } from '../src/utils/ApiError';

jest.mock('../src/models/ESGConfig');
jest.mock('../src/models/EmissionFactor');

describe('Emission calculation service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should automatically calculate co2e when autoEmissionCalc is true', async () => {
    // Mock ESGConfig to return autoEmissionCalc: true
    (ESGConfig.findOne as jest.Mock).mockResolvedValue({
      autoEmissionCalc: true,
    });

    // Mock EmissionFactor to return factor details
    (EmissionFactor.findById as jest.Mock).mockResolvedValue({
      co2ePerUnit: 0.42,
    });

    const quantity = 100;
    const result = await processCarbonTransactionEmission(quantity, 'factor123');

    expect(result).toBe(42);
    expect(ESGConfig.findOne).toHaveBeenCalledTimes(1);
    expect(EmissionFactor.findById).toHaveBeenCalledWith('factor123');
  });

  it('should allow manually provided positive co2e when autoEmissionCalc is false', async () => {
    // Mock ESGConfig to return autoEmissionCalc: false
    (ESGConfig.findOne as jest.Mock).mockResolvedValue({
      autoEmissionCalc: false,
    });

    // Mock EmissionFactor
    (EmissionFactor.findById as jest.Mock).mockResolvedValue({
      co2ePerUnit: 0.42,
    });

    const quantity = 100;
    const manualCo2e = 50;
    const result = await processCarbonTransactionEmission(quantity, 'factor123', manualCo2e);

    expect(result).toBe(50);
  });

  it('should throw ApiError if manual co2e is missing when autoEmissionCalc is false', async () => {
    (ESGConfig.findOne as jest.Mock).mockResolvedValue({
      autoEmissionCalc: false,
    });
    (EmissionFactor.findById as jest.Mock).mockResolvedValue({
      co2ePerUnit: 0.42,
    });

    await expect(
      processCarbonTransactionEmission(100, 'factor123')
    ).rejects.toThrow(ApiError);
  });

  it('should throw ApiError if manual co2e is negative when autoEmissionCalc is false', async () => {
    (ESGConfig.findOne as jest.Mock).mockResolvedValue({
      autoEmissionCalc: false,
    });
    (EmissionFactor.findById as jest.Mock).mockResolvedValue({
      co2ePerUnit: 0.42,
    });

    await expect(
      processCarbonTransactionEmission(100, 'factor123', -5)
    ).rejects.toThrow(ApiError);
  });
});
