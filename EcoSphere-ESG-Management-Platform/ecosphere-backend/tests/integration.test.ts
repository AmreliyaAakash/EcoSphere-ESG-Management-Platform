import request from 'supertest';
import app from '../src/app';
import { Employee } from '../src/models/Employee';
import { Department } from '../src/models/Department';
import { ESGConfig } from '../src/models/ESGConfig';
import { EmissionFactor } from '../src/models/EmissionFactor';
import { CSRActivity } from '../src/models/CSRActivity';
import { CSRCategory } from '../src/models/CSRCategory';
import { EmployeeParticipation } from '../src/models/EmployeeParticipation';
import { Badge } from '../src/models/Badge';
import { EmployeeBadge } from '../src/models/EmployeeBadge';
import { Reward } from '../src/models/Reward';
import { ComplianceIssue } from '../src/models/ComplianceIssue';
import { Audit } from '../src/models/Audit';
import { processCarbonTransactionEmission } from '../src/services/emission.service';
import { checkComplianceOverdue } from '../src/jobs/complianceOverdue.job';
import { checkAndAwardBadges } from '../src/services/badge.service';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

describe('EcoSphere ESG Integration Tests', () => {
  let adminToken: string;
  let adminEmployee: any;
  let testDepartment: any;

  beforeEach(async () => {
    // 1. Create a test department
    testDepartment = await Department.create({
      name: 'Engineering',
      code: 'ENG',
      status: 'ACTIVE'
    });

    // 2. Create an admin employee
    adminEmployee = await Employee.create({
      name: 'Alex Chen',
      email: 'alex.chen@ecosphere.io',
      password: 'password123',
      role: 'ADMIN',
      departmentId: testDepartment._id,
      xpBalance: 100,
      pointsBalance: 1000
    });

    // 3. Login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'alex.chen@ecosphere.io',
        password: 'password123'
      });
    
    if (loginRes.status !== 200) {
      console.error('Login failed status:', loginRes.status, 'body:', loginRes.body);
    }
    adminToken = loginRes.body.data.token;
  });

  describe('Auth Flow', () => {
    it('should login and return user details on /me', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('alex.chen@ecosphere.io');
    });
  });

  describe('Emission Factor Auto-Calc', () => {
    it('should calculate emission correctly when autoEmissionCalc is true/false', async () => {
      const ef = await EmissionFactor.create({
        activityType: 'Electricity — Grid',
        unit: 'kWh',
        co2ePerUnit: 0.42,
        source: 'DEFRA 2024'
      });

      // auto calc ON
      await ESGConfig.create({
        autoEmissionCalc: true,
        envWeight: 40,
        socialWeight: 30,
        govWeight: 30
      });

      const calcOn = await processCarbonTransactionEmission(100, ef._id.toString());
      expect(calcOn).toBe(42);

      // auto calc OFF
      await ESGConfig.updateOne({}, { autoEmissionCalc: false });
      
      // must throw error when co2e is missing
      await expect(processCarbonTransactionEmission(100, ef._id.toString())).rejects.toThrow();

      // should accept manual value
      const calcOff = await processCarbonTransactionEmission(100, ef._id.toString(), 85);
      expect(calcOff).toBe(85);
    });
  });

  describe('CSR Approval Blocked by Missing Evidence', () => {
    it('should block approval if evidenceRequired is true and proofUrl is missing', async () => {
      const cat = await CSRCategory.create({ name: 'Eco' });
      const act = await CSRActivity.create({
        title: 'Tree Planting',
        categoryId: cat._id,
        description: 'Planting trees',
        evidenceRequired: true,
        date: new Date(),
        departmentId: testDepartment._id
      });

      const part = await EmployeeParticipation.create({
        employeeId: adminEmployee._id,
        activityId: act._id,
        approvalStatus: 'PENDING',
        completionDate: new Date()
      });

      const res = await request(app)
        .patch(`/api/v1/employee-participations/${part._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      if (res.status !== 400) {
        console.error('CSR Approval failure debug payload:', res.body);
      }
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Proof is required');
    });
  });

  describe('Badge Auto-Award Crossing Threshold Exactly Once', () => {
    it('should award badge exactly once when crossing threshold', async () => {
      // Configure badgeAutoAward = true
      await ESGConfig.create({
        badgeAutoAward: true,
        envWeight: 40,
        socialWeight: 30,
        govWeight: 30
      });

      await Badge.create({
        name: 'Carbon Crusher',
        description: 'Reach 500 XP',
        unlockRule: { type: 'XP', threshold: 500 },
        iconUrl: '🌿'
      });

      // Set admin XP to 600
      await Employee.findByIdAndUpdate(adminEmployee._id, { xpBalance: 600 });
      
      // First call
      await checkAndAwardBadges(adminEmployee._id.toString());
      const badgesCount1 = await EmployeeBadge.countDocuments({ employeeId: adminEmployee._id });
      expect(badgesCount1).toBe(1);

      // Second call (idempotency check)
      await checkAndAwardBadges(adminEmployee._id.toString());
      const badgesCount2 = await EmployeeBadge.countDocuments({ employeeId: adminEmployee._id });
      expect(badgesCount2).toBe(1);
    });
  });

  describe('Reward Redemption Concurrency', () => {
    it('should prevent stock/points from going negative under concurrent requests', async () => {
      const reward = await Reward.create({
        name: 'Water Bottle',
        description: 'Bottle',
        pointsRequired: 100,
        stock: 1,
        status: 'ACTIVE'
      });

      // Call redemptions concurrently
      const req1 = request(app)
        .post(`/api/v1/rewards/${reward._id}/redeem`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const req2 = request(app)
        .post(`/api/v1/rewards/${reward._id}/redeem`)
        .set('Authorization', `Bearer ${adminToken}`);

      const [res1, res2] = await Promise.all([req1, req2]);

      // One should succeed, one should fail (since stock is 1)
      const successCount = [res1, res2].filter(r => r.status === 200).length;
      const failCount = [res1, res2].filter(r => r.status === 400).length;

      expect(successCount).toBe(1);
      expect(failCount).toBe(1);

      const updatedReward = await Reward.findById(reward._id);
      expect(updatedReward?.stock).toBe(0);
    });
  });

  describe('Compliance Overdue Job', () => {
    it('should flip open/in-progress issues to OVERDUE if deadline has passed', async () => {
      const audit = await Audit.create({
        scope: 'Test',
        auditorId: adminEmployee._id,
        date: new Date(),
        findings: 'none'
      });

      const issue = await ComplianceIssue.create({
        auditId: audit._id,
        severity: 'MEDIUM',
        description: 'Drill overdue',
        ownerId: adminEmployee._id,
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
        status: 'OPEN'
      });

      await checkComplianceOverdue();

      const updatedIssue = await ComplianceIssue.findById(issue._id);
      expect(updatedIssue?.status).toBe('OVERDUE');
    });
  });
});
