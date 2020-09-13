const auth = require(`@qnzl/auth`)

const { CLAIMS } = auth

module.exports = (claim) => (req, res, next) => {
  const {
    authorization
  } = req.headers

  const isTokenValid = auth.checkJWT(authorization, claim, `watchers`, process.env.ISSUER)

  if (!isTokenValid) {
    return res.status(401).send()
  }

  return next(req, res)
}
