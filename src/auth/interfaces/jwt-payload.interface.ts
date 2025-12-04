import { Types } from 'mongoose';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

export interface JwtPayload {
  userid: Types.ObjectId;
  employeeId?: Types.ObjectId; // Alias for userid for backward compatibility
  sub?: Types.ObjectId | string; // Alias for userid (JWT standard)
  roles: SystemRole[];
  email: string;
  userType: string;
  nationalId: string;
  employeeNumber?: string;
  candidateNumber?: string;
}
