const readline = require('readline-sync');

function questionBool(q) {
  var a = readline.question(q + ' (y/n) [default n]: ');
  var response = a == 'y' ? true : false;
  return response;
}

exports.questionBool = questionBool;
