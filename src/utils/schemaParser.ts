/**
 * Parses the schema file content to extract exported Zod object schema names.
 * @param schemaContent The content of the schema.ts file.
 * @returns An array of schema names.
 */
export function parseSchemaNames(schemaContent: string): string[] {
  const schemaNames: string[] = []
  // Regex to find lines like: export const schemaName = z.object({...})
  // It captures the 'schemaName'
  const regex = /^export\s+const\s+(\w+)\s*=\s*z\.object\(/gm
  let match: RegExpExecArray | null;

  while (true) {
    match = regex.exec(schemaContent);
    if (match === null) {
      break;
    }
    if (match[1]) {
      schemaNames.push(match[1])
    }
  }

  return schemaNames
}
