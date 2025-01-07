const fs = require('node:fs');

copyManifest();
copyDistDirectory('./plainly-plugin/dist', 'plainly-plugin/dist');
copyDistDirectory('./plainly-aescripts/dist', 'plainly-aescripts/dist');

function copyManifest() {
  console.log(
    '[preparePackage]: Copying CSXS/manifest.xml to package directory...',
  );
  if (!fs.existsSync('./package/CSXS')) {
    fs.mkdirSync('./package/CSXS', { force: true, recursive: true });
  }
  fs.copyFileSync('./CSXS/manifest.xml', './package/CSXS/manifest.xml');

  console.log(
    '[preparePackage]: \x1b[1m\x1b[32mSuccessfully\x1b[0m copied CSXS/manifest.xml to package directory.',
  );
}

function copyDistDirectory(src, dest) {
  console.log(`[preparePackage]: Copying ${src} to package directory...`);
  fs.cpSync(src, `./package/${dest}`, {
    force: true,
    recursive: true,
  });

  console.log(
    `[preparePackage]: \x1b[1m\x1b[32mSuccessfully\x1b[0m copied ${src} to package directory.`,
  );
}
