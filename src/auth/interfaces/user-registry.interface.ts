import { Model, Document } from 'mongoose';
import { UserProfileBase } from '../../employee-profile/models/user-schema';

/**
 * Interface for user type registration
 * Any subsystem can register their user schema here
 */
export interface UserTypeRegistry {
  /**
   * Unique identifier for the user type (e.g., 'employee', 'candidate')
   */
  type: string;

  /**
   * Mongoose model for this user type
   */
  model: Model<any & UserProfileBase & Document>;

  /**
   * Collection name
   */
  collectionName: string;

  /**
   * Function to check if user can login (status validation)
   */
  canLogin?: (user: any) => boolean;

  /**
   * Function to get default roles for this user type
   */
  getDefaultRoles?: (user: any) => string[] | Promise<string[]>;

  /**
   * Function to get user identifier (employeeNumber, candidateNumber, etc.)
   */
  getUserIdentifier?: (user: any) => string | undefined;
}
