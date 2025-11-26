////////////////////////# Core Config Module - Emad ##############

import { Test, TestingModule } from '@nestjs/testing';
import { PayrollConfigurationController } from './payroll-configuration.controller';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { ConfigStatus } from './enums/payroll-configuration-enums';

describe('PayrollConfigurationController', () => {
  let controller: PayrollConfigurationController;

  const mockPayrollConfigService = {
    // Pay Grades
    createPayGrade: jest.fn(),
    findAllPayGrades: jest.fn(),
    findPayGradeById: jest.fn(),
    updatePayGrade: jest.fn(),
    deletePayGrade: jest.fn(),
    submitPayGradeForApproval: jest.fn(),
    approvePayGrade: jest.fn(),
    rejectPayGrade: jest.fn(),
    getApprovedPayGrades: jest.fn(),

    // Allowances
    createAllowance: jest.fn(),
    findAllAllowances: jest.fn(),
    findAllowanceById: jest.fn(),
    updateAllowance: jest.fn(),
    deleteAllowance: jest.fn(),
    submitAllowanceForApproval: jest.fn(),
    approveAllowance: jest.fn(),
    rejectAllowance: jest.fn(),
    getApprovedAllowances: jest.fn(),

    // Tax Rules
    createTaxRule: jest.fn(),
    findAllTaxRules: jest.fn(),
    findTaxRuleById: jest.fn(),
    updateTaxRule: jest.fn(),
    deleteTaxRule: jest.fn(),
    submitTaxRuleForApproval: jest.fn(),
    approveTaxRule: jest.fn(),
    rejectTaxRule: jest.fn(),
    getApprovedTaxRules: jest.fn(),

    // Dashboard
    getPendingApprovalsDashboard: jest.fn(),
    getAllApprovedConfigurations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollConfigurationController],
      providers: [
        {
          provide: PayrollConfigurationService,
          useValue: mockPayrollConfigService,
        },
      ],
    }).compile();

    controller = module.get<PayrollConfigurationController>(
      PayrollConfigurationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Pay Grades Endpoints', () => {
    it('should create a pay grade', async () => {
      const createDto = {
        grade: 'Senior Developer',
        baseSalary: 8000,
        grossSalary: 10000,
      };
      const expectedResult = {
        ...createDto,
        _id: 'mockId',
        status: ConfigStatus.DRAFT,
      };

      mockPayrollConfigService.createPayGrade.mockResolvedValue(expectedResult);

      const result = await controller.createPayGrade(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockPayrollConfigService.createPayGrade).toHaveBeenCalledWith(
        createDto,
      );
    });

    it('should get all pay grades', async () => {
      const expectedResult = [
        { grade: 'Junior', baseSalary: 6000, grossSalary: 7000 },
        { grade: 'Senior', baseSalary: 8000, grossSalary: 10000 },
      ];

      mockPayrollConfigService.findAllPayGrades.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.findAllPayGrades({});

      expect(result).toEqual(expectedResult);
    });

    it('should approve a pay grade', async () => {
      const approveDto = { approvedBy: '507f1f77bcf86cd799439011' };
      const expectedResult = {
        grade: 'Senior',
        status: ConfigStatus.APPROVED,
        approvedBy: approveDto.approvedBy,
      };

      mockPayrollConfigService.approvePayGrade.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.approvePayGrade('mockId', approveDto);

      expect(result.status).toBe(ConfigStatus.APPROVED);
    });
  });

  describe('Allowances Endpoints', () => {
    it('should create an allowance', async () => {
      const createDto = {
        name: 'Housing Allowance',
        amount: 2000,
      };
      const expectedResult = {
        ...createDto,
        _id: 'mockId',
        status: ConfigStatus.DRAFT,
      };

      mockPayrollConfigService.createAllowance.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.createAllowance(createDto);

      expect(result).toEqual(expectedResult);
    });

    it('should get all approved allowances', async () => {
      const expectedResult = [
        { name: 'Housing', amount: 2000, status: ConfigStatus.APPROVED },
      ];

      mockPayrollConfigService.getApprovedAllowances.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getApprovedAllowances();

      expect(result).toEqual(expectedResult);
    });
  });

  describe('Tax Rules Endpoints', () => {
    it('should create a tax rule', async () => {
      const createDto = {
        name: 'Income Tax',
        rate: 15,
        description: 'Standard income tax',
      };
      const expectedResult = {
        ...createDto,
        _id: 'mockId',
        status: ConfigStatus.DRAFT,
      };

      mockPayrollConfigService.createTaxRule.mockResolvedValue(expectedResult);

      const result = await controller.createTaxRule(createDto);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('Approval Dashboard', () => {
    it('should get pending approvals dashboard', async () => {
      const expectedResult = {
        payGrades: { count: 2, items: [] },
        allowances: { count: 1, items: [] },
        taxRules: { count: 0, items: [] },
        totalPending: 3,
      };

      mockPayrollConfigService.getPendingApprovalsDashboard.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getPendingApprovalsDashboard();

      expect(result.totalPending).toBe(3);
    });
  });
});
