import { Module } from '@nestjs/common';
import { PuzzleService } from './puzzle.service';
import { PuzzleController } from './puzzle.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PuzzleController],
  providers: [PuzzleService, PrismaService],
})
export class PuzzleModule {}
