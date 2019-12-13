const fetch = require(`node-fetch`)
const auth = require(`@qnzl/auth`)

const { CLAIMS } = auth

const typeformToken = process.env.TYPEFORM_TOKEN

module.exports = async (req, res) => {
  const {
    authorization
  } = req.headers

  const isTokenValid = auth.checkJWT(authorization, CLAIMS.typeform.dump, `watchers`, process.env.ISSUER)

  if (!isTokenValid) {
    return res.status(401).send()
  }

  let formResponses
  try {
    console.log(`getting responses`)
    const response = await fetch(`https://api.typeform.com/forms/${req.query.formId}/responses`, {
        method: `GET`,
        headers: {
          'Authorization': `Bearer ${typeformToken}`
        }
      })

    formResponses = await response.json()
  } catch (e) {
    console.log(`failed to get form responses`, e)
    return res.status(500).send()
  }

  return res.json(formResponses)

}
