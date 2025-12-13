import { IsMongoId, IsOptional } from 'class-validator';

export class AssignParentDto {
  @IsMongoId()
  @IsOptional()
  parentDepartmentId?: string; // null to remove parent (make it root)
}
