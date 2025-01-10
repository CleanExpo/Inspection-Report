# Voice Service API Specification

## Base URL
```
Production: https://voice-api.moisture-inspector.com/v1
Staging: https://staging-voice-api.moisture-inspector.com/v1
```

## Authentication
```http
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Speech Recognition

#### 1.1 Process Audio Stream
```http
POST /speech/process
Content-Type: audio/wav

Request:
{
  "audio": <binary_data>,
  "config": {
    "encoding": "LINEAR16",
    "sampleRateHertz": 16000,
    "languageCode": "en-US",
    "model": "command_and_search",
    "useEnhanced": true
  }
}

Response:
{
  "results": [{
    "text": "record moisture reading fifteen percent",
    "confidence": 0.98,
    "alternatives": [{
      "text": "record moisture reading fifty percent",
      "confidence": 0.72
    }]
  }],
  "metadata": {
    "processingTime": 245,
    "audioLength": 2.5
  }
}
```

#### 1.2 Start Streaming Session
```http
POST /speech/stream/start

Request:
{
  "config": {
    "encoding": "LINEAR16",
    "sampleRateHertz": 16000,
    "languageCode": "en-US",
    "useEnhanced": true
  }
}

Response:
{
  "sessionId": "stream_abc123",
  "websocketUrl": "wss://voice-ws.moisture-inspector.com/v1/speech/stream/abc123"
}
```

### 2. Command Processing

#### 2.1 Process Command
```http
POST /command/process

Request:
{
  "text": "record moisture reading fifteen percent",
  "context": {
    "screen": "moisture_readings",
    "location": "bathroom_wall",
    "previousCommand": "start_reading"
  }
}

Response:
{
  "intent": {
    "name": "record_moisture_reading",
    "confidence": 0.95
  },
  "entities": {
    "value": 15,
    "unit": "percent",
    "location": "bathroom_wall"
  },
  "action": {
    "type": "RECORD_READING",
    "parameters": {
      "value": 15,
      "unit": "percent",
      "location": "bathroom_wall",
      "timestamp": "2024-01-15T14:30:00Z"
    }
  }
}
```

#### 2.2 Validate Command
```http
POST /command/validate

Request:
{
  "command": {
    "intent": "record_moisture_reading",
    "parameters": {
      "value": 15,
      "unit": "percent",
      "location": "bathroom_wall"
    }
  }
}

Response:
{
  "valid": true,
  "requiredParameters": [],
  "suggestions": []
}
```

### 3. Voice Response

#### 3.1 Generate Speech
```http
POST /speech/generate

Request:
{
  "text": "Moisture reading of 15 percent recorded for bathroom wall",
  "voice": {
    "languageCode": "en-US",
    "name": "en-US-Standard-C",
    "ssmlGender": "FEMALE"
  },
  "audioConfig": {
    "audioEncoding": "MP3",
    "speakingRate": 1.0,
    "pitch": 0.0
  }
}

Response:
{
  "audioContent": "<base64_encoded_audio>",
  "metadata": {
    "length": 2.5,
    "format": "mp3"
  }
}
```

#### 3.2 Get Response Template
```http
GET /response/template/{templateId}

Response:
{
  "template": "Moisture reading of {value} {unit} recorded for {location}",
  "parameters": ["value", "unit", "location"],
  "contexts": ["moisture_reading", "measurement"]
}
```

### 4. Voice Profile Management

#### 4.1 Create Voice Profile
```http
POST /profile/create

Request:
{
  "userId": "user123",
  "languageCode": "en-US",
  "audioSamples": [
    "<base64_encoded_audio_1>",
    "<base64_encoded_audio_2>",
    "<base64_encoded_audio_3>"
  ]
}

Response:
{
  "profileId": "vp_xyz789",
  "status": "ENROLLED",
  "confidence": 0.95
}
```

#### 4.2 Update Voice Profile
```http
PUT /profile/{profileId}/update

