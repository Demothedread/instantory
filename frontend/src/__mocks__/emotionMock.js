module.exports = {
  css: () => 'emotion-css-mock',
  jsx: (type, props, ...children) => {
    return { type, props, children };
  }
};
