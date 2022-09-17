import {Controller, Get} from '@nestjs/common';
import {PuzzleService} from './puzzle.service';

@Controller('puzzle')
export class PuzzleController {
  constructor(private readonly puzzleService: PuzzleService) {
  }

  @Get('random')
  getRandom() {
    return this.puzzleService.getRandom();
  }

  @Get('promotion')
  getPromotion() {
    return this.puzzleService.getPromotion();
  }
}
