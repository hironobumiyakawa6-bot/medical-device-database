const app = require('../../dist/_worker.js');

exports.handler = async (event, context) => {
  const request = {
    method: event.httpMethod,
    url: event.path,
    headers: event.headers,
    body: event.body
  };

  try {
    const response = await app.default.fetch(new Request(
      `https://${event.headers.host}${event.path}`,
      {
        method: event.httpMethod,
        headers: event.headers,
        body: event.body
      }
    ));

    const body = await response.text();
    
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: body
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};