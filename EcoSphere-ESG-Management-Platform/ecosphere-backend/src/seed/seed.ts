import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Load env variables
dotenv.config();

import { env } from '../config/env';
import { Department } from '../models/Department';
import { CSRCategory } from '../models/CSRCategory';
import { ChallengeCategory } from '../models/ChallengeCategory';
import { EmissionFactor } from '../models/EmissionFactor';
import { EnvironmentalGoal } from '../models/EnvironmentalGoal';
import { Policy } from '../models/Policy';
import { Badge } from '../models/Badge';
import { Reward } from '../models/Reward';
import { CarbonTransaction } from '../models/CarbonTransaction';
import { CSRActivity } from '../models/CSRActivity';
import { Employee } from '../models/Employee';
import { EmployeeParticipation } from '../models/EmployeeParticipation';
import { Challenge } from '../models/Challenge';
import { ChallengeParticipation } from '../models/ChallengeParticipation';
import { PolicyAcknowledgement } from '../models/PolicyAcknowledgement';
import { Audit } from '../models/Audit';
import { ComplianceIssue } from '../models/ComplianceIssue';
import { ESGConfig } from '../models/ESGConfig';
import { EmployeeBadge } from '../models/EmployeeBadge';
import { RewardRedemption } from '../models/RewardRedemption';
import { DiversityMetric } from '../models/DiversityMetric';
import { TrainingRecord } from '../models/TrainingRecord';

const loadJSON = (filename: string) => {
  const filepath = path.join(__dirname, 'data', filename);
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
};

const runSeed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const seedReset = process.env.SEED_RESET === 'true';

    // Load datasets
    const departments = loadJSON('departments.json');
    const csrCategories = loadJSON('csrCategories.json');
    const challengeCategories = loadJSON('challengeCategories.json');
    const emissionFactors = loadJSON('emissionFactors.json');
    const environmentalGoals = loadJSON('environmentalGoals.json');
    const policies = loadJSON('policies.json');
    const badges = loadJSON('badges.json');
    const rewards = loadJSON('rewards.json');
    const carbonTransactions = loadJSON('carbonTransactions.json');
    const csrActivities = loadJSON('csrActivities.json');
    const employeesData = loadJSON('employees.json');
    const employeeParticipations = loadJSON('employeeParticipations.json');
    const challenges = loadJSON('challenges.json');
    const challengeParticipations = loadJSON('challengeParticipations.json');
    const policyAcknowledgements = loadJSON('policyAcknowledgements.json');
    const audits = loadJSON('audits.json');
    const complianceIssues = loadJSON('complianceIssues.json');
    const esgConfigData = loadJSON('esgConfig.json');
    const diversityMetrics = loadJSON('diversityMetrics.json');
    const trainingRecords = loadJSON('trainingRecords.json');

    // Hash passwords for employees
    const defaultPasswordHash = await bcrypt.hash('password123', 10);
    const employees = employeesData.map((e: any) => ({
      ...e,
      password: defaultPasswordHash
    }));

    // List of models and their data
    const collectionsToSeed = [
      { model: Department, data: departments, name: 'Departments' },
      { model: CSRCategory, data: csrCategories, name: 'CSR Categories' },
      { model: ChallengeCategory, data: challengeCategories, name: 'Challenge Categories' },
      { model: EmissionFactor, data: emissionFactors, name: 'Emission Factors' },
      { model: EnvironmentalGoal, data: environmentalGoals, name: 'Environmental Goals' },
      { model: Policy, data: policies, name: 'Policies' },
      { model: Badge, data: badges, name: 'Badges' },
      { model: Reward, data: rewards, name: 'Rewards' },
      { model: CarbonTransaction, data: carbonTransactions, name: 'Carbon Transactions' },
      { model: CSRActivity, data: csrActivities, name: 'CSR Activities' },
      { model: Employee, data: employees, name: 'Employees' },
      { model: EmployeeParticipation, data: employeeParticipations, name: 'Employee Participations' },
      { model: Challenge, data: challenges, name: 'Challenges' },
      { model: ChallengeParticipation, data: challengeParticipations, name: 'Challenge Participations' },
      { model: PolicyAcknowledgement, data: policyAcknowledgements, name: 'Policy Acknowledgements' },
      { model: Audit, data: audits, name: 'Audits' },
      { model: ComplianceIssue, data: complianceIssues, name: 'Compliance Issues' },
      { model: DiversityMetric, data: diversityMetrics, name: 'Diversity Metrics' },
      { model: TrainingRecord, data: trainingRecords, name: 'Training Records' }
    ];

    if (seedReset) {
      console.log('SEED_RESET is true. Clearing collections...');
      
      // Delete everything
      await Promise.all([
        Department.deleteMany({}),
        CSRCategory.deleteMany({}),
        ChallengeCategory.deleteMany({}),
        EmissionFactor.deleteMany({}),
        EnvironmentalGoal.deleteMany({}),
        Policy.deleteMany({}),
        Badge.deleteMany({}),
        Reward.deleteMany({}),
        CarbonTransaction.deleteMany({}),
        CSRActivity.deleteMany({}),
        Employee.deleteMany({}),
        EmployeeParticipation.deleteMany({}),
        Challenge.deleteMany({}),
        ChallengeParticipation.deleteMany({}),
        PolicyAcknowledgement.deleteMany({}),
        Audit.deleteMany({}),
        ComplianceIssue.deleteMany({}),
        ESGConfig.deleteMany({}),
        EmployeeBadge.deleteMany({}),
        RewardRedemption.deleteMany({}),
        DiversityMetric.deleteMany({}),
        TrainingRecord.deleteMany({})
      ]);

      console.log('Collections cleared. Inserting seed data...');

      // Seed all
      for (const col of collectionsToSeed) {
        await (col.model as any).insertMany(col.data);
        console.log(`Seeded ${col.data.length} ${col.name}`);
      }

      // Seed ESGConfig singleton
      await ESGConfig.create({
        _id: new mongoose.Types.ObjectId('60d5ec4f1f1f1f1f1f1f9999'),
        ...esgConfigData
      });
      console.log('Seeded ESGConfig singleton');

    } else {
      console.log('SEED_RESET is false. Upserting seed data...');

      // Upsert all
      for (const col of collectionsToSeed) {
        let count = 0;
        for (const item of col.data) {
          await (col.model as any).updateOne({ _id: item._id }, { $set: item }, { upsert: true });
          count++;
        }
        console.log(`Upserted ${count} ${col.name}`);
      }

      // Upsert ESGConfig singleton
      await ESGConfig.updateOne(
        { _id: new mongoose.Types.ObjectId('60d5ec4f1f1f1f1f1f1f9999') },
        { $set: esgConfigData },
        { upsert: true }
      );
      console.log('Upserted ESGConfig singleton');
    }

    console.log('Seeding process finished successfully.');
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
};

runSeed();
