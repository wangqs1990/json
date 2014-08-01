(function(exports) {
  //" -> 22 [ -> 5B { -> 7B
  function isNum(key) {
    return key >= 0x30 && key <= 0x39; 
  }

  function isAlph(key) {
    return (key >= 0x41 && key <= 0x5a) ||
      (key >= 0x61 && key <= 0x7a);
  }

  function Parser() {
    this._source = "";
    this._cur = 0;
  }

  Parser.prototype = {
    constructor: Parser,
    nextQuote: function() {
      var s = this._source, next = s.indexOf("\"", this._cur || 0);
      while (next !== -1 && s.charCodeAt(next - 1) === 0x5c) {
        next = s.indexOf("\"", next + 1);
      }
      this._cur = next;
      return next;
    },
    compress: function() {
      var code = this._source.charCodeAt(this._cur);
      while (code === 0x20 || code === 0x09 || code === 0x07) {
        code = this._source.charCodeAt(this._cur);
        this._cur++;
      }

    },
    parseDict: function() {
      var ret = {}, item, code, cur = this._cur, key, s = this._source;
      while (s.charCodeAt(this._cur) !== 0x7d) {
        if (s.charCodeAt(this._cur) !== 0x22) {
          throw new Error("Unexcept token " + s[this._cur]);
        }
        cur = ++this._cur;
        key = this._source.substring(cur, this.nextQuote());
        cur = ++this._cur;
        this.compress();
        if (s.charCodeAt(cur) === 0x3a) { //match ":"
          this._cur++;
          ret[key] = this.parsePrimary();
        } else {
          throw new Error("Unexcept token" + s[this._cur]);
        }
        if (s.charCodeAt(this._cur) === 0x2c) { //math ","
          this._cur++;
        }
      }
      return ret;
    },
    parseArray: function() {
      var ret = [];
      while (this._source.charCodeAt(this._cur) !== 0x5d) {
        ret.push(this.parsePrimary());
        this.compress();
        if (this._source.charCodeAt(this._cur) === 0x2c) { //match ","
          this._cur++;
        }
      }
      return ret;
    },
    parsePrimary: function() {
      this.compress();
      var code, cur = this._cur, word, s = this._source;
      switch((code = this._source.charCodeAt(cur))) {
      case 0x5b:   //array
        this._cur++;
        return this.parseArray();
      case 0x7b:   //object
        this._cur++;
        return this.parseDict();
      case 0x22:   //string
        this._cur++;
        return this._source.substring(cur, this.nextQuote());
      case 0x74:   //null or true
      case 0x6e:
        word = s.substr(cur, 4);
        if (word === "true") {
          return true;
        } else if (word === "null") {
          return null;
        } else {
          throw new Error("Unexcept token" + String.fromCharCode(cur));
        }
        this._cur += 4;
      case 0x66:         //false
        word = s.substr(cur, 5);
        if (word === "false") {
          return false;
        } else {
          throw new Error("Uexcept token" + String.fromCharCode(cur));
        }
        this._cur += 5;
      }

      //number
      var numIndex = cur;
      if (code === 0x2d) {
        numIndex++;
      }
      code = s.charCodeAt(numIndex++);
      if (isNum(code) && (code - 0x03)) {
        while (isNum(s.charCodeAt(numIndex))) {
          numIndex++;
        }
        if (s.charCodeAt(numIndex) === 0x2e) {
          numIndex++;
        }
        while (isNum(s.charCodeAt(numIndex))){
          numIndex++;
        }
        this._cur = numIndex;
        return parseFloat(s.substring(cur, numIndex));
      } 
    },
    parse: function(str) {
      this._source = str;
      var obj = this.parsePrimary();
      this._source = ""; this._cur = 0;
      return obj;
    }
  }

  var parser = new Parser();
  exports.parse = function() {
    return parser.parse.apply(parser, arguments);
  };

})(this);