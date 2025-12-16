/**
 * Performance Goal DTO
 * Used for storing goals in GridFS (no schema exists)
 */

export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export interface PerformanceGoalDto {
  id?: string;
  goalTitle: string;
  description: string;
  employeeId: string;
  setBy: string; // Manager ID
  cycleId?: string;
  category?: string;
  type?: string;
  priority?: string;
  targetMetric?: string;
  targetValue?: number;
  targetUnit?: string;
  currentValue?: number;
  startDate: Date;
  dueDate: Date;
  status: GoalStatus;
  finalComments?: string;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

