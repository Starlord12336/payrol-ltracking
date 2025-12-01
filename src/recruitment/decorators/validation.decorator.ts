import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsValidApplicationStatus(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidApplicationStatus',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const validStatuses = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'REJECTED', 'HIRED'];
          return typeof value === 'string' && validStatuses.includes(value.toUpperCase());
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid ApplicationStatus (APPLIED, SHORTLISTED, INTERVIEW, OFFER, REJECTED, HIRED)`;
        },
      },
    });
  };
}

export function IsValidInterviewMethod(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidInterviewMethod',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const validMethods = ['IN_PERSON', 'VIDEO', 'PHONE'];
          return typeof value === 'string' && validMethods.includes(value.toUpperCase());
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid InterviewMethod (IN_PERSON, VIDEO, PHONE)`;
        },
      },
    });
  };
}

export function IsValidInterviewStatus(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidInterviewStatus',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const validStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'];
          return typeof value === 'string' && validStatuses.includes(value.toUpperCase());
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid InterviewStatus (SCHEDULED, COMPLETED, CANCELLED, RESCHEDULED)`;
        },
      },
    });
  };
}

export function IsValidOfferResponseStatus(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidOfferResponseStatus',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED'];
          return typeof value === 'string' && validStatuses.includes(value.toUpperCase());
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid OfferResponseStatus (PENDING, ACCEPTED, REJECTED)`;
        },
      },
    });
  };
}

export function IsValidOfferFinalStatus(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidOfferFinalStatus',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
          return typeof value === 'string' && validStatuses.includes(value.toUpperCase());
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid OfferFinalStatus (PENDING, APPROVED, REJECTED)`;
        },
      },
    });
  };
}

export function IsValidApprovalStatus(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidApprovalStatus',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
          return typeof value === 'string' && validStatuses.includes(value.toUpperCase());
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid ApprovalStatus (PENDING, APPROVED, REJECTED)`;
        },
      },
    });
  };
}

export function IsValidAssignee(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidAssignee',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const validAssignees = ['candidate', 'hr'];
          return typeof value === 'string' && validAssignees.includes(value.toLowerCase());
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be either 'candidate' or 'hr'`;
        },
      },
    });
  };
}

export function IsValidDateRange(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidDateRange',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value || typeof value !== 'object') return false;
          const { startDate, endDate } = value;
          if (!startDate || !endDate) return false;
          const start = new Date(startDate);
          const end = new Date(endDate);
          return start <= end;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must have startDate <= endDate`;
        },
      },
    });
  };
}
