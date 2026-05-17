import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAllProducts() {
    return this.prisma.product.findMany();
  }

  async findProductById(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findAllCategories() {
    return this.prisma.category.findMany();
  }

  async findProductsByCategory(categoryId: number) {
    return this.prisma.product.findMany({ where: { category_id: categoryId } });
  }

  // --- MANAGEMENT ENDPOINTS (ADMIN) ---
  async createProduct(dto: CreateProductDto) {
    const categoryExists = await this.prisma.category.findUnique({ where: { id: dto.category_id } });
    if (!categoryExists) throw new BadRequestException('Invalid category id');

    return this.prisma.product.create({
      data: dto,
    });
  }

  async updateProduct(id: number, dto: CreateProductDto) {
    await this.findProductById(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async reduceStock(id: number, quantity: number) {
    const product = await this.findProductById(id);
    
    if (quantity > product.stock) {
      throw new BadRequestException('Requested quantity exceeds product stock availability');
    }

    return this.prisma.product.update({
      where: { id },
      data: { stock: product.stock - quantity },
    });
  }

  async deleteProduct(id: number) {
    await this.findProductById(id);
    await this.prisma.product.delete({ where: { id } });
    return { message: 'Product deleted successfully' };
  }
}