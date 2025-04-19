import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';
import TerminalComponent from './TerminalComponent';

const API_BASE = 'http://localhost:8080/api';

export default function App() {
  const [files, setFiles] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [code, setCode] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/login');
  };

  const fetchFiles = () => {
    axios.get(`${API_BASE}/files`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setFiles(res.data))
      .catch(err => {
        console.error('Error fetching files', err);
        if (err.response?.status === 401) {
          handleLogout();
        }
      });
  };

  const openFile = filename => {
    setCurrentFile(filename);
    axios.get(`${API_BASE}/download/${filename}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setCode(res.data))
      .catch(err => {
        console.error('Error loading file', err);
        if (err.response?.status === 401) {
          handleLogout();
        }
      });
  };

  const saveFile = async () => {
    if (!currentFile) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const form = new FormData();
    form.append('file', blob, currentFile);

    try {
      await axios.post(`${API_BASE}/upload-single`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Saved!');
      fetchFiles();
    } catch (err) {
      console.error('Save error', err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        alert('Failed to save file');
      }
    }
  };

  const handleNewFile = () => {
    setIsCreatingFile(true);
  };

  const createNewFile = async (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    try {
      const blob = new Blob([''], { type: 'text/plain' });
      const form = new FormData();
      form.append('file', blob, newFileName);

      await axios.post(`${API_BASE}/upload-single`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setNewFileName('');
      setIsCreatingFile(false);
      fetchFiles();
      setCurrentFile(newFileName);
      setCode('');
    } catch (err) {
      console.error('Error creating file', err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        alert('Failed to create file');
      }
    }
  };

  return (
    <div className="vscode-container">
      {/* File Explorer */}
      <aside className="file-explorer">
        <div className="explorer-header">
          <h2>Explorer</h2>
          <div className="explorer-actions">
            <button className="new-file-button" onClick={handleNewFile}>+</button>
            <button className="logout-button" onClick={handleLogout}>
              <span className="logout-icon">⎋</span>
            </button>
          </div>
        </div>
        
        {isCreatingFile && (
          <form onSubmit={createNewFile} className="new-file-form">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter file name..."
              autoFocus
            />
            <button type="submit">Create</button>
            <button type="button" onClick={() => setIsCreatingFile(false)}>Cancel</button>
          </form>
        )}

        <ul>
          {files.map(f => (
            <li key={f}>
              <button
                className={`file-item ${f === currentFile ? 'active' : ''}`}
                onClick={() => openFile(f)}
              >
                {f}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content area */}
      <main className="main-content">
        {/* Header */}
        <header className="editor-header">
          <span>{currentFile || 'No file opened'}</span>
          <button onClick={saveFile}>Save</button>
        </header>

        {/* Editor */}
        <div className="editor-container">
          <MonacoEditor
            language={currentFile?.split('.').pop() || 'javascript'}
            theme="vs-dark"
            value={code}
            onChange={value => setCode(value)}
            options={{ automaticLayout: true }}
          />
        </div>

        {/* Terminal */}
        <div className="terminal-container">
          <TerminalComponent />
        </div>
      </main>
    </div>
  );
}
