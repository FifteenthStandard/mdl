const { JSDOM, VirtualConsole } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const { NodeHtmlMarkdown } = require('node-html-markdown');
const { writeFile } = require('fs').promises;

async function main(url, filename) {
  const resp = await fetch(url);
  const text = await resp.text();

  const virtualConsole = new VirtualConsole();
  const doc = new JSDOM(text, { virtualConsole });

  const reader = new Readability(doc.window.document);
  const article = reader.parse();

  const headerMarkdown = `# [${article.title}](${url})\n\n`;
  const bylineMarkdown = article.byline ? `${article.byline}\n\n` : '';
  const contentMarkdown = NodeHtmlMarkdown.translate(article.content);

  const markdown = headerMarkdown + bylineMarkdown + contentMarkdown;

  if (filename) {
    await writeFile(filename, markdown);
  } else {
    console.log(markdown);
  }
};

if (process.argv.length < 3) {
  console.error('Usage: mdl <url> [<filename>]');
  return;
}

const url = process.argv[2];
const filename = process.argv[3];
main(url, filename);