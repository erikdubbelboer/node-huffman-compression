
var assert    = require('assert');
var BitBuffer = require('./BitBuffer.js');
var huffman   = require('./index.js');


// Test the BitBuffer.
var test = new BitBuffer();
var i;

// 11000000111001 == 12345
// Reverse the bits so we can write them as little endian.
var bits = '11000000111001'.split('').reverse();

for (i = 0; i < bits.length; ++i) {
  test.add(bits[i] == '1');
}

var buf = test.toBuffer();

assert.equal(12345, buf.readUInt16LE(0));

test = new BitBuffer(buf);

for (i = 0; i < bits.length; ++i) {
  assert.equal(bits[i] == '1', test.get());
}


// Test encoding and decoding.
var data = 'j\'aime aller sur le bord de l\'eau les jeudis ou les jours impairs';
var dict = new huffman.Dictionary(data);

dict.finish();
console.log(dict.toString());

var compressed = huffman.compress(dict, data);

assert.equal(true, data.length > compressed.length);

var decompressed = huffman.decompress(dict, compressed);

assert.equal(data, decompressed.join(''));


console.log();
console.log('all tests passed.');

