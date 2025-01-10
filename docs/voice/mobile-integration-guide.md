# Voice System Mobile Integration Guide

## Overview
This guide outlines the integration of voice capabilities into the mobile application for the Moisture Inspector system.

## Prerequisites

### Required Dependencies
```json
{
  "dependencies": {
    "@react-native-voice/voice": "^3.2.0",
    "@react-native-community/audio-toolkit": "^2.0.3",
    "react-native-permissions": "^3.8.0",
    "react-native-background-timer": "^2.4.1"
  }
}
```

### Required Permissions
```xml
<!-- Android: AndroidManifest.xml -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

<!-- iOS: Info.plist -->
<key>NSMicrophoneUsageDescription</key>
<string>Voice commands are used for hands-free operation during inspections</string>
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

## Integration Steps

### 1. Voice Service Setup

```typescript
// src/services/VoiceService.ts
import Voice, { 
  SpeechResultsEvent, 
  SpeechErrorEvent 
} from '@react-native-voice/voice';

export class VoiceService {
  private static instance: VoiceService;
  private isListening: boolean = false;
  
  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  async initialize(): Promise<void> {
    Voice.onSpeechStart = this.handleSpeechStart;
    Voice.onSpeechResults = this.handleSpeechResults;
    Voice.onSpeechError = this.handleSpeechError;
    
    await this.checkPermissions();
  }

  private async checkPermissions(): Promise<void> {
    const { check, request, PERMISSIONS } = require('react-native-permissions');
    
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.MICROPHONE,
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    });

    const result = await check(permission);
    if (result !== 'granted') {
      await request(permission);
    }
  }

  async startListening(): Promise<void> {
    try {
      this.isListening = true;
      await Voice.start('en-US');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      throw error;
    }
  }

  async stopListening(): Promise<void> {
    try {
      this.isListening = false;
      await Voice.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      throw error;
    }
  }

  private handleSpeechStart = (event: any) => {
    // Handle speech start event
  };

  private handleSpeechResults = async (event: SpeechResultsEvent) => {
    if (event.value && event.value[0]) {
      const command = event.value[0];
      await this.processCommand(command);
    }
  };

  private handleSpeechError = (error: SpeechErrorEvent) => {
    console.error('Speech recognition error:', error);
    this.isListening = false;
  };

  private async processCommand(command: string): Promise<void> {
    try {
      const response = await fetch('https://voice-api.moisture-inspector.com/v1/command/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          text: command,
          context: await this.getCurrentContext()
        }),
      });

      const result = await response.json();
      await this.executeCommand(result.action);
    } catch (error) {
      console.error('Error processing command:', error);
      throw error;
    }
  }
}
```

### 2. Voice Context Provider

```typescript
// src/contexts/VoiceContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface VoiceContextType {
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  lastCommand: string | null;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const voiceService = VoiceService.getInstance();

  const startListening = async () => {
    try {
      await voiceService.startListening();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  };

  const stopListening = async () => {
    try {
      await voiceService.stopListening();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        startListening,
        stopListening,
        lastCommand,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};
```

### 3. Voice Command Hook

```typescript
// src/hooks/useVoiceCommand.ts
import { useContext, useEffect } from 'react';
import { VoiceContext } from '../contexts/VoiceContext';

interface VoiceCommandOptions {
  onCommand?: (command: string) => void;
  onError?: (error: Error) => void;
  commands?: string[];
}

export const useVoiceCommand = (options: VoiceCommandOptions = {}) => {
  const context = useContext(VoiceContext);
  
  if (!context) {
    throw new Error('useVoiceCommand must be used within a VoiceProvider');
  }

  const { isListening, startListening, stopListening, lastCommand } = context;

  useEffect(() => {
    if (lastCommand && options.onCommand) {
      options.onCommand(lastCommand);
    }
  }, [lastCommand]);

  return {
    isListening,
    startListening,
    stopListening,
  };
};
```

### 4. Voice UI Components

```typescript
// src/components/VoiceButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useVoiceCommand } from '../hooks/useVoiceCommand';

export const VoiceButton: React.FC = () => {
  const { isListening, startListening, stopListening } = useVoiceCommand();
  const pulseAnim = new Animated.Value(1);

  const startPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (isListening) {
        startPulse();
      }
    });
  };

  const handlePress = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
      startPulse();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View
        style={[
          styles.button,
          { transform: [{ scale: pulseAnim }] },
          isListening && styles.listening,
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listening: {
    backgroundColor: '#FF3B30',
  },
});
```

### 5. Integration Example

```typescript
// src/screens/MoistureReadingScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VoiceButton } from '../components/VoiceButton';
import { useVoiceCommand } from '../hooks/useVoiceCommand';

