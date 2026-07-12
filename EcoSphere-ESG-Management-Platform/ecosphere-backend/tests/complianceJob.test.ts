import { checkComplianceOverdue } from '../src/jobs/complianceOverdue.job';
import { sendChallengeReminders } from '../src/jobs/challengeReminder.job';
import { ComplianceIssue } from '../src/models/ComplianceIssue';
import { Challenge } from '../src/models/Challenge';
import { ChallengeParticipation } from '../src/models/ChallengeParticipation';
import { createNotification } from '../src/services/notification.service';

jest.mock('../src/models/ComplianceIssue');
jest.mock('../src/models/Challenge');
jest.mock('../src/models/ChallengeParticipation');
jest.mock('../src/services/notification.service');

describe('Cron Jobs Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkComplianceOverdue', () => {
    it('should set status to OVERDUE for issues that are past their dueDate', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockIssue = {
        _id: 'issue123',
        description: 'Test Issue',
        dueDate: yesterday,
        status: 'OPEN',
        ownerId: 'owner123',
        save: jest.fn().mockResolvedValue(true)
      };

      (ComplianceIssue.find as jest.Mock).mockResolvedValue([mockIssue]);

      await checkComplianceOverdue();

      expect(mockIssue.status).toBe('OVERDUE');
      expect(mockIssue.save).toHaveBeenCalled();
      expect(createNotification).toHaveBeenCalledWith('owner123', 'COMPLIANCE_OVERDUE', expect.any(String));
    });
  });

  describe('sendChallengeReminders', () => {
    it('should notify users with joined challenges ending within 48 hours', async () => {
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);

      (Challenge.find as jest.Mock).mockResolvedValue([
        {
          _id: 'challenge123',
          title: 'Carbon Free Day',
          deadline: tomorrow,
          status: 'ACTIVE'
        }
      ]);

      const mockParticipation = {
        _id: 'participation123',
        employeeId: 'employee123',
        challengeId: {
          _id: 'challenge123',
          title: 'Carbon Free Day',
          deadline: tomorrow
        },
        approval: 'PENDING'
      };

      (ChallengeParticipation.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue([mockParticipation])
      });

      await sendChallengeReminders();

      expect(createNotification).toHaveBeenCalledWith(
        'employee123',
        'CHALLENGE_REMINDER',
        expect.stringContaining('Carbon Free Day')
      );
    });
  });
});
