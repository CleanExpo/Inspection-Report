'use client';

import React, { useState } from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import { APIPlaygroundState, APIRequest, RequestHistory as RequestHistoryType } from '../../types/api-playground';
import RequestBuilder from './RequestBuilder';
import ResponseDisplay from './ResponseDisplay';
import RequestHistory from './RequestHistory';
import { useRequestHistory } from './useRequestHistory';
import SaveLoadManager from './SaveLoadManager';

const initialRequest: APIRequest = {
  method: 'GET',
  url: '',
  headers: {},
  body: '',
};

const initialState: APIPlaygroundState = {
  currentRequest: initialRequest,
  status: 'idle',
};

export default function APIPlayground() {
  const [state, setState] = useState<APIPlaygroundState>(initialState);
  const { 
    history, 
    addToHistory, 
    clearHistory, 
    removeFromHistory, 
    updateHistoryItemName 
  } = useRequestHistory();

  const handleHistorySelect = (historyItem: RequestHistoryType) => {
    setState(prev => ({
      ...prev,
      currentRequest: historyItem.request,
      lastResponse: historyItem.response,
      status: 'idle'
    }));
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        API Playground
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100% - 64px)' }}>
        {/* History Panel */}
        <Paper
          elevation={2}
          sx={{
            width: 300,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Typography variant="h6" gutterBottom>
            History
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <RequestHistory
              history={history}
              onSelectRequest={handleHistorySelect}
              onClearHistory={clearHistory}
              onRemoveFromHistory={removeFromHistory}
              onUpdateName={updateHistoryItemName}
            />
          </Box>
        </Paper>

        {/* Request Panel */}
        <Paper 
          elevation={2} 
          sx={{ 
            flex: 1, 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Request
            </Typography>
            <SaveLoadManager
              currentRequest={state.currentRequest}
              onLoadRequest={(request) => {
                setState(prev => ({
                  ...prev,
                  currentRequest: request,
                  status: 'idle'
                }));
              }}
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <RequestBuilder
              request={state.currentRequest}
              onRequestChange={(field, value) => {
                setState(prev => ({
                  ...prev,
                  currentRequest: {
                    ...prev.currentRequest,
                    [field]: value
                  } as APIRequest // Type assertion to ensure correct typing
                }));
              }}
            />
          </Box>
        </Paper>

        {/* Response Panel */}
        <Paper 
          elevation={2} 
          sx={{ 
            flex: 1,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Response
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <ResponseDisplay
              response={state.lastResponse}
              isLoading={state.status === 'loading'}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
