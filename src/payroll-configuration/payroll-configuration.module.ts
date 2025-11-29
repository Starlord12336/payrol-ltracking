import { Module } from '@nestjs/common';
import { PayrollConfigurationController } from './payroll-configuration.controller';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { CompanyWideSettings, CompanyWideSettingsSchema, } from './models/CompanyWideSettings.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { allowance, allowanceSchema } from './models/allowance.schema';
import { insuranceBrackets, insuranceBracketsSchema, } from './models/insuranceBrackets.schema';
import { payrollPolicies, payrollPoliciesSchema, } from './models/payrollPolicies.schema';
import { payType, payTypeSchema, } from './models/payType.schema';
import { signingBonus, signingBonusSchema, } from './models/signingBonus.schema';
import { taxRules, taxRulesSchema, } from './models/taxRules.schema';
import { terminationAndResignationBenefits, terminationAndResignationBenefitsSchema, } from './models/terminationAndResignationBenefits';
import { payGrade, payGradeSchema, } from './models/payGrades.schema';

// Guards - John Wasfy
import { PayrollSpecialistGuard, PayrollManagerGuard, HRManagerGuard, } from './guards';

// Listeners - John Wasfy
import { SigningBonusListener } from './listeners/signing-bonus.listener';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: allowance.name, schema: allowanceSchema },
      { name: signingBonus.name, schema: signingBonusSchema },
      { name: taxRules.name, schema: taxRulesSchema },
      { name: insuranceBrackets.name, schema: insuranceBracketsSchema },
      { name: payType.name, schema: payTypeSchema },
      { name: payrollPolicies.name, schema: payrollPoliciesSchema },
      {
        name: terminationAndResignationBenefits.name,
        schema: terminationAndResignationBenefitsSchema,
      },
      { name: CompanyWideSettings.name, schema: CompanyWideSettingsSchema },
      { name: payGrade.name, schema: payGradeSchema },
    ]),
  ],
  controllers: [PayrollConfigurationController],
  providers: [
    PayrollConfigurationService,
    // Guards
    PayrollSpecialistGuard,
    PayrollManagerGuard,
    HRManagerGuard,
    // Event Listeners
    SigningBonusListener,
  ],
  exports: [
    PayrollConfigurationService,
    // Export guards for use in other modules if needed
    PayrollSpecialistGuard,
    PayrollManagerGuard,
    HRManagerGuard,
  ],
})
export class PayrollConfigurationModule { }

