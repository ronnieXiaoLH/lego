// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsonServer = require('json-server')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

const SECRET_KEY = '123456789'
const expiresIn = '1h'

function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn })
}
function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY)
}

// 接口路径加前缀 /api
const rewriter = jsonServer.rewriter({
  '/api/*': '/$1',
})

server.use(bodyParser.json())
server.use(rewriter)
server.use(middlewares)

// 自定义路由
server.post('/users/loginByPhoneNumber', (req, res) => {
  const { phoneNumber, vericode } = req.body
  const accessToken = createToken({ phoneNumber, vericode })
  res.status(200).json({ data: { token: accessToken } })
})

server.use('/works', (req, res, next) => {
  const errorResp = {
    errno: 12001,
    message: '登录校验失败',
  }
  const authHeader = req.headers.authorization
  if (authHeader === undefined) {
    return res.json(errorResp)
  }
  try {
    // authHeader 的格式是 `Bearer ${token}`
    verifyToken(authHeader.split(' ')[1])
    next()
  } catch (error) {
    res.json(errorResp)
  }
})

router.render = (req, res) => {
  // 包装接口返回的数据格式
  res.jsonp({
    errno: 0,
    data: {
      list: res.locals.data,
      count: res.locals.data.length,
    },
  })
}
server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running')
})
