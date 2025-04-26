#!/usr/bin/env node

import { Command } from 'commander'
import fsExtra from 'fs-extra' // Use fs-extra for directory handling
import * as path from 'path'
import { fileURLToPath } from 'url' // Needed for __dirname in NodeNext/ESM
import ora from 'ora' // Import ora
import { updateSchemaDerivedFile, generateApiFiles } from './utils/fileUpdater.js'
import { parseSchemaNames } from './utils/schemaParser.js'
import chokidar from 'chokidar' // Import chokidar

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to get version asynchronously
async function getCliVersion(): Promise<string> {
  try {
    const packageJsonPath = path.resolve(__dirname, '../package.json')
    const pkg = await fsExtra.readJson(packageJsonPath)
    return pkg.version || 'unknown'
  } catch (error) {
    console.warn('Warning: Could not read version from package.json')
    return 'unknown'
  }
}

// --- Helper Function for Generate Logic ---
async function runGenerateLogic(options: {
  schemaPath: string
  derivedPath: string
  outputDir: string
  trpcPath: string
  utilPath: string
}) {
  const schemaPath = path.resolve(process.cwd(), options.schemaPath)
  const derivedPath = path.resolve(process.cwd(), options.derivedPath)
  const outputDir = path.resolve(process.cwd(), options.outputDir)
  const trpcPath = path.resolve(process.cwd(), options.trpcPath)
  const utilPath = path.resolve(process.cwd(), options.utilPath)
  const templateBaseDir = path.resolve(__dirname, '../templates')

  const generateSpinner = ora('Starting code generation...').start()
  generateSpinner.info(`Schema file: ${path.relative(process.cwd(), schemaPath)}`)
  generateSpinner.info(`Derived file: ${path.relative(process.cwd(), derivedPath)}`)
  generateSpinner.info(`API output directory: ${path.relative(process.cwd(), outputDir)}`)
  generateSpinner.info(`tRPC helper path: ${path.relative(process.cwd(), trpcPath)}`)
  generateSpinner.info(`Util directory path: ${path.relative(process.cwd(), utilPath)}`)

  try {
    // 1. Parse Schema File
    generateSpinner.text = `Parsing schema file...`
    if (!(await fsExtra.pathExists(schemaPath))) {
      generateSpinner.fail(`Schema file not found at ${schemaPath}.`)
      return
    }
    const schemaContent = await fsExtra.readFile(schemaPath, 'utf-8')
    const schemaNames = parseSchemaNames(schemaContent)
    if (schemaNames.length === 0) {
      generateSpinner.warn('No Zod schemas found in schema file.')
      return
    }
    generateSpinner.succeed(`Parsed schemas: ${schemaNames.join(', ')}`)

    // 2. Update schemaDerived.ts
    generateSpinner.start(`Updating derived schema file...`) // Use start for next step
    if (!(await fsExtra.pathExists(derivedPath))) {
      generateSpinner.fail(`Derived schema file not found at ${derivedPath}.`)
      return
    }
    await updateSchemaDerivedFile(derivedPath, schemaPath, schemaNames)
    generateSpinner.succeed(`Updated ${path.basename(derivedPath)}`)

    // 3. Generate API Files
    generateSpinner.start(`Generating API files...`)
    const apiTemplateDir = path.join(templateBaseDir, 'generated')
    await generateApiFiles(outputDir, derivedPath, trpcPath, utilPath, apiTemplateDir, schemaNames)
    generateSpinner.succeed(`Generated API files for: ${schemaNames.join(', ')}`)

    generateSpinner.info('Code generation finished successfully!')
  } catch (error: any) {
    generateSpinner.fail('Error during code generation:')
    console.error(error.message || error)
    // Don't exit in watch mode, just log error
  }
}

const program = new Command()

// Initialize program description (version set in main)
program.description('A CLI tool for managing Mongoose models and APIs based on Zod schemas')

