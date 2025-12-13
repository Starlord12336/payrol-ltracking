import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { UserRegistryService } from './services/user-registry.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from '../employee-profile/models/employee-profile.schema';
import {
  Candidate,
  CandidateSchema,
} from '../employee-profile/models/candidate.schema';
import {
  EmployeeSystemRole,
  EmployeeSystemRoleSchema,
} from '../employee-profile/models/employee-system-role.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => EmployeeProfileModule), // Use forwardRef to break circular dependency
    MongooseModule.forFeature([
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: EmployeeSystemRole.name, schema: EmployeeSystemRoleSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '24h';
        return {
          global: true,
          secret:
            configService.get<string>('JWT_SECRET') ||
            'default-secret-change-in-production',
          signOptions: {
            expiresIn: expiresIn as string,
          },
        } as any; // Type assertion to handle JWT module type compatibility
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRegistryService, JwtAuthGuard, RolesGuard], // Add guards as providers
  exports: [
    AuthService,
    UserRegistryService,
    JwtAuthGuard,
    RolesGuard,
    JwtModule, // Export JwtModule so modules importing AuthModule can access JwtService
  ], // Export guards and JwtModule so other modules can use them
})
export class AuthModule {}
