# Landing Page Components

This directory contains the components used to build the inspection report system's landing page.

## Component Structure

### HeroSection
`HeroSection.tsx`
- Main hero section at the top of the landing page
- Customizable title, subtitle, and icon
- Supports custom styling through props

Props:
```typescript
interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  containerStyles?: SxProps<Theme>;
  titleStyles?: SxProps<Theme>;
  subtitleStyles?: SxProps<Theme>;
}
```

### InspectionSectionCard
`InspectionSectionCard.tsx`
- Individual card component for each inspection section
- Displays icon, title, and description
- Handles click navigation
- Supports keyboard navigation

Props:
```typescript
interface InspectionSectionCardProps extends InspectionSection {
  onClick?: (path: string) => void;
  customStyles?: React.CSSProperties;
}
```

### InspectionSectionsGrid
`InspectionSectionsGrid.tsx`
- Grid layout for inspection section cards
- Uses default sections or accepts custom sections
- Customizable spacing and click handling

Props:
```typescript
interface InspectionSectionsGridProps {
  sections?: InspectionSection[];
  onSectionClick?: (path: string) => void;
  cardStyles?: React.CSSProperties;
  gridSpacing?: number;
}
```

### QuickActions
`QuickActions.tsx`
- Quick action buttons for common tasks
- Customizable click handlers for each action
- Responsive layout

Props:
```typescript
interface QuickActionsProps {
  onNewInspection?: () => void;
  onViewReports?: () => void;
  onViewGallery?: () => void;
}
```

## Usage

Import and use these components in your pages:

```tsx
import HeroSection from '../components/HeroSection';
import InspectionSectionsGrid from '../components/InspectionSectionsGrid';
import QuickActions from '../components/QuickActions';

export default function Page() {
  return (
    <>
      <HeroSection />
      <InspectionSectionsGrid />
      <QuickActions />
    </>
  );
}
```

## Customization

Each component accepts various props for customization. See the individual component interfaces for available options.

Example:
```tsx
<HeroSection 
  title="Custom Title"
  subtitle="Custom subtitle text"
  containerStyles={{ backgroundColor: 'primary.main' }}
/>
```

## Theme

The components use the global theme defined in `app/theme.ts`. Modify this file to change the overall look and feel of the components.
