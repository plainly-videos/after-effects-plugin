const fs = require('node:fs');

const isDev = process.argv.includes('--dev');
const isPackage = process.argv.includes('--package');

const manifestPath = isPackage
  ? './package/CSXS/manifest.xml'
  : './CSXS/manifest.xml';

// if it is package, first copy the CSXS folder to the package folder
if (isPackage) {
  console.log(
    '[updateManifest]: Copying CSXS/manifest.xml to package directory...',
  );
  if (!fs.existsSync('./package/CSXS')) fs.mkdirSync('./package/CSXS');
  fs.copyFileSync('./CSXS/manifest.xml', './package/CSXS/manifest.xml');
}

fs.readFile(manifestPath, 'utf-8', (err, data) => {
  if (err) throw err;

  console.log('[updateManifest]: Updating manifest...');

  const updatedManifest = data
    .replace(
      /<MainPath>(.*?)<\/MainPath>/,
      isDev
        ? '<MainPath>./dist-dev/index.html</MainPath>'
        : '<MainPath>./dist/index.html</MainPath>',
    )
    .replace(
      /<ScriptPath>(.*?)<\/ScriptPath>/,
      isDev
        ? '<ScriptPath>./dist-dev/jsx/core.jsx</ScriptPath>'
        : '<ScriptPath>./dist/plainly.core.jsx</ScriptPath>',
    )
    .replace(
      /<Menu>(.*?)<\/Menu>/,
      isDev
        ? '<Menu>Plainly plugin - Dev mode</Menu>'
        : '<Menu>Plainly plugin</Menu>',
    );

  if (updatedManifest === data) {
    console.log('[updateManifest]: Manifest is already up-to-date.');
    return;
  }

  fs.writeFile(manifestPath, updatedManifest, 'utf-8', (err) => {
    if (err) throw err;
    console.log(
      `[updateManifest]: Manifest updated \x1b[1m\x1b[32msuccessfully\x1b[0m for ${isDev ? 'development' : 'production'} mode.`,
    );
  });
});
