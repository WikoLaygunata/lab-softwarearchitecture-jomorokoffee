import { IsNotEmpty, IsString, IsInt, IsNumber, Min, Max, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsMinWords } from '../decorators/min-words.decorator';

export class CreateProductDto {
  @ApiProperty({ example: 'Kopi Susu Gula Aren' })
  @IsString()
  @IsNotEmpty()
  @IsMinWords(3, { message: 'Product name must contain at least 3 words' }) // Kriteria 3 kata 
  name!: string;

  @ApiProperty({ example: 'Kopi espresso dengan susu segar murni dan pemanis alami gula aren' })
  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Product description must have at least 20 characters' }) // Kriteria 20 karakter 
  description!: string;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  @Min(1, { message: 'Price must be a positive integer (at least 1)' }) // Kriteria harga positif 
  price!: number;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  @Max(999, { message: 'Product stock must be between 0 and 999' }) // Kriteria stok 0-999 
  stock!: number;

  @ApiProperty({ example: 'http://image.url/kopi.png', required: false })
  @IsString()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  category_id!: number;
}

// DTO untuk aksi pengurangan kuantitas stok produk
export class ReduceStockDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  quantity!: number;
}