export const MoistureReadingScreen: React.FC = () => {
  const { isListening } = useVoiceCommand({
    onCommand: async (command) => {
      if (command.includes('record moisture')) {
        // Extract value and location from command
        const match = command.match(/record moisture (\d+) percent/i);
        if (match) {
          const value = parseInt(match[1], 10);
          await saveMoistureReading(value);
        }
      }
    },
    commands: [
      'record moisture [number] percent',
      'save reading',
      'cancel reading',
    ],
  });

  return (
    <View style={styles.container}>
      {/* Other screen content */}
      <VoiceButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

## Best Practices

### 1. Error Handling
```typescript
const handleVoiceError = (error: Error) => {
  if (error.message.includes('permission')) {
    // Handle permission errors
    showPermissionAlert();
  } else if (error.message.includes('network')) {
    // Handle network errors
    enableOfflineMode();
  } else {
    // Handle other errors
    showErrorMessage(error.message);
  }
};
```

### 2. Battery Optimization
```typescript
const optimizeVoiceService = () => {
  // Disable voice service when app is in background
  AppState.addEventListener('change', (state) => {
    if (state === 'background') {
      stopVoiceService();
    } else if (state === 'active') {
      startVoiceService();
    }
  });

  // Use low power mode when battery is low
  Battery.addEventListener('batteryLevelDidChange', (level) => {
    if (level < 0.2) {
      enableLowPowerMode();
    }
  });
};
```

### 3. Performance Monitoring
```typescript
const monitorVoicePerformance = () => {
  // Track recognition accuracy
  let successfulCommands = 0;
  let totalCommands = 0;

  const trackCommandSuccess = (success: boolean) => {
    totalCommands++;
    if (success) successfulCommands++;
    
    const accuracy = (successfulCommands / totalCommands) * 100;
    analytics.trackMetric('voice_recognition_accuracy', accuracy);
  };

  // Track response times
  const trackResponseTime = async (startTime: number) => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    analytics.trackMetric('voice_response_time', responseTime);
  };
};
```

### 4. Offline Support
```typescript
const enableOfflineSupport = () => {
  // Cache common commands
  const cacheCommands = async () => {
    const commonCommands = await fetchCommonCommands();
    await AsyncStorage.setItem('cached_commands', JSON.stringify(commonCommands));
  };

  // Process commands offline
  const processOfflineCommand = async (command: string) => {
    const cachedCommands = JSON.parse(
      await AsyncStorage.getItem('cached_commands')
    );
    
    const matchedCommand = findBestMatch(command, cachedCommands);
    if (matchedCommand) {
      await executeOfflineCommand(matchedCommand);
    }
  };
};
```

## Troubleshooting

### Common Issues

1. Recognition Not Starting
```typescript
const troubleshootRecognition = async () => {
  // Check microphone
  const microphoneStatus = await Voice.isAvailable();
  if (!microphoneStatus) {
    console.error('Microphone not available');
    return;
  }

  // Check permissions
  const permissions = await Voice.hasPermission();
  if (!permissions) {
    console.error('Missing permissions');
    return;
  }

  // Check network
  const networkStatus = await NetInfo.fetch();
  if (!networkStatus.isConnected) {
    console.error('No network connection');
    return;
  }
};
```

2. Poor Recognition Quality
```typescript
const improveRecognitionQuality = () => {
  // Implement noise reduction
  const noiseReduction = {
    enabled: true,
    level: 0.5,
  };

  // Adjust sample rate
  const audioConfig = {
    sampleRate: 16000,
    channels: 1,
    bitsPerSample: 16,
  };

  // Use enhanced recognition
  const recognitionConfig = {
    enhanced: true,
    model: 'command_and_search',
  };
};
```

## Testing

### Unit Tests
```typescript
describe('VoiceService', () => {
  it('should initialize correctly', async () => {
    const service = VoiceService.getInstance();
    await service.initialize();
    expect(service).toBeDefined();
  });

  it('should process commands correctly', async () => {
    const command = 'record moisture 15 percent';
    const result = await service.processCommand(command);
    expect(result.intent).toBe('record_moisture_reading');
    expect(result.entities.value).toBe(15);
  });
});
```

### Integration Tests
```typescript
describe('Voice Integration', () => {
  it('should handle voice commands in moisture reading screen', async () => {
    const { getByTestId } = render(<MoistureReadingScreen />);
    const voiceButton = getByTestId('voice-button');
    
    fireEvent.press(voiceButton);
    await waitFor(() => {
      expect(VoiceService.getInstance().isListening).toBe(true);
    });
  });
});
