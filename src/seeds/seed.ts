import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

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
import { Department } from '../organization-structure/models/department.schema';
import { Position } from '../organization-structure/models/position.schema';

// Mock user IDs for testing (these should be valid ObjectIds)
const mockPayrollManagerId = new Types.ObjectId('507f1f77bcf86cd799439011');
const mockHRManagerId = new Types.ObjectId('507f1f77bcf86cd799439012');
const mockHRAdminId = new Types.ObjectId('507f1f77bcf86cd799439016');
const mockHREmployeeId = new Types.ObjectId('507f1f77bcf86cd799439017');
const mockPayrollSpecialistId = new Types.ObjectId('507f1f77bcf86cd799439013');
const mockSystemAdminId = new Types.ObjectId('507f1f77bcf86cd799439014');
const mockLegalPolicyAdminId = new Types.ObjectId('507f1f77bcf86cd799439015');

// Common password for all seeded users
const COMMON_PASSWORD = 'Racker123';

// Pre-hashed password (hash of 'Racker123')
const HASHED_PASSWORD = '$2b$10$gFHt6qGTx6BL52ttdFkTNeeHDP8Fhajz94ypENk/Hymgq8An4N3u6';

// Store credentials for file generation
interface UserCredential {
  email: string;
  password: string;
  role: string;
  name: string;
  department?: string;
}

