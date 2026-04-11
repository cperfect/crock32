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

// note that there is no restriction to ASCII - this is just a quick way to test a bunch of characters
const AllAsciiPrintables = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';

const AllAsciiPrintablesCrock32 = '40GJ48S44MK2EA1958NJRB9E5WR32CHK6GTKCDSR74X3PF1X7RZM0GA28D24AHJ7914MMJTC9N74YM2HA99N8NAPAXC5JPJVBHENWQV0C5H66S35CSKPGTBADDP6TVKFE1RQ4WVMENV7EY3SF9XQRZBY';

const AllAsciiPrintablesCrock32Checked = '40GJ48S44MK2EA1958NJRB9E5WR32CHK6GTKCDSR74X3PF1X7RZM0GA28D24AHJ7914MMJTC9N74YM2HA99N8NAPAXC5JPJVBHENWQV0C5H66S35CSKPGTBADDP6TVKFE1RQ4WVMENV7EY3SF9XQRZBYJ';

const BigFormattedText = `STATELY, PLUMP BUCK MULLIGAN CAME FROM THE STAIRHEAD, bearing a bowl of lather on which a mirror and a razor lay crossed. A yellow dressing gown, ungirdled, was sustained gently-behind him by the mild morning air. He held the bowl aloft and intoned:

-- Introibo ad altare Dei.

Halted, he peered down the dark winding stairs and called up coarsely:

-- Come up, Kinch. Come up, you fearful jesuit.

Solemnly he came forward and mounted the round gunrest. He faced about and blessed gravely thrice the tower, the surrounding country and the awaking mountains. Then, catching sight of Stephen Dedalus, he bent towards him and made rapid crosses in the air, gurgling in his throat and shaking his head. Stephen Dedalus, displeased and sleepy, leaned his arms on the top of the staircase and looked coldly at the shaking gurgling face that blessed him, equine in its length, and at the light untonsured hair, grained and hued like pale oak.`;

const BigFormattedTextCrock32 = `ADA42N259HCJR82G9HAMTM1089AM6JS09NAMRK298X0MW823856MA826A97MT82M912J0MTM854N4J258522R832CNGQ4TBECWG62832DXVPR83FCRG6RRBMD1JQ483FDRG7ET39CDM20R90DNMQ4WKFE8G62VK441GJ0WK1F9QQ483CC5WJ0RVJDXSQ6SB45RG4283SCNP6RVVQ41J74SBKEDMPWSS0CXQQEVHC41TPWSV9E9J6RSB45GG7ERBK41SQAWVMC5MPWSB441KPAVKMDHWJTRK5D1MPWS10D1MPT832F4G78T3541PPJV3441PPYWKED5Q6E831D5S2W828CMG6GSBCCGG78T3541H6YXVC41GPRVV6EGG62VK441MPWX3FDSJP8EGA18PJT829DST74VV9C9QJ0RB441GPRX31E9JJ0H35D4Q0M2J8C5P78SB45GG6GS90E1JPAWK5CGG68VVQDRG78T3541J62WKB41VPJVK4D5Q6E83KEHGPJWKK41GPWS10CDGPRV35CGG7AW10CDQP2WKKCNP7JEGA18PJT823DXPPA83NE0P20JV9DSHPGBH08DQPTS90ENR2R83SDXTJ0SK5C5S6CXBC41N6AWVND5T2W2GAADQPRSBDDSP7J838CMG66RBDCMG6CVVJEXGQ4S10C5Q6883DDXTPWX35CGG78T3541S6YXBECGG6EXBEE9JQ6X1E4146A836C5HPAS10C5H6YXBM41GPWS10C9P6AWVKCNJ20SVJC5V6AV3S41T6GWK9CDJJ0X38CMG78VVQCNS2R83MD1JJ0WVNE9S6YXBECHMPWSS0CDQQAVKME9WJ0RBECGG78T3541GQERBBD5Q6E83DDXTPWX31D5Q76BH0AHM6AVHC41HP2X33D1MPWSS0EDMPET3M41QPC82KEHJQ0T35DRG48SB4C5P7AWSC41M6A832CNQ7883MDXVP2WK4ECG6GTBD41GPWS10DNGP8S90E9GQ0TB441HQ4VVKEDJQ6839DRG78T3541GPJWHC41KQAWK7DHMPWSS0D5Q20T39ECG78T3JDXGQ8831DSJ20WV8C5NPJVK741M6JWS0D1JP2S1E419Q8SBGD1JPW824CNJ62V3NECP20S39EDR6RSB1EDJP8831DSJ20WVCCNJQ0Y9C41P6ARBECNJ20T39ECG62WKDECG6YVH0EHM6A83MDXR20VV641T6GS90EDT62TBJCDGQ6S90C5Q6883CDXQPPSB441HPYV34DHWJ0RBM41T6GS90EDM62TV9DSKJ0SVNE9KPRTBECWG6CRB3CMG78T31EGG64V35EDSPAS10D1MPTB10CNRQATBECMG6JVH0D5T7683CCNQ6EX385GG62VK441GQ883MD1JJ0V39CXM7883NDST6YVKKENS6AS10D1GPJWHC41KQ4RB9DSJP8831DSJ20T3NCNJ20V39DDJJ0W31DHJJ0VV1DCQ0`;

