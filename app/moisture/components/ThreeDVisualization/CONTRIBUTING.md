# Contributing to ThreeDVisualization

## Development Workflow

### 1. Setup
```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev
```

### 2. Component Structure
The ThreeDVisualization system follows a modular architecture:

```
ThreeDVisualization/
├── setup.ts         # Scene management
├── controls.ts      # Camera controls
├── points.ts        # Point system
├── types.ts         # TypeScript definitions
├── index.tsx        # Main component
├── README.md        # Documentation
├── CONTRIBUTING.md  # Contribution guide
└── __tests__/      # Test files
```

### 3. Implementation Guidelines

#### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Keep files focused and modular
- Use meaningful variable names
- Maintain consistent formatting

#### Testing Requirements
- Write tests for all new features
- Maintain 80% code coverage minimum
- Test edge cases and error conditions
- Use test utilities from test-utils.ts
- Mock external dependencies
- Test async operations properly

#### Performance Considerations
- Optimize Three.js operations
- Minimize object creation in loops
- Use object pooling for frequent updates
- Implement proper cleanup
- Profile rendering performance
- Consider memory usage

### 4. Pull Request Process

1. Branch Naming
```
feature/description-of-feature
bugfix/description-of-bug
improvement/description-of-improvement
```

2. Commit Messages
```
feat: Add new feature
fix: Fix specific issue
improve: Improve existing functionality
docs: Update documentation
test: Add or update tests
```

3. PR Requirements
- Update relevant documentation
- Add/update tests
- Follow code style guidelines
- Include performance considerations
- Add migration steps if needed

### 5. Development Best Practices

#### Scene Management
```typescript
// Good
class SceneManager {
  private cleanup(): void {
    this.disposeGeometries();
    this.disposeMaterials();
    this.clearScene();
  }
}

// Avoid
class SceneManager {
  public dispose(): void {
    // Direct manipulation without cleanup
  }
}
```

#### Resource Management
```typescript
// Good
useEffect(() => {
  const geometry = new THREE.SphereGeometry();
  const material = new THREE.MeshStandardMaterial();
  
  return () => {
    geometry.dispose();
    material.dispose();
  };
}, []);

// Avoid
useEffect(() => {
  new THREE.SphereGeometry(); // No cleanup
}, []);
```

#### Event Handling
```typescript
// Good
const handleResize = useCallback(() => {
  if (!containerRef.current) return;
  sceneManager.handleResize();
}, []);

// Avoid
const handleResize = () => {
  sceneManager.handleResize(); // No null checks
};
```

### 6. Documentation Standards

#### Component Documentation
```typescript
/**
 * ThreeDVisualization component for rendering moisture readings in 3D space.
 * @param props - Component properties
 * @param props.floorPlans - Array of floor plans with moisture readings
 * @param props.controlSettings - Optional camera control settings
 * @returns React component
 */
```

#### Method Documentation
```typescript
/**
 * Adds a new measurement point to the scene.
 * @param reading - Moisture reading data
 * @param level - Floor level for the point
 * @returns Created point object
 * @throws Error if scene is not initialized
 */
```

### 7. Testing Guidelines

#### Unit Tests
```typescript
describe('SceneManager', () => {
  beforeEach(() => {
    // Setup test environment
  });

  test('initializes with correct config', () => {
    const manager = new SceneManager(container, config);
    expect(manager.getRefs()).toBeDefined();
  });
});
```

#### Integration Tests
```typescript
describe('ThreeDVisualization', () => {
  test('renders floor plans correctly', async () => {
    render(<ThreeDVisualization floorPlans={mockFloorPlans} />);
    await waitFor(() => {
      expect(screen.getByTestId('three-d-visualization')).toBeInTheDocument();
    });
  });
});
```

### 8. Performance Testing

#### Metrics to Monitor
- Frame rate (target: 60 FPS)
- Memory usage
- Load time
- Interaction responsiveness

#### Tools
- Chrome DevTools Performance tab
- Three.js Stats
- React Profiler
- Memory leak detection

### 9. Debugging Tips

1. Scene Issues
```typescript
// Add helpers
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);
```

2. Performance Issues
```typescript
// Enable performance monitoring
import Stats from 'three/examples/jsm/libs/stats.module';
const stats = Stats();
document.body.appendChild(stats.dom);
```

3. Memory Issues
```typescript
// Track disposals
const disposables = new Set();
disposables.add(geometry);
// Later...
disposables.forEach(item => item.dispose());
```

### 10. Release Process

1. Version Update
- Update version in package.json
- Update CHANGELOG.md
- Tag release in git

2. Testing
- Run full test suite
- Perform manual testing
- Check performance metrics

3. Documentation
- Update API documentation
- Update examples
- Review migration guide
