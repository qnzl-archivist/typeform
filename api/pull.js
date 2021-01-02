const authCheck = require(`./_lib/auth`)
const fetch = require(`node-fetch`)
const auth = require(`@qnzl/auth`)

const { CLAIMS } = auth

const typeformToken = process.env.TYPEFORM_TOKEN

const handler = async (req, res) => {

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

module.exports = (req, res) => {
  return authCheck(CLAIMS.typeform.dump)(req, res, handler)
}
