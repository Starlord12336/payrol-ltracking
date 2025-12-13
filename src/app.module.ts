import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TimeManagementModule } from './time-management/time-management.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { LeavesModule } from './leaves/leaves.module';

import { PayrollTrackingModule } from './payroll-tracking/payroll-tracking.module';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';
import { OrganizationStructureModule } from './organization-structure/organization-structure.module';
import { PerformanceModule } from './performance/performance.module';
import { PayrollConfigurationModule } from './payroll-configuration/payroll-configuration.module';
import { PayrollExecutionModule } from './payroll-execution/payroll-execution.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb+srv://emad_admin:VTleW62xq1Dpywdx@payroll-cluster-system.n3cu4rw.mongodb.net/',
    ),
    AuthModule, // Auth module must be imported first for guards and JWT
    TimeManagementModule,
    RecruitmentModule,
    LeavesModule,
    PayrollExecutionModule,
    PayrollConfigurationModule,
    PayrollTrackingModule,
    EmployeeProfileModule,
    OrganizationStructureModule,
    PerformanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
