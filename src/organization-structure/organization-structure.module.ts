import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

// Shared Schemas (needed for populate)
import { User, UserSchema } from '../shared/schemas/user.schema';
import { Employee, EmployeeSchema } from '../shared/schemas/employee.schema';
import { Department, DepartmentSchema } from '../shared/schemas/department.schema';
import { Position, PositionSchema } from '../shared/schemas/position.schema';

// Organization Structure Schemas
import { ReportingLine, ReportingLineSchema } from './schemas/reporting-line.schema';
import { OrgChangeRequest, OrgChangeRequestSchema } from './schemas/org-change-request.schema';
import { DepartmentBudget, DepartmentBudgetSchema } from './schemas/department-budget.schema';
import { OrgChartSnapshot, OrgChartSnapshotSchema } from './schemas/org-chart-snapshot.schema';

// Controllers
import { DepartmentController } from './controllers/department.controller';
import { PositionController } from './controllers/position.controller';
import { ReportingLineController } from './controllers/reporting-line.controller';
import { OrgChangeRequestController } from './controllers/org-change-request.controller';
import { OrgChartController } from './controllers/org-chart.controller';
import { DepartmentBudgetController } from './controllers/department-budget.controller';
import { OrgChartSnapshotController } from './controllers/org-chart-snapshot.controller';

// Services
import { DepartmentService } from './services/department.service';
import { PositionService } from './services/position.service';
import { ReportingLineService } from './services/reporting-line.service';
import { OrgChangeRequestService } from './services/org-change-request.service';
import { OrgChartService } from './services/org-chart.service';
import { DepartmentBudgetService } from './services/department-budget.service';
import { OrgChartSnapshotService } from './services/org-chart-snapshot.service';

@Module({
  imports: [
    AuthModule, // Import AuthModule to use JwtAuthGuard and RolesGuard
    MongooseModule.forFeature([
      // Shared schemas (needed for populate)
      { name: User.name, schema: UserSchema },
      { name: Employee.name, schema: EmployeeSchema },
      // Organization Structure schemas
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
      { name: ReportingLine.name, schema: ReportingLineSchema },
      { name: OrgChangeRequest.name, schema: OrgChangeRequestSchema },
      { name: DepartmentBudget.name, schema: DepartmentBudgetSchema },
      { name: OrgChartSnapshot.name, schema: OrgChartSnapshotSchema },
    ]),
  ],
  controllers: [
    DepartmentController,
    PositionController,
    ReportingLineController,
    OrgChangeRequestController,
    OrgChartController,
    DepartmentBudgetController,
    OrgChartSnapshotController,
  ],
  providers: [
    DepartmentService,
    PositionService,
    ReportingLineService,
    OrgChangeRequestService,
    OrgChartService,
    DepartmentBudgetService,
    OrgChartSnapshotService,
  ],
  exports: [
    DepartmentService,
    PositionService,
    ReportingLineService,
    OrgChangeRequestService,
    OrgChartService,
    DepartmentBudgetService,
    OrgChartSnapshotService,
  ],
})
export class OrganizationStructureModule {}