const BigFormattedTextCrock32Checked = `ADA42N259HCJR82G9HAMTM1089AM6JS09NAMRK298X0MW823856MA826A97MT82M912J0MTM854N4J258522R832CNGQ4TBECWG62832DXVPR83FCRG6RRBMD1JQ483FDRG7ET39CDM20R90DNMQ4WKFE8G62VK441GJ0WK1F9QQ483CC5WJ0RVJDXSQ6SB45RG4283SCNP6RVVQ41J74SBKEDMPWSS0CXQQEVHC41TPWSV9E9J6RSB45GG7ERBK41SQAWVMC5MPWSB441KPAVKMDHWJTRK5D1MPWS10D1MPT832F4G78T3541PPJV3441PPYWKED5Q6E831D5S2W828CMG6GSBCCGG78T3541H6YXVC41GPRVV6EGG62VK441MPWX3FDSJP8EGA18PJT829DST74VV9C9QJ0RB441GPRX31E9JJ0H35D4Q0M2J8C5P78SB45GG6GS90E1JPAWK5CGG68VVQDRG78T3541J62WKB41VPJVK4D5Q6E83KEHGPJWKK41GPWS10CDGPRV35CGG7AW10CDQP2WKKCNP7JEGA18PJT823DXPPA83NE0P20JV9DSHPGBH08DQPTS90ENR2R83SDXTJ0SK5C5S6CXBC41N6AWVND5T2W2GAADQPRSBDDSP7J838CMG66RBDCMG6CVVJEXGQ4S10C5Q6883DDXTPWX35CGG78T3541S6YXBECGG6EXBEE9JQ6X1E4146A836C5HPAS10C5H6YXBM41GPWS10C9P6AWVKCNJ20SVJC5V6AV3S41T6GWK9CDJJ0X38CMG78VVQCNS2R83MD1JJ0WVNE9S6YXBECHMPWSS0CDQQAVKME9WJ0RBECGG78T3541GQERBBD5Q6E83DDXTPWX31D5Q76BH0AHM6AVHC41HP2X33D1MPWSS0EDMPET3M41QPC82KEHJQ0T35DRG48SB4C5P7AWSC41M6A832CNQ7883MDXVP2WK4ECG6GTBD41GPWS10DNGP8S90E9GQ0TB441HQ4VVKEDJQ6839DRG78T3541GPJWHC41KQAWK7DHMPWSS0D5Q20T39ECG78T3JDXGQ8831DSJ20WV8C5NPJVK741M6JWS0D1JP2S1E419Q8SBGD1JPW824CNJ62V3NECP20S39EDR6RSB1EDJP8831DSJ20WVCCNJQ0Y9C41P6ARBECNJ20T39ECG62WKDECG6YVH0EHM6A83MDXR20VV641T6GS90EDT62TBJCDGQ6S90C5Q6883CDXQPPSB441HPYV34DHWJ0RBM41T6GS90EDM62TV9DSKJ0SVNE9KPRTBECWG6CRB3CMG78T31EGG64V35EDSPAS10D1MPTB10CNRQATBECMG6JVH0D5T7683CCNQ6EX385GG62VK441GQ883MD1JJ0V39CXM7883NDST6YVKKENS6AS10D1GPJWHC41KQ4RB9DSJP8831DSJ20T3NCNJ20V39DDJJ0W31DHJJ0VV1DCQ0=`;

describe('Encode', () => {
  it('should encode binary', () => {
    expect(encode(BinaryData)).to.equal(BinaryDataCrock32);
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
  it('should encode big formatted text', () => {
    expect(encodeString(BigFormattedText)).to.equal(BigFormattedTextCrock32);
  });
});

describe('Encode String with checkum', () => {
  it('should encode all ascii printables', () => {
    expect(encodeString(AllAsciiPrintables, true)).to.equal(AllAsciiPrintablesCrock32Checked);
  });
  it('should encode big formatted text', () => {
    expect(encodeString(BigFormattedText, true)).to.equal(BigFormattedTextCrock32Checked);
  });
});

describe('Decode', () => {
  it('should decode binary', () => {
    expect(decode(BinaryDataCrock32)).to.deep.equal(BinaryData);
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
  it('should decode big formatted text', () => {
    expect(decodeString(BigFormattedTextCrock32)).to.equal(BigFormattedText);
  });
});

describe('Decode String with checksum', () => {
  it('should decode all ascii printables', () => {
    expect(decodeString(AllAsciiPrintablesCrock32Checked, true)).to.equal(AllAsciiPrintables);
  });
  it('should decode big formatted text', () => {
    expect(decodeString(BigFormattedTextCrock32Checked, true)).to.equal(BigFormattedText);
  });
  it('should throw an error if checksum validation fails', () => {
    const corrupt = replaceCharAt(AllAsciiPrintablesCrock32Checked, 3, 'A');
    expect(function() {
      decode(corrupt, true);
    }).to.throw('Checksum validation failed');
  });
});
