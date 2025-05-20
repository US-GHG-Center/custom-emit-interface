// custom-emit-interface-example/craco.config.js
const path = require('path');
const { loaderByName } = require('@craco/craco');

module.exports = {
  webpack: {
    alias: {
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      // Add this alias for react-router-dom
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom')
    },
    configure: (webpackConfig, { env, paths }) => {
      // 1. Remove ModuleScopePlugin
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
      );
      if (scopePluginIndex !== -1) {
        webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
        console.log("Craco: ModuleScopePlugin removed.");
      } else {
        console.warn("Craco: ModuleScopePlugin not found, could not remove.");
      }

      // 2. Configure Babel to transpile your linked library's source code
      const linkedLibPath = path.resolve(__dirname, 'node_modules/test01-emit/src'); // Adjust if needed
      const mainRule = webpackConfig.module.rules.find(rule => Array.isArray(rule.oneOf));
      if (mainRule) {
        const babelLoaderRule = mainRule.oneOf.find(loaderByName('babel-loader'));
        if (babelLoaderRule) {
          if (Array.isArray(babelLoaderRule.include)) {
            if (!babelLoaderRule.include.includes(linkedLibPath)) {
              babelLoaderRule.include.push(linkedLibPath);
            }
          } else {
            babelLoaderRule.include = [babelLoaderRule.include, linkedLibPath];
          }
          console.log("Craco: Babel loader configured for linked library:", linkedLibPath);
        } else {
          console.warn("Craco: babel-loader not found within 'oneOf' rules.");
        }
      } else {
        console.warn("Craco: Main 'oneOf' rule not found for babel-loader configuration.");
      }

      return webpackConfig;
    }
  },
  jest: {
    configure: (jestConfig, { env, paths, resolve, rootDir }) => {
      jestConfig.moduleNameMapper = {
        ...jestConfig.moduleNameMapper,
        '^react$': path.resolve(__dirname, 'node_modules/react/index.js'),
        '^react-dom$': path.resolve(__dirname, 'node_modules/react-dom/index.js'),
        // Add this alias for Jest as well
        '^react-router-dom$': path.resolve(__dirname, 'node_modules/react-router-dom/index.js')
      };
      // Adjust transformIgnorePatterns if needed for Jest to transpile react-router-dom or your linked lib
      // jestConfig.transformIgnorePatterns = [
      //   '/node_modules/(?!test01-emit|react-router|other-es6-module/).+\\.(js|jsx|mjs|cjs|ts|tsx)$',
      //   '^.+\\.module\\.(css|sass|scss)$',
      // ];
      return jestConfig;
    },
  },
};