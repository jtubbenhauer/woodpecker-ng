import {Injectable} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import {hash} from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {User} from "../../prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    const bcrypt = require('bcrypt');

    if (user && bcrypt.compare(password, hash)) {
      const {password, ...result} = user;
      return result;
    }

    return null;
  }

  async login(user: User) {
    const payload = {username: user.login, sub: user.id}

    return {
      access_token: this.jwtService.sign(payload)
    }
  }
}