Request:
{
  "audioSamples": [
    "<base64_encoded_audio>"
  ]
}

Response:
{
  "status": "UPDATED",
  "confidence": 0.97,
  "updatedAt": "2024-01-15T14:30:00Z"
}
```

### 5. Context Management

#### 5.1 Get Current Context
```http
GET /context/current

Response:
{
  "screen": "moisture_readings",
  "location": "bathroom_wall",
  "activeCommand": "record_reading",
  "availableCommands": [
    "save_reading",
    "cancel_reading",
    "add_note"
  ],
  "metadata": {
    "lastCommand": "start_reading",
    "timestamp": "2024-01-15T14:29:00Z"
  }
}
```

#### 5.2 Update Context
```http
POST /context/update

Request:
{
  "screen": "photo_capture",
  "metadata": {
    "previousScreen": "moisture_readings",
    "transition": "voice_command"
  }
}

Response:
{
  "updated": true,
  "availableCommands": [
    "take_photo",
    "add_caption",
    "return"
  ]
}
```

### 6. System Management

#### 6.1 System Health
```http
GET /health

Response:
{
  "status": "healthy",
  "components": {
    "speech_recognition": "operational",
    "command_processing": "operational",
    "voice_synthesis": "operational"
  },
  "metrics": {
    "latency": 45,
    "uptime": 99.99,
    "errorRate": 0.01
  }
}
```

#### 6.2 Model Status
```http
GET /models/status

Response:
{
  "models": {
    "acoustic": {
      "version": "2.0.0",
      "lastUpdated": "2024-01-01T00:00:00Z",
      "status": "active"
    },
    "language": {
      "version": "1.5.0",
      "lastUpdated": "2024-01-01T00:00:00Z",
      "status": "active"
    },
    "noise": {
      "version": "1.2.0",
      "lastUpdated": "2024-01-01T00:00:00Z",
      "status": "active"
    }
  }
}
```

## WebSocket API

### Speech Streaming
```javascript
// Connect to WebSocket
ws = new WebSocket('wss://voice-ws.moisture-inspector.com/v1/speech/stream/{sessionId}')

// Send audio chunks
ws.send({
  type: 'audio',
  data: <binary_audio_chunk>
})

// Receive interim results
ws.onmessage = (event) => {
  const result = {
    type: 'interim_result',
    text: 'record moisture',
    confidence: 0.85,
    isFinal: false
  }
}

// Receive final result
ws.onmessage = (event) => {
  const result = {
    type: 'final_result',
    text: 'record moisture reading fifteen percent',
    confidence: 0.98,
    isFinal: true,
    command: {
      intent: 'record_moisture_reading',
      parameters: {
        value: 15,
        unit: 'percent'
      }
    }
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid audio format",
    "details": {
      "expectedFormat": "LINEAR16",
      "receivedFormat": "MP3"
    }
  }
}
```

### Error Codes
```yaml
authentication_errors:
  - INVALID_TOKEN
  - TOKEN_EXPIRED
  - UNAUTHORIZED

validation_errors:
  - INVALID_REQUEST
  - MISSING_PARAMETER
  - INVALID_FORMAT

processing_errors:
  - SPEECH_RECOGNITION_FAILED
  - COMMAND_PROCESSING_FAILED
  - VOICE_SYNTHESIS_FAILED

system_errors:
  - SERVICE_UNAVAILABLE
  - INTERNAL_ERROR
  - RATE_LIMIT_EXCEEDED
```

## Rate Limits
```yaml
endpoints:
  speech_recognition:
    limit: 100 requests per minute
    burst: 150 requests
    
  command_processing:
    limit: 200 requests per minute
    burst: 300 requests
    
  voice_synthesis:
    limit: 100 requests per minute
    burst: 150 requests
```

## Versioning
- API version is included in the URL path
- Breaking changes will increment the major version number
- Backward compatible changes will be introduced without version changes
- Deprecated endpoints will be maintained for 6 months after announcement
