// src/employee-profile/employee-profile.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';

import { EmployeeProfileService } from './employee-profile.service';
import { EmployeeProfile } from './models/employee-profile.schema';
import { EmployeeProfileChangeRequest } from './models/ep-change-request.schema';
import { EmployeeSystemRole } from './models/employee-system-role.schema';
import {
  ProfileChangeStatus,
  SystemRole,
} from './enums/employee-profile.enums';

describe('EmployeeProfileService', () => {
  let service: EmployeeProfileService;

  // Simple Jest mocks for the Mongoose models
  const profileModelMock = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
  };

  const changeRequestModelMock = {
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
  };

  const roleModelMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeProfileService,
        {
          provide: getModelToken(EmployeeProfile.name),
          useValue: profileModelMock,
        },
        {
          provide: getModelToken(EmployeeProfileChangeRequest.name),
          useValue: changeRequestModelMock,
        },
        {
          provide: getModelToken(EmployeeSystemRole.name),
          useValue: roleModelMock,
        },
      ],
    }).compile();

    service = module.get<EmployeeProfileService>(EmployeeProfileService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOwnProfile', () => {
    const validId = '64b000000000000000000001'; // valid 24-char hex for ObjectId

    it('returns a profile when found', async () => {
      const mockProfile = { _id: validId, firstName: 'Aly' };

      profileModelMock.findById.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(mockProfile),
        }),
      });

      const result = await service.getOwnProfile(validId);

      expect(profileModelMock.findById).toHaveBeenCalledWith(validId);
      expect(result).toEqual(mockProfile);
    });

    it('throws NotFoundException when profile does not exist', async () => {
      profileModelMock.findById.mockReturnValue({
        lean: () => ({
          exec: () => Promise.resolve(null),
        }),
      });

      await expect(service.getOwnProfile(validId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('reviewChangeRequest', () => {
    const hrProfileId = '64b000000000000000000010';
    const requestId = '64b000000000000000000020';

    it('approves a pending change request for an HR user', async () => {
      // 1) Mock ensureHasRole via roleModelMock (HR role)
      roleModelMock.findOne.mockReturnValue({
        lean: () => ({
          exec: () =>
            Promise.resolve({
              roles: [SystemRole.HR_MANAGER],
              isActive: true,
            }),
        }),
      });

      // 2) Mock existing PENDING request
      const mockRequest: any = {
        _id: requestId,
        requestId: 'EPR-2025-123',
        status: ProfileChangeStatus.PENDING,
        reason: 'Old reason',
        processedAt: undefined,
        save: jest.fn().mockResolvedValue(true),
      };

      changeRequestModelMock.findById.mockReturnValue({
        exec: () => Promise.resolve(mockRequest),
      });

      const dto = {
        status: ProfileChangeStatus.APPROVED,
        reason: 'All good',
      };

      const result = await service.reviewChangeRequest(
        hrProfileId,
        requestId,
        dto,
      );

      // status & reason should be updated on the request object
      expect(mockRequest.status).toBe(ProfileChangeStatus.APPROVED);
      expect(mockRequest.reason).toBe('All good');
      expect(mockRequest.processedAt).toBeInstanceOf(Date);
      expect(mockRequest.save).toHaveBeenCalled();

      // And the returned response should match
      expect(result.requestId).toBe('EPR-2025-123');
      expect(result.status).toBe(ProfileChangeStatus.APPROVED);
      expect(result.processedAt).toBeInstanceOf(Date);
    });
  });
});
