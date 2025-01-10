# Voice Command Dictionary

## General Commands

### Navigation
```yaml
open_section:
  command: "Open [section_name]"
  examples:
    - "Open moisture readings"
    - "Open photo gallery"
    - "Open floor plan"
  response: "Opening [section_name]"

close_section:
  command: "Close [section_name]"
  examples:
    - "Close current section"
    - "Close readings"
  response: "Closing [section_name]"

go_back:
  command: "Go back"
  aliases:
    - "Return"
    - "Previous screen"
  response: "Returning to previous screen"
```

### System Control
```yaml
start_recording:
  command: "Start recording"
  context: "Any screen"
  response: "Recording started"

stop_recording:
  command: "Stop recording"
  context: "During recording"
  response: "Recording stopped"

save_data:
  command: "Save [item_type]"
  examples:
    - "Save reading"
    - "Save photo"
    - "Save notes"
  response: "Saving [item_type]"

cancel_action:
  command: "Cancel"
  aliases:
    - "Stop"
    - "Abort"
  response: "Action cancelled"
```

## Moisture Readings

### Taking Readings
```yaml
new_reading:
  command: "New reading for [location]"
  examples:
    - "New reading for living room wall"
    - "New reading for bathroom floor"
  response: "Ready to record reading for [location]"

record_value:
  command: "Record [number] [unit]"
  examples:
    - "Record 15 percent"
    - "Record 85 points"
  response: "Recorded [number] [unit]"

mark_affected_area:
  command: "Mark affected area [dimensions]"
  examples:
    - "Mark affected area 2 by 3 meters"
    - "Mark affected area 6 feet wide"
  response: "Marking affected area [dimensions]"
```

### Reading Management
```yaml
compare_readings:
  command: "Compare with previous readings"
  context: "Moisture reading screen"
  response: "Previous readings for this location are..."

trend_analysis:
  command: "Show moisture trend"
  context: "Moisture reading screen"
  response: "Moisture trend shows..."

set_baseline:
  command: "Set as baseline reading"
  context: "Moisture reading screen"
  response: "Setting current reading as baseline"
```

## Documentation

### Photo Documentation
```yaml
take_photo:
  command: "Take photo of [subject]"
  examples:
    - "Take photo of water damage"
    - "Take photo of affected wall"
  response: "Taking photo"

add_photo_note:
  command: "Add note to photo: [note_text]"
  context: "Photo review screen"
  response: "Adding note to photo"

mark_damage:
  command: "Mark damage on photo"
  context: "Photo review screen"
  response: "Ready to mark damage area"
```

### Notes and Observations
```yaml
add_note:
  command: "Add note: [note_text]"
  context: "Any screen"
  response: "Adding note"

start_dictation:
  command: "Start dictation"
  context: "Notes section"
  response: "Starting dictation"

end_dictation:
  command: "End dictation"
  context: "During dictation"
  response: "Ending dictation"
```

## Equipment Management

### Equipment Operation
```yaml
calibrate_device:
  command: "Calibrate [device_name]"
  examples:
    - "Calibrate moisture meter"
    - "Calibrate thermal camera"
  response: "Starting calibration for [device_name]"

check_battery:
  command: "Check battery level"
  context: "Equipment screen"
  response: "Battery level is [percentage]"

connect_device:
  command: "Connect to [device_name]"
  examples:
    - "Connect to moisture meter"
    - "Connect to thermal camera"
  response: "Connecting to [device_name]"
```

## Report Generation

### Report Commands
```yaml
start_report:
  command: "Start new report"
  context: "Reports section"
  response: "Creating new report"

add_to_report:
  command: "Add [item_type] to report"
  examples:
    - "Add photos to report"
    - "Add readings to report"
  response: "Adding [item_type] to report"

generate_report:
  command: "Generate report"
  context: "Reports section"
  response: "Generating report"
```

## Help and Assistance

### Help Commands
```yaml
get_help:
  command: "Help with [topic]"
  examples:
    - "Help with moisture readings"
    - "Help with photo documentation"
  response: "Here's how to [topic]..."

list_commands:
  command: "What can I say?"
  aliases:
    - "Show commands"
    - "Available commands"
  response: "Available commands are..."

explain_process:
  command: "Explain [process_name]"
  examples:
    - "Explain moisture mapping"
    - "Explain documentation requirements"
  response: "Here's how to [process_name]..."
```

## Context-Aware Interactions

### Smart Assistance
```yaml
suggest_next:
  command: "What's next?"
  context: "Any screen"
  response: "Based on current readings, you should..."

verify_completion:
  command: "Is this complete?"
  context: "Any screen"
  response: "Checking completion status..."

highlight_issues:
  command: "Any concerns?"
  context: "Review screen"
  response: "Analyzing current data..."
```

## Error Handling

### Error Recovery
```yaml
retry_action:
  command: "Try again"
  context: "After error"
  response: "Retrying last action"

report_issue:
  command: "Report problem"
  context: "Any screen"
  response: "Recording issue details"

get_support:
  command: "Need support"
  context: "Any screen"
  response: "Connecting to support..."
```

## Voice Customization

### Voice Settings
```yaml
adjust_speed:
  command: "Speak [speed_level]"
  examples:
    - "Speak faster"
    - "Speak slower"
  response: "Adjusting speech speed"

change_voice:
  command: "Change voice to [voice_type]"
  examples:
    - "Change voice to male"
    - "Change voice to female"
  response: "Changing voice type"

toggle_confirmation:
  command: "Toggle confirmations"
  context: "Settings"
  response: "Confirmation prompts [status]"
