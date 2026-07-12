import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { 
  fetchReportRawData, 
  generateCSVStream, 
  generateXLSXStream, 
  generatePDFStream,
  REPORT_CONFIGS
} from '../services/report.service';

export const getReportPreview = asyncHandler(async (req: Request, res: Response) => {
  const type = req.params.type as string;
  
  if (!REPORT_CONFIGS[type]) {
    throw new ApiError(400, 'Invalid report type');
  }

  // Preview returns first 20 rows
  const data = await fetchReportRawData(type, 20);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        type,
        config: REPORT_CONFIGS[type],
        preview: data
      },
      'Report preview fetched successfully'
    )
  );
});

export const exportReport = asyncHandler(async (req: Request, res: Response) => {
  const type = req.params.type as string;
  const format = (req.query.format as string || 'csv').toLowerCase();

  if (!REPORT_CONFIGS[type]) {
    throw new ApiError(400, 'Invalid report type');
  }

  const config = REPORT_CONFIGS[type];
  const data = await fetchReportRawData(type);

  const filename = `report-${type}-${Date.now()}`;

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    const stream = generateCSVStream(data, config);
    stream.pipe(res);
    return;
  }

  if (format === 'xlsx') {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    const stream = await generateXLSXStream(data, config);
    stream.pipe(res);
    return;
  }

  if (format === 'pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
    const stream = generatePDFStream(data, config);
    stream.pipe(res);
    return;
  }

  throw new ApiError(400, 'Unsupported export format');
});
