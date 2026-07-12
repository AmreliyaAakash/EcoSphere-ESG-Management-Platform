import cron from 'node-cron';
import { ComplianceIssue } from '../models/ComplianceIssue';
import { createNotification } from '../services/notification.service';

export const checkComplianceOverdue = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const issues = await ComplianceIssue.find({
    status: { $in: ['OPEN', 'IN_PROGRESS'] }
  });

  for (const issue of issues) {
    if (new Date(issue.dueDate) < today) {
      issue.status = 'OVERDUE';
      await issue.save();

      await createNotification(
        issue.ownerId.toString(),
        'COMPLIANCE_OVERDUE',
        `Compliance issue "${issue.description}" is overdue. It was due on ${issue.dueDate.toDateString()}.`
      );
    }
  }
};

export const initComplianceOverdueJob = () => {
  // Scheduled daily at 00:05 server time
  cron.schedule('5 0 * * *', async () => {
    console.log('Running daily compliance overdue check job...');
    try {
      await checkComplianceOverdue();
      console.log('Compliance overdue check job completed successfully.');
    } catch (error) {
      console.error('Error running compliance overdue check job:', error);
    }
  });
};
