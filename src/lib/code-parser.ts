export interface CodeBlock {
  name: string;
  html: string;
}

export async function parseCode(input: string) {
  const cleaned = cleanCode(input);
  const actorNamePattern = /^const (\w+) = /;

  const codeBlocks = cleaned
    .split(/\n\s*\n(?=const \w+ =)/)
    .filter((block) => block.trim().length > 0)
    .map(async (block): Promise<CodeBlock> => {
      const actorNameMatch = block.match(actorNamePattern);
      if (!actorNameMatch) throw new Error('Unexpected code block');

      const name = actorNameMatch[1];
      const html = await applySyntaxHighlighting(block);

      return { name, html };
    });

  return Promise.all(codeBlocks);
}

async function applySyntaxHighlighting(input: string) {
  const { codeToHtml } = await import('shiki');

  return await codeToHtml(input, {
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
