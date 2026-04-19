import {encode} from '../index.js';
import {randomBytes} from 'crypto';

const MIN_LENGTH = 2;

const generateId = (length: number): string => {
  if (length < MIN_LENGTH || !Number.isInteger(length)) {
    throw new Error(`Length must be an integer of at least ${MIN_LENGTH}: was ${length}`);
  }
  return encode(randomBytes(length));
};

export default generateId;

