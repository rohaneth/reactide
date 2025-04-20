import React, { useLayoutEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

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
      rows: 10 // Set a reasonable default height
    });
    
    const fitAddon = new FitAddon();
    termRef.current = term;
    fitRef.current = fitAddon;

    term.loadAddon(fitAddon);
    term.open(containerRef.current);

    // Initial fit
    requestAnimationFrame(() => {
      fitAddon.fit();
      term.writeln('Welcome to the Web Terminal ⌨️');
      term.write('> ');
    });

    // Handle terminal input
    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.key === 'Enter') {
        term.write('\r\n');
        if (stompRef.current?.connected && commandBuffer.trim()) {
          stompRef.current.send('/app/terminal', {}, commandBuffer);
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

    // Efficient resize handling
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (fitRef.current) {
          fitRef.current.fit();
        }
      });
    });

    resizeObserver.observe(containerRef.current);

    // WebSocket setup
    const socket = new SockJS('https://7e3b-2409-4081-1e-1c9c-7955-3e55-1d71-ed2.ngrok-free.app/ws');
    const client = Stomp.over(socket);
    stompRef.current = client;
    
    client.connect({}, () => {
      client.subscribe('/topic/output', response => {
        term.writeln(response.body);
        term.write('> ');
      });
    });

    return () => {
      resizeObserver.disconnect();
      if (stompRef.current?.connected) {
        stompRef.current.disconnect();
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
