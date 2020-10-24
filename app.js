const WebSocket = require('ws');
const WebSocketJSONStream = require('@teamwork/websocket-json-stream');
const ShareDB = require('sharedb');

/**
 * By Default Sharedb uses JSON0 OT type.
 * To Make it compatible with our quill editor.
 * We are using this npm package called rich-text
 * which is based on quill delta
 */
ShareDB.types.register(require('rich-text').type);

const shareDBServer = new ShareDB();
const connection = shareDBServer.connect();

/**
 * 'documents' is collection name(table name in sql terms)
 * 'firstDocument' is the id of the document
 */
const doc = connection.get('documents', 'firstDocument');

doc.fetch(function (err) {
  if (err) throw err;
  if (doc.type === null) {
    /**
     * If there is no document with id "firstDocument" in memory
     * we are creating it and then starting up our ws server
     */
    doc.create([{ insert: 'Hello World!' }], 'rich-text', () => {
      const wss = new WebSocket.Server({ port: 8080 });

      wss.on('connection', function connection(ws) {
        // For transport we are using a ws JSON stream for communication
        // that can read and write js objects.
        const jsonStream = new WebSocketJSONStream(ws);
        shareDBServer.listen(jsonStream);
      });
    });
    return;
  }
});
