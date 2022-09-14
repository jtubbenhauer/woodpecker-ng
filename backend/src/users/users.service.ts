import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '../../prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { hash, compare } from 'bcrypt';

interface FormatLogin extends Partial<User> {
  login: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(user): Promise<any> {
    const existingUser = await this.prisma.user.findFirst({
      where: { login: user.login },
    });

    if (existingUser) {
      throw new HttpException('user_already_exists', HttpStatus.CONFLICT);
    }

    return this.prisma.user.create({
      ...user,
      password: await hash(user.password, 10),
    });
  }

  async findByLogin({ login, password }): Promise<FormatLogin> {
    const user = await this.prisma.user.findFirst({ where: { login } });

    if (!user) {
      throw new HttpException('invalid_credentials', HttpStatus.UNAUTHORIZED);
    }

    //Compare passwords
    const correctPassword = await compare(password, user.password);

    if (!correctPassword) {
      throw new HttpException('invalid_credentials', HttpStatus.UNAUTHORIZED);
    }

    const { password: p, ...rest } = user;
    return rest;
  }

  async findByPayload({ login }): Promise<any> {
    return this.prisma.user.findFirst({ where: { login } });
  }
}
