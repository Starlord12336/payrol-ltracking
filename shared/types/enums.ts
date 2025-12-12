/**
 * Additional enums not in auth.ts
 * Gender, MaritalStatus, EmployeeStatus, ContractType, CandidateStatus are exported from auth.ts
 */

export enum WorkType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
}

export enum GraduationType {
  UNDERGRADE = 'UNDERGRADE',
  BACHELOR = 'BACHELOR',
  MASTER = 'MASTER',
  PHD = 'PHD',
  OTHER = 'OTHER',
}

export enum ProfileChangeStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
}

/**
 * Helper function to format enum values for display
 * Converts enum values like "FULL_TIME_CONTRACT" to "Full Time Contract"
 */
export function formatEnumValue(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Get all enum values as an array
 */
export function getEnumValues<T extends Record<string, string>>(enumObject: T): string[] {
  return Object.values(enumObject);
}

