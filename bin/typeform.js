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
  .option('-f, --form [form id]', 'Form ID')
  .option('--export-format <format>', 'Export file format', '{date}-typeform.json')
  .option('--export-path [path]', 'Export file path')
  .action(dump)

program.parseAsync(process.argv)

async function dump({
  form,
  token,
  clientId,
  exportPath,
  exportFormat,
}) {
  let formResponses

  const filledExportFormat = exportFormat
    .replace('{date}', dayjs().format('YYYY-MM-DD'))

  const EXPORT_PATH = resolve(exportPath, filledExportFormat)

  try {
    const response = await fetch(`https://api.typeform.com/forms/${form}/responses`, {
        method: `GET`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

    formResponses = await response.json()
  } catch (e) {
    return onfatal(e)
  }

  const dump = JSON.stringify(formResponses)

  await promisify(fs.writeFile)(EXPORT_PATH, dump)
}
