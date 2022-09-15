import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PuzzleService {
  constructor(private prisma: PrismaService) {}

  getRandom() {
    const skip = Math.floor(Math.random() * 1000);
    return this.prisma.puzzle.findFirst({ skip: skip });
  }
}
