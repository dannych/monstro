const merge = require('deepmerge');

module.exports = (neutrino) => {
  const { config } = neutrino;

  config.module
    .rule('compile')
    .test(/\.js?$/)
    .loader('babel', ({ options }) => ({
      options: merge(options, {
        plugins: [require.resolve('babel-plugin-transform-object-rest-spread')],
      }),
    }));
};
