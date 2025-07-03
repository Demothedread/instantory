module.exports = {
  presets: [
    // ...other presets if needed...
    '@babel/preset-react', // ensures React JSX support
    '@emotion/babel-preset-css-prop' // enables Emotion's css prop and pragma
  ],
  plugins: [
    // ...other plugins if needed...
    ['@babel/plugin-proposal-decorators', { legacy: true }]
  ]
};
