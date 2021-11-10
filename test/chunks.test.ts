import { expect } from 'chai';
import { combinePartialsOld, byteToChunk, getCopyMask, toChunks, combinePartials } from '../src/chunks';


describe('Get Copy Mask', () => {
  it('1,3 on 8 bits => 11100000', () => {
  const m = getCopyMask(1,3,8);
  expect(m).to.equal('11100000');
 });
 it('1,5 on 8 bits => 11111000', () => {
  const m = getCopyMask(1,5,8);
  expect(m).to.equal('11111000');
 });
 it('3,7 on 8 bits => 00111110', () => {
  const m = getCopyMask(3,7,8);
  expect(m).to.equal('00111110');
 });
 it('2,6 on 8 bits => 01111100', () => {
  const m = getCopyMask(2,6,8);
  expect(m).to.equal('01111100');
 });
 it('5,8 on 8 bits => 00001111', () => {
  const m = getCopyMask(5,8,8);
  expect(m).to.equal('00001111');
 });
 it('2,5 on 5 bits => 01111', () => {
  const m = getCopyMask(2,5,5);
  expect(m).to.equal('01111');
 });
});

xdescribe('Old Combine Partials', () => {
  it('0b11100, 0b00011 => 0b11111', () => {
    const c = combinePartialsOld(0b11100, 0b00011); //r 0, l 0
    expect(c).to.equal(0b11111);
  });
  it('0b11000, 0b00111 => 0b11111', () => {
    const c = combinePartialsOld(0b11000, 0b00111); //r 0, l 0
    expect(c).to.equal(0b11111);
  });
  it('0b11000, 0b00011 => 0b11011', () => {
    const c = combinePartialsOld(0b11000, 0b00011); //r 0, l 0
    expect(c).to.equal(0b11011);
  });
  it('0b01000, 0b00011 => 0b01011', () => {
    const c = combinePartialsOld(0b01000, 0b00011); //r 0, l 0
    expect(c).to.equal(0b01011);
  });
  it('0b00010, 0b00111 => 0b10111', () => {
    const c = combinePartialsOld(0b00010, 0b00111); //r 3, l 0
    expect(c).to.equal(0b10111);
  });
  it('0b00111, 0b00010 => 0b10111', () => {
    const c = combinePartialsOld(0b00111, 0b00010); //r 2, l 0
    expect(c).to.equal(0b11110);
  });
  it('0b00111, 0b11000 => 0b11111', () => {
    const c = combinePartialsOld(0b00111, 0b11000); //r 2, l 3
    expect(c).to.equal(0b11111);
  });
  it('0b00111, 0b01000 => 0b11101', () => {
    const c = combinePartialsOld(0b00111, 0b01000); //r 2, l 3
    expect(c).to.equal(0b11101);
  });
  it('0b00111, 0b10000 => 0b11110', () => {
    const c = combinePartialsOld(0b00111, 0b10000); //r 2, l 3
    expect(c).to.equal(0b11110);
  });
  it('0b01101, 0b10000 => 0b11011', () => {
    const c = combinePartialsOld(0b01101, 0b10000); //r 1, l 4
    expect(c).to.equal(0b11011);
  });
  it('0b01101, 0b01000 => error (greater than 31)', () => {
    expect(() => combinePartialsOld(0b01101, 0b01000)).to.throw;
  });
  it('should throw error when total is greater than 31', () => {
    expect(() => combinePartialsOld(0b1111111, 0b00011)).to.throw;
  });
});

describe('Combine Partials', () => {
  it('0b11100 > 0, 0b00011 < 0 => 0b11111', () => {
    const c = combinePartials({
      bits: 0b11100,
      length: 0,
    },
    { 
      bits: 0b00011,
      length: 0,
    }); //r 0, l 0
    expect(c).to.equal(0b11111);
  });
  it('0b111 > 2, 0b11 < 0 => 0b11111', () => {
    const c = combinePartials({
      bits: 0b111,
      length: 2,
    },
    { 
      bits: 0b11,
      length: 0,
    }); //r 0, l 0
    expect(c).to.equal(0b11111);
  });
  it('0b10 > 3, 0b111 < 0 => 0b10111', () => {
    const c = combinePartials({
      bits: 0b10,
      length: 3,
    },
    { 
      bits: 0b111,
      length: 0,
    }); //r 0, l 0
    expect(c).to.equal(0b10111);
  });
 
});

describe('Byte to Chunk', () => {
  it('0b11100000, 1,3 => 0b111', () => {
    const b = byteToChunk(0b11100000, getCopyMask(1,3,8));
    expect(b).to.equal(0b111);
  });
  it('0b00111000, 2,6 => 0b1110', () => {
    const b = byteToChunk(0b00111000, getCopyMask(2,6,8));
    expect(b).to.equal(0b01110);
  });
  it('0b00001111, 1,3 => 0b000', () => {
    const b = byteToChunk(0b00001111, getCopyMask(1,3,8));
    expect(b).to.equal(0b000);
  });
  it('0b00000000, 1,3 => 0b000', () => {
    const b = byteToChunk(0b00000000, getCopyMask(1,3,8));
    expect(b).to.equal(0b000);
  });
  it('0b00000110, 5,8 => 0b110', () => {
    const b = byteToChunk(0b00000110, getCopyMask(5,8,8));
    expect(b).to.equal(0b110);
  });
});

describe('To Chunks', () => {
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