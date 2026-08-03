const nodeExternals = require('webpack-node-externals');

module.exports = function (options, webpack) {
  // Override externals to allow bundling workspace packages (@aeos/*)
  // This prevents Webpack from treating our monorepo packages as external runtime dependencies
  options.externals = [
    nodeExternals({
      allowlist: [/^@aeos\//],
    }),
  ];
  return options;
};
