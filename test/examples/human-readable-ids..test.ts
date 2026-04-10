import {expect} from 'chai';
import generateId from '../../src/examples/human-readable-ids';

describe('generate id', () => {
  it('should generate an 8 char id', () => {
    const id = generateId();
    expect(id).length.to.equal(8);
  });
});
