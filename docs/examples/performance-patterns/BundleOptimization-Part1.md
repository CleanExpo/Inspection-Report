# Bundle Optimization Techniques - Part 1

## Tree Shaking

Tree shaking is a term commonly used in the JavaScript context for dead-code elimination. This section covers implementation patterns for effective tree shaking.

### Export/Import Patterns

```javascript
// Good - Named exports are better for tree shaking
export const util1 = () => { /* ... */ };
export const util2 = () => { /* ... */ };

// Less optimal - Default exports can be harder to tree shake
export default {
  util1: () => { /* ... */ },
  util2: () => { /* ... */ }
};
```

### Side Effect Free Modules

```javascript
// package.json
{
  "sideEffects": false  // Marks package as free of side effects
}

// Alternative: Specify files with side effects
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/some-file.js"
  ]
}
```

### Pure Function Annotations

```javascript
// Mark functions as pure for better optimization
/*#__PURE__*/ const createWidget = () => {
  return {
    type: 'widget',
    render: () => {}
  };
};

// Example with class
const MyComponent = /*#__PURE__*/ (() => {
  return class Component {
    render() { /* ... */ }
  };
})();
```

## Module Resolution Optimization

### Path Aliases

```javascript
// tsconfig.json or jsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@services/*": ["src/services/*"]
    }
  }
}

// Usage in code
import { Button } from '@components/Button';
import { formatDate } from '@utils/date';
```

### Module Bundler Configuration

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    // Specify extension resolution order
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    
    // Add aliases
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
};
```

## Dependency Optimization

### Package Size Analysis

```javascript
// package.json
{
  "scripts": {
    "analyze": "webpack-bundle-analyzer dist/stats.json",
    "build:stats": "webpack --json stats.json"
  }
}
```

### Alternative Package Selection

```javascript
// Before optimization
import moment from 'moment';

// After optimization - Using smaller alternative
import dayjs from 'dayjs';

// Or using native Date API when possible
const formatDate = (date) => new Intl.DateTimeFormat('en-US').format(date);
```

### Selective Imports

```javascript
// Bad - Imports entire library
import lodash from 'lodash';

// Good - Import only needed functions
import map from 'lodash/map';
import filter from 'lodash/filter';

// Better - Use native methods when possible
const mapped = array.map(item => item.value);
const filtered = array.filter(item => item.active);
```

## Build Configuration Patterns

### Environment-Specific Builds

```javascript
// webpack.config.js
module.exports = (env) => ({
  mode: env.production ? 'production' : 'development',
  optimization: {
    usedExports: true,
    minimize: env.production,
    concatenateModules: env.production,
    sideEffects: true
  }
});
```

### Module Concatenation

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    concatenateModules: true,  // Enable scope hoisting
    moduleIds: 'deterministic',
    chunkIds: 'deterministic'
  }
};
```

### Source Map Configuration

```javascript
// webpack.config.js
module.exports = (env) => ({
  devtool: env.production 
    ? 'source-map'
    : 'eval-cheap-module-source-map',
  
  optimization: {
    minimize: env.production,
    minimizer: [
      new TerserPlugin({
        sourceMap: true // Enable source maps in production
      })
    ]
  }
});
```

## Best Practices

1. **Module Organization**
   - Keep modules focused and small
   - Use named exports over default exports
   - Avoid side effects in modules

2. **Build Configuration**
   - Enable tree shaking in production builds
   - Configure proper source maps per environment
   - Use deterministic chunk and module IDs

3. **Dependency Management**
   - Regularly audit dependencies
   - Use smaller alternatives when possible
   - Implement selective imports

4. **Code Splitting**
   - Split code based on routes/features
   - Implement proper dynamic imports
   - Configure chunk optimization
