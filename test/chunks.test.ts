import { expect } from 'chai';
import { combinePartials, copyBits, getCopyMask, toChunks } from '../src/chunks';


describe('Get Copy Mask', () => {
  it('1,3 => 11100000', () => {
  const m = getCopyMask(1,3);
  expect(m).to.equal('11100000');
 });
 it('1,5 => 11111000', () => {
  const m = getCopyMask(1,5);
  expect(m).to.equal('11111000');
 });
 it('3,7 => 00111110', () => {
  const m = getCopyMask(3,7);
  expect(m).to.equal('00111110');
 });
 it('2,6 => 01111100', () => {
  const m = getCopyMask(2,6);
  expect(m).to.equal('01111100');
 });
 it('5,8 => 00001111', () => {
  const m = getCopyMask(5,8);
  expect(m).to.equal('00001111');
 });
});

describe('Combine Partials', () => {
  it('0b11100, 0b00011 => 0b11111', () => {
    const c = combinePartials(0b11100, 0b00011);
    expect(c).to.equal(0b11111);
  });
  it('0b11000, 0b00011 => 0b11011', () => {
    const c = combinePartials(0b11000, 0b00011);
    expect(c).to.equal(0b11011);
  });
  it('should throw error when total is greated than 31', () => {
    expect(() => combinePartials(0b1111111, 0b00011)).to.throw;
  });
});

describe('Copy Bits', () => {
  it('11100000, 1,3 => 111', () => {
    const b = copyBits(0b11100000, getCopyMask(1,3));
    expect(b).to.equal(0b111);
  });
  it('00111000, 2,6 => 1110', () => {
    const b = copyBits(0b00111000, getCopyMask(2,6));
    expect(b).to.equal(0b01110);
  });
});

xdescribe('To Chunks', () => {
  it('', () => {
    const uint8 = Uint8Array.from([
      0b10101010,
      0b11111111,
      0b10110000,
    ]);
    const chunks = toChunks(uint8);
    expect(chunks).to.equal([
      0b10101,
      0b01011,
      0b11111,
      0b11011,
      0b00000, //padded with 1 trailing zero
    ]);
  });
});