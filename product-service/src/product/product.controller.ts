import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, ReduceStockDto } from './dto/product.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Products & Categories')
@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // --- PUBLIC ROUTES (GUEST & CUSTOMER) ---
  @Get('products')
  @ApiOperation({ summary: 'List all products' })
  async getAllProducts() {
    return this.productService.findAllProducts();
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get details of a specific product' })
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findProductById(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all available categories' })
  async getAllCategories() {
    return this.productService.findAllCategories();
  }

  @Get('categories/:categoryId/products')
  @ApiOperation({ summary: 'Filter products by category' })
  async getProductsByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.productService.findProductsByCategory(categoryId);
  }

  // --- PROTECTED ROUTES (ADMIN ONLY) ---
  @Post('admin/products')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Proteksi ganda token + role admin 
  @ApiOperation({ summary: 'Create a new product (Admin Only)' })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  @Post('admin/products/:id/update')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Update product details (Admin Only)' })
  async updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateProductDto) {
    return this.productService.updateProduct(id, dto);
  }

  @Post('admin/products/:id/reduce')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Reduce product quantity stock (Admin/Internal System Only)' })
  async reduceStock(@Param('id', ParseIntPipe) id: number, @Body() dto: ReduceStockDto) {
    return this.productService.reduceStock(id, dto.quantity);
  }

  @Post('admin/products/:id/delete')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiOperation({ summary: 'Delete product (Admin Only)' })
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.deleteProduct(id);
  }
}