import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartItemDto } from './dto/transaction.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TransactionService {
  private readonly productServiceUrl = 'http://localhost:3002';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // --- HELPER: Generator Token Admin Internal ---
  // Karena rute /admin/* di Product Service terkunci Guard ADMIN, 
  // Transaction Service harus membuat token admin sementara untuk melakukan perubahan stok
  private generateAdminToken() {
    return this.jwtService.sign({ id: 0, role: 'ADMIN' });
  }

  // --- LOGIKA SHOPPING CART ---
  async getCart(userId: number) {
    const cart = await this.prisma.cart.findFirst({
      where: { user_id: userId },
      include: { items: true },
    });

    if (!cart) return { items: [] };

    // Ambil detail nama dan harga produk dari Product Service
    const enrichedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const res = await fetch(`${this.productServiceUrl}/products/${item.product_id}`);
          if (!res.ok) throw new Error();
          const product = await res.json();
          return {
            id: item.id,
            product_id: item.product_id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
          };
        } catch {
          return { product_id: item.product_id, name: 'Unknown Product', price: 0, quantity: item.quantity };
        }
      }),
    );

    return { id: cart.id, user_id: cart.user_id, items: enrichedItems };
  }

  async addToCart(userId: number, dto: CartItemDto) {
    // 1. Ambil info produk dari Product Service untuk cek stok
    const res = await fetch(`${this.productServiceUrl}/products/${dto.product_id}`);
    if (!res.ok) throw new NotFoundException('Product not found in catalog');
    const product = await res.json();

    if (dto.quantity > product.stock) {
      throw new BadRequestException('Requested quantity exceeds product stock availability'); // [cite: 181]
    }

    // 2. Ambil atau buat keranjang belanja (parent) baru
    let cart = await this.prisma.cart.findFirst({ where: { user_id: userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { user_id: userId } });
    }

    // 3. Cek validasi apakah produk sudah ada di dalam keranjang belanja
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cart_id: cart.id, product_id: dto.product_id },
    });
    if (existingItem) {
      throw new BadRequestException('The product must not already exist in the cart');
    }

    // 4. Masukkan item baru
    await this.prisma.cartItem.create({
      data: {
        cart_id: cart.id,
        product_id: dto.product_id,
        quantity: dto.quantity,
      },
    });

    return { message: 'Item added to cart successfully' };
  }

  async updateCartItem(userId: number, productId: number, quantity: number) {
    const cart = await this.prisma.cart.findFirst({ where: { user_id: userId } });
    if (!cart) throw new NotFoundException('Cart record not found');

    const cartItem = await this.prisma.cartItem.findFirst({
      where: { cart_id: cart.id, product_id: productId },
    });
    if (!cartItem) throw new NotFoundException('Item not found in cart');

    // Cek ketersediaan stok barang terbaru di Product Service
    const res = await fetch(`${this.productServiceUrl}/products/${productId}`);
    if (!res.ok) throw new NotFoundException('Product not found');
    const product = await res.json();

    if (quantity > product.stock) {
      throw new BadRequestException('Requested quantity exceeds product stock availability');
    }

    await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    return { message: 'Cart item updated successfully' };
  }

  async deleteCartItem(userId: number, productId: number) {
    const cart = await this.prisma.cart.findFirst({ where: { user_id: userId } });
    if (!cart) throw new NotFoundException('Cart not found');

    const cartItem = await this.prisma.cartItem.findFirst({
      where: { cart_id: cart.id, product_id: productId },
    });
    if (!cartItem) throw new NotFoundException('Item not found in cart');

    await this.prisma.cartItem.delete({ where: { id: cartItem.id } });
    return { message: 'Product removed from cart successfully' };
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findFirst({ where: { user_id: userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
    }
    return { message: 'Cart cleared successfully' };
  }

  // --- LOGIKA CHECKOUT & ORDERS ---
  async checkout(userId: number) {
    const cart = await this.prisma.cart.findFirst({
      where: { user_id: userId },
      include: { items: true },
    });

    // Validasi isi keranjang kosong
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout. Your cart is empty.');
    }

    // 1. Buat record Order induk
    const order = await this.prisma.order.create({
      data: { user_id: userId },
    });

    // 2. Loop setiap item di cart untuk dipindahkan ke order_detail & potong stok
    const adminToken = this.generateAdminToken();
    for (const item of cart.items) {
      // Ambil snapshot harga terupdate dari Product Service
      const res = await fetch(`${this.productServiceUrl}/products/${item.product_id}`);
      if (!res.ok) throw new NotFoundException(`Product ID ${item.product_id} no longer exists`);
      const product = await res.json();

      // Create record child order detail
      await this.prisma.orderDetail.create({
        data: {
          order_id: order.id,
          product_id: item.product_id,
          price: product.price,
          quantity: item.quantity,
        },
      });

      await fetch(`${this.productServiceUrl}/admin/products/${item.product_id}/reduce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ quantity: item.quantity }),
      });
    }

    await this.clearCart(userId);

    return { message: 'Checkout processed successfully. Order created.' };
  }

  async getOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { user_id: userId },
      include: { details: true },
    });
  }

  async getOrderDetail(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { details: true },
    });
    if (!order) throw new NotFoundException('Order record not found');

    const enrichedDetails = await Promise.all(
      order.details.map(async (detail) => {
        try {
          const res = await fetch(`${this.productServiceUrl}/products/${detail.product_id}`);
          const product = await res.json();
          return {
            product_id: detail.product_id,
            name: product.name,
            quantity: detail.quantity,
            price: detail.price,
          };
        } catch {
          return { product_id: detail.product_id, name: 'Unknown Item', quantity: detail.quantity, price: detail.price };
        }
      }),
    );

    return {
      order_id: order.id,
      user_id: order.user_id,
      created_at: order.created_at,
      products: enrichedDetails,
    };
  }
}