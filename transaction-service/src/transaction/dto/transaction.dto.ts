import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  product_id!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity!: number;
}

export class UpdateQuantityDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity!: number;
}