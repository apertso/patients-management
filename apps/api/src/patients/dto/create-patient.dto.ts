import { IsDateString, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phoneNumber?: string;

  @IsDateString()
  dob!: string;
}
