import { Injectable, Logger } from '@nestjs/common';
import { PayrollConfigurationService } from '../payroll-configuration.service';

/**
 * Employee Onboarded Event
 *
 * Event data structure for when a new employee completes onboarding.
 * Contains employee details needed for signing bonus processing.
 */
export interface EmployeeOnboardedEvent {
  employeeId: string;
  positionName: string;
  workType: string; // 'FULL_TIME' or 'PART_TIME'
  contractType: string;
  startDate: Date;
  departmentId?: string;
}

/**
 * SigningBonusListener
 *
 * Service for processing signing bonuses during employee onboarding.
 *
 * Business Rules:
 * - BR-24: Signing bonuses only for full-time employees
 * - BR-56: Signing bonuses as distinct payroll component
 * - ONB-019: Auto-process signing bonuses during onboarding
 *
 * Workflow:
 * 1. Called by Onboarding module when employee is onboarded
 * 2. Check if employee is full-time (BR-24)
 * 3. Fetch approved signing bonus for position
 * 4. Log auto-processing action
 * 5. Return bonus details for payroll integration
 *
 * Usage:
 * ```typescript
 * // In Onboarding module:
 * await signingBonusListener.handleEmployeeOnboarded({
 *   employeeId: '...',
 *   positionName: 'Senior Developer',
 *   workType: 'FULL_TIME',
 *   contractType: 'FULL_TIME_CONTRACT',
 *   startDate: new Date(),
 * });
 * ```
 *
 * @author John Wasfy
 */
@Injectable()
export class SigningBonusListener {
  private readonly logger = new Logger(SigningBonusListener.name);

  constructor(
    private readonly payrollConfigService: PayrollConfigurationService,
  ) {}

  /**
   * Handle employee onboarded event
   *
   * Automatically checks for and processes signing bonuses for newly onboarded employees.
   * This method should be called by the Onboarding module when an employee completes onboarding.
   *
   * @param event - Employee onboarded event data
   * @returns The signing bonus document if found and eligible, null otherwise
   */
  async handleEmployeeOnboarded(
    event: EmployeeOnboardedEvent,
  ): Promise<any | null> {
    this.logger.log(
      `ONB-019: Processing signing bonus for employee ${event.employeeId}, position: ${event.positionName}`,
    );

    try {
      // BR-24: Check if employee is eligible (full-time only)
      const isEligible = await this.payrollConfigService.validateEligibility(
        event.positionName,
        event.workType,
      );

      if (!isEligible) {
        this.logger.log(
          `ONB-019: Employee ${event.employeeId} is not eligible for signing bonus (not full-time or no bonus configured for position)`,
        );
        return null;
      }

      // Fetch approved signing bonus for position
      const signingBonus =
        await this.payrollConfigService.findSigningBonusByPosition(
          event.positionName,
        );

      if (!signingBonus) {
        this.logger.log(
          `ONB-019: No approved signing bonus found for position "${event.positionName}"`,
        );
        return null;
      }

      // Log successful auto-processing
      this.logger.log(
        `ONB-019: Signing bonus auto-processed for employee ${event.employeeId}. ` +
          `Position: ${event.positionName}, Amount: ${signingBonus.amount} EGP, ` +
          `Bonus ID: ${signingBonus._id}`,
      );

      // TODO: Integrate with payroll execution to add bonus to first payroll run
      // This would typically involve:
      // 1. Creating a payroll item for the signing bonus
      // 2. Linking it to the employee's first payroll cycle
      // 3. Marking the bonus as "processed" to prevent duplicate payments (BR-28)

      this.logger.log(
        `ONB-019: Signing bonus ${signingBonus._id} ready for first payroll run`,
      );

      return signingBonus;
    } catch (error) {
      this.logger.error(
        `ONB-019: Error processing signing bonus for employee ${event.employeeId}: ${error.message}`,
        error.stack,
      );
      // Don't throw - we don't want to break onboarding if signing bonus processing fails
      return null;
    }
  }

  /**
   * Handle employee onboarding failed event
   *
   * Cleanup or logging if onboarding fails after signing bonus was processed.
   *
   * @param event - Event data containing employee ID
   */
  async handleOnboardingFailed(event: { employeeId: string }): Promise<void> {
    this.logger.warn(
      `ONB-019: Onboarding failed for employee ${event.employeeId}. ` +
        `Signing bonus processing may need to be rolled back.`,
    );

    // TODO: Implement rollback logic if signing bonus was already added to payroll
  }
}
