const readline = require('readline-sync');

function questionBool(q) {
  var a = readline.question(q + ' (y/n) [default n]: ');
  var response = a == 'y' ? true : false;
  return response;
}

function questionNumArray(q, length) {
  var response = [];
  var a = readline.question(q);

  if (a === '*') {
    response = [...Array(length).keys()];
  } else if (a) {
    response = a.split(' ').map(n => Number.parseInt(n));
  }

  return response;
}

exports.questionBool = questionBool;
exports.questionNumArray = questionNumArray;
