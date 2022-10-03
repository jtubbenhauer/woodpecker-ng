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

export const timeToString = (time: number) => {
  let hours = Math.floor(time / 3600);
  let minutes = Math.floor((time % 3600) / 60);
  let seconds = time % 60;
  let minuteString =
    minutes.toString().length == 1
      ? `0${minutes.toString()}`
      : minutes.toString();
  let secondString =
    seconds.toString().length == 1
      ? `0${seconds.toString()}`
      : seconds.toString();
  return {
    hours: hours.toString(),
    minutes: minuteString,
    seconds: secondString,
  };
};