import { IsNotEmpty, IsString } from 'class-validator';

export class FindDto {
  @IsNotEmpty()
  where: Record<string, string>;

  @IsString()
  @IsNotEmpty()
  sheetId: string;
}
