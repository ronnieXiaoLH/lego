module.exports = {
  devServer: {
    proxy: {
      '/imooc': {
        target: 'https://api.imooc-lego.com/api/utils/',
        changeOrigin: true,
        pathRewrite: {
          '^/imooc': '',
        },
      },
      '/api': {
        target: 'https://api.imooc-lego.com/api/',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
}
