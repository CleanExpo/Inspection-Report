# SearchBar Component

The SearchBar component provides a comprehensive search interface with advanced filtering capabilities, specifically designed for searching and filtering voice notes and related content.

## Features

### Search Functionality
- Real-time search input
- Clear search capability
- Search icon indication
- Forward ref support for input focus

### Advanced Filtering
- Filter by note types
- Filter by severity levels
- Filter by locations
- Additional boolean filters
  - Has Photos
  - Has AI Analysis
  - Has Critical Issues

### UI Elements
- Material-UI integration
- Popover filter menu
- Chip-based filter selection
- Checkbox options
- Clear filters capability

## Props

| Prop | Type | Description |
|------|------|-------------|
| onSearch | (query: string) => void | Callback when search query changes |
| onFilter | (filters: SearchFilters) => void | Callback when filters are applied |
| noteTypes | VoiceNote['type'][] | Available note type options |
| severityLevels | string[] | Available severity level options |
| locations | string[] | Available location options |
| ref | React.RefObject<HTMLInputElement> | Optional ref for the search input |

### SearchFilters Interface

```typescript
interface SearchFilters {
  types: VoiceNote['type'][];
  severities: string[];
  locations: string[];
  hasPhotos: boolean;
  hasAnalysis: boolean;
  hasCriticalIssues: boolean;
}
```

## Usage

```tsx
import SearchBar from 'components/SearchBar';

const MyComponent = () => {
  const handleSearch = (query: string) => {
    // Handle search query
  };

  const handleFilter = (filters: SearchFilters) => {
    // Handle filter changes
  };

  return (
    <SearchBar
      onSearch={handleSearch}
      onFilter={handleFilter}
      noteTypes={['observation', 'issue', 'recommendation']}
      severityLevels={['low', 'medium', 'high']}
      locations={['room1', 'room2', 'hallway']}
    />
  );
};
```

## Component Structure

1. **Search Input**
   - Full-width text field
   - Search icon prefix
   - Clear button suffix
   - Real-time search updates

2. **Filter Button**
   - Icon button with tooltip
   - Opens filter popover
   - Visual feedback for active filters

3. **Filter Popover**
   - Organized filter sections
   - Chip-based selection
   - Checkbox options
   - Auto-applies on close

## Filter Categories

### Note Types
- Displayed as interactive chips
- Multiple selection supported
- Visual indication of selected state
- Dynamic options from props

### Severity Levels
- Chip-based selection
- Multiple selection enabled
- Clear visual state
- Configurable through props

### Locations
- Filterable building locations
- Multiple selection
- Chip interface
- Prop-driven options

### Additional Filters
- Photo availability
- AI analysis presence
- Critical issues flag
- Boolean checkbox controls

## Interactions

1. **Search Input**
   ```tsx
   <TextField
     inputRef={ref}
     fullWidth
     placeholder="Search notes..."
     onChange={(e) => onSearch(e.target.value)}
     // ...
   />
   ```

2. **Filter Selection**
   ```tsx
   <Chip
     label={type}
     onClick={() => handleFilterChange('types', type)}
     variant={filters.types.includes(type) ? 'filled' : 'outlined'}
     size="small"
   />
   ```

3. **Checkbox Filters**
   ```tsx
   <FormControlLabel
     control={
       <Checkbox
         checked={filters.hasPhotos}
         onChange={(e) => handleFilterChange('hasPhotos', e.target.checked)}
         size="small"
       />
     }
     label="Has Photos"
   />
   ```

## Best Practices

1. **Search Implementation**
   - Implement debouncing for search
   - Consider case sensitivity
   - Handle empty states
   - Provide clear feedback

2. **Filter Management**
   - Clear visual feedback
   - Maintain filter state
   - Easy bulk clear option
   - Consistent behavior

3. **Performance**
   - Optimize filter operations
   - Minimize re-renders
   - Handle large datasets
   - Cache filter results

4. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - Clear focus indicators
   - Descriptive labels

## Error Handling

- Graceful handling of empty states
- Validation of filter combinations
- Fallback for missing options
- Clear error messaging

## Notes

- Component is forward ref compatible
- Maintains internal filter state
- Auto-applies filters on popover close
- Supports keyboard navigation
- Responsive design ready
