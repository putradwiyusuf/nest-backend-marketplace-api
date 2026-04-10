import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'

// Modules
import { AuthModule } from './modules/auth/auth.module'
import { ListingsModule } from './modules/listings/listings.module'

@Module({
  imports: [
    // ENV CONFIG
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // DATABASE
    PrismaModule,
    // AUTH
    AuthModule,
    // LISTINGS
    ListingsModule,
  ],
})
export class AppModule { }