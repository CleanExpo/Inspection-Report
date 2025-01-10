# Voice Service Troubleshooting Guide

## Common Issues and Solutions

### 1. Recognition Accuracy Issues

#### Low Recognition Accuracy
```yaml
symptoms:
  - Commands frequently misinterpreted
  - Low confidence scores
  - High word error rate

diagnosis:
  - Check recognition accuracy metrics
  - Review error logs for patterns
  - Analyze audio quality metrics

solutions:
  - Verify microphone settings:
    ```bash
    # Check audio input levels
    arecord -l
    # Test audio capture
    arecord -d 10 -f cd test.wav
    ```
  
  - Update language models:
    ```bash
    # Check model versions
    curl -X GET https://voice-api.moisture-inspector.com/v1/models/status
    # Update models if needed
    ./update-models.sh --force
    ```

  - Adjust noise reduction:
    ```typescript
    // Increase noise reduction level
    await voiceService.updateConfig({
      noiseReduction: {
        enabled: true,
        level: 0.8
      }
    });
    ```
```

#### Background Noise Interference
```yaml
symptoms:
  - Increased error rates in noisy environments
  - Low signal-to-noise ratio
  - Inconsistent recognition

diagnosis:
  - Monitor noise levels:
    ```bash
    # Check audio levels
    sox test.wav -n stat
    ```
  
  - Analyze audio spectrum:
    ```bash
    # Generate spectrogram
    sox test.wav -n spectrogram -o spec.png
    ```

solutions:
  - Enable advanced noise filtering:
    ```typescript
    await voiceService.setNoiseFilter({
      type: 'adaptive',
      threshold: -40,
      attack: 0.02,
      release: 0.2
    });
    ```
  
  - Adjust microphone sensitivity:
    ```typescript
    await voiceService.setInputGain({
      gain: 0.8,
      autoGain: true
    });
    ```
```

### 2. Performance Issues

#### High Latency
```yaml
symptoms:
  - Slow response times
  - Command processing delays
  - Voice feedback lag

diagnosis:
  - Check system metrics:
    ```bash
    # Monitor CPU usage
    top -p $(pgrep -f voice-service)
    
    # Check memory usage
    free -m
    
    # Monitor network latency
    ping voice-api.moisture-inspector.com
    ```

  - Review service logs:
    ```bash
    # Check for bottlenecks
    grep "processing_time" /var/log/voice-service/performance.log
    ```

solutions:
  - Scale services:
    ```bash
    # Increase service instances
    kubectl scale deployment voice-service --replicas=3
    
    # Monitor scaling
    kubectl get hpa voice-service
    ```

  - Optimize caching:
    ```typescript
    await voiceService.updateCache({
      commandCache: {
        size: '100MB',
        ttl: '1h'
      },
      modelCache: {
        preload: true,
        size: '1GB'
      }
    });
    ```
```

#### Memory Leaks
```yaml
symptoms:
  - Increasing memory usage
  - Performance degradation over time
  - Service restarts

diagnosis:
  - Monitor memory usage:
    ```bash
    # Check memory growth
    watch -n 1 'ps -o pid,rss,command -p $(pgrep -f voice-service)'
    
    # Generate heap dump
    node --heapsnapshot-signal=SIGUSR2 voice-service.js
    ```

  - Analyze heap:
    ```bash
    # Use Chrome DevTools to analyze heap snapshot
    chrome://inspect
    ```

solutions:
  - Implement memory limits:
    ```yaml
    resources:
      limits:
        memory: 2Gi
      requests:
        memory: 1Gi
    ```

  - Add garbage collection logging:
    ```bash
    NODE_OPTIONS="--trace-gc" node voice-service.js
    ```
```

### 3. Integration Issues

#### Mobile App Connection Problems
```yaml
symptoms:
  - Failed WebSocket connections
  - Authentication errors
  - Timeout issues

diagnosis:
  - Check connection logs:
    ```bash
    # Monitor WebSocket connections
    tail -f /var/log/voice-service/websocket.log
    
    # Check authentication attempts
    grep "auth_failure" /var/log/voice-service/auth.log
    ```

  - Test network connectivity:
    ```bash
    # Test WebSocket endpoint
    wscat -c wss://voice-ws.moisture-inspector.com
    ```

solutions:
  - Implement connection retry logic:
    ```typescript
    const wsClient = new WebSocket(url, {
      reconnect: true,
      maxRetries: 5,
      backoff: {
        initial: 1000,
        multiplier: 1.5,
        max: 10000
      }
    });
    ```

  - Add connection monitoring:
    ```typescript
    wsClient.on('close', (code, reason) => {
      logger.error('WebSocket closed', { code, reason });
      metrics.increment('websocket.disconnection');
    });
    ```
```

