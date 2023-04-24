import { datadogRum } from '@datadog/browser-rum';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { v4 as uuid } from 'uuid';

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

datadogRum.init({
  applicationId: process.env.DD_APPLICATION_ID,
  clientToken: process.env.DD_CLIENT_TOKEN,
  site: 'datadoghq.eu',
  service: 'my-test-application',
  env: 'dev',
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  traceSampleRate: 100,
  defaultPrivacyLevel: 'mask-user-input'
});

datadogRum.startSessionReplayRecording();

setTimeout(() => {
  datadogRum.addTiming('test_timing');
}, getRandomNumber(500, 10000));

const Dashboard = () => {
  const [count, setCount] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const wsClient = new WebSocket('ws://localhost:8022');
    wsClient.addEventListener('open', () => {
      console.log('WebSocket connected');
      setWs(wsClient);
    });

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleButtonClick = (increment: number) => {
    if (!ws) {
      console.error('WebSocket not connected');
      return;
    }
  
    setCount(count + increment);
  
    const traceId = 'trace-' + uuid();

    // Start a custom RUM action to capture the trace context
    datadogRum.addAction('button clicked', {
      count: count + increment,
      operation: increment > 0 ? 'increment' : 'decrement',
      trace_id: traceId,
    });
  
    const message = {
      ping: 1,
      req_id: `${increment > 0 ? 'increment' : 'decrement'}-${Date.now()}`,
      trace_id: traceId
    };
  
    ws.send(JSON.stringify(message));
  };

  return (
    <div>
      <h1>Example Website</h1>
      <p>This is just an example website with a counter.</p>
      <p>
        Last count: <strong id="lastCount">{count}</strong>
      </p>

      <button onClick={() => handleButtonClick(-1)}>-</button> <button onClick={() => handleButtonClick(1)}>+</button>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);

root.render(<Dashboard />);
