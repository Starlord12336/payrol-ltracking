import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeProfileController } from './employee-profile.controller';
import { EmployeeProfileService } from './employee-profile.service';
import { ProfileChangeStatus } from './enums/employee-profile.enums';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Types } from 'mongoose';

describe('EmployeeProfileController', () => {
  let controller: EmployeeProfileController;
  let service: EmployeeProfileService;

  const employeeProfileServiceMock = {
    getOwnProfile: jest.fn(),
    updateMyProfile: jest.fn(),
    reviewChangeRequest: jest.fn(),
  } as Partial<EmployeeProfileService> as EmployeeProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeProfileController],
      providers: [
        {
          provide: EmployeeProfileService,
          useValue: employeeProfileServiceMock,
        },
      ],
    }).compile();

    controller = module.get<EmployeeProfileController>(
      EmployeeProfileController,
    );
    service = module.get<EmployeeProfileService>(EmployeeProfileService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyProfile', () => {
    it('should return wrapped profile data', async () => {
      const mockProfileId = new Types.ObjectId('64b000000000000000000001');
      const mockProfile = { _id: mockProfileId, firstName: 'Aly' };

      const mockUser: JwtPayload = {
        userid: mockProfileId,
        employeeId: mockProfileId,
        roles: [],
        email: 'aly@example.com',
        userType: 'employee',
        nationalId: '123456789',
      };

      (service.getOwnProfile as jest.Mock).mockResolvedValue(mockProfile);

      const result = await controller.getMyProfile(mockUser);

      expect(service.getOwnProfile).toHaveBeenCalledWith(mockProfileId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
      expect(result.message).toBe('Profile retrieved successfully');
    });
  });

  describe('updateMyProfile', () => {
    it('should call service.updateMyProfile and return wrapped result', async () => {
      const mockProfileId = new Types.ObjectId('64b000000000000000000002');
      const dto: any = {
        personalEmail: 'aly@example.com',
        city: 'Cairo',
      };
      const updatedProfile = {
        _id: mockProfileId,
        personalEmail: 'aly@example.com',
        address: { city: 'Cairo' },
      };

      const mockUser: JwtPayload = {
        userid: mockProfileId,
        employeeId: mockProfileId,
        roles: [],
        email: 'aly@example.com',
        userType: 'employee',
        nationalId: '123456789',
      };

      (service.updateMyProfile as jest.Mock).mockResolvedValue(updatedProfile);

      const result = await controller.updateMyProfile(mockUser, dto);

      expect(service.updateMyProfile).toHaveBeenCalledWith(mockProfileId, dto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedProfile);
      expect(result.message).toBe('Profile updated successfully');
    });
  });

  describe('reviewChangeRequest', () => {
    it('should call service.reviewChangeRequest with correct parameters', async () => {
      const hrProfileId = new Types.ObjectId('64b000000000000000000010');
      const requestId = '64b000000000000000000020';

      const body: any = {
        status: ProfileChangeStatus.APPROVED,
        reason: 'All good',
      };

      const serviceResponse = {
        requestId: 'EPR-2025-123456',
        status: ProfileChangeStatus.APPROVED,
        processedAt: new Date(),
      };

      const mockUser: JwtPayload = {
        userid: hrProfileId,
        employeeId: hrProfileId,
        roles: [],
        email: 'hr@example.com',
        userType: 'employee',
        nationalId: '987654321',
      };

      (service.reviewChangeRequest as jest.Mock).mockResolvedValue(
        serviceResponse,
      );

      const result = await controller.reviewChangeRequest(
        requestId,
        mockUser,
        body,
      );

      expect(service.reviewChangeRequest).toHaveBeenCalledWith(
        hrProfileId,
        requestId,
        body,
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(serviceResponse);
      expect(result.message).toBe('Change request reviewed successfully');
    });
  });
});
