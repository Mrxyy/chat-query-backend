export function extractCodeBlocks(markdownText, lang = null) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeBlocks = [];

  let match;
  while ((match = codeBlockRegex.exec(markdownText)) !== null) {
    if (lang === null || match[1] === lang) {
      codeBlocks.push(match[2]);
    }
  }

  return codeBlocks;
}
