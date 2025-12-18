import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class ProcessSigningBonusDto {
    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    contractId: string;
}