#### Device Compatibility Issues
```yaml
symptoms:
  - Platform-specific failures
  - Inconsistent behavior across devices
  - Feature unavailability

diagnosis:
  - Check device logs:
    ```bash
    # iOS device logs
    xcrun simctl spawn booted log stream --predicate 'subsystem == "com.moisture-inspector"'
    
    # Android device logs
    adb logcat | grep -i voice
    ```

  - Test feature support:
    ```typescript
    const checkDeviceSupport = async () => {
      const features = await voiceService.checkFeatures();
      console.log('Supported features:', features);
    };
    ```

solutions:
  - Implement feature detection:
    ```typescript
    const initVoiceService = async () => {
      const capabilities = await detectCapabilities();
      await voiceService.initialize({
        fallbackMode: !capabilities.nativeVoice,
        alternativeAPI: capabilities.webSpeech
      });
    };
    ```

  - Add device-specific configurations:
    ```typescript
    const deviceConfig = {
      ios: {
        sampleRate: 44100,
        channels: 1
      },
      android: {
        sampleRate: 16000,
        channels: 1
      }
    };
    ```
```

### 4. Service Health Issues

#### Service Crashes
```yaml
symptoms:
  - Unexpected service termination
  - Error stack traces
  - Unhandled exceptions

diagnosis:
  - Analyze crash logs:
    ```bash
    # Check service logs
    journalctl -u voice-service -n 1000 --no-pager
    
    # Check error patterns
    grep -r "Error:" /var/log/voice-service/
    ```

  - Monitor process status:
    ```bash
    # Check process health
    systemctl status voice-service
    
    # View recent crashes
    coredumpctl list
    ```

solutions:
  - Implement error boundaries:
    ```typescript
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', error);
      metrics.increment('uncaught_exception');
      // Graceful shutdown
      shutdown();
    });
    ```

  - Add health checks:
    ```typescript
    const healthCheck = async () => {
      try {
        await Promise.all([
          checkDatabase(),
          checkCache(),
          checkModels()
        ]);
        return { status: 'healthy' };
      } catch (error) {
        return { status: 'unhealthy', error };
      }
    };
    ```
```

#### Resource Exhaustion
```yaml
symptoms:
  - High CPU usage
  - Memory pressure
  - Disk space issues

diagnosis:
  - Monitor resource usage:
    ```bash
    # Check system resources
    htop
    
    # Monitor disk usage
    df -h
    
    # Check I/O stats
    iostat -x 1
    ```

  - Analyze resource trends:
    ```bash
    # Generate resource usage report
    sar -r 1 3600 > memory_report.txt
    sar -u 1 3600 > cpu_report.txt
    ```

solutions:
  - Implement resource limits:
    ```yaml
    # Docker resource limits
    resources:
      limits:
        cpu: "2"
        memory: "2Gi"
      requests:
        cpu: "1"
        memory: "1Gi"
    ```

  - Add resource monitoring:
    ```typescript
    const monitorResources = () => {
      setInterval(async () => {
        const usage = await getResourceUsage();
        if (usage.memory > 80) {
          logger.warn('High memory usage');
          await optimizeMemory();
        }
      }, 60000);
    };
    ```
```

## Recovery Procedures

### 1. Service Recovery
```bash
# Stop service
systemctl stop voice-service

# Clear temporary files
rm -rf /tmp/voice-service/*

# Reset cache
redis-cli FLUSHDB

# Start service
systemctl start voice-service

# Verify recovery
curl -X GET https://voice-api.moisture-inspector.com/v1/health
```

### 2. Data Recovery
```bash
# Backup current data
./backup.sh --full

# Restore from backup
./restore.sh --timestamp="2024-01-15T14:30:00Z"

# Verify data integrity
./verify-data.sh
```

## Preventive Measures

### 1. Monitoring Setup
```yaml
monitoring:
  metrics:
    - recognition_accuracy
    - response_time
    - error_rate
    - resource_usage
  
  alerts:
    - type: accuracy_drop
      threshold: 90%
      duration: 5m
    
    - type: high_latency
      threshold: 2s
      duration: 5m
```

### 2. Backup Strategy
```yaml
backups:
  schedule:
    full: daily
    incremental: hourly
  
  retention:
    full: 30d
    incremental: 7d
  
  verification:
    frequency: daily
    type: restore_test
```

## Emergency Contacts
```yaml
contacts:
  voice_service_team:
    primary: voice-team@moisture-inspector.com
    slack: #voice-alerts
    phone: +1-555-0123

  infrastructure_team:
    primary: infra-team@moisture-inspector.com
    slack: #infra-alerts
    phone: +1-555-0124

  vendor_support:
    speech_recognition: support@speech-vendor.com
    cloud_provider: cloud-support@provider.com
