(function(exports) {
  //" -> 22 [ -> 5B { -> 7B
  function isNum(key) {
    return key >= 0x30 && key <= 0x39; 
  }

  function isAlph(key) {
    return (key >= 0x41 && key <= 0x5a) ||
      (key >= 0x61 && key <= 0x7a);
  }

  function nextQuote(s, start) {
    var next = s.indexOf("\"",start || 0);
    while (next !== -1 && s.charCodeAt(next - 1) === 0x5c) {
      next = s.indexOf("\"", next + 1);
    }
    return next;
  }

})(this);