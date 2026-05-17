import { ApiProperty } from '@nestjs/swagger'; // 
import { IsEmail, IsNotEmpty, IsString, IsAlpha, MinLength, Matches, NotContains } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John' }) // 
  @IsString()
  @IsNotEmpty()
  @IsAlpha('en-US', { message: 'First name must contain letters only' })
  first_name!: string;

  @ApiProperty({ example: 'Doe' }) // 
  @IsString()
  @IsNotEmpty()
  @IsAlpha('en-US', { message: 'Last name must contain letters only' })
  last_name!: string;

  @ApiProperty({ example: 'john.doe@gmail.com' }) // 
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty()
  @Matches(/(.com|.net|.org|.id)$/, { message: 'Email must end with a valid domain such as .com, .net, .org, or .id' })
  email!: string;

  @ApiProperty({ example: 'Password123' }) // 
  @IsString()
  @IsNotEmpty()
  @NotContains(' ', { message: 'Password cannot contain spaces' })
  @MinLength(8, { message: 'Password must have a minimum of 8 total characters' })
  @Matches(/(.*[0-9].*[0-9])/, { message: 'Password must contain at least 2 numeric digits' })
  password!: string;

  @ApiProperty({ example: 'CUSTOMER', description: 'Available roles: ADMIN or CUSTOMER' }) // 
  @IsString()
  @IsNotEmpty()
  role!: string;
}