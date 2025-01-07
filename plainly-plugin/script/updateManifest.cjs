const fs = require('node:fs');

const isDev = process.argv.includes('--dev');

const manifestPath = './../CSXS/manifest.xml';

// if it is package, first copy the CSXS folder to the package folder
// if (isPackage) {
//   console.log(
//     '[updateManifest]: Copying CSXS/manifest.xml to package directory...',
//   );
//   if (!fs.existsSync('./../package/CSXS')) {
//     fs.mkdirSync('./../package/CSXS', { force: true, recursive: true });
//   }
//   fs.copyFileSync('./../CSXS/manifest.xml', './../package/CSXS/manifest.xml');
// }

fs.readFile(manifestPath, 'utf-8', (err, data) => {
  if (err) throw err;

  console.log('[updateManifest]: Updating manifest...');

  const updatedManifest = data
    .replace(
      /<MainPath>(.*?)<\/MainPath>/,
      isDev
        ? '<MainPath>./plainly-plugin/dist-dev/index.html</MainPath>'
        : '<MainPath>./plainly-plugin/dist/index.html</MainPath>',
    )
    .replace(
      /<Menu>(.*?)<\/Menu>/,
      isDev
        ? '<Menu>Plainly Videos - Dev mode</Menu>'
        : '<Menu>Plainly Videos</Menu>',
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