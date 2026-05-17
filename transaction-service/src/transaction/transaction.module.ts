import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'SECRET_KEY_JOMORO_KOFFEE',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, JwtStrategy],
})
export class TransactionModule {}