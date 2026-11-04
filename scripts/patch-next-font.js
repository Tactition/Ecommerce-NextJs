const fs = require('fs');
const path = require('path');

const loaderPath = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'compiled', '@next', 'font', 'dist', 'google', 'loader.js');

if (fs.existsSync(loaderPath)) {
  let content = fs.readFileSync(loaderPath, 'utf8');
  const target = "const ext = /\\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)[1];";
  const replacement = "const match = /\\.(woff|woff2|eot|ttf|otf)/.exec(googleFontFileUrl); const ext = match ? match[1] : 'woff2';";

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(loaderPath, content, 'utf8');
    console.log('[patch-next-font] Successfully patched next/font Google loader regex.');
  }
}

