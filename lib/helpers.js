/**
 *
 * @param {any[]} array
 */
function getMostFrequentItem(array) {
  let item = null;

  if(!array || array.length === 0)
    return null;

  const freqs = array.map(i => array.reduce((p, c) => p + (c == i), 0));

  return array[freqs.indexOf(freqs.sort()[0])];
}

exports.getMostFrequentItem = getMostFrequentItem;
