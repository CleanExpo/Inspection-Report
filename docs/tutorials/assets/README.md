# Tutorial Assets

This directory contains assets used in the tutorial videos for the Moisture Mapping System.

## Directory Structure

```
assets/
├── thumbnails/           # Video thumbnail images (16:9 ratio, 1280x720)
├── graphics/            # Graphics, diagrams, and overlays
├── transitions/         # Standard video transitions
├── intro-outro/         # Intro and outro sequences
└── templates/          # Design templates and guidelines
```

## Asset Guidelines

### Thumbnails
- Resolution: 1280x720 pixels (16:9)
- Format: PNG or JPG
- Include:
  * Clear visual representation of content
  * Text overlay with video title
  * System branding elements

### Graphics
- Vector-based when possible (SVG)
- Consistent color scheme with system UI
- Clear labeling and annotations
- High contrast for visibility

### Video Elements
- Intro sequence: 5-7 seconds
- Outro sequence: 3-5 seconds
- Transitions: 0.5-1 second
- Lower thirds: 3-4 seconds display time

## Naming Conventions

```
thumbnails: tutorial-[category]-[name]-thumb.png
graphics: tutorial-[category]-[name]-graphic-[number].svg
transitions: transition-[type].mp4
intro-outro: [intro|outro]-[version].mp4
```

## Technical Specifications

### Video
- Resolution: 1920x1080 (1080p)
- Frame Rate: 30fps
- Codec: H.264
- Format: MP4

### Audio
- Format: AAC
- Sample Rate: 48kHz
- Bitrate: 320kbps
- Channels: Stereo

### Graphics
- Formats: SVG, PNG (with transparency)
- Minimum text size: 14pt
- Brand colors:
  * Primary: #007bff
  * Secondary: #6c757d
  * Accent: #28a745

## Asset Management

1. Version Control
   - Keep dated versions of key assets
   - Maintain changelog for significant updates
   - Archive outdated assets in 'archive' subfolder

2. Quality Assurance
   - Test all assets in video editing software
   - Verify compatibility across platforms
   - Review for accessibility compliance

3. Accessibility
   - Include alt text for images
   - Maintain high contrast ratios
   - Provide text versions of graphical content

Note: When adding new assets, ensure they follow these guidelines and maintain consistency with existing materials.
