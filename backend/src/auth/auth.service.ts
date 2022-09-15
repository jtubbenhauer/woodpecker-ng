import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    const bcrypt = require('bcrypt');

    if (user && bcrypt.compare(password, hash)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }
}
