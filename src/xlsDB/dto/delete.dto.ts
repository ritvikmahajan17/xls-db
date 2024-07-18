import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeleteDto {
  @IsNotEmpty()
  where: Record<string, string>;

  @IsString()
  @IsNotEmpty()
  sheetId: string;

  @IsOptional()
  @IsString()
  sheetName: string;
}
