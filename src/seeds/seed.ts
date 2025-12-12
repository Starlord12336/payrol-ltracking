import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

// Import all schema models
import { payGrade } from '../payroll-configuration/models/payGrades.schema';
import { allowance } from '../payroll-configuration/models/allowance.schema';
import { taxRules } from '../payroll-configuration/models/taxRules.schema';
import { insuranceBrackets } from '../payroll-configuration/models/insuranceBrackets.schema';
import { payrollPolicies } from '../payroll-configuration/models/payrollPolicies.schema';
import { signingBonus } from '../payroll-configuration/models/signingBonus.schema';
import { payType } from '../payroll-configuration/models/payType.schema';
import { terminationAndResignationBenefits } from '../payroll-configuration/models/terminationAndResignationBenefits';
import { CompanyWideSettings } from '../payroll-configuration/models/CompanyWideSettings.schema';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole } from '../employee-profile/models/employee-system-role.schema';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

// Mock user IDs for testing (these should be valid ObjectIds)
const mockPayrollManagerId = new Types.ObjectId('507f1f77bcf86cd799439011');
const mockHRManagerId = new Types.ObjectId('507f1f77bcf86cd799439012');
const mockPayrollSpecialistId = new Types.ObjectId('507f1f77bcf86cd799439013');
const mockSystemAdminId = new Types.ObjectId('507f1f77bcf86cd799439014');
const mockLegalPolicyAdminId = new Types.ObjectId('507f1f77bcf86cd799439015');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get all models
  const payGradeModel = app.get<Model<any>>(getModelToken(payGrade.name));
  const allowanceModel = app.get<Model<any>>(getModelToken(allowance.name));
  const taxRulesModel = app.get<Model<any>>(getModelToken(taxRules.name));
  const insuranceBracketsModel = app.get<Model<any>>(
    getModelToken(insuranceBrackets.name),
  );
  const payrollPoliciesModel = app.get<Model<any>>(
    getModelToken(payrollPolicies.name),
  );
  const signingBonusModel = app.get<Model<any>>(
    getModelToken(signingBonus.name),
  );
  const payTypeModel = app.get<Model<any>>(getModelToken(payType.name));
  const terminationBenefitsModel = app.get<Model<any>>(
    getModelToken(terminationAndResignationBenefits.name),
  );
  const companySettingsModel = app.get<Model<any>>(
    getModelToken(CompanyWideSettings.name),
  );
  const employeeProfileModel = app.get<Model<any>>(
    getModelToken(EmployeeProfile.name),
  );
  const employeeSystemRoleModel = app.get<Model<any>>(
    getModelToken(EmployeeSystemRole.name),
  );

  console.log('🌱 Starting seed process...');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await payGradeModel.deleteMany({});
    await allowanceModel.deleteMany({});
    await taxRulesModel.deleteMany({});
    await insuranceBracketsModel.deleteMany({});
    await payrollPoliciesModel.deleteMany({});
    await signingBonusModel.deleteMany({});
    await payTypeModel.deleteMany({});
    await terminationBenefitsModel.deleteMany({});
    await companySettingsModel.deleteMany({});
    await employeeSystemRoleModel.deleteMany({});
    await employeeProfileModel.deleteMany({});

    // ========================== TEST USERS ==========================
    console.log('👥 Creating Test Users with Different Roles...');
    
    // 1. Payroll Manager
    const payrollManagerProfile = await employeeProfileModel.create({
      _id: mockPayrollManagerId,
      employeeNumber: 'EMP-PM-001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      fullName: 'Sarah Johnson',
      nationalId: '29001011234567',
      password: '$2b$10$6Dh6kRVsIXbsVHBkpRR1PuDLANJ0wNSl9pt9jMz0adajJ44eXNXjK',
      dateOfHire: new Date('2020-01-15'),
      workEmail: 'sarah.johnson@company.com',
      personalEmail: 'sarah.j@email.com',
      mobilePhone: '+20 100 123 4567',
      status: 'ACTIVE',
      contractType: 'FULL_TIME_CONTRACT',
      workType: 'FULL_TIME',
    });

    await employeeSystemRoleModel.create({
      _id: new Types.ObjectId(),
      employeeProfileId: mockPayrollManagerId,
      roles: [SystemRole.PAYROLL_MANAGER],
      permissions: [],
      isActive: true,
    });

    // 2. HR Manager
    const hrManagerProfile = await employeeProfileModel.create({
      _id: mockHRManagerId,
      employeeNumber: 'EMP-HR-001',
      firstName: 'Michael',
      lastName: 'Chen',
      fullName: 'Michael Chen',
      nationalId: '29002021234567',
      password: '$2b$10$6Dh6kRVsIXbsVHBkpRR1PuDLANJ0wNSl9pt9jMz0adajJ44eXNXjK',
      dateOfHire: new Date('2019-06-01'),
      workEmail: 'michael.chen@company.com',
      personalEmail: 'michael.c@email.com',
      mobilePhone: '+20 100 234 5678',
      status: 'ACTIVE',
      contractType: 'FULL_TIME_CONTRACT',
      workType: 'FULL_TIME',
    });

    await employeeSystemRoleModel.create({
      _id: new Types.ObjectId(),
      employeeProfileId: mockHRManagerId,
      roles: [SystemRole.HR_MANAGER],
      permissions: [],
      isActive: true,
    });

    // 3. Payroll Specialist
    const payrollSpecialistProfile = await employeeProfileModel.create({
      _id: mockPayrollSpecialistId,
      employeeNumber: 'EMP-PS-001',
      firstName: 'Emma',
      lastName: 'Williams',
      fullName: 'Emma Williams',
      nationalId: '29003031234567',
      password: '$2b$10$6Dh6kRVsIXbsVHBkpRR1PuDLANJ0wNSl9pt9jMz0adajJ44eXNXjK',
      dateOfHire: new Date('2021-03-10'),
      workEmail: 'emma.williams@company.com',
      personalEmail: 'emma.w@email.com',
      mobilePhone: '+20 100 345 6789',
      status: 'ACTIVE',
      contractType: 'FULL_TIME_CONTRACT',
      workType: 'FULL_TIME',
    });

    await employeeSystemRoleModel.create({
      _id: new Types.ObjectId(),
      employeeProfileId: mockPayrollSpecialistId,
      roles: [SystemRole.PAYROLL_SPECIALIST],
      permissions: [],
      isActive: true,
    });

    // 4. System Admin
    const systemAdminProfile = await employeeProfileModel.create({
      _id: mockSystemAdminId,
      employeeNumber: 'EMP-SA-001',
      firstName: 'David',
      lastName: 'Rodriguez',
      fullName: 'David Rodriguez',
      nationalId: '29004041234567',
      password: '$2b$10$6Dh6kRVsIXbsVHBkpRR1PuDLANJ0wNSl9pt9jMz0adajJ44eXNXjK',
      dateOfHire: new Date('2018-01-05'),
      workEmail: 'david.rodriguez@company.com',
      personalEmail: 'david.r@email.com',
      mobilePhone: '+20 100 456 7890',
      status: 'ACTIVE',
      contractType: 'FULL_TIME_CONTRACT',
      workType: 'FULL_TIME',
    });

    await employeeSystemRoleModel.create({
      _id: new Types.ObjectId(),
      employeeProfileId: mockSystemAdminId,
      roles: [SystemRole.SYSTEM_ADMIN],
      permissions: [],
      isActive: true,
    });

    // 5. Legal & Policy Admin
    const legalAdminProfile = await employeeProfileModel.create({
      _id: mockLegalPolicyAdminId,
      employeeNumber: 'EMP-LP-001',
      firstName: 'Sophia',
      lastName: 'Martinez',
      fullName: 'Sophia Martinez',
      nationalId: '29005051234567',
      password: '$2b$10$6Dh6kRVsIXbsVHBkpRR1PuDLANJ0wNSl9pt9jMz0adajJ44eXNXjK',
      dateOfHire: new Date('2020-09-01'),
      workEmail: 'sophia.martinez@company.com',
      personalEmail: 'sophia.m@email.com',
      mobilePhone: '+20 100 567 8901',
      status: 'ACTIVE',
      contractType: 'FULL_TIME_CONTRACT',
      workType: 'FULL_TIME',
    });

    await employeeSystemRoleModel.create({
      _id: new Types.ObjectId(),
      employeeProfileId: mockLegalPolicyAdminId,
      roles: [SystemRole.LEGAL_POLICY_ADMIN],
      permissions: [],
      isActive: true,
    });

    console.log('✅ Created 5 test users with roles:');
    console.log('   - Payroll Manager (sarah.johnson@company.com)');
    console.log('   - HR Manager (michael.chen@company.com)');
    console.log('   - Payroll Specialist (emma.williams@company.com)');
    console.log('   - System Admin (david.rodriguez@company.com)');
    console.log('   - Legal & Policy Admin (sophia.martinez@company.com)');

    // ========================== PAY GRADES ==========================
    console.log('💰 Seeding Pay Grades...');
    const payGrades = await payGradeModel.insertMany([
      // APPROVED items (for viewing and potential rejection)
      {
        grade: 'Junior Developer',
        baseSalary: 6000,
        grossSalary: 8000,
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-15'),
      },
      {
        grade: 'Mid-Level Developer',
        baseSalary: 12000,
        grossSalary: 16000,
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-15'),
      },
      {
        grade: 'Senior Developer',
        baseSalary: 20000,
        grossSalary: 28000,
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-15'),
      },
      // DRAFT items (for testing edit, delete, submit buttons)
      {
        grade: 'Executive Level',
        baseSalary: 40000,
        grossSalary: 60000,
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
      {
        grade: 'Team Lead',
        baseSalary: 25000,
        grossSalary: 35000,
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
      {
        grade: 'Principal Engineer',
        baseSalary: 35000,
        grossSalary: 50000,
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
      // REJECTED item (for historical reference)
      {
        grade: 'Intern Level - Rejected',
        baseSalary: 6000,
        grossSalary: 7000,
        status: 'rejected',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-02-01'),
      },
    ]);
    console.log(`✅ Created ${payGrades.length} pay grades`);

    // ========================== ALLOWANCES ==========================
    console.log('🎁 Seeding Allowances...');
    const allowances = await allowanceModel.insertMany([
      // APPROVED items
      {
        name: 'Transportation Allowance',
        amount: 500,
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-02-01'),
      },
      {
        name: 'Housing Allowance',
        amount: 2500,
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-02-01'),
      },
      {
        name: 'Annual Performance Bonus',
        amount: 5000,
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-10'),
      },
      // DRAFT items
      {
        name: 'Meal Vouchers',
        amount: 300,
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
      {
        name: 'Communication Allowance',
        amount: 400,
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
      {
        name: 'Education Allowance',
        amount: 1000,
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
      // REJECTED item
      {
        name: 'Gym Membership - Rejected',
        amount: 200,
        status: 'rejected',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-03-01'),
      },
    ]);
    console.log(`✅ Created ${allowances.length} allowances`);

    // ========================== TAX RULES ==========================
    console.log('📋 Seeding Tax Rules...');
    const taxes = await taxRulesModel.insertMany([
      // APPROVED items
      {
        name: 'Tax Exempt Bracket',
        description: 'No tax for income up to 15,000 EGP annually',
        rate: 0,
        minSalary: 0,
        maxSalary: 15000,
        taxRate: 0,
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-05'),
      },
      {
        name: 'Low Income Tax',
        description: '2.5% tax for 15,001 to 30,000 EGP',
        rate: 2.5,
        minSalary: 15001,
        maxSalary: 30000,
        taxRate: 2.5,
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-05'),
      },
      {
        name: 'Mid Income Tax',
        description: '10% tax for 30,001 to 45,000 EGP',
        rate: 10,
        minSalary: 30001,
        maxSalary: 45000,
        taxRate: 10,
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-05'),
      },
      // DRAFT items
      {
        name: 'Upper Mid Income Tax',
        description: '15% tax for 45,001 to 60,000 EGP',
        rate: 15,
        minSalary: 45001,
        maxSalary: 60000,
        taxRate: 15,
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
      {
        name: 'High Income Tax',
        description: '20% tax for 60,001 to 200,000 EGP',
        rate: 20,
        minSalary: 60001,
        maxSalary: 200000,
        taxRate: 20,
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
    ]);
    console.log(`✅ Created ${taxes.length} tax rules`);

    // ========================== INSURANCE BRACKETS ==========================
    console.log('🏥 Seeding Insurance Brackets...');
    const insurance = await insuranceBracketsModel.insertMany([
      // APPROVED items (note: these need HR_MANAGER approval)
      {
        name: 'Standard Social Insurance - Entry',
        minSalary: 0,
        maxSalary: 15000,
        employeeRate: 11,
        employeePercentage: 11,
        employerRate: 18.75,
        status: 'approved',
        createdBy: mockHRManagerId,
        approvedBy: mockHRManagerId,
        approvedAt: new Date('2024-01-20'),
      },
      {
        name: 'Standard Social Insurance - Mid',
        minSalary: 15001,
        maxSalary: 50000,
        employeeRate: 11,
        employeePercentage: 11,
        employerRate: 18.75,
        status: 'approved',
        createdBy: mockHRManagerId,
        approvedBy: mockHRManagerId,
        approvedAt: new Date('2024-01-20'),
      },
      {
        name: 'Basic Health Insurance',
        minSalary: 0,
        maxSalary: 100000,
        employeeRate: 1,
        employeePercentage: 1,
        employerRate: 4,
        status: 'approved',
        createdBy: mockHRManagerId,
        approvedBy: mockHRManagerId,
        approvedAt: new Date('2024-02-10'),
      },
      // DRAFT items
      {
        name: 'Enhanced Health Coverage',
        minSalary: 30000,
        maxSalary: 100000,
        employeeRate: 0.5,
        employeePercentage: 0.5,
        employerRate: 5,
        status: 'draft',
        createdBy: mockHRManagerId,
      },
      {
        name: 'Executive Social Insurance',
        minSalary: 50001,
        maxSalary: 150000,
        employeeRate: 12,
        employeePercentage: 12,
        employerRate: 19,
        status: 'draft',
        createdBy: mockHRManagerId,
      },
      // REJECTED item
      {
        name: 'Premium Health - Rejected',
        minSalary: 20000,
        maxSalary: 80000,
        employeeRate: 2,
        employeePercentage: 2,
        employerRate: 6,
        status: 'rejected',
        createdBy: mockHRManagerId,
        approvedBy: mockHRManagerId,
        approvedAt: new Date('2024-03-15'),
      },
    ]);
    console.log(`✅ Created ${insurance.length} insurance brackets`);

    // ========================== PAYROLL POLICIES ==========================
    console.log('📜 Seeding Payroll Policies...');
    const policies = await payrollPoliciesModel.insertMany([
      {
        policyName: 'Late Arrival Penalty',
        description: 'Deduction for late arrivals',
        policyType: 'Misconduct',
        applicability: 'All Employees',
        effectiveDate: new Date('2024-03-01'),
        ruleDefinition: {
          percentage: 5,
          fixedAmount: 0,
          thresholdAmount: 1,
        },
        status: 'approved',
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-02-28'),
      },
      {
        policyName: 'Full Time Performance Bonus',
        description: 'Quarterly bonus for full-time employees',
        policyType: 'Benefit',
        applicability: 'Full Time Employees',
        effectiveDate: new Date('2024-01-01'),
        ruleDefinition: {
          percentage: 10,
          fixedAmount: 0,
          thresholdAmount: 1,
        },
        status: 'approved',
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-15'),
      },
      {
        policyName: 'Part Time Allowance',
        description: 'Monthly allowance for part-time staff',
        policyType: 'Allowance',
        applicability: 'Part Time Employees',
        effectiveDate: new Date('2024-01-01'),
        ruleDefinition: {
          percentage: 0,
          fixedAmount: 2000,
          thresholdAmount: 1,
        },
        status: 'approved',
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-10'),
      },
      {
        policyName: 'Contractor Deduction Draft',
        description: 'Deduction policy for contractors',
        policyType: 'Deduction',
        applicability: 'Contractors',
        effectiveDate: new Date('2024-06-01'),
        ruleDefinition: {
          percentage: 3,
          fixedAmount: 500,
          thresholdAmount: 1,
        },
        status: 'draft',
      },
      {
        policyName: 'Leave Deduction Policy Draft',
        description: 'Deduction policy for unpaid leave',
        policyType: 'Leave',
        applicability: 'All Employees',
        effectiveDate: new Date('2024-04-01'),
        ruleDefinition: {
          percentage: 100,
          fixedAmount: 0,
          thresholdAmount: 1,
        },
        status: 'draft',
      },
    ]);
    console.log(`✅ Created ${policies.length} payroll policies`);

    // ========================== SIGNING BONUSES ==========================
    console.log('✍️ Seeding Signing Bonuses...');
    const bonuses = await signingBonusModel.insertMany([
      // APPROVED items
      {
        positionName: 'Software Engineer',
        amount: 10000,
        bonusType: 'onboarding',
        eligibilityCriteria: 'New hire with 2+ years experience',
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-25'),
      },
      {
        positionName: 'Senior Software Engineer',
        amount: 20000,
        bonusType: 'onboarding',
        eligibilityCriteria: 'New hire with 5+ years experience',
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-25'),
      },
      {
        positionName: 'Product Manager',
        amount: 25000,
        bonusType: 'onboarding',
        eligibilityCriteria: 'New hire with management experience',
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-02-05'),
      },
      // DRAFT items
      {
        positionName: 'Data Scientist',
        amount: 18000,
        bonusType: 'onboarding',
        eligibilityCriteria: 'New hire with ML/AI background',
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
      {
        positionName: 'DevOps Engineer',
        amount: 15000,
        bonusType: 'onboarding',
        eligibilityCriteria: 'New hire with cloud experience',
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
      {
        positionName: 'UI/UX Designer',
        amount: 12000,
        bonusType: 'onboarding',
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
    ]);
    console.log(`✅ Created ${bonuses.length} signing bonuses`);

    // ========================== PAY TYPES ==========================
    console.log('⏰ Seeding Pay Types...');
    const payTypes = await payTypeModel.insertMany([
      // APPROVED items
      {
        type: 'monthly',
        amount: 15000,
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-01'),
      },
      {
        type: 'weekly',
        amount: 8000,
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-01'),
      },
      {
        type: 'contract-based',
        amount: 25000,
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-15'),
      },
      // DRAFT items
      {
        type: 'daily',
        amount: 6500,
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
      {
        type: 'hourly',
        amount: 6000,
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
    ]);
    console.log(`✅ Created ${payTypes.length} pay types`);

    // ========================== TERMINATION BENEFITS ==========================
    console.log('🎯 Seeding Termination Benefits...');
    const termination = await terminationBenefitsModel.insertMany([
      // APPROVED items
      {
        name: 'Standard Severance Package',
        amount: 10000,
        terms: 'One month salary per year of service',
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-10'),
      },
      {
        name: 'End of Service Gratuity',
        amount: 15000,
        terms: 'As per Egyptian labor law Article 122',
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-10'),
      },
      {
        name: 'Leave Encashment',
        amount: 5000,
        terms: 'Payment for unused annual leave days',
        status: 'approved',
        createdBy: mockPayrollManagerId,
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-02-01'),
      },
      // DRAFT items
      {
        name: 'Notice Period Compensation',
        amount: 7000,
        terms: 'For employees waiving notice period',
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
      {
        name: 'Executive Retirement Package',
        amount: 25000,
        terms: 'Special package for C-level retirements',
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
      {
        name: 'Early Retirement Bonus',
        amount: 20000,
        terms: 'Applicable for employees retiring before 60',
        status: 'draft',
        createdBy: mockPayrollManagerId,
      },
    ]);
    console.log(`✅ Created ${termination.length} termination benefits`);

    // ========================== COMPANY SETTINGS ==========================
    console.log('⚙️ Seeding Company Settings...');
    const settings = await companySettingsModel.insertMany([
      {
        payDate: new Date('2024-01-25'),
        timeZone: 'Africa/Cairo',
        currency: 'EGP',
        status: 'approved',
        approvedBy: mockPayrollManagerId,
        approvedAt: new Date('2024-01-01'),
      },
      {
        payDate: new Date('2024-02-28'),
        timeZone: 'Africa/Cairo',
        currency: 'EGP',
        status: 'draft',
      },
      {
        payDate: new Date('2025-01-01'),
        timeZone: 'Africa/Cairo',
        currency: 'EGP',
        status: 'draft',
      },
    ]);
    console.log(`✅ Created ${settings.length} company settings`);
  } catch (error) {
    console.error('❌ Error during seed process:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
