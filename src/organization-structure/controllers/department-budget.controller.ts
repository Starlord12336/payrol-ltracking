import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DepartmentBudgetService } from '../services/department-budget.service';
import { CreateDepartmentBudgetDto, UpdateDepartmentBudgetDto } from '../dto';
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser } from '../../auth';
import { UserRole } from '../../shared/schemas/user.schema';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { BudgetStatus } from '../schemas/department-budget.schema';

@Controller('organization-structure/department-budgets')
@UseGuards(JwtAuthGuard)
export class DepartmentBudgetController {
  constructor(private readonly budgetService: DepartmentBudgetService) {}

  /**
   * Create a new department budget
   * POST /api/organization-structure/department-budgets
   * Roles: HR_ADMIN, SYSTEM_ADMIN, FINANCE_STAFF
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.FINANCE_STAFF)
  async create(
    @Body() createDto: CreateDepartmentBudgetDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const budget = await this.budgetService.create(createDto, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Department budget created successfully',
      data: budget,
    };
  }

  /**
   * Get all budgets with filters
   * GET /api/organization-structure/department-budgets
   */
  @Get()
  async findAll(
    @Query('departmentId') departmentId?: string,
    @Query('fiscalYear') fiscalYear?: string,
    @Query('status') status?: BudgetStatus,
  ) {
    const budgets = await this.budgetService.findAll(
      departmentId,
      fiscalYear ? parseInt(fiscalYear, 10) : undefined,
      status,
    );
    
    return {
      success: true,
      message: 'Budgets retrieved successfully',
      data: budgets,
      count: budgets.length,
    };
  }

  /**
   * Get budget by ID
   * GET /api/organization-structure/department-budgets/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const budget = await this.budgetService.findOne(id);
    
    return {
      success: true,
      message: 'Budget retrieved successfully',
      data: budget,
    };
  }

  /**
   * Get budget by department and fiscal period
   * GET /api/organization-structure/department-budgets/department/:departmentId/period
   */
  @Get('department/:departmentId/period')
  async findByPeriod(
    @Param('departmentId') departmentId: string,
    @Query('fiscalYear') fiscalYear: string,
    @Query('fiscalQuarter') fiscalQuarter?: string,
  ) {
    const budget = await this.budgetService.findByDepartmentAndPeriod(
      departmentId,
      parseInt(fiscalYear, 10),
      fiscalQuarter ? parseInt(fiscalQuarter, 10) : undefined,
    );
    
    if (!budget) {
      return {
        success: false,
        message: 'Budget not found for the specified period',
        data: null,
      };
    }
    
    return {
      success: true,
      message: 'Budget retrieved successfully',
      data: budget,
    };
  }

  /**
   * Get budget utilization statistics
   * GET /api/organization-structure/department-budgets/department/:departmentId/stats
   */
  @Get('department/:departmentId/stats')
  async getStats(
    @Param('departmentId') departmentId: string,
    @Query('fiscalYear') fiscalYear?: string,
  ) {
    const stats = await this.budgetService.getUtilizationStats(
      departmentId,
      fiscalYear ? parseInt(fiscalYear, 10) : undefined,
    );
    
    return {
      success: true,
      message: 'Budget statistics retrieved successfully',
      data: stats,
    };
  }

  /**
   * Update a budget
   * PUT /api/organization-structure/department-budgets/:id
   * Roles: HR_ADMIN, SYSTEM_ADMIN, FINANCE_STAFF
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.FINANCE_STAFF)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDepartmentBudgetDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const budget = await this.budgetService.update(id, updateDto, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Budget updated successfully',
      data: budget,
    };
  }

  /**
   * Approve a budget
   * POST /api/organization-structure/department-budgets/:id/approve
   * Roles: HR_ADMIN, SYSTEM_ADMIN, FINANCE_STAFF
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.FINANCE_STAFF)
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const budget = await this.budgetService.approve(id, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Budget approved successfully',
      data: budget,
    };
  }

  /**
   * Activate a budget
   * POST /api/organization-structure/department-budgets/:id/activate
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async activate(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const budget = await this.budgetService.activate(id, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Budget activated successfully',
      data: budget,
    };
  }

  /**
   * Close a budget
   * POST /api/organization-structure/department-budgets/:id/close
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async close(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const budget = await this.budgetService.close(id, user.sub?.toString() || user.userid.toString());
    
    return {
      success: true,
      message: 'Budget closed successfully',
      data: budget,
    };
  }

  /**
   * Delete a budget (only DRAFT)
   * DELETE /api/organization-structure/department-budgets/:id
   * Roles: HR_ADMIN, SYSTEM_ADMIN
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYSTEM_ADMIN)
  async delete(@Param('id') id: string) {
    await this.budgetService.delete(id);
    
    return {
      success: true,
      message: 'Budget deleted successfully',
    };
  }
}

