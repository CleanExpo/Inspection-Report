# Bundle Optimization Techniques - Part 2

## Dynamic Imports

### Route-Based Code Splitting

```javascript
// Next.js Dynamic Import
import dynamic from 'next/dynamic';

const DashboardComponent = dynamic(() => 
  import('../components/Dashboard'), {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

// React Router with React.lazy
import { Suspense, lazy } from 'react';

const UserProfile = lazy(() => 
  import('./components/UserProfile')
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Suspense>
  );
}
```

### Component-Level Code Splitting

```javascript
// Conditional Import Based on User Interaction
function ModalContainer() {
  const [ModalComponent, setModalComponent] = useState(null);

  const openModal = async () => {
    const { Modal } = await import('./Modal');
    setModalComponent(() => Modal);
  };

  return (
    <div>
      <button onClick={openModal}>Open Modal</button>
      {ModalComponent && <ModalComponent />}
    </div>
  );
}

// Feature Flag Based Import
const FeatureComponent = ({ isEnabled }) => {
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    if (isEnabled) {
      import('./NewFeature')
        .then(module => setComponent(() => module.default))
        .catch(error => console.error('Feature load error:', error));
    }
  }, [isEnabled]);

  return Component ? <Component /> : null;
};
```

## Advanced Chunk Optimization

### Chunk Splitting Configuration

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

### Preload and Prefetch Configuration

```javascript
// webpack.config.js
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');

module.exports = {
  plugins: [
    new PreloadWebpackPlugin({
      rel: 'preload',
      include: 'initial',
      fileBlacklist: [/\.map$/, /hot-update\.js$/]
    }),
    new PreloadWebpackPlugin({
      rel: 'prefetch',
      include: 'asyncChunks'
    })
  ]
};

// Usage in HTML
<link 
  rel="prefetch" 
  href="./chunks/feature.chunk.js" 
  as="script"
>
```

## Module Federation

### Host Application Configuration

```javascript
// webpack.config.js (host)
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      filename: 'remoteEntry.js',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
        app2: 'app2@http://localhost:3002/remoteEntry.js'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};
```

### Remote Application Configuration

```javascript
// webpack.config.js (remote)
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button',
        './Card': './src/components/Card'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};
```

## Performance Monitoring

### Bundle Size Monitoring

```javascript
// package.json
{
  "scripts": {
    "build:analyze": "ANALYZE=true next build",
    "size": "bundlesize",
    "postbuild": "webpack-bundle-analyzer build/bundle-stats.json"
  },
  "bundlesize": [
    {
      "path": "./dist/main.*.js",
      "maxSize": "100 kB"
    },
    {
      "path": "./dist/chunks/*.js",
      "maxSize": "50 kB"
    }
  ]
}
```

### Runtime Performance Tracking

```javascript
// performance.js
export const trackChunkLoading = () => {
  if (performance && performance.getEntriesByType) {
    const resources = performance.getEntriesByType('resource');
    const chunks = resources.filter(r => 
      r.name.includes('chunk')
    );
    
    chunks.forEach(chunk => {
      console.log(`Chunk ${chunk.name}:`, {
        downloadTime: chunk.duration,
        size: chunk.transferSize
      });
    });
  }
};

// Usage with React
useEffect(() => {
  trackChunkLoading();
}, []);
```

## Advanced Optimization Techniques

### Critical CSS Extraction

```javascript
// webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CriticalCssPlugin = require('critical-css-webpack-plugin');

module.exports = {
  plugins: [
    new MiniCssExtractPlugin(),
    new CriticalCssPlugin({
      base: 'dist/',
      src: 'index.html',
      target: 'index.html',
      inline: true,
      extract: true,
      width: 375,
      height: 565
    })
  ]
};
```

### Compression Optimization

```javascript
// webpack.config.js
const CompressionPlugin = require('compression-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');

module.exports = {
  plugins: [
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new BrotliPlugin({
      asset: '[path].br[query]',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
};
```

## Best Practices

1. **Dynamic Import Strategy**
   - Use meaningful chunk names
   - Implement proper loading states
   - Handle import errors gracefully

2. **Module Federation**
   - Share common dependencies
   - Version control shared modules
   - Implement fallback strategies

3. **Performance Monitoring**
   - Set size budgets
   - Track loading metrics
   - Monitor chunk download times

4. **Optimization Tools**
   - Use compression
   - Implement critical CSS
   - Configure proper caching
