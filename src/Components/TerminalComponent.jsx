import React, { useLayoutEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { Client } from '@stomp/stompjs'; // ✅ Native STOMP client
import 'xterm/css/xterm.css';

const TerminalComponent = () => {
  const containerRef = useRef(null);
  const termRef = useRef(null);
  const fitRef = useRef(null);
  const stompRef = useRef(null);
  let commandBuffer = '';

  useLayoutEffect(() => {
    const term = new Terminal({
      theme: { background: '#1e1e1e', foreground: '#d4d4d4' },
      cursorBlink: true,
      rows: 10
    });

    const fitAddon = new FitAddon();
    termRef.current = term;
    fitRef.current = fitAddon;

    term.loadAddon(fitAddon);
    term.open(containerRef.current);

    requestAnimationFrame(() => {
      fitAddon.fit();
      term.writeln('Welcome to the Web Terminal ⌨️');
      term.write('> ');
    });

    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.key === 'Enter') {
        term.write('\r\n');
        if (stompRef.current?.connected && commandBuffer.trim()) {
          stompRef.current.publish({
            destination: '/app/terminal',
            body: commandBuffer
          });
          commandBuffer = '';
        }
        term.write('> ');
      } else if (domEvent.key === 'Backspace') {
        if (commandBuffer.length > 0) {
          term.write('\b \b');
          commandBuffer = commandBuffer.slice(0, -1);
        }
      } else if (printable) {
        term.write(key);
        commandBuffer += key;
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fitRef.current?.fit();
      });
    });
    resizeObserver.observe(containerRef.current);

    // ✅ Native WebSocket over STOMP (no SockJS)
    const client = new Client({
      brokerURL: 'wss://7e3b-2409-4081-1e-1c9c-7955-3e55-1d71-ed2.ngrok-free.app/ws',
      connectHeaders: {},
      debug: str => console.log('[WebSocket]', str),
      reconnectDelay: 5000,
    });

    stompRef.current = client;

    client.onConnect = () => {
      client.subscribe('/topic/output', response => {
        term.writeln(response.body);
        term.write('> ');
      });
    };

    client.activate();

    return () => {
      resizeObserver.disconnect();
      if (stompRef.current?.connected) {
        stompRef.current.deactivate();
      }
      term.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1e1e1e',
        padding: '4px'
      }}
    />
  );
};

export default TerminalComponent;
