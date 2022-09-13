import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { puzzles } from '../../prisma/client';

@Injectable()
export class PuzzleService {
  constructor(private prisma: PrismaService) {}

  getRandom() {
    const skip = Math.floor(Math.random() * 1000);
    return this.prisma.puzzles.findFirst({ skip: skip });
  }
}
