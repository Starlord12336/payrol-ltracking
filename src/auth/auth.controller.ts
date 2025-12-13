import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: result.message,
        userType: result.userType,
      };
    } catch (error) {
      if (error.status === 409) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: error.message || 'User already exists',
          },
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred during registration',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('login')
  async signIn(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this.authService.signIn(loginDto);

      // Set httpOnly cookie with JWT token
      res.cookie('token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        user: {
          userid: result.payload.userid,
          email: result.payload.email,
          userType: result.payload.userType,
          roles: result.payload.roles,
          employeeNumber: result.payload.employeeNumber,
          candidateNumber: result.payload.candidateNumber,
          nationalId: result.payload.nationalId,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred during login',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    // The user object is already attached by the JWT guard
    const response: any = {
      userid: user.userid,
      email: user.email,
      userType: user.userType,
      roles: user.roles,
      nationalId: user.nationalId,
    };

    // Add type-specific identifier
    if (user.userType === 'employee') {
      response.employeeNumber = user.employeeNumber;
    } else {
      response.candidateNumber = user.candidateNumber;
    }

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    // Clear the cookie by setting it to empty and expired
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0), // Expire immediately
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Logged out successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    try {
      const result = await this.authService.changePassword(
        user.userid,
        user.userType, // Pass userType to the service
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );

      return {
        statusCode: HttpStatus.OK,
        message: result.message,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An error occurred while changing password',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
