import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PuzzleModule } from './puzzle/puzzle.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [PuzzleModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
