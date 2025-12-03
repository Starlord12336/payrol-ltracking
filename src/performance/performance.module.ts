import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { AuthModule } from '../auth/auth.module';
// Performance schemas
import {
  AppraisalTemplate,
  AppraisalTemplateSchema,
} from './schemas/appraisal-template.schema';
import {
  AppraisalCycle,
  AppraisalCycleSchema,
} from './schemas/appraisal-cycle.schema';
import {
  AppraisalEvaluation,
  AppraisalEvaluationSchema,
} from './schemas/appraisal-evaluation.schema';
import {
  AppraisalDispute,
  AppraisalDisputeSchema,
} from './schemas/appraisal-dispute.schema';
import {
  PerformanceGoal,
  PerformanceGoalSchema,
} from './schemas/performance-goal.schema';
import {
  PerformanceFeedback,
  PerformanceFeedbackSchema,
} from './schemas/performance-feedback.schema';
import {
  PerformanceHistory,
  PerformanceHistorySchema,
} from './schemas/performance-history.schema';
// Integration schemas (from shared)
import { EmployeeProfile, EmployeeProfileSchema } from '../shared/schemas/employee-profile.schema';
import { Department, DepartmentSchema } from '../shared/schemas/department.schema';
import { Position, PositionSchema } from '../shared/schemas/position.schema';

@Module({
  imports: [
    AuthModule, // Import AuthModule to use JwtAuthGuard and RolesGuard
    MongooseModule.forFeature([
      // Performance schemas
      { name: AppraisalTemplate.name, schema: AppraisalTemplateSchema },
      { name: AppraisalCycle.name, schema: AppraisalCycleSchema },
      { name: AppraisalEvaluation.name, schema: AppraisalEvaluationSchema },
      { name: AppraisalDispute.name, schema: AppraisalDisputeSchema },
      { name: PerformanceGoal.name, schema: PerformanceGoalSchema },
      { name: PerformanceFeedback.name, schema: PerformanceFeedbackSchema },
      { name: PerformanceHistory.name, schema: PerformanceHistorySchema },
      // Integration schemas
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
    ]),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
