(function(exports) {
  var xhex = /[\x00-\x1f]/g,
      escpReg = /[\\"]/g,
      ctrlMap = {
        '\b': "\\b",
        '\t': "\\t",
        '\n': "\\n",
        '\f': "\\f",
        '\r': "\\r"
      },
      ctrlReg = /[\b\t\n\f\r]/g;

  function quote(str) {
    return "\"" + str
      .replace(ctrlReg, function(m) {
        return ctrlMap[m];
      })
      .replace(escpReg, "\\$&")
      .replace(xhex, function(m) {
        var code = m.charCodeAt(0);
        return code < 16 ? "\\u000" : "\\u00" + code.toString(16); 
      }) 
      + "\"";
  }
  var toString = Object.prototype.toString,
      _replacer = null, _space = gap = "";
  function walk(o) {
    if (o && o.toJSON) {
      return o.toJSON();
    }
    var type = typeof o;
    switch(type) {
    case "string":
      return quote(o);
    case "number":
      if (isNaN(o)) {
        return "null";
      }
    case "boolean":
      return o.valueOf();
    case "object":
      if (o === null) {
        return "null";
      }
      if (toString.call(o) === "[object Array]") {
        return walkArr(o);
      } else {
        return walkObj(o);
      }
    }
    return;
  };

  function walkArr(arr) {
    var s = "[", item;
    if (_space) {
      s = "[\n", gap += _space;
    }

    for (var i = 0, length = arr.length - 1; true; i++) {
      item = _replacer ? _replacer("", arr[i]) : arr[i];
      _space && (s += gap);
      if (item === undefined) {
        s += "null";
      } else {
        s += walk(item);
      }

      if (i === length) {
        break;
      } else {
        s += _space ? ",\n" : ",";
      }
    }

    if (_space) {
      gap = gap.substr(0, gap.length - _space.length);
      return s + "\n" +gap + "]";
    }
    return s + "]";
  }

  function walkObj(obj) {
    var keys = [], item, s = "{", value;
    if (_space) {
      s = "{\n", gap += _space;
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] !== undefined) {
          keys.push(key);
        }
      }
    }

    for (var i = 0, length = keys.length - 1; true; i++) {
      item = keys[i];
      value = _replacer ? _replacer("", obj[keys[i]]) : obj[keys[i]];
      _space && (s += gap);
      s += "\"" + item.toString() + _space ? "\": ": "\":" + walk(value);
      if (i === length) {
        break;
      } else {
        s += _space ? ",\n" : ",";
      }
    }
    if (_space) {
      gap = gap.substr(0, gap.length - _space.length);
      return s + "\n" + gap + "}";
    }
    return s + "}";
  }

  exports.stringify = function(value, replacer, space) {
    var r;
    _replacer = replacer, _space = space;
    value = _replacer ? _replacer("", value) : value;
    r = walk(value)
    _replacer = null, _space = gap = "";
    return r;
  };
})(this);