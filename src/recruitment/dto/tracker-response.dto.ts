import { OnboardingTaskStatus } from '../enums/onboarding-task-status.enum';

export class TaskResponseDto {
  _id?: string;
  name: string;
  department?: string;
  status: OnboardingTaskStatus;
  deadline?: Date;
  completedAt?: Date;
  sequence?: number; // Order in workflow
  description?: string; // What to do
  owner?: string; // Who is responsible
  estimatedHours?: number; // How long it takes
  notes?: string;
  documentId?: string;
  isBlocked?: boolean; // Cannot start until prerequisite done
  prerequisiteTaskIndex?: number; // Index of blocking task
}

export class TrackerResponseDto {
  success: boolean;
  employeeId: string;
  contractId?: string;
  tasks: TaskResponseDto[];
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  nextTask?: TaskResponseDto; // First pending task (what to do next)
  nextTaskIndex?: number; // Index of next task
  completed: boolean;
  completedAt?: Date;
  message?: string;
}

export class DepartmentTaskTemplateDto {
  name: string;
  department: string;
  sequence: number;
  description: string;
  owner: string; // e.g., 'HR', 'IT', 'Finance'
  estimatedHours: number;
}
