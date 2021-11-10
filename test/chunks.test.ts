import {expect} from 'chai';
import {
  byteToChunk, getCopyMask, toChunks, combinePartials,
} from '../src/chunks';


describe('Get Copy Mask', () => {
  it('1,3 on 8 bits => 11100000', () => {
    const m = getCopyMask(1, 3, 8);
    expect(m).to.equal('11100000');
  });
  it('1,5 on 8 bits => 11111000', () => {
    const m = getCopyMask(1, 5, 8);
    expect(m).to.equal('11111000');
  });
  it('3,7 on 8 bits => 00111110', () => {
    const m = getCopyMask(3, 7, 8);
    expect(m).to.equal('00111110');
  });
  it('2,6 on 8 bits => 01111100', () => {
    const m = getCopyMask(2, 6, 8);
    expect(m).to.equal('01111100');
  });
  it('5,8 on 8 bits => 00001111', () => {
    const m = getCopyMask(5, 8, 8);
    expect(m).to.equal('00001111');
  });
  it('2,5 on 5 bits => 01111', () => {
    const m = getCopyMask(2, 5, 5);
    expect(m).to.equal('01111');
  });
  it('1,3 on 5 bits => 11100', () => {
    const m = getCopyMask(1, 3, 5);
    expect(m).to.equal('11100');
  });
});

describe('Byte to Chunk', () => {
  it('0b11100000, 1,3 => 0b111', () => {
    const b = byteToChunk(0b11100000, getCopyMask(1, 3, 8));
    expect(b).to.equal(0b111);
  });
  it('0b00111000, 2,6 => 0b1110', () => {
    const b = byteToChunk(0b00111000, getCopyMask(2, 6, 8));
    expect(b).to.equal(0b01110);
  });
  it('0b00001111, 1,3 => 0b000', () => {
    const b = byteToChunk(0b00001111, getCopyMask(1, 3, 8));
    expect(b).to.equal(0b000);
  });
  it('0b00000000, 1,3 => 0b000', () => {
    const b = byteToChunk(0b00000000, getCopyMask(1, 3, 8));
    expect(b).to.equal(0b000);
  });
  it('0b00000110, 5,8 => 0b110', () => {
    const b = byteToChunk(0b00000110, getCopyMask(5, 8, 8));
    expect(b).to.equal(0b110);
  });
  it('0b01110110, 1,3 => 0b01100', () => {
    const b = byteToChunk(0b01110110, getCopyMask(1, 3, 8));
    expect(b).to.equal(0b11);
  });
});

describe('Combine Partials', () => {
  it('0b00111, 0b00011 < 0 => 0b11111', () => {
    const c = combinePartials({
      bits: 0b00111,
      length: 3,
    },
    {
      bits: 0b00011,
      length: 2,
    }); // r 0, l 0
    expect(c, `got ${c.toString(2)}`).to.equal(0b11111);
  });
  it('0b10 len 2, 0b111 len 3 => 0b10111', () => {
    const c = combinePartials({
      bits: 0b10,
      length: 2,
    },
    {
      bits: 0b111,
      length: 3,
    });
    expect(c, `got ${c.toString(2)}`).to.equal(0b10111);
  });
  it('0b010 len 3, 0b11 len 0 => 0b01011', () => {
    const c = combinePartials({
      bits: 0b010,
      length: 3, // account for 010 with leading 0 dropped
    },
    {
      bits: 0b11,
      length: 2,
    });
    expect(c, `got ${c.toString(2)}`).to.equal(0b01011);
  });
  it('0b01 len 2, 0b001 len 3=> 0b01001', () => {
    const c = combinePartials({
      bits: 0b1,
      length: 2, // account for 01 with leading 0 dropped
    },
    {
      bits: 0b1,
      length: 3, // acount for 001 with leading 0s dropped
    });
    expect(c, `got ${c.toString(2)}`).to.equal(0b01001);
  });
  it('0b01000 len 4, 0b001 len 1 => 0b10001', () => {
    const c = combinePartials({
      bits: 0b01000,
      length: 4, // account for 01000 with leading 0 dropped
    },
    {
      bits: 0b001,
      length: 1, // acount for 001 with leading 0s dropped
    });
    expect(c, `got ${c.toString(2)}`).to.equal(0b10001);
  });
});

xdescribe('To Chunks', () => {
  it('', () => {
    const uint8 = Uint8Array.from([
      0b10101010,
      0b11111111,
      0b10110100,
    ]);
    const chunks = toChunks(uint8);
    expect(chunks).to.equal([
      0b10101,
      0b01011,
      0b11111,
      0b11011,
      0b01000, // padded with 1 trailing zero
    ]);
  });
});
