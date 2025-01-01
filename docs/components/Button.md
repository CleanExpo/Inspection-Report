# Button Component

The Button component is a customized wrapper around Material-UI's Button component, providing consistent styling and enhanced functionality across the application.

## Features

### Styled Integration
- Extends Material-UI Button component
- Consistent styling with application theme
- Custom border radius from theme
- Removed uppercase text transform
- Enhanced padding for better usability

### Theme Integration
- Uses application's theme palette
- Custom hover states
- Consistent border radius
- Seamless Material-UI integration

### Customization
- Supports all Material-UI Button props
- Additional custom properties
- Flexible width options
- Maintains theme consistency

## Props

Extends all Material-UI ButtonProps with additional properties:

| Prop | Type | Description |
|------|------|-------------|
| fullWidth | boolean | Optional. Makes button take full width of container |
| children | ReactNode | Button content |
| ...ButtonProps | ButtonProps | All standard Material-UI Button props |

## Usage

```tsx
import { Button } from 'components/Button';

// Basic Usage
<Button>
  Click Me
</Button>

// Primary Variant
<Button variant="contained" color="primary">
  Submit
</Button>

// Full Width
<Button fullWidth>
  Wide Button
</Button>

// With onClick Handler
<Button onClick={() => handleClick()}>
  Handle Click
</Button>

// Disabled State
<Button disabled>
  Disabled
</Button>
```

## Styling

The component uses Material-UI's styled API for consistent theming:

```typescript
const StyledButton = styled(MuiButton)<CustomButtonProps>(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  padding: '8px 24px',
  '&.MuiButton-containedPrimary': {
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));
```

### Custom Styles

1. **Border Radius**
   - Uses theme's border radius
   - Consistent with application design

2. **Text Transform**
   - Removes default uppercase transform
   - More natural text appearance

3. **Padding**
   - Custom padding (8px 24px)
   - Improved touch target size

4. **Colors**
   - Uses theme's primary color palette
   - Custom hover state colors

## Best Practices

1. **Consistent Usage**
   - Use for primary actions
   - Maintain consistent styling
   - Follow application patterns

2. **Accessibility**
   - Include descriptive text
   - Use appropriate ARIA labels
   - Consider keyboard navigation

3. **Responsive Design**
   - Use fullWidth prop when needed
   - Consider mobile touch targets
   - Maintain readable text size

4. **State Management**
   - Handle loading states
   - Provide feedback on actions
   - Manage disabled states

## Examples

### Primary Action Button
```tsx
<Button 
  variant="contained" 
  color="primary"
  onClick={handleSubmit}
>
  Submit Form
</Button>
```

### Secondary Action Button
```tsx
<Button 
  variant="outlined" 
  color="secondary"
  onClick={handleCancel}
>
  Cancel
</Button>
```

### Full Width Button
```tsx
<Button 
  fullWidth 
  variant="contained"
  color="primary"
>
  Save Changes
</Button>
```

### Loading State
```tsx
<Button 
  disabled={isLoading}
  variant="contained"
>
  {isLoading ? 'Processing...' : 'Submit'}
</Button>
```

## Error Handling

- Gracefully handles missing props
- Falls back to default styles
- Maintains functionality without theme
- Preserves accessibility features

## Notes

- Use for consistent button styling across the application
- Extends Material-UI's Button functionality
- Maintains theme consistency
- Supports all standard button operations
