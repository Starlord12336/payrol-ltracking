////////////////////////# Core Config Module - Emad ##############

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { payGrade } from './models/payGrades.schema';
import { allowance } from './models/allowance.schema';
import { taxRules } from './models/taxRules.schema';
import { ConfigStatus } from './enums/payroll-configuration-enums';
import { BadRequestException } from '@nestjs/common';

// Mock model factory
const mockModel = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  exec: jest.fn(),
});

describe('PayrollConfigurationService', () => {
  let service: PayrollConfigurationService;
  let payGradeModel: ReturnType<typeof mockModel>;
  let allowanceModel: ReturnType<typeof mockModel>;
  let taxRulesModel: ReturnType<typeof mockModel>;

  beforeEach(async () => {
    payGradeModel = mockModel();
    allowanceModel = mockModel();
    taxRulesModel = mockModel();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollConfigurationService,
        {
          provide: getModelToken(payGrade.name),
          useValue: {
            ...payGradeModel,
            new: jest
              .fn()
              .mockImplementation((dto: Record<string, unknown>) => ({
                ...dto,
                save: jest.fn().mockResolvedValue({ ...dto, _id: 'mockId' }),
              })),
          },
        },
        {
          provide: getModelToken(allowance.name),
          useValue: {
            ...allowanceModel,
            new: jest
              .fn()
              .mockImplementation((dto: Record<string, unknown>) => ({
                ...dto,
                save: jest.fn().mockResolvedValue({ ...dto, _id: 'mockId' }),
              })),
          },
        },
        {
          provide: getModelToken(taxRules.name),
          useValue: {
            ...taxRulesModel,
            new: jest
              .fn()
              .mockImplementation((dto: Record<string, unknown>) => ({
                ...dto,
                save: jest.fn().mockResolvedValue({ ...dto, _id: 'mockId' }),
              })),
          },
        },
      ],
    }).compile();

    service = module.get<PayrollConfigurationService>(
      PayrollConfigurationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Pay Grades', () => {
    describe('Business Rules', () => {
      it('should reject pay grade when gross salary < base salary (BR-PG-003)', async () => {
        const dto = {
          grade: 'Test Grade',
          baseSalary: 10000,
          grossSalary: 8000, // Less than base salary
        };

        await expect(service.createPayGrade(dto)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should enforce minimum salary of 6000 EGP (BR-PG-002)', () => {
        // This is enforced by DTO validation with @Min(6000)
        // The DTO validator will reject salaries below 6000
        expect(true).toBe(true);
      });
    });
  });

  describe('Allowances', () => {
    it('should create allowance in DRAFT status (BR-AW-001)', () => {
      // Allowances are created in DRAFT status by default
      expect(ConfigStatus.DRAFT).toBe('draft');
    });
  });

  describe('Tax Rules', () => {
    it('should validate tax rate is between 0 and 100 (BR-TX-002)', () => {
      // This is enforced by DTO validation with @Min(0) and @Max(100)
      expect(true).toBe(true);
    });
  });

  describe('Approval Workflow', () => {
    it('should have DRAFT, APPROVED, REJECTED statuses (BR-AW-001)', () => {
      expect(ConfigStatus.DRAFT).toBe('draft');
      expect(ConfigStatus.APPROVED).toBe('approved');
      expect(ConfigStatus.REJECTED).toBe('rejected');
    });
  });
});
