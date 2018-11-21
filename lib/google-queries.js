var { google } = require('googleapis');

// Constants

const parensOpen = ['(', '[', '{'];
const parensClosed = [')', ']', '}'];

// Functions

function buildQueryForWork(artist, work) {
  let separator = artist ? ' - ' : '';
  return normalizeQueryField(artist) + separator + normalizeQueryField(work);
}

/**
 * Normalizes query field
 * @param {String} field
 */
function normalizeQueryField(field) {
  let normalized = '';

  if (typeof field === 'string') {
    for (let i = 0; i < field.length; i++) {
      const char = field.charAt(i);
      const parensIndex = parensOpen.indexOf(char);
      if (parensIndex >= 0) {
        let closedOccurrenceIndex = field.substr(i + 1, field.length - i - 1).indexOf(parensClosed[parensIndex]);
        if (closedOccurrenceIndex >= 0) {
          closedOccurrenceIndex += i + 1;
          field = field.substr(0, i) + field.substr(closedOccurrenceIndex + 1, field.length - closedOccurrenceIndex - 1);
        } else {
          field = field.replace(parensClosed[parensIndex], '');
          field = field.replace(parensOpen[parensIndex], '');
        }
      }
    }
    normalized = field;
  }

  normalized = normalized.trim();
  normalized = normalized.replace(/\s+/g, ' ');

  return normalized;
}

async function likeVideo(videoId, auth) {
  var service = google.youtube('v3');
  var requestData = {
    'params': {
      'id': videoId,
      'rating': 'like'
    }
  };
  var parameters = removeEmptyParameters(requestData['params']);
  parameters['auth'] = auth;
  var response = null;

  try {
    response = await service.videos.rate(parameters);
  } catch (err) {
    if (err) {
      console.error('The API returned an error: ' + err);
    }
  }

  return response;
}

async function youtubeSearch(query, long, auth) {
  const requestData = {
    'params': {
      'maxResults': '1',
      'part': 'snippet',
      'q': query,
      'order': 'relevance',
      'type': 'video',
      'videoDimension': '2d'
    }
  };

  if (long) {
    requestData.params['videoDuration'] = 'long';
  }

  var service = google.youtube('v3');
  var parameters = removeEmptyParameters(requestData['params']);
  parameters['auth'] = auth;

  try {
    const response = await service.search.list(parameters);
    return response.data.items;
  }
  catch (err) {
    console.error('The API returned an error: ' + err);
  }
}

function removeEmptyParameters(params) {
  for (var p in params) {
    if (!params[p] || params[p] == 'undefined') {
      delete params[p];
    }
  }
  return params;
}

exports.youtubeSearch = youtubeSearch;
exports.buildQueryForWork = buildQueryForWork;
exports.likeVideo = likeVideo;
