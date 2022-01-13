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
    },
  },
}
