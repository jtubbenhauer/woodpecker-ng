import { Chess, Move, Square, SQUARES } from 'chess.js';
import { Key } from 'chessground/types';

export const toColour = (chess: Chess) => {
  return chess.turn() == 'w' ? 'white' : 'black';
};

export const getOrientation = (chess: Chess) => {
  return chess.turn() == 'w' ? 'black' : 'white';
};

export const convertSingleMove = (move: string) => {
  if (move.length == 4) {
    return {
      from: move.substring(0, 2),
      to: move.substring(2, 4),
    };
  } else {
    return {
      from: move.substring(0, 2),
      to: move.substring(2, 4),
      promotion: move.substring(4, 5),
    };
  }
};

export const getLegalMoves = (chess: Chess) => {
  const legalMoves = new Map();
  SQUARES.forEach((square) => {
    const moves = chess.moves({ square: square, verbose: true });
    if (moves.length) {
      legalMoves.set(
        square,
        moves.map((move) => typeof move !== 'string' && move.to)
      );
    }
  });
  return legalMoves;
};

export const getPieceTypeAtOrig = (orig: Key, chess: Chess) => {
  return chess.get(orig as Square);
};

export const isPromotion = (orig: Key, chess: Chess) => {
  let pieceData = getPieceTypeAtOrig(orig, chess);
  if (pieceData.type == 'p') {
    if (pieceData.color == 'b' && orig.substring(1, 2) == '2') {
      return true;
    } else return pieceData.color == 'w' && orig.substring(1, 2) == '7';
  } else {
    return false;
  }
};

export const getLastMove = (chess: Chess): Move => {
  const arr = chess.history({ verbose: true });
  return arr[arr.length - 1] as Move;
};
