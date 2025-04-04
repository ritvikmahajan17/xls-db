import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, isString, IsString } from 'class-validator';

export class AddDto {
  @IsNotEmpty()
  @ApiProperty({
    example: {
      name: 'John Doe',
      age: '30',
      city: 'New York',
    },
  })
  values: Record<string, string>;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '{your-sheet-id}',
    description: 'The ID of the Google Sheet where the data will be added.',
  })
  sheetId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '{your-service-client-email}',
    description:
      'The email of the service account used to access the Google Sheet.',
  })
  serviceClientEmail: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '{your-service-private-key}',
    description:
      'The private key of the service account used to access the Google Sheet.',
  })
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