const credentials: UserCredential[] = [];

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
  const departmentModel = app.get<Model<any>>(
    getModelToken(Department.name),
  );
  const positionModel = app.get<Model<any>>(
    getModelToken(Position.name),
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
    // Note: We don't delete employee profiles or system roles to preserve existing users
    // The seed will update existing HR employees or create them if they don't exist
    // await employeeSystemRoleModel.deleteMany({});
    // await employeeProfileModel.deleteMany({});
    // Note: We don't delete departments/positions to preserve HR department
    // await departmentModel.deleteMany({});
    // await positionModel.deleteMany({});

    // ========================== TEST USERS ==========================
    console.log('👥 Creating Test Users with Different Roles...');
    
    // 1. Payroll Manager
    let payrollManagerProfile = await employeeProfileModel.findById(mockPayrollManagerId);
    if (!payrollManagerProfile) {
      payrollManagerProfile = await employeeProfileModel.create({
        _id: mockPayrollManagerId,
        employeeNumber: 'EMP-PM-001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        fullName: 'Sarah Johnson',
        nationalId: '29001011234567',
        password: HASHED_PASSWORD,
        dateOfHire: new Date('2020-01-15'),
        workEmail: 'sarah.johnson@company.com',
        personalEmail: 'sarah.j@email.com',
        mobilePhone: '+20 100 123 4567',
        status: 'ACTIVE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
      });
      console.log('   ✓ Created Payroll Manager profile');
    } else {
      console.log('   ✓ Payroll Manager profile already exists');
    }

    // Ensure Payroll Manager has the correct system role
    let payrollManagerRole = await employeeSystemRoleModel.findOne({
      employeeProfileId: mockPayrollManagerId,
    });
    if (!payrollManagerRole) {
      await employeeSystemRoleModel.create({
        _id: new Types.ObjectId(),
        employeeProfileId: mockPayrollManagerId,
        roles: [SystemRole.PAYROLL_MANAGER],
        permissions: [],
        isActive: true,
      });
      console.log('   ✓ Created Payroll Manager system role');
    } else {
      console.log('   ✓ Payroll Manager system role already exists');
    }

    // ========== SETUP HR DEPARTMENT AND POSITIONS FIRST ==========
    console.log('🏢 Setting up HR Department and Positions...');
    
    // 1. Ensure HR department exists
    let hrDepartment = await departmentModel.findOne({ code: 'HR' });
    if (!hrDepartment) {
      hrDepartment = await departmentModel.create({
        code: 'HR',
        name: 'Human Resources',
        description: 'Default HR department',
        isActive: true,
      });
      console.log('   ✓ Created HR department');
    } else {
      // Ensure HR department is active
      if (!hrDepartment.isActive) {
        await departmentModel.findByIdAndUpdate(hrDepartment._id, { isActive: true });
        hrDepartment.isActive = true;
      }
      console.log('   ✓ HR department already exists');
    }

    // 2. Create or get HR Manager position in HR department
    let hrManagerPosition = await positionModel.findOne({ 
      code: 'HR-MGR-001',
      departmentId: hrDepartment._id 
    });
    
    if (!hrManagerPosition) {
      // Use findOneAndUpdate with upsert to avoid pre-hook issues
      hrManagerPosition = await positionModel.findOneAndUpdate(
        { code: 'HR-MGR-001', departmentId: hrDepartment._id },
        {
          code: 'HR-MGR-001',
          title: 'HR Manager',
          description: 'Human Resources Manager position',
          departmentId: hrDepartment._id,
          isActive: true,
        },
        { upsert: true, new: true, runValidators: false }
      );
      console.log('   ✓ Created HR Manager position');
    } else {
      // Ensure position is active
      if (!hrManagerPosition.isActive) {
        await positionModel.findByIdAndUpdate(hrManagerPosition._id, { isActive: true });
        hrManagerPosition.isActive = true;
      }
      console.log('   ✓ HR Manager position already exists');
    }

    // 3. Set HR Manager position as head of HR department
    if (!hrDepartment.headPositionId || 
        hrDepartment.headPositionId.toString() !== hrManagerPosition._id.toString()) {
      hrDepartment.headPositionId = hrManagerPosition._id;
      await hrDepartment.save();
      console.log('   ✓ Set HR Manager as head of HR department');
    }

    // ========== HR MANAGER ==========
    console.log('👔 Creating HR Manager...');
    
    // Create/update HR Manager profile with department and position
    let hrManagerProfile = await employeeProfileModel.findById(mockHRManagerId);
    if (!hrManagerProfile) {
      // Create with department and position already set
      hrManagerProfile = await employeeProfileModel.create({
        _id: mockHRManagerId,
        employeeNumber: 'EMP-HR-001',
        firstName: 'Michael',
        lastName: 'Chen',
        fullName: 'Michael Chen',
        nationalId: '29002021234567',
        password: HASHED_PASSWORD,
        dateOfHire: new Date('2019-06-01'),
        workEmail: 'michael.chen@company.com',
        personalEmail: 'michael.c@email.com',
        mobilePhone: '+20 100 234 5678',
        status: 'ACTIVE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        primaryDepartmentId: hrDepartment._id,
        primaryPositionId: hrManagerPosition._id,
      });
      console.log('   ✓ Created HR Manager profile with department and position');
      console.log(`   ✓ HR Manager primaryDepartmentId: ${hrManagerProfile.primaryDepartmentId}`);
      console.log(`   ✓ HR Manager primaryPositionId: ${hrManagerProfile.primaryPositionId}`);
    } else {
      // Update existing profile with department and position
      const hrManagerUpdateResult = await employeeProfileModel.findByIdAndUpdate(
        mockHRManagerId,
        {
          primaryDepartmentId: hrDepartment._id,
          primaryPositionId: hrManagerPosition._id,
        },
        { new: true }
      );
      if (hrManagerUpdateResult) {
        console.log('   ✓ Updated HR Manager profile with department and position');
        console.log(`   ✓ HR Manager primaryDepartmentId: ${hrManagerUpdateResult.primaryDepartmentId}`);
        console.log(`   ✓ HR Manager primaryPositionId: ${hrManagerUpdateResult.primaryPositionId}`);
      } else {
        console.warn('   ⚠ Could not update HR Manager department assignment');
      }
    }

    // Ensure HR Manager has the correct system role
    let hrManagerRole = await employeeSystemRoleModel.findOne({
      employeeProfileId: mockHRManagerId,
    });
    if (!hrManagerRole) {
      await employeeSystemRoleModel.create({
        _id: new Types.ObjectId(),
        employeeProfileId: mockHRManagerId,
        roles: [SystemRole.HR_MANAGER],
        permissions: [],
        isActive: true,
      });
      console.log('   ✓ Created HR Manager system role');
    } else {
      // Update role if it doesn't include HR_MANAGER
      if (!hrManagerRole.roles.includes(SystemRole.HR_MANAGER)) {
        hrManagerRole.roles = [...(hrManagerRole.roles || []), SystemRole.HR_MANAGER];
        await hrManagerRole.save();
        console.log('   ✓ Updated HR Manager system role');
      } else {
        console.log('   ✓ HR Manager system role already correct');
      }
    }
    
    // Store credentials
    credentials.push({
      email: 'michael.chen@company.com',
      password: COMMON_PASSWORD,
      role: 'HR Manager',
      name: 'Michael Chen',
      department: 'HR Department',
    });

    // ========== HR ADMIN ==========
    console.log('👔 Creating HR Admin...');
    
    // Create or get HR Admin position (reports to HR Manager)
    let hrAdminPosition = await positionModel.findOne({
      code: 'HR-ADM-001',
      departmentId: hrDepartment._id,
    });

    if (!hrAdminPosition) {
      // Use findOneAndUpdate with upsert to avoid pre-hook issues
      hrAdminPosition = await positionModel.findOneAndUpdate(
        { code: 'HR-ADM-001', departmentId: hrDepartment._id },
        {
          code: 'HR-ADM-001',
          title: 'HR Administrator',
          description: 'Human Resources Administrator position',
          departmentId: hrDepartment._id,
          reportsToPositionId: hrManagerPosition._id, // Reports to HR Manager
          isActive: true,
        },
        { upsert: true, new: true, runValidators: false }
      );
      console.log('   ✓ Created HR Admin position');
    } else {
      if (!hrAdminPosition.isActive) {
        hrAdminPosition.isActive = true;
        await hrAdminPosition.save();
      }
      // Ensure reporting relationship
      if (!hrAdminPosition.reportsToPositionId || 
          hrAdminPosition.reportsToPositionId.toString() !== hrManagerPosition._id.toString()) {
        hrAdminPosition.reportsToPositionId = hrManagerPosition._id;
        await hrAdminPosition.save();
      }
      console.log('   ✓ HR Admin position already exists');
    }
    
    let hrAdminProfile = await employeeProfileModel.findById(mockHRAdminId);
    if (!hrAdminProfile) {
      // Create with department and position already set
      hrAdminProfile = await employeeProfileModel.create({
        _id: mockHRAdminId,
        employeeNumber: 'EMP-HR-ADM-001',
        firstName: 'Sarah',
        lastName: 'Anderson',
        fullName: 'Sarah Anderson',
        nationalId: '29002031234567',
        password: HASHED_PASSWORD,
        dateOfHire: new Date('2020-03-15'),
        workEmail: 'sarah.anderson@company.com',
        personalEmail: 'sarah.a@email.com',
        mobilePhone: '+20 100 234 5679',
        status: 'ACTIVE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        primaryDepartmentId: hrDepartment._id,
        primaryPositionId: hrAdminPosition._id,
      });
      console.log('   ✓ Created HR Admin profile with department and position');
    } else {
      // Update existing profile with department and position
      const hrAdminUpdateResult = await employeeProfileModel.findByIdAndUpdate(
        mockHRAdminId,
        {
          primaryDepartmentId: hrDepartment._id,
          primaryPositionId: hrAdminPosition._id,
        },
        { new: true }
      );
      if (hrAdminUpdateResult) {
        console.log('   ✓ Updated HR Admin profile with department and position');
        console.log(`   ✓ HR Admin primaryDepartmentId: ${hrAdminUpdateResult.primaryDepartmentId}`);
        console.log(`   ✓ HR Admin primaryPositionId: ${hrAdminUpdateResult.primaryPositionId}`);
      } else {
        console.warn('   ⚠ Could not update HR Admin department assignment');
      }
    }

    // Ensure HR Admin has the correct system role
    let hrAdminRole = await employeeSystemRoleModel.findOne({
      employeeProfileId: mockHRAdminId,
    });
    if (!hrAdminRole) {
      await employeeSystemRoleModel.create({
        _id: new Types.ObjectId(),
        employeeProfileId: mockHRAdminId,
        roles: [SystemRole.HR_ADMIN],
        permissions: [],
        isActive: true,
      });
      console.log('   ✓ Created HR Admin system role');
    } else {
      // Update role if it doesn't include HR_ADMIN
      if (!hrAdminRole.roles.includes(SystemRole.HR_ADMIN)) {
        hrAdminRole.roles = [...(hrAdminRole.roles || []), SystemRole.HR_ADMIN];
        await hrAdminRole.save();
        console.log('   ✓ Updated HR Admin system role');
      } else {
        console.log('   ✓ HR Admin system role already correct');
      }
    }

    // Store credentials
    credentials.push({
      email: 'sarah.anderson@company.com',
      password: COMMON_PASSWORD,
      role: 'HR Admin',
      name: 'Sarah Anderson',
      department: 'HR Department',
    });

    // ========== HR EMPLOYEE ==========
    console.log('👤 Creating HR Employee...');
    
    // Create or get HR Employee position (reports to HR Manager)
    let hrEmployeePosition = await positionModel.findOne({
      code: 'HR-EMP-001',
      departmentId: hrDepartment._id,
    });

    if (!hrEmployeePosition) {
      // Use findOneAndUpdate with upsert to avoid pre-hook issues
      hrEmployeePosition = await positionModel.findOneAndUpdate(
        { code: 'HR-EMP-001', departmentId: hrDepartment._id },
        {
          code: 'HR-EMP-001',
          title: 'HR Specialist',
          description: 'Human Resources Specialist position',
          departmentId: hrDepartment._id,
          reportsToPositionId: hrManagerPosition._id, // Reports to HR Manager
          isActive: true,
        },
        { upsert: true, new: true, runValidators: false }
      );
      console.log('   ✓ Created HR Employee position');
    } else {
      if (!hrEmployeePosition.isActive) {
        hrEmployeePosition.isActive = true;
        await hrEmployeePosition.save();
      }
      // Ensure reporting relationship
      if (!hrEmployeePosition.reportsToPositionId || 
          hrEmployeePosition.reportsToPositionId.toString() !== hrManagerPosition._id.toString()) {
        hrEmployeePosition.reportsToPositionId = hrManagerPosition._id;
        await hrEmployeePosition.save();
      }
      console.log('   ✓ HR Employee position already exists');
    }
    
    let hrEmployeeProfile = await employeeProfileModel.findById(mockHREmployeeId);
    if (!hrEmployeeProfile) {
      // Create with department and position already set
      hrEmployeeProfile = await employeeProfileModel.create({
        _id: mockHREmployeeId,
        employeeNumber: 'EMP-HR-EMP-001',
        firstName: 'David',
        lastName: 'Kim',
        fullName: 'David Kim',
        nationalId: '29002041234567',
        password: HASHED_PASSWORD,
        dateOfHire: new Date('2021-06-01'),
        workEmail: 'david.kim@company.com',
        personalEmail: 'david.k@email.com',
        mobilePhone: '+20 100 234 5680',
        status: 'ACTIVE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        primaryDepartmentId: hrDepartment._id,
        primaryPositionId: hrEmployeePosition._id,
      });
      console.log('   ✓ Created HR Employee profile with department and position');
    } else {
      // Update existing profile with department and position
      const hrEmployeeUpdateResult = await employeeProfileModel.findByIdAndUpdate(
        mockHREmployeeId,
        {
          primaryDepartmentId: hrDepartment._id,
          primaryPositionId: hrEmployeePosition._id,
        },
        { new: true }
      );
      if (hrEmployeeUpdateResult) {
        console.log('   ✓ Updated HR Employee profile with department and position');
        console.log(`   ✓ HR Employee primaryDepartmentId: ${hrEmployeeUpdateResult.primaryDepartmentId}`);
        console.log(`   ✓ HR Employee primaryPositionId: ${hrEmployeeUpdateResult.primaryPositionId}`);
      } else {
        console.warn('   ⚠ Could not update HR Employee department assignment');
      }
    }

    // Ensure HR Employee has the correct system role
    let hrEmployeeRole = await employeeSystemRoleModel.findOne({
      employeeProfileId: mockHREmployeeId,
    });
    if (!hrEmployeeRole) {
      await employeeSystemRoleModel.create({
        _id: new Types.ObjectId(),
        employeeProfileId: mockHREmployeeId,
        roles: [SystemRole.HR_EMPLOYEE],
        permissions: [],
        isActive: true,
      });
      console.log('   ✓ Created HR Employee system role');
    } else {
      // Update role if it doesn't include HR_EMPLOYEE
      if (!hrEmployeeRole.roles.includes(SystemRole.HR_EMPLOYEE)) {
        hrEmployeeRole.roles = [...(hrEmployeeRole.roles || []), SystemRole.HR_EMPLOYEE];
        await hrEmployeeRole.save();
        console.log('   ✓ Updated HR Employee system role');
      } else {
        console.log('   ✓ HR Employee system role already correct');
      }
    }

    // Store credentials
    credentials.push({
      email: 'david.kim@company.com',
      password: COMMON_PASSWORD,
      role: 'HR Employee',
      name: 'David Kim',
      department: 'HR Department',
    });

    // Sync roles for all HR employees to ensure organizational roles are assigned
    console.log('🔄 Syncing HR employee roles...');
    try {
      const { OrganizationStructureService } = await import('../organization-structure/organization-structure.service');
      const orgStructureService = app.get(OrganizationStructureService);
      
      await orgStructureService.syncEmployeeRoles(mockHRManagerId.toString());
      await orgStructureService.syncEmployeeRoles(mockHRAdminId.toString());
      await orgStructureService.syncEmployeeRoles(mockHREmployeeId.toString());
      console.log('   ✓ Synced roles for all HR employees (DEPARTMENT_HEAD for Manager, DEPARTMENT_EMPLOYEE for Admin and Employee)');
    } catch (error) {
      console.warn('   ⚠ Could not sync roles automatically:', error.message);
      console.log('   ℹ️  Roles will be auto-synced on next login or profile update');
    }

    console.log('✅ Created 3 HR employees:');
    console.log('   - HR Manager (michael.chen@company.com)');
    console.log('   - HR Admin (sarah.anderson@company.com)');
    console.log('   - HR Employee (david.kim@company.com)');

    // 3. Payroll Specialist
    let payrollSpecialistProfile = await employeeProfileModel.findById(mockPayrollSpecialistId);
    if (!payrollSpecialistProfile) {
      payrollSpecialistProfile = await employeeProfileModel.create({
        _id: mockPayrollSpecialistId,
        employeeNumber: 'EMP-PS-001',
        firstName: 'Emma',
        lastName: 'Williams',
        fullName: 'Emma Williams',
        nationalId: '29003031234567',
        password: HASHED_PASSWORD,
        dateOfHire: new Date('2021-03-10'),
        workEmail: 'emma.williams@company.com',
        personalEmail: 'emma.w@email.com',
        mobilePhone: '+20 100 345 6789',
        status: 'ACTIVE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
      });
      console.log('   ✓ Created Payroll Specialist profile');
    } else {
      console.log('   ✓ Payroll Specialist profile already exists');
    }

    let payrollSpecialistRole = await employeeSystemRoleModel.findOne({
      employeeProfileId: mockPayrollSpecialistId,
    });
    if (!payrollSpecialistRole) {
      await employeeSystemRoleModel.create({
        _id: new Types.ObjectId(),
        employeeProfileId: mockPayrollSpecialistId,
        roles: [SystemRole.PAYROLL_SPECIALIST],
        permissions: [],
        isActive: true,
      });
      console.log('   ✓ Created Payroll Specialist system role');
    } else {
      console.log('   ✓ Payroll Specialist system role already exists');
    }
    
    // Store credentials
    credentials.push({
      email: 'emma.williams@company.com',
      password: COMMON_PASSWORD,
      role: 'Payroll Specialist',
      name: 'Emma Williams',
    });

    // 4. System Admin
    let systemAdminProfile = await employeeProfileModel.findById(mockSystemAdminId);
    if (!systemAdminProfile) {
      systemAdminProfile = await employeeProfileModel.create({
        _id: mockSystemAdminId,
        employeeNumber: 'EMP-SA-001',
        firstName: 'David',
        lastName: 'Rodriguez',
        fullName: 'David Rodriguez',
        nationalId: '29004041234567',
        password: HASHED_PASSWORD,
        dateOfHire: new Date('2018-01-05'),
        workEmail: 'david.rodriguez@company.com',
        personalEmail: 'david.r@email.com',
        mobilePhone: '+20 100 456 7890',
        status: 'ACTIVE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
      });
      console.log('   ✓ Created System Admin profile');
    } else {
      console.log('   ✓ System Admin profile already exists');
    }

    let systemAdminRole = await employeeSystemRoleModel.findOne({
      employeeProfileId: mockSystemAdminId,
    });
    if (!systemAdminRole) {
      await employeeSystemRoleModel.create({
        _id: new Types.ObjectId(),
        employeeProfileId: mockSystemAdminId,
        roles: [SystemRole.SYSTEM_ADMIN],
        permissions: [],
        isActive: true,
      });
      console.log('   ✓ Created System Admin system role');
    } else {
      console.log('   ✓ System Admin system role already exists');
    }
    
    // Store credentials
    credentials.push({
      email: 'david.rodriguez@company.com',
      password: COMMON_PASSWORD,
      role: 'System Admin',
      name: 'David Rodriguez',
    });

    // 5. Legal & Policy Admin
    let legalAdminProfile = await employeeProfileModel.findById(mockLegalPolicyAdminId);
    if (!legalAdminProfile) {
      legalAdminProfile = await employeeProfileModel.create({
        _id: mockLegalPolicyAdminId,
        employeeNumber: 'EMP-LP-001',
        firstName: 'Sophia',
        lastName: 'Martinez',
        fullName: 'Sophia Martinez',
        nationalId: '29005051234567',
        password: HASHED_PASSWORD,
        dateOfHire: new Date('2020-09-01'),
        workEmail: 'sophia.martinez@company.com',
        personalEmail: 'sophia.m@email.com',
        mobilePhone: '+20 100 567 8901',
        status: 'ACTIVE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
      });
      console.log('   ✓ Created Legal & Policy Admin profile');
    } else {
      console.log('   ✓ Legal & Policy Admin profile already exists');
    }
    
    let legalAdminRole = await employeeSystemRoleModel.findOne({
      employeeProfileId: mockLegalPolicyAdminId,
    });
    if (!legalAdminRole) {
      await employeeSystemRoleModel.create({
        _id: new Types.ObjectId(),
        employeeProfileId: mockLegalPolicyAdminId,
        roles: [SystemRole.LEGAL_POLICY_ADMIN],
        permissions: [],
        isActive: true,
      });
      console.log('   ✓ Created Legal & Policy Admin system role');
    } else {
      console.log('   ✓ Legal & Policy Admin system role already exists');
    }
    
    // Store credentials
    credentials.push({
      email: 'sophia.martinez@company.com',
      password: COMMON_PASSWORD,
      role: 'Legal & Policy Admin',
      name: 'Sophia Martinez',
    });

    await employeeSystemRoleModel.create({
      _id: new Types.ObjectId(),
      employeeProfileId: mockLegalPolicyAdminId,
      roles: [SystemRole.LEGAL_POLICY_ADMIN],
      permissions: [],
      isActive: true,
    });

    console.log('✅ Created test users with roles:');
    console.log('   HR Department:');
    console.log('     - HR Manager (michael.chen@company.com)');
    console.log('     - HR Admin (sarah.anderson@company.com)');
    console.log('     - HR Employee (david.kim@company.com)');
    console.log('   Other Roles:');
    console.log('     - Payroll Manager (sarah.johnson@company.com)');
    console.log('     - Payroll Specialist (emma.williams@company.com)');
    console.log('     - System Admin (david.rodriguez@company.com)');
    console.log('     - Legal & Policy Admin (sophia.martinez@company.com)');

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
    // Generate credentials file
    await generateCredentialsFile(credentials);
    await app.close();
  }
}

