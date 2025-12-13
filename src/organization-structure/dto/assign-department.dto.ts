import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignDepartmentDto {
  @IsMongoId()
  @IsNotEmpty()
  departmentId: string;
}
