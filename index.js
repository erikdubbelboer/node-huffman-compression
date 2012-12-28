
var BitBuffer = require('./BitBuffer.js');


exports.Dictionary = function(data) {
  this.frequency  = {};
  this.encode     = false;
  this.decode     = false;
  this.terminator = false;


  this.fromString = function(data) {
    data = JSON.parse(data);

    this.encode     = data[0];
    this.decode     = data[1];
    this.terminator = data[2];

    return this;
  };

  this.toString = function() {
    return JSON.stringify([
      this.encode,
      this.decode,
      this.terminator
    ]);
  };


  this.train = function(data) {
    if (typeof data == 'string') {
      data = data.split('');
    }

    for (var i = 0; i < data.length; ++i) {
      var c = data[i];

      if (!this.frequency[c]) {
        this.frequency[c] = 1;
      } else {
        ++this.frequency[c];
      }
    }
  };

  this.finish = function() {
    var queue = [];

    if (Object.keys(this.frequency).length == 0) {
      throw 'Your dictionary can not be empty';
    }

    for (var c in this.frequency) {
      if (this.frequency.hasOwnProperty(c)) {
        queue.push({
          'c': c,
          'f': this.frequency[c],
          'd': 0
        });
      }
    }

    queue.push({
      'c': {},
      'f': 1,
      'd': 0
    });

    while (queue.length > 1) {
      queue.sort(function(a, b) {
        if (a.f > b.f) {
          return -1;
        } else if (a.f < b.f) {
          return 1;
        } else if (a.d > b.d) {
          return -1;
        } else if (a.d < b.d) {
          return 1;
        } else {
          return 0;
        }
      });

      var a = queue.pop();
      var b = queue.pop();

      queue.push({
        0  : a,
        1  : b,
        'f': a.f + b.f,
        'd': Math.max(a.d, b.d) + 1
      });
    }
    
    var encode = {};
    var terminator;

    function clean(node, bits) {
      var root = [];

      if (node[0].c) {
        if (typeof node[0].c == 'object') {
          terminator = bits.concat([0]);
        } else {
          encode[node[0].c] = bits.concat([0]);
        }

        root.push(node[0].c);
      } else {
        root.push(clean(node[0], bits.concat([0])));
      }

      if (node[1].c) {
        if (typeof node[1].c == 'object') {
          terminator = bits.concat([1]);
        } else {
          encode[node[1].c] = bits.concat([1]);
        }

        root.push(node[1].c);
      } else {
        root.push(clean(node[1], bits.concat([1])));
      }

      return root;
    }

    this.encode     = encode;
    this.decode     = clean(queue.pop(), []);
    this.terminator = terminator;
  };
  
  
  if (data) {
    this.train(data);
  }
};


exports.compress = function(dictionary, data) {
  if (!dictionary.encode) {
    throw 'Invalid dictionary';
  }

  if (typeof data == 'string') {
    data = data.split('');
  }

  var bits = new BitBuffer(data.length);

  for (var i = 0; i < data.length; ++i) {
    var c = data[i];

    if (!dictionary.encode[c]) {
      throw 'Could not encode: ' + c;
    }

    var e = dictionary.encode[c];

    for (var j = 0; j < e.length; ++j) {
      bits.add(e[j]);
    }
  }

  e = dictionary.terminator;

  for (var j = 0; j < e.length; ++j) {
    bits.add(e[j]);
  }

  return bits.toBuffer();
};


exports.decompress = function(dictionary, data) {
  if (!dictionary.decode) {
    throw 'Invalid or unfinished dictionary';
  }

  var bits = new BitBuffer(data);
  var out  = [];
  var node = dictionary.decode;

  for (;;) {
    var bit = 0 + bits.get();

    node = node[bit];

    if ((typeof node == 'string') || (typeof node == 'number')) {
      out.push(node);
      
      node = dictionary.decode;
    } else if (!Array.isArray(node)) {
      break;
    }
  }

  return out;
};

