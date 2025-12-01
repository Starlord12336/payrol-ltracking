import { IsString, IsEnum } from 'class-validator';
import { DocumentType } from '../enums/document-type.enum';

export class UploadOnboardingDocumentDto {
  @IsString()
  employeeId: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsString()
  filePath: string;
}
