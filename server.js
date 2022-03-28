const Koa = require('koa')
const Router = require('koa-router')
const statics = require('koa-static')
const koaBody = require('koa-body')

const port = 36231
const app = new Koa
const router = new Router

app.use(koaBody())
app.use(statics('docs'))

router.get('/ping', function (ctx) {
  return ctx.body = 'pong'
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(port, function () {
  console.log(`http://localhost:${port}/`)
})
