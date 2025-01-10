# Voice Service Monitoring Guide

## Overview
This guide outlines the monitoring strategy for the voice processing system, including metrics collection, alerting, and performance tracking.

## Key Metrics

### 1. Recognition Performance
```yaml
metrics:
  recognition_accuracy:
    description: "Percentage of correctly recognized commands"
    type: gauge
    threshold:
      warning: < 95%
      critical: < 90%
    query: |
      sum(rate(voice_recognition_success[5m])) /
      sum(rate(voice_recognition_total[5m])) * 100

  word_error_rate:
    description: "Word error rate in transcriptions"
    type: gauge
    threshold:
      warning: > 5%
      critical: > 10%
    query: |
      sum(voice_transcription_errors) /
      sum(voice_transcription_words) * 100

  confidence_score:
    description: "Average confidence score of recognized commands"
    type: gauge
    threshold:
      warning: < 0.85
      critical: < 0.75
    query: |
      avg(voice_recognition_confidence)
```

### 2. Response Times
```yaml
metrics:
  speech_to_text_latency:
    description: "Time taken to convert speech to text"
    type: histogram
    threshold:
      warning: > 500ms
      critical: > 1000ms
    query: |
      histogram_quantile(0.95, sum(rate(voice_stt_duration_bucket[5m])) by (le))

  command_processing_time:
    description: "Time taken to process and execute commands"
    type: histogram
    threshold:
      warning: > 200ms
      critical: > 500ms
    query: |
      histogram_quantile(0.95, sum(rate(voice_command_duration_bucket[5m])) by (le))

  end_to_end_latency:
    description: "Total time from voice input to action completion"
    type: histogram
    threshold:
      warning: > 1s
      critical: > 2s
    query: |
      histogram_quantile(0.95, sum(rate(voice_total_duration_bucket[5m])) by (le))
```

### 3. System Health
```yaml
metrics:
  cpu_usage:
    description: "CPU usage of voice processing services"
    type: gauge
    threshold:
      warning: > 70%
      critical: > 85%
    query: |
      avg(rate(process_cpu_seconds_total{service="voice"}[5m])) * 100

  memory_usage:
    description: "Memory usage of voice processing services"
    type: gauge
    threshold:
      warning: > 80%
      critical: > 90%
    query: |
      sum(container_memory_usage_bytes{service="voice"}) /
      sum(container_spec_memory_limit_bytes{service="voice"}) * 100

  error_rate:
    description: "Rate of processing errors"
    type: gauge
    threshold:
      warning: > 1%
      critical: > 5%
    query: |
      sum(rate(voice_processing_errors_total[5m])) /
      sum(rate(voice_processing_total[5m])) * 100
```

## Grafana Dashboards

### 1. Voice Service Overview
```json
{
  "title": "Voice Service Overview",
  "panels": [
    {
      "title": "Recognition Accuracy",
      "type": "gauge",
      "datasource": "Prometheus",
      "targets": [
        {
          "expr": "sum(rate(voice_recognition_success[5m])) / sum(rate(voice_recognition_total[5m])) * 100"
        }
      ],
      "thresholds": [
        { "value": 90, "color": "red" },
        { "value": 95, "color": "yellow" },
        { "value": 98, "color": "green" }
      ]
    },
    {
      "title": "Response Times",
      "type": "graph",
      "datasource": "Prometheus",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, sum(rate(voice_total_duration_bucket[5m])) by (le))"
        }
      ]
    }
  ]
}
```

### 2. Error Tracking Dashboard
```json
{
  "title": "Voice Service Errors",
  "panels": [
    {
      "title": "Error Rate by Type",
      "type": "graph",
      "datasource": "Prometheus",
      "targets": [
        {
          "expr": "sum(rate(voice_processing_errors_total[5m])) by (error_type)"
        }
      ]
    },
    {
      "title": "Error Distribution",
      "type": "pie",
      "datasource": "Prometheus",
      "targets": [
        {
          "expr": "sum(voice_processing_errors_total) by (error_type)"
        }
      ]
    }
  ]
}
```

## Alert Rules