async function generateCredentialsFile(creds: UserCredential[]) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `SEED_CREDENTIALS_${timestamp}.md`;
    const filePath = path.join(process.cwd(), fileName);

    let content = '# Seeded User Credentials\n\n';
    content += `Generated on: ${new Date().toLocaleString()}\n\n`;
    content += `**All users have the same password:** \`${COMMON_PASSWORD}\`\n\n`;
    content += '---\n\n';

    // Group by department
    const hrUsers = creds.filter(c => c.department === 'HR Department');
    const otherUsers = creds.filter(c => !c.department);

    if (hrUsers.length > 0) {
      content += '## HR Department Users\n\n';
      hrUsers.forEach((cred, index) => {
        content += `### ${index + 1}. ${cred.role}\n`;
        content += `- **Name:** ${cred.name}\n`;
        content += `- **Email:** \`${cred.email}\`\n`;
        content += `- **Password:** \`${cred.password}\`\n`;
        content += `- **Role:** ${cred.role}\n`;
        content += `- **Department:** ${cred.department}\n\n`;
      });
    }

    if (otherUsers.length > 0) {
      content += '## Other Users\n\n';
      otherUsers.forEach((cred, index) => {
        content += `### ${index + 1}. ${cred.role}\n`;
        content += `- **Name:** ${cred.name}\n`;
        content += `- **Email:** \`${cred.email}\`\n`;
        content += `- **Password:** \`${cred.password}\`\n`;
        content += `- **Role:** ${cred.role}\n\n`;
      });
    }

    content += '---\n\n';
    content += '## Quick Reference\n\n';
    content += '| Role | Email | Password |\n';
    content += '|------|-------|----------|\n';
    creds.forEach(cred => {
      content += `| ${cred.role} | ${cred.email} | ${cred.password} |\n`;
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`\n✅ Credentials file generated: ${fileName}`);
    console.log(`📄 File location: ${filePath}\n`);
  } catch (error) {
    console.error('⚠️  Could not generate credentials file:', error);
  }
}

bootstrap();
