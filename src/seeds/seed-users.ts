import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { EmployeeProfile, EmployeeProfileSchema } from '../employee-profile/models/employee-profile.schema';
import { Candidate, CandidateSchema } from '../employee-profile/models/candidate.schema';
import { EmployeeSystemRole, EmployeeSystemRoleSchema } from '../employee-profile/models/employee-system-role.schema';
import {
  SystemRole,
  EmployeeStatus,
  CandidateStatus,
  Gender,
  MaritalStatus,
  ContractType,
  WorkType,
} from '../employee-profile/enums/employee-profile.enums';

// MongoDB connection string - reads from .env file or uses default
// Make sure to set MONGODB_URI in your .env file
const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://emad_admin:VTleW62xq1Dpywdx@payroll-cluster-system.n3cu4rw.mongodb.net/';

interface UserCredentials {
  email: string;
  password: string;
  role: string;
  userType: 'employee' | 'candidate';
}

const credentials: UserCredentials[] = [];

async function seedUsers() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get models
    const EmployeeProfileModel = mongoose.model('EmployeeProfile', EmployeeProfileSchema);
    const CandidateModel = mongoose.model('Candidate', CandidateSchema);
    const EmployeeSystemRoleModel = mongoose.model('EmployeeSystemRole', EmployeeSystemRoleSchema);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing seed data...');
    await EmployeeProfileModel.deleteMany({ employeeNumber: { $regex: /^EMP-SEED-/ } });
    await CandidateModel.deleteMany({ candidateNumber: { $regex: /^CAND-SEED-/ } });
    await EmployeeSystemRoleModel.deleteMany({});
    console.log('Cleared existing seed data');

    // Hash password function
    const hashPassword = async (password: string): Promise<string> => {
      return await bcrypt.hash(password, 10);
    };

    const commonPassword = 'Password123!';
    const hashedPassword = await hashPassword(commonPassword);

    // 1. Create Candidate
    console.log('Creating Candidate...');
    const candidate = new CandidateModel({
      firstName: 'John',
      lastName: 'Candidate',
      fullName: 'John Candidate',
      nationalId: '10000000000001',
      password: hashedPassword,
      personalEmail: 'candidate@test.com',
      mobilePhone: '+201000000001',
      gender: Gender.MALE,
      maritalStatus: MaritalStatus.SINGLE,
      candidateNumber: 'CAND-SEED-001',
      applicationDate: new Date('2024-01-01'),
      status: CandidateStatus.APPLIED,
    });
    await candidate.save();
    credentials.push({
      email: 'candidate@test.com',
      password: commonPassword,
      role: 'Job Candidate',
      userType: 'candidate',
    });
    console.log('✓ Candidate created');

    // 2. Create Employees with different roles
    const employees = [
      {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'system.admin@test.com',
        employeeNumber: 'EMP-SEED-001',
        role: SystemRole.SYSTEM_ADMIN,
      },
      {
        firstName: 'HR',
        lastName: 'Administrator',
        email: 'hr.admin@test.com',
        employeeNumber: 'EMP-SEED-002',
        role: SystemRole.HR_ADMIN,
      },
      {
        firstName: 'HR',
        lastName: 'Manager',
        email: 'hr.manager@test.com',
        employeeNumber: 'EMP-SEED-003',
        role: SystemRole.HR_MANAGER,
      },
      {
        firstName: 'HR',
        lastName: 'Employee',
        email: 'hr.employee@test.com',
        employeeNumber: 'EMP-SEED-004',
        role: SystemRole.HR_EMPLOYEE,
      },
      {
        firstName: 'Department',
        lastName: 'Head',
        email: 'dept.head@test.com',
        employeeNumber: 'EMP-SEED-005',
        role: SystemRole.DEPARTMENT_HEAD,
      },
      {
        firstName: 'Department',
        lastName: 'Employee',
        email: 'dept.employee@test.com',
        employeeNumber: 'EMP-SEED-006',
        role: SystemRole.DEPARTMENT_EMPLOYEE,
      },
      {
        firstName: 'Payroll',
        lastName: 'Specialist',
        email: 'payroll.specialist@test.com',
        employeeNumber: 'EMP-SEED-007',
        role: SystemRole.PAYROLL_SPECIALIST,
      },
      {
        firstName: 'Payroll',
        lastName: 'Manager',
        email: 'payroll.manager@test.com',
        employeeNumber: 'EMP-SEED-008',
        role: SystemRole.PAYROLL_MANAGER,
      },
      {
        firstName: 'Recruiter',
        lastName: 'User',
        email: 'recruiter@test.com',
        employeeNumber: 'EMP-SEED-009',
        role: SystemRole.RECRUITER,
      },
      {
        firstName: 'Finance',
        lastName: 'Staff',
        email: 'finance.staff@test.com',
        employeeNumber: 'EMP-SEED-010',
        role: SystemRole.FINANCE_STAFF,
      },
      {
        firstName: 'Legal',
        lastName: 'Policy Admin',
        email: 'legal.admin@test.com',
        employeeNumber: 'EMP-SEED-011',
        role: SystemRole.LEGAL_POLICY_ADMIN,
      },
    ];

    console.log('Creating Employees...');
    for (const empData of employees) {
      const employee = new EmployeeProfileModel({
        firstName: empData.firstName,
        lastName: empData.lastName,
        fullName: `${empData.firstName} ${empData.lastName}`,
        nationalId: `2000000000${employees.indexOf(empData) + 1}`.padStart(14, '0'),
        password: hashedPassword,
        personalEmail: empData.email,
        workEmail: empData.email,
        mobilePhone: `+2010000000${String(employees.indexOf(empData) + 2).padStart(2, '0')}`,
        gender: Gender.MALE,
        maritalStatus: MaritalStatus.SINGLE,
        employeeNumber: empData.employeeNumber,
        dateOfHire: new Date('2024-01-01'),
        status: EmployeeStatus.ACTIVE,
        statusEffectiveFrom: new Date('2024-01-01'),
        contractType: ContractType.FULL_TIME_CONTRACT,
        workType: WorkType.FULL_TIME,
      });

      const savedEmployee = await employee.save();

      // Create EmployeeSystemRole
      const systemRole = new EmployeeSystemRoleModel({
        employeeProfileId: savedEmployee._id,
        roles: [empData.role],
        permissions: [],
        isActive: true,
      });
      await systemRole.save();

      credentials.push({
        email: empData.email,
        password: commonPassword,
        role: empData.role,
        userType: 'employee',
      });

      console.log(`✓ ${empData.role} created: ${empData.email}`);
    }

    console.log('\n=== SEEDING COMPLETE ===\n');
    console.log('All users created with password: Password123!\n');
    console.log('=== USER CREDENTIALS ===\n');
    credentials.forEach((cred, index) => {
      console.log(`${index + 1}. ${cred.role}`);
      console.log(`   Email: ${cred.email}`);
      console.log(`   Password: ${cred.password}`);
      console.log(`   Type: ${cred.userType}\n`);
    });

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seed
seedUsers();

