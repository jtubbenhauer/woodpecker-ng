import { Chess, Move, Square, SQUARES } from 'chess.js';
import { Key, Piece, PiecesDiff } from 'chessground/types';

export const toColour = (chess: Chess) => {
  return chess.turn() == 'w' ? 'white' : 'black';
};

export const getOrientation = (chess: Chess) => {
  return chess.turn() == 'w' ? 'black' : 'white';
};

export const convertSingleMove = (
  move: string
): { from: Key; to: Key; promotion: string | undefined } => {
  if (move.length == 4) {
    return {
      from: move.substring(0, 2) as Key,
      to: move.substring(2, 4) as Key,
      promotion: undefined,
    };
  } else {
    return {
      from: move.substring(0, 2) as Key,
      to: move.substring(2, 4) as Key,
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

export const convertPromotionPiece = (piece: string) => {
  switch (piece) {
    case 'q':
      return 'queen';
    case 'r':
      return 'rook';
    case 'n':
      return 'knight';
    case 'b':
      return 'bishop';
    default:
      return 'queen';
  }
};

export const getPromotionDisplaySquares = (
  dest: Key,
  chess: Chess
): [Key, Piece][] => {
  const chars = dest.split('');
  if (chars[1] == '8') {
    return [
      [
        [chars[0], '8'].join('') as Key,
        { role: 'queen', color: toColour(chess) },
      ],
      [
        [chars[0], '7'].join('') as Key,
        { role: 'rook', color: toColour(chess) },
      ],
      [
        [chars[0], '6'].join('') as Key,
        { role: 'knight', color: toColour(chess) },
      ],
      [
        [chars[0], '5'].join('') as Key,
        { role: 'bishop', color: toColour(chess) },
      ],
    ];
  } else {
    return [
      [
        [chars[0], '1'].join('') as Key,
        { role: 'queen', color: toColour(chess) },
      ],
      [
        [chars[0], '2'].join('') as Key,
        { role: 'rook', color: toColour(chess) },
      ],
      [
        [chars[0], '3'].join('') as Key,
        { role: 'knight', color: toColour(chess) },
      ],
      [
        [chars[0], '4'].join('') as Key,
        { role: 'bishop', color: toColour(chess) },
      ],
    ];
  }
};

export const getWrongPromotionSquares = (dest: Key): any => {
  let arr = dest.split('');
  if (arr[1] == '1') {
    return [
      [[arr[0], '3'].join('') as Key, undefined],
      [[arr[0], '4'].join('') as Key, undefined],
    ];
  } else {
    return [
      [[arr[0], '6'].join('') as Key, undefined],
      [[arr[0], '5'].join('') as Key, undefined],
    ];
  }
};
