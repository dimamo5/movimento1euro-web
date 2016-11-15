const request = require('request');
const SERVER_KEY = 'AIzaSyArnARY44zHlhIyUxWHM6HHC1mUIEAxnFg';

const options = {
  method: 'POST',
  uri: 'https://fcm.googleapis.com/fcm/send',
  headers: {
    Authorization: `key=${SERVER_KEY}`,
  },
  json: true,
  body: {
    notification: {
      title: 'Titulo',
      body: 'Corpo',
    },
  },
};

/* Ids.length >= 1  */
function sendTemplate(ids, title, content, next) {
  if (!next || typeof next != 'function' && ids.constructor === Array) {
    throw new Error('1º argument must be an array function and 4º must be a callback function');
  }

  //TODO: wait 4 all responses to return a map

  for(id of ids) {
      options.body.to = id;
      options.body.notification = {title, body: content};

      //TODO: call replace tags (parser) method


      request(options, (error, response, body) => {
          if (!error && response.statusCode == 200) {
              next(null, true);
          } else {
              var error = new Error(`${response.getActual}body`);
              next(error, false);
          }
      });
  }
}

/* Ids.length >= 1  */
function sendManual(ids, title, content, next) {
  if (!next || typeof next != 'function' && ids.constructor === Array) {
    throw new Error('1º argument must be an array function and 4º must be a callback function');
  }
  options.body.registration_ids = ids;
  options.body.notification = { title, body: content };
  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200 && body.failure == 0) {
      next(null, true);
    } else {
      next(body, false);
    }
  });
}
