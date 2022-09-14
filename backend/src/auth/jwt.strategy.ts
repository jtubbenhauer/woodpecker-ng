import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

//https://medium.com/@bruceguenkam/how-to-create-authentication-system-with-jwt-using-nestjs-and-prisma-e803d899a7a7

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }
}
