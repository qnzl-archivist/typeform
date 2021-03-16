#!/usr/bin/node env

const { promisify } = require('util')
const { resolve } = require('path')
const { Command } = require('commander')
const Trello = require('trello')
const fetch = require('node-fetch')
const dayjs = require('dayjs')
const fs = require('fs')

const program = new Command()

process.on('unhandledRejection', onfatal)
process.on('uncaughtException', onfatal)

function onfatal(err) {
  console.log('fatal:', err.message)
  exit(1)
}

function exit(code) {
  process.nextTick(process.exit, code)
}

program
  .command('dump')
  .description('Dump to file')
  .option('-t, --token [token]', 'Auth token')
  .option('--export-format <format>', 'Export file format', '{date}-typeform.json')
  .option('--export-path [path]', 'Export file path')
  .action(dump)

program.parseAsync(process.argv)

async function dump({
  token,
  clientId,
  exportPath,
  exportFormat,
}) {
  try {
    const filledExportFormat = exportFormat
      .replace('{date}', dayjs().format('YYYY-MM-DD'))

    const EXPORT_PATH = resolve(exportPath, filledExportFormat)

    const formResponse = await fetch(`https://api.typeform.com/forms`, {
        method: `GET`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

    const { items: forms } = await formResponse.json()

    const indivFormPromises = forms.map(async ({ id }) => {
      const indivFormResponse = await fetch(`https://api.typeform.com/forms/${id}`, {
          method: `GET`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

      return indivFormResponse.json()
    })

    const individualForms = await Promise.all(indivFormPromises)

    const formResponsePromises = forms.map(async ({ id }) => {
      const response = await fetch(`https://api.typeform.com/forms/${id}/responses`, {
          method: `GET`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

      return response.json()
    })

    const { items: formResponses } = await Promise.all(formResponsePromises)

    const dump = JSON.stringify({
      formResponses,
      forms: individualForms,
    })

    await promisify(fs.writeFile)(EXPORT_PATH, dump)
  } catch (e) {
    return onfatal(e)
  }
}
