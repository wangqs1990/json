var stringify = require("./stringify").stringify;

console.log(stringify([{a:1}],null, "  "));
console.log(JSON.stringify([{a:1}], null, "  "));

stringify({a:1});
JSON.stringify({a:1}, function(){console.log(arguments);return arguments[1];});