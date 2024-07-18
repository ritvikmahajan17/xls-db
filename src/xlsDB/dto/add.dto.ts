import { IsNotEmpty, IsOptional, isString, IsString } from 'class-validator';

export class AddDto {
  @IsNotEmpty()
  values: Record<string, string>;

  @IsString()
  @IsNotEmpty()
  sheetId: string;

  @IsOptional()
  @IsString()
  sheetName: string;
}