// --- init command ---
program
  .command('init')
  .description('Initialize project with default DB and utility files.')
  .option('-o, --output-dir <path>', 'Output directory for DB files', './src/server/db')
  .option('--util-output-dir <path>', 'Output directory for utility files', './src/server/api/util')
  .option('-f, --force', 'Overwrite existing files', false)
  .action(async (options) => {
    const dbOutputDir = path.resolve(process.cwd(), options.outputDir)
    const utilOutputDir = path.resolve(process.cwd(), options.utilOutputDir)
    const dbTemplateDir = path.resolve(__dirname, '../templates/db')
    const utilTemplateDir = path.resolve(__dirname, '../templates/util')
    const forceOverwrite = options.force

    const initSpinner = ora('Initializing project files...').start()
    initSpinner.text = `DB files in: ${dbOutputDir}`
    initSpinner.text = `Utility files in: ${utilOutputDir}`
    if (forceOverwrite) {
      initSpinner.text = '(--force specified, existing files will be overwritten)'
    }

    try {
      await fsExtra.ensureDir(dbOutputDir)
      await fsExtra.ensureDir(utilOutputDir)

      // --- Copy DB Files ---
      initSpinner.text = 'Copying DB templates...'
      const dbFilesToCopy = ['connection.ts', 'schema.ts', 'schemaDerived.ts']
      let dbFilesExist = false
      if (!forceOverwrite) {
        for (const file of dbFilesToCopy) {
          if (await fsExtra.pathExists(path.join(dbOutputDir, file))) {
            dbFilesExist = true
            initSpinner.warn(`    Warning: DB File ${file} already exists.`)
          }
        }
      }
      if (!dbFilesExist || forceOverwrite) {
        if (!(await fsExtra.pathExists(dbTemplateDir))) {
          initSpinner.fail(`❌ Error: DB Template directory not found at ${dbTemplateDir}.`)
          process.exit(1)
        }
        await fsExtra.copy(dbTemplateDir, dbOutputDir)
      } else {
        initSpinner.info('Skipping DB file copy (files exist and --force not used).')
      }

      // --- Copy Util Files ---
      initSpinner.text = 'Copying Utility templates...'
      const utilFilesToCopy = ['getMany.ts'] // Add other util files here
      let utilFilesExist = false
      if (!forceOverwrite) {
        for (const file of utilFilesToCopy) {
          if (await fsExtra.pathExists(path.join(utilOutputDir, file))) {
            utilFilesExist = true
            initSpinner.warn(`    Warning: Utility File ${file} already exists.`)
          }
        }
      }
      if (!utilFilesExist || forceOverwrite) {
        if (!(await fsExtra.pathExists(utilTemplateDir))) {
          initSpinner.fail(`❌ Error: Util Template directory not found at ${utilTemplateDir}.`)
          process.exit(1)
        }
        await fsExtra.copy(utilTemplateDir, utilOutputDir)
      } else {
        initSpinner.info('Skipping Utility file copy (files exist and --force not used).')
      }

      initSpinner.succeed('Initialization complete! Review copied files.')
    } catch (error: any) {
      initSpinner.fail('Error initializing project files:')
      console.error(error.message || error)
      process.exit(1)
    }
  })

// --- generate command (uses helper function) ---
program
  .command('generate')
  .description('Generate API files and update schemaDerived based on schema.ts.')
  .option('--schema-path <path>', 'Path to the Zod schema definition file', './src/server/db/schema.ts')
  .option('--derived-path <path>', 'Path to the derived schema and types file', './src/server/db/schemaDerived.ts')
  .option('-o, --output-dir <path>', 'Output directory for generated API files', './src/server/api/generated')
  .option('--trpc-path <path>', 'Path to the tRPC helper file (trpc.ts)', './src/server/api/trpc.ts')
  .option('--util-path <path>', 'Path to the directory containing getMany utility', './src/server/api/util')
  .action(async (options) => {
    // Directly call the extracted logic function
    await runGenerateLogic(options)
  })

// --- watch command ---
program
  .command('watch')
  .description('Watch the schema file for changes and automatically run generate.')
  // Re-use options from generate command for consistency
  .option('--schema-path <path>', 'Path to the Zod schema definition file', './src/server/db/schema.ts')
  .option('--derived-path <path>', 'Path to the derived schema and types file', './src/server/db/schemaDerived.ts')
  .option('-o, --output-dir <path>', 'Output directory for generated API files', './src/server/api/generated')
  .option('--trpc-path <path>', 'Path to the tRPC helper file (trpc.ts)', './src/server/api/trpc.ts')
  .option('--util-path <path>', 'Path to the directory containing getMany utility', './src/server/api/util')
  .action(async (options) => {
    const watchPath = path.resolve(process.cwd(), options.schemaPath)
    console.log(`👀 Watching for changes in: ${watchPath}`)

    // Run generate once immediately when watch starts
    console.log('🚀 Performing initial generation run...')
    await runGenerateLogic(options)
    console.log('Watcher started. Press Ctrl+C to exit.')

    const watcher = chokidar.watch(watchPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true, // Don't trigger on initial scan
      awaitWriteFinish: {
        // Helps prevent multiple triggers for one save
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    })

    watcher
      .on('add', async (filePath) => {
        // Handle file add (though watching specific file usually uses 'change')
        console.log(`➕ File ${path.basename(filePath)} has been added. Triggering generate...`)
        await runGenerateLogic(options)
      })
      .on('change', async (filePath) => {
        console.log(`🔄 File ${path.basename(filePath)} has been changed. Triggering generate...`)
        await runGenerateLogic(options)
      })
      .on('error', (error) => console.error(`❌ Watcher error: ${error}`))
      .on('ready', () => console.log('Watcher ready.'))
  })

async function main() {
  // Set version asynchronously before parsing
  program.version(await getCliVersion())

  program.parse(process.argv)

  // Handle case where no command is provided
  const commandNames = program.commands.map((cmd) => cmd.name())
  const providedCommand = process.argv[2] // Get the first argument after node and script name
  if (!providedCommand || !commandNames.includes(providedCommand)) {
    // Check if any known command was attempted but failed parsing (e.g., wrong options)
    // Commander might handle this implicitly, but explicit check is safer
    if (!program.args.length && process.argv.slice(2).length > 0 && !providedCommand?.startsWith('-')) {
      // Likely an unknown command was entered
      // Commander might show an error, or we can add one here
    } else if (!program.args.length && process.argv.slice(2).length === 0) {
      // No command provided at all
      program.outputHelp()
    }
    // If a known command was provided but has args (likely options), commander handles help/errors
  }
}

main().catch((err) => {
  console.error('CLI Error:', err)
  process.exit(1)
})
