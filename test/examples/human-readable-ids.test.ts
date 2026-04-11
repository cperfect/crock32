import {expect} from 'chai';
import generateId from '../../src/examples/human-readable-ids';

describe('generate id', () => {
  it('should generate an 8 char id', () => {
    const id = generateId(5);
    expect(id).to.have.lengthOf(8);
    expect(id).to.match(/^[0-9A-Z]+$/);
  });
  it('should throw for length less than 2', () => {
    expect(() => generateId(1)).to.throw(Error);
  });
  it('should throw for non-integer length', () => {
    expect(() => generateId(2.5)).to.throw(Error);
  });
});
