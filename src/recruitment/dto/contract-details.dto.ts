export class ContractDetailsResponseDto {
  _id: string;
  offerId: string;
  acceptanceDate: Date;
  grossSalary: number;
  signingBonus?: number;
  role: string;
  benefits?: string[];
  documentId?: string;
  employeeSignatureUrl?: string;
  employerSignatureUrl?: string;
  employeeSignedAt?: Date;
  employerSignedAt?: Date;
}
