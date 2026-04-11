/* eslint-disable max-len */
import {expect} from 'chai';
import {
  decode,
  decodeString,
  encode,
  encodeString,
} from '../src/index';

const replaceCharAt = (
    str: string,
    idx: number,
    char: string,
) => {
  if (idx > str.length-1) return str;
  return str.substring(0, idx) + char + str.substring(idx + 1);
};

// https://www.dcode.fr/crockford-base-32-encoding

const BinaryData = Uint8Array.from([
  0b01100010,
  0b01100001,
  0b01110011,
  0b01100101,
]);

const BinaryDataCrock32 = 'C9GQ6S8';

const BinaryDataCrock32Checked = 'C9GQ6S8J';

// note that there is no restriction to ASCII - this is just a quick way to test a bunch of characters.
// also serves as the primary round-trip correctness test covering encode→decode for non-trivial input.
const AllAsciiPrintables = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

const AllAsciiPrintablesCrock32 = '40GJ48S44MK2EA1958NJRB9E5WR32CHK6GTKCDSR74X3PF1X7RZM0GA28D24AHJ7914MMJTC9N74YM2HA99N8NAPAXC5JPJVBHENWQV0C5H66S35CSKPGTBADDP6TVKFE1RQ4WVMENV7EY3SF9XQRZBY';

const AllAsciiPrintablesCrock32Checked = '40GJ48S44MK2EA1958NJRB9E5WR32CHK6GTKCDSR74X3PF1X7RZM0GA28D24AHJ7914MMJTC9N74YM2HA99N8NAPAXC5JPJVBHENWQV0C5H66S35CSKPGTBADDP6TVKFE1RQ4WVMENV7EY3SF9XQRZBYJ';


describe('Encode', () => {
  it('should encode binary', () => {
    expect(encode(BinaryData)).to.equal(BinaryDataCrock32);
  });
  it('should encode empty input to empty string', () => {
    expect(encode(new Uint8Array([]))).to.equal('');
  });
});

describe('Encode with checksum', () => {
  it('should encode binary with checksum', () => {
    expect(encode(BinaryData, true)).to.equal(BinaryDataCrock32Checked);
  });
});

describe('Encode String', () => {
  it('should encode all ascii printables', () => {
    expect(encodeString(AllAsciiPrintables)).to.equal(AllAsciiPrintablesCrock32);
  });
});

describe('Encode String with checkum', () => {
  it('should encode all ascii printables', () => {
    expect(encodeString(AllAsciiPrintables, true)).to.equal(AllAsciiPrintablesCrock32Checked);
  });
});

describe('Decode', () => {
  it('should decode binary', () => {
    expect(decode(BinaryDataCrock32)).to.deep.equal(BinaryData);
  });
  it('should decode empty string to empty Uint8Array', () => {
    expect(decode('')).to.deep.equal(new Uint8Array([]));
  });
  it('should decode hyphen-only string to empty Uint8Array', () => {
    expect(decode('---')).to.deep.equal(new Uint8Array([]));
  });
  it('should ignore a single hyphen', () => {
    expect(decode('C9GQ6-S8')).to.deep.equal(decode('C9GQ6S8'));
  });
  it('should ignore multiple hyphens', () => {
    expect(decode('C9-GQ-6S-8')).to.deep.equal(decode('C9GQ6S8'));
  });
});

describe('Decode with checksum', () => {
  it('should decode binary', () => {
    expect(decode(BinaryDataCrock32Checked, true)).to.deep.equal(BinaryData);
  });
  it('should throw an error for empty input', () => {
    expect(function() {
      decode('', true);
    }).to.throw('Input must contain at least one checksum symbol');
  });
  it('should throw an error for hyphen-only input', () => {
    expect(function() {
      decode('---', true);
    }).to.throw('Input must contain at least one checksum symbol');
  });
  it('should throw an error if checksum validation fails', () => {
    const corrupt = replaceCharAt(BinaryDataCrock32Checked, 3, 'A');
    expect(function() {
      decode(corrupt, true);
    }).to.throw('Checksum validation failed');
  });
});

describe('Decode String', () => {
  it('should decode all ascii printables', () => {
    expect(decodeString(AllAsciiPrintablesCrock32)).to.equal(AllAsciiPrintables);
  });
});

describe('Decode String with checksum', () => {
  it('should decode all ascii printables', () => {
    expect(decodeString(AllAsciiPrintablesCrock32Checked, true)).to.equal(AllAsciiPrintables);
  });
  it('should throw an error if checksum validation fails', () => {
    const corrupt = replaceCharAt(AllAsciiPrintablesCrock32Checked, 3, 'A');
    expect(function() {
      decode(corrupt, true);
    }).to.throw('Checksum validation failed');
  });
});
