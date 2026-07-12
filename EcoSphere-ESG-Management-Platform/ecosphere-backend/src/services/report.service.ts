import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { CarbonTransaction } from '../models/CarbonTransaction';
import { EmployeeParticipation } from '../models/EmployeeParticipation';
import { ComplianceIssue } from '../models/ComplianceIssue';
import { Employee } from '../models/Employee';
import { ApiError } from '../utils/ApiError';
import { Readable } from 'stream';

export interface ReportConfig {
  headers: string[];
  fields: string[];
  title: string;
}

export const REPORT_CONFIGS: Record<string, ReportConfig> = {
  'carbon-transactions': {
    title: 'Carbon Transactions Report',
    headers: ['Transaction ID', 'Source Module', 'Quantity', 'CO2e Calculated', 'Department', 'Date'],
    fields: ['id', 'sourceModule', 'quantity', 'co2eCalculated', 'departmentName', 'date']
  },
  'csr-participation': {
    title: 'CSR Participation Report',
    headers: ['Participation ID', 'Employee Name', 'Activity Title', 'Approval Status', 'Points Earned', 'Completion Date'],
    fields: ['id', 'employeeName', 'activityTitle', 'approvalStatus', 'pointsEarned', 'completionDate']
  },
  'compliance-issues': {
    title: 'Compliance Issues Report',
    headers: ['Issue ID', 'Severity', 'Description', 'Owner Name', 'Due Date', 'Status'],
    fields: ['id', 'severity', 'description', 'ownerName', 'dueDate', 'status']
  },
  'leaderboard': {
    title: 'Employee Leaderboard Report',
    headers: ['Rank', 'Employee Name', 'Department', 'XP Balance', 'Points Balance'],
    fields: ['rank', 'name', 'departmentName', 'xp', 'points']
  }
};

export const fetchReportRawData = async (type: string, limit?: number): Promise<any[]> => {
  const queryLimit = limit || 100000; // Big default limit if exporting all

  if (type === 'carbon-transactions') {
    const data = await CarbonTransaction.find()
      .populate('departmentId')
      .sort({ date: -1 })
      .limit(queryLimit);

    return data.map(item => ({
      id: item._id.toString(),
      sourceModule: item.sourceModule,
      quantity: item.quantity,
      co2eCalculated: item.co2eCalculated ?? 0,
      departmentName: (item.departmentId as any)?.name || 'N/A',
      date: item.date.toISOString().split('T')[0]
    }));
  }

  if (type === 'csr-participation') {
    const data = await EmployeeParticipation.find()
      .populate('employeeId')
      .populate('activityId')
      .sort({ createdAt: -1 })
      .limit(queryLimit);

    return data.map(item => ({
      id: item._id.toString(),
      employeeName: (item.employeeId as any)?.name || 'N/A',
      activityTitle: (item.activityId as any)?.title || 'N/A',
      approvalStatus: item.approvalStatus,
      pointsEarned: item.pointsEarned,
      completionDate: item.completionDate.toISOString().split('T')[0]
    }));
  }

  if (type === 'compliance-issues') {
    const data = await ComplianceIssue.find()
      .populate('ownerId')
      .sort({ dueDate: -1 })
      .limit(queryLimit);

    return data.map(item => ({
      id: item._id.toString(),
      severity: item.severity,
      description: item.description,
      ownerName: (item.ownerId as any)?.name || 'N/A',
      dueDate: item.dueDate.toISOString().split('T')[0],
      status: item.status
    }));
  }

  if (type === 'leaderboard') {
    const employees = await Employee.find()
      .populate('departmentId')
      .sort({ xpBalance: -1 })
      .limit(queryLimit);

    return employees.map((emp, index) => ({
      rank: index + 1,
      name: emp.name,
      departmentName: (emp.departmentId as any)?.name || 'Unassigned',
      xp: emp.xpBalance,
      points: emp.pointsBalance
    }));
  }

  throw new ApiError(400, 'Invalid report type');
};

export const generateCSVStream = (data: any[], config: ReportConfig): Readable => {
  const parser = new Parser({
    fields: config.fields.map((f, i) => ({
      label: config.headers[i],
      value: f
    }))
  });
  const csv = parser.parse(data);
  return Readable.from([csv]);
};

export const generateXLSXStream = async (data: any[], config: ReportConfig): Promise<Readable> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(config.title);

  // Setup columns
  worksheet.columns = config.headers.map((h, i) => ({
    header: h,
    key: config.fields[i],
    width: 20
  }));

  // Style Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2F4F4F' } // Sleek Dark Slate
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  headerRow.height = 25;

  // Add rows
  data.forEach(item => worksheet.addRow(item));

  // Auto-fit column widths
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell!((cell) => {
      const cellValue = cell.value ? cell.value.toString() : '';
      if (cellValue.length > maxLength) {
        maxLength = cellValue.length;
      }
    });
    column.width = Math.max(maxLength + 4, 15);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Readable.from([buffer]);
};

export const generatePDFStream = (data: any[], config: ReportConfig): Readable => {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  doc.fontSize(18).fillColor('#2F4F4F').text(config.title, { align: 'center' });
  doc.moveDown(1.5);

  const startY = doc.y;
  const colWidth = 530 / config.headers.length;

  // Draw Header Row
  doc.fontSize(10).fillColor('#FFFFFF');
  config.headers.forEach((header, index) => {
    const x = 30 + index * colWidth;
    doc.rect(x, startY - 2, colWidth, 18).fill('#2F4F4F');
    doc.fillColor('#FFFFFF').text(header, x + 4, startY + 2, {
      width: colWidth - 8,
      align: 'left'
    });
  });

  doc.moveDown();

  // Draw Data Rows
  let currentY = doc.y + 10;
  doc.fillColor('#333333');

  data.forEach((row) => {
    // Page break handling
    if (currentY > 750) {
      doc.addPage();
      currentY = 40;
    }

    config.fields.forEach((field, index) => {
      const x = 30 + index * colWidth;
      const textVal = row[field]?.toString() || '';
      doc.text(textVal, x + 4, currentY, {
        width: colWidth - 8,
        align: 'left'
      });
    });

    currentY += 20;
  });

  doc.end();
  return doc;
};
