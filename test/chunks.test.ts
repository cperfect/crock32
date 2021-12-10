import {expect} from 'chai';
import {
  byteToChunk,
  getCopyMask,
  toChunks,
  combinePartialChunks,
  combinePartialBytes,
  fromChunks,
} from '../src/chunks';


describe('Get Copy Mask', () => {
  it('1,3 on 8 bits => 11100000', () => {
    const m = getCopyMask(1, 3, 8);
    expect(m).to
        .deep.equal({bits: Number.parseInt('11100000', 2), leftShift: 5});
  });
  it('1,5 on 8 bits => 11111000', () => {
    const m = getCopyMask(1, 5, 8);
    expect(m).to
        .deep.equal({bits: Number.parseInt('11111000', 2), leftShift: 3});
  });
  it('3,7 on 8 bits => 00111110', () => {
    const m = getCopyMask(3, 7, 8);
    expect(m).to
        .deep.equal({bits: Number.parseInt('00111110', 2), leftShift: 1});
  });
  it('2,6 on 8 bits => 01111100', () => {
    const m = getCopyMask(2, 6, 8);
    expect(m).to
        .deep.equal({bits: Number.parseInt('01111100', 2), leftShift: 2});
  });
  it('5,8 on 8 bits => 00001111', () => {
    const m = getCopyMask(5, 8, 8);
    expect(m).to
        .deep.equal({bits: Number.parseInt('00001111', 2), leftShift: 0});
  });
  it('2,5 on 5 bits => 01111', () => {
    const m = getCopyMask(2, 5, 5);
    expect(m).to
        .deep.equal({bits: Number.parseInt('01111', 2), leftShift: 0});
  });
  it('1,3 on 5 bits => 11100', () => {
    const m = getCopyMask(1, 3, 5);
    expect(m).to
        .deep.equal({bits: Number.parseInt('11100', 2), leftShift: 2});
  });
  it('3,5 on 5 bits => 00111', () => {
    const m = getCopyMask(3, 5, 5);
    expect(m).to
        .deep.equal({bits: Number.parseInt('00111', 2), leftShift: 0});
  });
  it('2,4 on 5 bits => 01110', () => {
    const m = getCopyMask(2, 4, 5);
    expect(m).to
        .deep.equal({bits: Number.parseInt('01110', 2), leftShift: 1});
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
  it('0b11111111, 3, 8,7 => 0b11111', () => {
    const b = byteToChunk(0b11111111, getCopyMask(3, 7, 8));
    expect(b, `got ${b.toString(2)}`).to.equal(0b11111);
  });
  it('0b11111111, 1, 3,5 => 0b111', () => {
    const b = byteToChunk(0b11111111, getCopyMask(1, 3, 5));
    expect(b, `got ${b.toString(2)}`).to.equal(0b111);
  });
  it('0b11111111, 3, 5,5 => 0b111', () => {
    const b = byteToChunk(0b11111111, getCopyMask(3, 5, 5));
    expect(b, `got ${b.toString(2)}`).to.equal(0b111);
  });
  it('0b11111111, 1, 5,5 => 0b11111', () => {
    const b = byteToChunk(0b11111111, getCopyMask(1, 5, 5));
    expect(b, `got ${b.toString(2)}`).to.equal(0b11111);
  });
});

describe('Combine Partial Chunks', () => {
  it('0b00111, 0b00011 < 0 => 0b11111', () => {
    const c = combinePartialChunks({
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
    const c = combinePartialChunks({
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
    const c = combinePartialChunks({
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
    const c = combinePartialChunks({
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
    const c = combinePartialChunks({
      bits: 0b01000,
      length: 4, // account for 01000 with leading 0 dropped
    },
    {
      bits: 0b001,
      length: 1,
    });
    expect(c, `got ${c.toString(2)}`).to.equal(0b10001);
  });
  it('0b01000 len 4, 0b011 len 2 => error', () => {
    expect(function() {
      combinePartialChunks({
        bits: 0b01000,
        length: 4, // account for 01000 with leading 0 dropped
      },
      {
        bits: 0b011,
        length: 2,
      });
    }).to.throw(Error);
  });
});

describe('To Chunks', () => {
  it('multiple bytes with padding', () => {
    const uint8 = Uint8Array.from([
      0b10101010,
      0b11111111,
      0b10110100,
    ]);
    const chunks = toChunks(uint8);
    // eslint-disable-next-line max-len
    expect(chunks).to.deep.equal([
      0b10101,
      0b01011,
      0b11111,
      0b11011,
      0b01000, // padded with 1 trailing zero
    ]);
  });
  it('single byte', () => {
    const uint8 = Uint8Array.from([
      0b10101000,
    ]);
    const chunks = toChunks(uint8);
    // eslint-disable-next-line max-len
    expect(chunks).to.deep.equal([
      0b10101,
      0b00000,
    ]);
  });
  it('multiple bytes without padding', () => {
    const uint8 = Uint8Array.from([
      0b10101010,
      0b11111111,
      0b10110100,
      0b11110000,
      0b00001111,
    ]);
    const chunks = toChunks(uint8);
    // eslint-disable-next-line max-len
    expect(chunks).to.deep.equal([
      0b10101,
      0b01011,
      0b11111,
      0b11011,
      0b01001,
      0b11100,
      0b00000,
      0b01111, // no padding
    ]);
  });
});

describe('Combine Partial Bytes', () => {
  it('0b00111, 0b00011 < 0 => 0b11111', () => {
    const c = combinePartialBytes(
        [
          {
            bits: 0b00111,
            length: 3,
          },
          {
            bits: 0b00011,
            length: 2,
          },
          {
            bits: 0b00011,
            length: 3,
          },
        ],
    );
    expect(c, `got ${c.toString(2)}`).to.equal(0b11111011);
  });
  it('0b00111, 0b00011 < 0 => 0b11111', () => {
    const c = combinePartialBytes(
        [
          {
            bits: 0b00111,
            length: 3,
          },
          {
            bits: 0b00011,
            length: 2,
          },
        ],
    );
    expect(c, `got ${c.toString(2)}`).to.equal(0b11111000);
  });
  it('0b00111, 0b00011 < 0 => 0b11111', () => {
    expect(function() {
      combinePartialBytes(
          [
            {
              bits: 0b00111,
              length: 3,
            },
            {
              bits: 0b00011,
              length: 2,
            },
            {
              bits: 0b00011,
              length: 4,
            },
          ],
      );
    }).to.throw(Error);
  });
});

describe('From Chunks', () => {
  it('multiple chunks with padding', () => {
    const chunks = [
      0b10101,
      0b01011,
      0b11111,
      0b11011,
      0b01000, // padded with 1 trailing zero
    ];
    const uint8 = fromChunks(chunks);
    // eslint-disable-next-line max-len
    expect(uint8).to.deep.equal(Uint8Array.from([
      0b10101010,
      0b11111111,
      0b10110100,
    ]));
  });
  it('single chunk', () => {
    const chunks = [
      0b10101,
    ];
    const uint8 = fromChunks(chunks);
    expect(uint8).to.deep.equal(Uint8Array.from([
      0b10101000,
    ]));
  });
  it('multiple chunks without padding', () => {
    const chunks = [
      0b10101,
      0b01011,
      0b11111,
      0b11011,
      0b01001,
      0b11100,
      0b00000,
      0b01111, // no padding
    ];
    const uint8 = fromChunks(chunks);
    expect(uint8).to.deep.equal(Uint8Array.from([
      0b10101010,
      0b11111111,
      0b10110100,
      0b11110000,
      0b00001111,
    ]));
  });
});
