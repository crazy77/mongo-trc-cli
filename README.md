# Mongo TRC CLI

**Mongo**ose + **T**ypeScript + **R**eact + Zod **C**LI

## 🤔 Purpose & Role

This CLI tool aims to streamline the development of type-safe APIs by automating boilerplate code generation when using **Mongoose**, **Zod**, **tRPC**, and specifically the **`@zodyac/zod-mongoose`** library together. It acts as a bridge, making it easier and faster to work with this specific tech stack.

**Key Goals:**

- **Leverage `@zodyac/zod-mongoose`:** Simplifies the process of using Zod schemas defined in `schema.ts` (which should utilize `@zodyac/zod-mongoose` helpers like `zId`, `zUUID`) to generate Mongoose-compatible derived types, validation schemas, and collection instances in `schemaDerived.ts`.
- **Automate tRPC Routers:** Generates basic tRPC router files for each schema found, providing standard CRUD endpoints that utilize the generated types and schemas.
- **Reduce Boilerplate:** Automatically generates database connection setup (`connection.ts`) and common utility functions (like `getMany.ts`).
- **Ensure Consistency & Type Safety:** Maintains a consistent project structure and leverages Zod as the single source of truth to minimize type errors between the database, backend logic, and potentially the frontend.
- **Accelerate Development:** Quickly scaffold new data models and their API endpoints by simply defining the Zod schema using `@zodyac/zod-mongoose` conventions.

In essence, you define your data structure once in `schema.ts` (using Zod and `@zodyac/zod-mongoose`), and this tool handles the repetitive setup and code generation needed for seamless integration between Mongoose, tRPC, and your Zod definitions.

## 💾 Default File Structure (after `init`)

The `init` command, using default paths, will create the following structure in your project:

```plaintext
src/
└── server/
    ├── api/
    │   └── generated/       # Generated API routes (by 'generate' command)
    │       ├── user.ts        # Example generated tRPC router
    │       ├── post.ts        # Example generated tRPC router
    │       └── index.ts       # Exports all generated routers
    └── db/
        ├── connection.ts      # Mongoose connection setup (by 'init')
        ├── schema.ts          # Zod schema definitions (Edit this file!)
        ├── schemaDerived.ts   # Generated types, schemas, collections (Updated by 'generate')
        └── util.ts            # Default utility function(s) (by 'init')
```

- Files marked with `(by 'init')` are created/copied by the `init` command.
- Files/directories marked with `(by 'generate' command)` or `(Updated by 'generate')` are created/updated by the `generate` command.

## Installation

```bash
# Install globally
npm install -g .

# Or use with npx
npx mongo-trc <command>
```

## Usage

### `init`

Initializes a new project or adds the necessary DB and utility files to an existing project.

```bash
mongo-trc init [options]
```

**Options:**

- `-o, --output-dir <path>`: Directory for **DB files** (`connection.ts`, `schema.ts`, `schemaDerived.ts`, `util.ts`). (Default: `./src/server/db`)
- `-f, --force`: Overwrite existing files. (Default: `false`)

### `generate`

Generates tRPC API route files and updates the `schemaDerived.ts` file.

```bash
mongo-trc generate [options]
```

**Options:**

- `--schema-path <path>`: Path to the Zod **schema definition file** (`schema.ts`). (Default: `./src/server/db/schema.ts`)
- `--derived-path <path>`: Path to the **derived schema file** (`schemaDerived.ts`). (Default: `./src/server/db/schemaDerived.ts`)
- `-o, --output-dir <path>`: Output directory for the **generated API route files**. (Default: `./src/server/api/generated`)
- `--trpc-path <path>`: Path to your **tRPC helper file** (`trpc.ts`). (Default: `./src/server/api/trpc.ts`)

### `watch`

Watches the schema file for changes and automatically runs `generate`.

```bash
mongo-trc watch [options]
```

**Options:**

- Uses the same options as the `generate` command (`--schema-path`, `--derived-path`, `-o`, `--trpc-path`).

Press `Ctrl+C` to stop the watcher.

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev <command>

# Build the CLI
npm run build
```

## License

ISC (Modify as needed)
