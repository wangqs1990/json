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
  var toString = Object.prototype.toString;
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
    for (var i = 0, length = arr.length - 1; true; i++) {
      item = arr[i];
      if (item === undefined) {
        s += "null";
      } else {
        s += walk(arr[i]);
      }

      if (i === length) {
        break;
      } else {
        s += ",";
      }
    }
    return s += "]";
  }

  function walkObj(obj) {
    var keys = [], item, s = "{";
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] !== undefined) {
          keys.push(key);
        }
      }
    }

    for (var i = 0, length = keys.length - 1; true; i++) {
      item = keys[i];
      s += "\"" + item.toString() + "\":" + walk(obj[keys[i]]);

      if (i === length) {
        break;
      } else {
        s += ",";
      }
    }

    return s  + "}";
  }

  exports.stringify = walk;
})(this);