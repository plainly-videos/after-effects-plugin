const fs = require('node:fs');

const isDev = process.argv.includes('--dev');
const isTest = process.argv.includes('--test');
const manifestPath = './CSXS/manifest.xml';

fs.readFile(manifestPath, 'utf-8', (err, data) => {
  if (err) throw err;

  console.log('[updateManifest]: Updating manifest...');

  const updatedManifest = data
    .replace(
      /<MainPath>(.*?)<\/MainPath>/,
      isDev
        ? '<MainPath>./dist-dev/index.html</MainPath>'
        : isTest
          ? '<MainPath>./dist-test/index.html</MainPath>'
          : '<MainPath>./dist/index.html</MainPath>',
    )
    .replace(
      /<ScriptPath>(.*?)<\/ScriptPath>/,
      isDev
        ? '<ScriptPath>./dist-dev/jsx/core.jsx</ScriptPath>'
        : isTest
          ? '<ScriptPath>./dist-test/plainly.core.jsx</ScriptPath>'
          : '<ScriptPath>./dist/plainly.core.jsx</ScriptPath>',
    )
    .replace(
      /<Menu>(.*?)<\/Menu>/,
      isDev
        ? '<Menu>Plainly plugin - Dev mode</Menu>'
        : isTest
          ? '<Menu>Plainly plugin - Test mode</Menu>'
          : '<Menu>Plainly plugin</Menu>',
    );

  if (updatedManifest === data) {
    console.log('[updateManifest]: Manifest is already up-to-date.');
    return;
  }

  fs.writeFile(manifestPath, updatedManifest, 'utf-8', (err) => {
    if (err) throw err;
    console.log(
      `[updateManifest]: Manifest updated \x1b[1m\x1b[32msuccessfully\x1b[0m for ${isDev ? 'development' : isTest ? 'test' : 'production'} mode.`,
    );
  });
});
