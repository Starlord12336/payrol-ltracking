import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { EmployeeProfileController } from './employee-profile.controller';
import { EmployeeProfileService } from './employee-profile.service';
import { Candidate, CandidateSchema } from './models/candidate.schema';
import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from './models/employee-profile.schema';
import {
  EmployeeSystemRole,
  EmployeeSystemRoleSchema,
} from './models/employee-system-role.schema';
import {
  EmployeeProfileChangeRequest,
  EmployeeProfileChangeRequestSchema,
} from './models/ep-change-request.schema';
import {
  EmployeeQualification,
  EmployeeQualificationSchema,
} from './models/qualification.schema';
import { EmergencyContact, EmergencyContactSchema } from './models/emergency-contact.schema';
import { Dependent, DependentSchema } from './models/dependent.schema';
import { EmployeeNote, EmployeeNoteSchema } from './models/employee-note.schema';
import { EmployeeHistory, EmployeeHistorySchema } from './models/employee-history.schema';
import { ProfileAccessLog, ProfileAccessLogSchema } from './models/profile-access-log.schema';

// Services
import { EmergencyContactService } from './services/emergency-contact.service';
import { DependentService } from './services/dependent.service';
import { EmployeeNoteService } from './services/employee-note.service';
import { EmployeeHistoryService } from './services/employee-history.service';
import { ProfileAccessLogService } from './services/profile-access-log.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: EmployeeSystemRole.name, schema: EmployeeSystemRoleSchema },
      {
        name: EmployeeProfileChangeRequest.name,
        schema: EmployeeProfileChangeRequestSchema,
      },
      { name: EmployeeQualification.name, schema: EmployeeQualificationSchema },
      { name: EmergencyContact.name, schema: EmergencyContactSchema },
      { name: Dependent.name, schema: DependentSchema },
      { name: EmployeeNote.name, schema: EmployeeNoteSchema },
      { name: EmployeeHistory.name, schema: EmployeeHistorySchema },
      { name: ProfileAccessLog.name, schema: ProfileAccessLogSchema },
    ]),
    forwardRef(() => AuthModule), // Use forwardRef to break circular dependency
  ],
  controllers: [EmployeeProfileController],
  providers: [
    EmployeeProfileService,
    EmergencyContactService,
    DependentService,
    EmployeeNoteService,
    EmployeeHistoryService,
    ProfileAccessLogService,
  ],
  exports: [
    EmployeeProfileService,
    EmergencyContactService,
    DependentService,
    EmployeeNoteService,
    EmployeeHistoryService,
    ProfileAccessLogService,
  ], // Export services for use in other modules
})
export class EmployeeProfileModule {}
