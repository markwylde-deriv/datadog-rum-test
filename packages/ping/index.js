import tracer from 'dd-trace';
import bunyan from 'bunyan';
import { WebSocketServer } from 'ws';

const logger = bunyan.createLogger({
  name: 'dd-trace',
  level: 'trace',
});

console.log(process.env);
tracer.init({
  logger: {
    debug: message => logger.trace(message),
    error: err => logger.error(err)
  },
  logInjection: true,
});

const wss = new WebSocketServer({ port: 8022 });

wss.on('connection', (ws) => {
  logger.trace('Client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.ping) {
      // Extract trace context from the received message
      const traceId = data.trace_id;
      const parentId = data.parent_id;

      // Start a custom span for processing the ping event
      const span = tracer.startSpan('process_ping', {
        childOf: {
          spanId: traceId
        },
        tags: {
          'websocket.event': 'ping',
          'websocket.req_id': data.req_id,
        },
      });

      // Simulate processing time
      setTimeout(() => {
        // Send the pong response with the same req_id and trace context as in the request
        ws.send(JSON.stringify({ pong: Date.now(), req_id: data.req_id, trace_id: traceId, parent_id: parentId }));

        // Finish the span after processing and sending the response
        span.finish();
      }, 100);
    }
  });

  ws.on('close', () => {
    logger.trace('Client disconnected');
  });
});

logger.info('WebSocket server started on port 8022');
