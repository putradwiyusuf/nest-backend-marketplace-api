/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    })
    const token = this.generateToken(user.id, user.email)
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        isShownPhone: user.isShownPhone || false,
      },
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (!user) throw new UnauthorizedException('Invalid credentials')

    const isMatch = await bcrypt.compare(dto.password, user.password)

    if (!isMatch) throw new UnauthorizedException('Invalid credentials')

    const token = this.generateToken(user.id, user.email, user.role)
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isShownPhone: user.isShownPhone,
        role: user.role,
      },
    }
  }

  private generateToken(userId: string, email: string, role?: string) {
    return {
      access_token: this.jwt.sign({
        sub: userId,
        email,
        role
      }),
    }
  }
}