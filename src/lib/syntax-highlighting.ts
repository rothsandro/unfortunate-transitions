export async function applySyntaxHighlighting(input: string) {
  const { codeToHtml } = await import('shiki');

  return await codeToHtml(cleanCode(input), {
    lang: 'typescript',
    theme: 'dark-plus',
    colorReplacements: {
      '#1e1e1e': 'transparent',
    },
  });
}

function cleanCode(input: string): string {
  return (
    input
      // Remove imports (everything before the first empty line)
      .replace(/^.+?\n\s*\n/s, '')

      // Remove one line "type X = ..." declarations
      .replace(/^type .+?=\s.+?;\n/gm, '')

      .replace('export const ', 'const ')

      // Replace log messages `log('Foo "Bar"')` and `log("Foo's Bar")` with log('...')
      .replace(/ log\((['"`])(?:\\\1|.)*?\1\)/g, " log('...')")
  );
}
