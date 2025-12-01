import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// Auth Module
import { AuthModule } from './auth/auth.module';

// Employee Profile Module
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';

// Organization Structure Module
import { OrganizationStructureModule } from './organization-structure/organization-structure.module';

// Performance Module
import { PerformanceModule } from './performance/performance.module';

@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'], // Check both backend/.env and root .env
      cache: true,
    }),

    // MongoDB Connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in environment variables');
        }

        return {
          uri,
          dbName: configService.get<string>('MONGODB_DB_NAME') || 'hr_system',
          retryWrites: true,
          w: 'majority',
        };
      },
      inject: [ConfigService],
    }),

    // Feature Modules - AuthModule must be imported first to ensure JwtModule is available globally
    AuthModule,
    EmployeeProfileModule,
    OrganizationStructureModule,
    PerformanceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

