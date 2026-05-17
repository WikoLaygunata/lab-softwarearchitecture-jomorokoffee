import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Memastikan koneksi ke database MySQL terjalin saat service dinyalakan
    await this.$connect();
  }
}