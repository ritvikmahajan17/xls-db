import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDto {
  @IsNotEmpty()
  where: Record<string, string>;

  @IsNotEmpty()
  newValues: Record<string, string>;

  @IsString()
  @IsNotEmpty()
  sheetId: string;
}
