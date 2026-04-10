import {encode} from '../index';
import {randomBytes} from 'crypto';

const MIN_LENGTH = 2;

const generateId = (length: number): string => {
  if (length < MIN_LENGTH || !Number.isInteger(length) {
    throw new Error(`Length must be an integer greater than 2: was ${length}`);
  }
  if (Number.isInteger(length * 8 / 5)) {
    return encode(randomBytes(length));
  } 
  return encode(randomBytes(length+1).slice(length - 1)); // 5 bytes will generate exactly 8 characters
};

export default generateId;