### 1. Recognition Performance Alerts
```yaml
groups:
  - name: voice_recognition_alerts
    rules:
      - alert: LowRecognitionAccuracy
        expr: |
          sum(rate(voice_recognition_success[5m])) /
          sum(rate(voice_recognition_total[5m])) * 100 < 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low voice recognition accuracy"
          description: "Recognition accuracy has fallen below 90%"

      - alert: HighWordErrorRate
        expr: |
          sum(voice_transcription_errors) /
          sum(voice_transcription_words) * 100 > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High word error rate"
          description: "Word error rate is above 10%"
```

### 2. Performance Alerts
```yaml
groups:
  - name: voice_performance_alerts
    rules:
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, sum(rate(voice_total_duration_bucket[5m])) by (le)) > 2
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High voice processing latency"
          description: "95th percentile latency is above 2 seconds"

      - alert: HighErrorRate
        expr: |
          sum(rate(voice_processing_errors_total[5m])) /
          sum(rate(voice_processing_total[5m])) * 100 > 5
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate"
          description: "Error rate is above 5%"
```

## Logging

### 1. Log Format
```json
{
  "timestamp": "2024-01-15T14:30:00.000Z",
  "level": "info",
  "service": "voice-processing",
  "event": "command_processed",
  "data": {
    "command_text": "record moisture reading fifteen percent",
    "confidence": 0.95,
    "processing_time": 150,
    "intent": "record_moisture_reading",
    "entities": {
      "value": 15,
      "unit": "percent"
    }
  },
  "metadata": {
    "user_id": "user123",
    "device_id": "device456",
    "session_id": "session789"
  }
}
```

### 2. Log Aggregation
```yaml
filebeat.inputs:
- type: log
  paths:
    - /var/log/voice-service/*.log
  json.keys_under_root: true
  fields:
    service: voice-processing

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "voice-logs-%{+yyyy.MM.dd}"
```

## Performance Monitoring

### 1. Resource Usage Tracking
```yaml
monitoring:
  resources:
    cpu:
      usage_percent: true
      throttling: true
    memory:
      usage_bytes: true
      limit_bytes: true
    disk:
      read_bytes: true
      write_bytes: true
    network:
      rx_bytes: true
      tx_bytes: true
```

### 2. Performance Metrics
```yaml
monitoring:
  performance:
    request_rate:
      description: "Number of voice requests per second"
      type: counter
      labels:
        - method
        - endpoint
    
    processing_time:
      description: "Time taken to process voice commands"
      type: histogram
      buckets: [0.1, 0.5, 1, 2, 5]
      labels:
        - command_type
        - status
```

## Health Checks

### 1. Service Health Endpoints
```yaml
health_checks:
  endpoints:
    - url: /health/recognition
      interval: 30s
      timeout: 5s
      success_threshold: 1
      failure_threshold: 3
      
    - url: /health/processing
      interval: 30s
      timeout: 5s
      success_threshold: 1
      failure_threshold: 3
```

### 2. Component Health Checks
```yaml
health_checks:
  components:
    speech_recognition:
      check: "Test recognition with sample audio"
      interval: 5m
      
    command_processing:
      check: "Process test command"
      interval: 5m
      
    voice_synthesis:
      check: "Generate test response"
      interval: 5m
```

## Incident Response

### 1. Automated Recovery
```yaml
recovery:
  actions:
    high_error_rate:
      - scale_up_instances
      - reload_models
      - notify_team
      
    high_latency:
      - clear_cache
      - restart_service
      - notify_team
```

### 2. Incident Playbooks
```yaml
playbooks:
  recognition_degradation:
    steps:
      - check_error_logs
      - verify_model_versions
      - analyze_traffic_patterns
      - review_resource_usage
      
  service_outage:
    steps:
      - verify_dependencies
      - check_network_connectivity
      - review_recent_deployments
      - initiate_rollback_if_needed
```

## Capacity Planning

### 1. Resource Scaling
```yaml
scaling:
  metrics:
    cpu_threshold: 70%
    memory_threshold: 80%
    request_rate_threshold: 100/s
    
  actions:
    scale_up:
      min_instances: 2
      max_instances: 10
      cooldown_period: 300s
```

### 2. Performance Forecasting
```yaml
forecasting:
  metrics:
    - daily_active_users
    - peak_request_rate
    - average_processing_time
    
  predictions:
    horizon: 7d
    frequency: 1h
    confidence_interval: 0.95
