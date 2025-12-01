/**
 * Dummy Data Seed for Milestone 1 Integration Testing
 * 
 * This file contains all the dummy data needed to test integration
 * between Employee Profile, Organization Structure, and Performance modules.
 */

import { Types } from 'mongoose';

// Helper to create ObjectIds
const id = (suffix: string) => new Types.ObjectId(suffix.padStart(24, '0'));

export const dummyData = {
  // =======================================
  // USERS (Authentication)
  // =======================================
  users: [
    {
      _id: id('user001'),
      email: 'admin@company.com',
      passwordHash: '$2b$10$YourHashedPasswordHere', // Hash "password123" in real implementation
      role: 'SYSTEM_ADMIN',
      employeeId: id('emp001'),
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      _id: id('user002'),
      email: 'hr.manager@company.com',
      passwordHash: '$2b$10$YourHashedPasswordHere',
      role: 'HR_MANAGER',
      employeeId: id('emp002'),
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      _id: id('user003'),
      email: 'mohamed.ali@company.com',
      passwordHash: '$2b$10$YourHashedPasswordHere',
      role: 'DEPARTMENT_MANAGER',
      employeeId: id('emp003'),
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      _id: id('user004'),
      email: 'ahmed.hassan@company.com',
      passwordHash: '$2b$10$YourHashedPasswordHere',
      role: 'EMPLOYEE',
      employeeId: id('emp004'),
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      _id: id('user005'),
      email: 'sara.ali@company.com',
      passwordHash: '$2b$10$YourHashedPasswordHere',
      role: 'EMPLOYEE',
      employeeId: id('emp005'),
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ],

  // =======================================
  // DEPARTMENTS
  // =======================================
  departments: [
    {
      _id: id('dept001'),
      departmentCode: 'ENG',
      departmentName: 'Engineering',
      description: 'Software Development and IT Operations',
      departmentHeadId: id('emp003'),
      costCenter: 'CC-1000',
      isActive: true,
      effectiveDate: new Date('2023-01-01'),
      createdBy: id('user001'),
      updatedBy: id('user001'),
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      _id: id('dept002'),
      departmentCode: 'HR',
      departmentName: 'Human Resources',
      description: 'HR Operations and Management',
      departmentHeadId: id('emp002'),
      costCenter: 'CC-2000',
      isActive: true,
      effectiveDate: new Date('2023-01-01'),
      createdBy: id('user001'),
      updatedBy: id('user001'),
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      _id: id('dept003'),
      departmentCode: 'FIN',
      departmentName: 'Finance',
      description: 'Financial Planning and Analysis',
      isActive: true,
      effectiveDate: new Date('2023-01-01'),
      createdBy: id('user001'),
      updatedBy: id('user001'),
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
  ],

  // =======================================
  // POSITIONS
  // =======================================
  positions: [
    {
      _id: id('pos001'),
      positionCode: 'ENG-MGR-001',
      positionTitle: 'Engineering Manager',
      departmentId: id('dept001'),
      level: 'Manager',
      jobFamily: 'Engineering',
      payGradeId: id('paygrade001'), // Reference to PayGrade (Payroll subsystem)
      headcountBudget: 1,
      currentHeadcount: 1,
      isActive: true,
      effectiveDate: new Date('2023-01-01'),
      createdBy: id('user001'),
      updatedBy: id('user001'),
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      _id: id('pos002'),
      positionCode: 'SE-SSE-001',
      positionTitle: 'Senior Software Engineer',
      departmentId: id('dept001'),
      reportsToPositionId: id('pos001'),
      level: 'Senior',
      jobFamily: 'Engineering',
      payGradeId: id('paygrade002'),
      headcountBudget: 5,
      currentHeadcount: 2,
      isActive: true,
      effectiveDate: new Date('2023-01-01'),
      createdBy: id('user001'),
      updatedBy: id('user001'),
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      _id: id('pos003'),
      positionCode: 'HR-MGR-001',
      positionTitle: 'HR Manager',
      departmentId: id('dept002'),
      level: 'Manager',
      jobFamily: 'Human Resources',
      payGradeId: id('paygrade001'),
      headcountBudget: 1,
      currentHeadcount: 1,
      isActive: true,
      effectiveDate: new Date('2023-01-01'),
      createdBy: id('user001'),
      updatedBy: id('user001'),
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
  ],

  // =======================================
  // EMPLOYEES
  // =======================================
  employees: [
    {
      _id: id('emp001'),
      personalInfo: {
        firstName: 'System',
        lastName: 'Administrator',
        nationalId: '29301234567890',
        dateOfBirth: new Date('1993-01-01'),
        gender: 'MALE',
        nationality: 'Egyptian',
        maritalStatus: 'SINGLE',
      },
      contactInfo: {
        personalEmail: 'admin.personal@gmail.com',
        workEmail: 'admin@company.com',
        phoneNumber: '+201000000000',
        address: {
          street: '123 Admin Street',
          city: 'Cairo',
          state: 'Cairo',
          country: 'Egypt',
          postalCode: '11511',
        },
      },
      employmentInfo: {
        employeeNumber: 'EMP-2021-001',
        hireDate: new Date('2021-01-01'),
        workReceivingDate: new Date('2021-01-01'),
        contractType: 'FULL_TIME',
        employmentStatus: 'ACTIVE',
      },
      organizationalInfo: {
        departmentId: id('dept002'),
        positionId: id('pos003'),
        location: 'Cairo HQ',
      },
      compensationInfo: {
        payGradeId: id('paygrade001'),
        currency: 'EGP',
        bankAccountNumber: '1000000000',
        bankName: 'National Bank of Egypt',
      },
      metadata: {
        createdBy: id('user001'),
        createdAt: new Date('2021-01-01'),
        updatedBy: id('user001'),
        updatedAt: new Date('2021-01-01'),
        version: 1,
      },
      isActive: true,
      createdAt: new Date('2021-01-01'),
      updatedAt: new Date('2021-01-01'),
    },
    {
      _id: id('emp002'),
      personalInfo: {
        firstName: 'Fatma',
        lastName: 'Ibrahim',
        nationalId: '29001234567890',
        dateOfBirth: new Date('1990-03-15'),
        gender: 'FEMALE',
        nationality: 'Egyptian',
        maritalStatus: 'MARRIED',
      },
      contactInfo: {
        personalEmail: 'fatma.ibrahim@gmail.com',
        workEmail: 'hr.manager@company.com',
        phoneNumber: '+201111111111',
        address: {
          street: '456 HR Avenue',
          city: 'Cairo',
          state: 'Cairo',
          country: 'Egypt',
          postalCode: '11511',
        },
      },
      employmentInfo: {
        employeeNumber: 'EMP-2021-002',
        hireDate: new Date('2021-02-01'),
        workReceivingDate: new Date('2021-02-01'),
        contractType: 'FULL_TIME',
        employmentStatus: 'ACTIVE',
      },
      organizationalInfo: {
        departmentId: id('dept002'),
        positionId: id('pos003'),
        location: 'Cairo HQ',
      },
      compensationInfo: {
        payGradeId: id('paygrade001'),
        currency: 'EGP',
        bankAccountNumber: '2000000000',
        bankName: 'National Bank of Egypt',
      },
      metadata: {
        createdBy: id('user001'),
        createdAt: new Date('2021-02-01'),
        updatedBy: id('user001'),
        updatedAt: new Date('2021-02-01'),
        version: 1,
      },
      isActive: true,
      createdAt: new Date('2021-02-01'),
      updatedAt: new Date('2021-02-01'),
    },
    {
      _id: id('emp003'),
      personalInfo: {
        firstName: 'Mohamed',
        lastName: 'Ali',
        nationalId: '29401234567890',
        dateOfBirth: new Date('1994-05-20'),
        gender: 'MALE',
        nationality: 'Egyptian',
        maritalStatus: 'MARRIED',
      },
      contactInfo: {
        personalEmail: 'mohamed.ali.personal@gmail.com',
        workEmail: 'mohamed.ali@company.com',
        phoneNumber: '+201222222222',
        address: {
          street: '789 Manager Road',
          city: 'Cairo',
          state: 'Cairo',
          country: 'Egypt',
          postalCode: '11511',
        },
      },
      employmentInfo: {
        employeeNumber: 'EMP-2022-001',
        hireDate: new Date('2022-01-01'),
        workReceivingDate: new Date('2022-01-01'),
        contractType: 'FULL_TIME',
        employmentStatus: 'ACTIVE',
      },
      organizationalInfo: {
        departmentId: id('dept001'),
        positionId: id('pos001'),
        reportingManagerId: id('emp001'),
        location: 'Cairo HQ',
      },
      compensationInfo: {
        payGradeId: id('paygrade001'),
        currency: 'EGP',
        bankAccountNumber: '3000000000',
        bankName: 'National Bank of Egypt',
      },
      metadata: {
        createdBy: id('user001'),
        createdAt: new Date('2022-01-01'),
        updatedBy: id('user001'),
        updatedAt: new Date('2022-01-01'),
        version: 1,
      },
      isActive: true,
      createdAt: new Date('2022-01-01'),
      updatedAt: new Date('2022-01-01'),
    },
    {
      _id: id('emp004'),
      personalInfo: {
        firstName: 'Ahmed',
        lastName: 'Hassan',
        nationalId: '29501234567890',
        dateOfBirth: new Date('1995-01-15'),
        gender: 'MALE',
        nationality: 'Egyptian',
        maritalStatus: 'SINGLE',
      },
      contactInfo: {
        personalEmail: 'ahmed.h@gmail.com',
        workEmail: 'ahmed.hassan@company.com',
        phoneNumber: '+201234567890',
        address: {
          street: '101 Developer Street',
          city: 'Cairo',
          state: 'Cairo',
          country: 'Egypt',
          postalCode: '11511',
        },
      },
      employmentInfo: {
        employeeNumber: 'EMP-2023-001',
        hireDate: new Date('2023-01-15'),
        workReceivingDate: new Date('2023-01-15'),
        contractType: 'FULL_TIME',
        employmentStatus: 'ACTIVE',
        probationEndDate: new Date('2023-04-15'),
        confirmationDate: new Date('2023-04-20'),
      },
      organizationalInfo: {
        departmentId: id('dept001'),
        positionId: id('pos002'),
        reportingManagerId: id('emp003'),
        location: 'Cairo HQ',
      },
      compensationInfo: {
        payGradeId: id('paygrade002'),
        currency: 'EGP',
        bankAccountNumber: '4000000000',
        bankName: 'National Bank of Egypt',
      },
      metadata: {
        createdBy: id('user002'),
        createdAt: new Date('2023-01-15'),
        updatedBy: id('user002'),
        updatedAt: new Date('2023-01-15'),
        version: 1,
      },
      isActive: true,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15'),
    },
    {
      _id: id('emp005'),
      personalInfo: {
        firstName: 'Sara',
        lastName: 'Ali',
        nationalId: '29601234567890',
        dateOfBirth: new Date('1996-06-10'),
        gender: 'FEMALE',
        nationality: 'Egyptian',
        maritalStatus: 'SINGLE',
      },
      contactInfo: {
        personalEmail: 'sara.ali.personal@gmail.com',
        workEmail: 'sara.ali@company.com',
        phoneNumber: '+201345678901',
        address: {
          street: '202 Coder Avenue',
          city: 'Cairo',
          state: 'Cairo',
          country: 'Egypt',
          postalCode: '11511',
        },
      },
      employmentInfo: {
        employeeNumber: 'EMP-2024-001',
        hireDate: new Date('2024-01-01'),
        workReceivingDate: new Date('2024-01-01'),
        contractType: 'FULL_TIME',
        employmentStatus: 'ACTIVE',
      },
      organizationalInfo: {
        departmentId: id('dept001'),
        positionId: id('pos002'),
        reportingManagerId: id('emp003'),
        location: 'Cairo HQ',
      },
      compensationInfo: {
        payGradeId: id('paygrade002'),
        currency: 'EGP',
        bankAccountNumber: '5000000000',
        bankName: 'National Bank of Egypt',
      },
      metadata: {
        createdBy: id('user002'),
        createdAt: new Date('2024-01-01'),
        updatedBy: id('user002'),
        updatedAt: new Date('2024-01-01'),
        version: 1,
      },
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ],

  // =======================================
  // REPORTING LINES
  // =======================================
  reportingLines: [
    {
      _id: id('rl001'),
      employeeId: id('emp003'),
      managerId: id('emp001'),
      reportingType: 'DIRECT',
      canApproveLeave: true,
      canApproveTimesheet: true,
      canApproveExpenses: true,
      canConductAppraisal: true,
      effectiveDate: new Date('2022-01-01'),
      isActive: true,
      createdBy: id('user001'),
      updatedBy: id('user001'),
      createdAt: new Date('2022-01-01'),
      updatedAt: new Date('2022-01-01'),
    },
    {
      _id: id('rl002'),
      employeeId: id('emp004'),
      managerId: id('emp003'),
      reportingType: 'DIRECT',
      canApproveLeave: true,
      canApproveTimesheet: true,
      canApproveExpenses: true,
      canConductAppraisal: true,
      effectiveDate: new Date('2023-01-15'),
      isActive: true,
      createdBy: id('user002'),
      updatedBy: id('user002'),
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-01-15'),
    },
    {
      _id: id('rl003'),
      employeeId: id('emp005'),
      managerId: id('emp003'),
      reportingType: 'DIRECT',
      canApproveLeave: true,
      canApproveTimesheet: true,
      canApproveExpenses: true,
      canConductAppraisal: true,
      effectiveDate: new Date('2024-01-01'),
      isActive: true,
      createdBy: id('user002'),
      updatedBy: id('user002'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ],

  // =======================================
  // APPRAISAL TEMPLATES
  // =======================================
  appraisalTemplates: [
    {
      _id: id('template001'),
      templateCode: 'ANNUAL-2025',
      templateName: 'Annual Performance Appraisal 2025',
      description: 'Standard annual performance review template',
      appraisalType: 'ANNUAL',
      ratingScale: {
        scaleType: 'NUMERIC',
        minValue: 1,
        maxValue: 5,
        labels: [
          { value: 1, label: 'Unsatisfactory' },
          { value: 2, label: 'Needs Improvement' },
          { value: 3, label: 'Meets Expectations' },
          { value: 4, label: 'Exceeds Expectations' },
          { value: 5, label: 'Exceptional' },
        ],
      },
      sections: [
        {
          sectionId: 'technical',
          sectionName: 'Technical Skills',
          weight: 40,
          order: 1,
          criteria: [
            {
              criteriaId: 'tech-quality',
              criteriaName: 'Quality of Work',
              weight: 50,
              isRequired: true,
              allowComments: true,
            },
            {
              criteriaId: 'tech-expertise',
              criteriaName: 'Technical Expertise',
              weight: 50,
              isRequired: true,
              allowComments: true,
            },
          ],
        },
        {
          sectionId: 'behavioral',
          sectionName: 'Behavioral Competencies',
          weight: 30,
          order: 2,
          criteria: [
            {
              criteriaId: 'teamwork',
              criteriaName: 'Teamwork & Collaboration',
              weight: 50,
              isRequired: true,
              allowComments: true,
            },
            {
              criteriaId: 'communication',
              criteriaName: 'Communication Skills',
              weight: 50,
              isRequired: true,
              allowComments: true,
            },
          ],
        },
        {
          sectionId: 'attendance',
          sectionName: 'Attendance & Punctuality',
          weight: 30,
          order: 3,
          criteria: [
            {
              criteriaId: 'attendance',
              criteriaName: 'Attendance Record',
              weight: 60,
              isRequired: true,
              allowComments: true,
            },
            {
              criteriaId: 'punctuality',
              criteriaName: 'Punctuality',
              weight: 40,
              isRequired: true,
              allowComments: true,
            },
          ],
        },
      ],
      calculationMethod: 'WEIGHTED_AVERAGE',
      requiresSelfAssessment: true,
      requiresPeerReview: false,
      allowEmployeeFeedback: true,
      disputePeriodDays: 7,
      isActive: true,
      version: 1,
      createdBy: id('user002'),
      updatedBy: id('user002'),
      approvedBy: id('user001'),
      approvedAt: new Date('2025-01-01'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
  ],

  // =======================================
  // APPRAISAL CYCLES
  // =======================================
  appraisalCycles: [
    {
      _id: id('cycle001'),
      cycleCode: '2025-ANNUAL',
      cycleName: '2025 Annual Performance Review',
      description: 'Annual performance review cycle for all employees',
      appraisalType: 'ANNUAL',
      templateId: id('template001'),
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-31'),
      selfAssessmentDeadline: new Date('2025-12-10'),
      managerReviewDeadline: new Date('2025-12-20'),
      hrReviewDeadline: new Date('2025-12-25'),
      disputeDeadline: new Date('2026-01-10'),
      targetEmployees: [id('emp004'), id('emp005')],
      assignments: [
        {
          employeeId: id('emp004'),
          reviewerId: id('emp003'),
          selfAssessmentRequired: true,
          status: 'NOT_STARTED',
          assignedAt: new Date('2025-12-01'),
        },
        {
          employeeId: id('emp005'),
          reviewerId: id('emp003'),
          selfAssessmentRequired: true,
          status: 'NOT_STARTED',
          assignedAt: new Date('2025-12-01'),
        },
      ],
      totalAssignments: 2,
      completedAssignments: 0,
      progressPercentage: 0,
      status: 'DRAFT',
      resultsPublished: false,
      createdBy: id('user002'),
      updatedBy: id('user002'),
      createdAt: new Date('2025-11-01'),
      updatedAt: new Date('2025-11-01'),
    },
  ],

  // =======================================
  // DUMMY DATA FOR EXTERNAL MODULES
  // =======================================
  externalModuleDummyData: {
    // Dummy Attendance Data (from Time Management module)
    attendance: [
      {
        employeeId: id('emp004'),
        period: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
        },
        totalWorkingDays: 250,
        presentDays: 240,
        absentDays: 5,
        lateDays: 8,
        overtimeHours: 120,
      },
      {
        employeeId: id('emp005'),
        period: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
        },
        totalWorkingDays: 250,
        presentDays: 245,
        absentDays: 2,
        lateDays: 3,
        overtimeHours: 80,
      },
    ],

    // Dummy Leave Data (from Leaves module)
    leaves: [
      {
        employeeId: id('emp004'),
        period: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
        },
        totalLeaveDays: 15,
        sickLeaveDays: 3,
        annualLeaveDays: 12,
        unpaidLeaveDays: 0,
      },
      {
        employeeId: id('emp005'),
        period: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
        },
        totalLeaveDays: 10,
        sickLeaveDays: 2,
        annualLeaveDays: 8,
        unpaidLeaveDays: 0,
      },
    ],

    // Dummy Pay Grade Data (from Payroll module)
    payGrades: [
      {
        _id: id('paygrade001'),
        gradeCode: 'GRADE-M1',
        gradeName: 'Manager Level 1',
        grossSalary: 25000,
        currency: 'EGP',
      },
      {
        _id: id('paygrade002'),
        gradeCode: 'GRADE-E3',
        gradeName: 'Engineer Level 3 (Senior)',
        grossSalary: 15000,
        currency: 'EGP',
      },
    ],
  },
};

export default dummyData;

