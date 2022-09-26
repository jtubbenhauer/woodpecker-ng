import { Set } from '../models/set';

export const randomArrayEl = (array: any[]) => {
  return array[Math.floor(Math.random() * array.length)];
};

export const getCurrentWinrate = (setData: Set) => {
  if (setData.failed >= setData.completed) {
    return '0';
  } else {
    return (
      ((setData.completed - setData.failed) / setData.completed) *
      100
    ).toFixed(0);
  }
};
