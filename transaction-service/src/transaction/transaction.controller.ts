import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CartItemDto, UpdateQuantityDto } from './dto/transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Shopping Cart & Orders')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // --- ENDPOINT SHOPPING CART ---
  @Get('cart')
  @ApiOperation({ summary: 'Retrieve authenticated user shopping cart' })
  async getCart(@Req() req: any) {
    return this.transactionService.getCart(req.user.id);
  }

  @Post('cart')
  @ApiOperation({ summary: 'Add item to shopping cart' })
  async addToCart(@Req() req: any, @Body() dto: CartItemDto) {
    return this.transactionService.addToCart(req.user.id, dto);
  }

  @Post('cart/:product_id/update')
  @ApiOperation({ summary: 'Update product quantity in cart' })
  async updateCartItem(
    @Req() req: any,
    @Param('product_id', ParseIntPipe) productId: number,
    @Body() dto: UpdateQuantityDto
  ) {
    return this.transactionService.updateCartItem(req.user.id, productId, dto.quantity);
  }

  @Post('cart/:product_id/delete')
  @ApiOperation({ summary: 'Delete specific product from cart' })
  async deleteCartItem(@Req() req: any, @Param('product_id', ParseIntPipe) productId: number) {
    return this.transactionService.deleteCartItem(req.user.id, productId);
  }

  @Post('cart/clear')
  @ApiOperation({ summary: 'Clear all items from the user cart' })
  async clearCart(@Req() req: any) {
    return this.transactionService.clearCart(req.user.id);
  }

  // --- ENDPOINT CHECKOUT & ORDERS ---
  @Post('orders')
  @ApiOperation({ summary: 'Process checkout and place an order' })
  async checkout(@Req() req: any) {
    return this.transactionService.checkout(req.user.id);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List all authenticated user orders' })
  async getOrders(@Req() req: any) {
    return this.transactionService.getOrders(req.user.id);
  }

  @Post('orders/:id')
  @ApiOperation({ summary: 'Fetch single order detail' })
  async getOrderDetail(@Param('id', ParseIntPipe) id: number) {
    return this.transactionService.getOrderDetail(id);
  }
}