import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, isString, IsString } from 'class-validator';

export class BatchAddDto {
  @IsNotEmpty()
  @ApiProperty({
    example: [
      {
        name: 'John Doe',
        age: '30',
        city: 'New York',
      },
      {
        name: 'Jane Doe',
        age: '25',
        city: 'Los Angeles',
      },
    ],
  })
  values: Record<string, string>[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '{your-sheet-id}',
    description: 'The ID of the Google Sheet where the data will be added.',
  })
  sheetId: string;

  @IsString()
  @IsNotEmpty()
  serviceClientEmail: string;

  @IsString()
  @IsNotEmpty()
  servicePrivateKey: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'UserData',
    description: 'The name of the sheet where the data will be added.',
    default: 'Sheet1',
  })
  sheetName: string;
}
