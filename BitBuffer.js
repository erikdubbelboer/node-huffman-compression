
module.exports = function(buffer) {
  if (buffer) {
    if (typeof buffer == 'number') {
      this.buffer = new Buffer(buffer);
    } else {
      if (!Buffer.isBuffer(buffer)) {
        throw 'only buffers are supported';
      }

      this.buffer = buffer;
    }
  } else {
    this.buffer = new Buffer(32);
    this.buffer.fill(0);
  }

  this.byteOffset = 0;
  this.bitOffset  = 0;


  this.add = function(bit) {
    if (this.bitOffset == 8) {
      ++this.byteOffset;

      if (this.byteOffset == this.buffer.length) {
        var temp = new Buffer(this.buffer.length * 2);
        temp.fill(0);

        this.buffer.copy(temp);

        delete this.buffer;
        this.buffer = temp;
      }

      this.bitOffset = 0;
    }

    if (bit) {
      this.buffer[this.byteOffset] |= 1 << this.bitOffset;
    } else {
      this.buffer[this.byteOffset] &= ~(1 << this.bitOffset);
    }

    ++this.bitOffset;
  };

  this.get = function() {
    if (this.byteOffset >= this.buffer.length) {
      throw 'no bits available';
    }

    var bit = !!(this.buffer[this.byteOffset] & (1 << this.bitOffset));

    ++this.bitOffset;

    if (this.bitOffset == 8) {
      ++this.byteOffset;
      this.bitOffset = 0;
    }

    return bit;
  };

  this.toBuffer = function() {
    var length = this.byteOffset + 1;

    if (this.bitOffset == 8) {
      ++length;
    }

    var temp = new Buffer(length);
    temp.fill(0);

    this.buffer.copy(temp, 0, 0, length);

    return temp;
  };
};

