# Code Splitting Patterns - Part 2

## Library Splitting Patterns

Library splitting is an advanced optimization technique that helps reduce initial bundle size by splitting third-party libraries and dependencies into separate chunks.

### Basic Library Splitting

```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

### Granular Library Splitting

```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // UI library bundle
        ui: {
          test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
          name: 'ui-libs',
          chunks: 'all',
          priority: 10,
        },
        // Data management libraries
        data: {
          test: /[\\/]node_modules[\\/](axios|swr|react-query)[\\/]/,
          name: 'data-libs',
          chunks: 'all',
          priority: 9,
        },
        // Other vendors
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 8,
        },
      },
    },
  },
};
```

### Dynamic Library Loading

```jsx
// Dynamically import heavy libraries only when needed
const ChartComponent = React.lazy(async () => {
  // Load Chart.js library dynamically
  await import('chart.js');
  return import('./components/Chart');
});

function Dashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ChartComponent />
    </Suspense>
  );
}
```

### Library Preloading Strategies

```jsx
// Preload libraries based on user interaction or route
const preloadChartLibrary = () => {
  const chartPromise = import('chart.js');
  const componentPromise = import('./components/Chart');
  return Promise.all([chartPromise, componentPromise]);
};

function DashboardLink() {
  return (
    <Link 
      to="/dashboard"
      onMouseEnter={preloadChartLibrary}
      onFocus={preloadChartLibrary}
    >
      Dashboard
    </Link>
  );
}
```

### Best Practices

1. **Analyze Bundle Sizes**
```bash
# Install webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer

# Add to webpack config
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}
```

2. **Implement Version-Based Caching**
```js
module.exports = {
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
  },
}
```

3. **Monitor Performance Impact**
```jsx
// Measure and log chunk loading times
const ComponentWithMetrics = React.lazy(() => {
  const start = performance.now();
  return import('./HeavyComponent').then(module => {
    const end = performance.now();
    console.log(`Chunk loaded in ${end - start}ms`);
    return module;
  });
});
```

### Common Pitfalls and Solutions

1. **Duplicate Dependencies**
```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000,
      cacheGroups: {
        default: false,
        vendors: false,
      },
    },
  },
};
```

2. **Large Common Chunks**
```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        common: {
          name: 'common',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
```

3. **Handling Legacy Browsers**
```html
<!-- Add module/nomodule support -->
<script type="module" src="/dist/modern.js"></script>
<script nomodule src="/dist/legacy.js"></script>
