function selectFolder() {
	var folder = Folder.selectDialog('Select folder to collect project files:');
	if (folder) return new Folder(folder.fsName); // Return selected folder

	// NOTE: this always returns undefined as a string if no folder is selected
}

function collectFiles(targetPath) {
	var os = checkOs();
	var osPath = os == 'Windows' ? '\\' : '/';

	if (!app.project.file) return;

	var projectName = app.project.file.name.slice(0, -4);
	var projectDir = new Folder(targetPath + osPath + projectName);
	var footageDir = new Folder(projectDir.absoluteURI + osPath + '(Footage)');
	var fontDir = new Folder(projectDir.absoluteURI + osPath + '(Fonts)');
	projectDir.create();
	footageDir.create();
	fontDir.create();

	var comps = getAllComps(app.project);
	for (var i = 0; i < comps.length; i++) {
		var layers = getTextLayersByComp(comps[i]);
		for (var j = 0; j < layers.length; j++) {
			var fontName = layers[j].sourceText.value.font;
			var fontExtension = layers[j].sourceText.value.fontLocation
				.split(osPath)
				.pop();
			if (fontExtension == null) continue;

			fontExtension = fontExtension.split('.').pop();
			var fontLocation = layers[j].sourceText.value.fontLocation;
			var targetFont = new File(
				fontDir.absoluteURI + osPath + fontName + '.' + fontExtension,
			);
			if (!targetFont.exists) {
				var sourceFont = new File(fontLocation);
				if (sourceFont.exists) {
					sourceFont.copy(
						fontDir.absoluteURI + osPath + fontName + '.' + fontExtension,
					);
				}
			}
		}
	}

	for (i = 1; i <= app.project.numItems; i++) {
		var item = app.project.item(i);

		if (item instanceof FootageItem == false) continue;
		if (item.file == null) continue;
		if (item.footageMissing) continue;

		var targetDir = new Folder(
			footageDir.absoluteURI + osPath + item.parentFolder.name + osPath,
		);
		if (!targetDir.exists) targetDir.create();

		if (item.mainSource.isStill) {
			var targetFile = new File(
				targetDir.absoluteURI + osPath + item.file.name,
			);
			if (!targetFile.exists)
				item.file.copy(targetDir.absoluteURI + osPath + item.file.name);
		} else {
			var itemExtension = item.file.name
				.substring(item.file.name.lastIndexOf('.') + 1)
				.toLowerCase();
			if (
				'jpg' === itemExtension ||
				'jpeg' === itemExtension ||
				'png' === itemExtension ||
				'gif' === itemExtension ||
				'bmp' === itemExtension ||
				'svg' === itemExtension ||
				'webp' === itemExtension ||
				'ico' === itemExtension ||
				'tif' === itemExtension ||
				'tiff' === itemExtension ||
				'eps' === itemExtension ||
				'raw' === itemExtension ||
				'ai' === itemExtension ||
				'ps' === itemExtension ||
				'indd' === itemExtension ||
				'pdf' === itemExtension ||
				'xcf' === itemExtension ||
				'sketch' === itemExtension ||
				'xd' === itemExtension ||
				'cin' === itemExtension ||
				'dpx' === itemExtension ||
				'exr' === itemExtension ||
				'pxr' === itemExtension ||
				'rla' === itemExtension ||
				'hdr' === itemExtension ||
				'tga' === itemExtension
			) {
				var sourceFolder = item.file.parent;
				var frames = sourceFolder.getFiles();

				for (var f = 0; f < frames.length; f++) {
					var frame = frames[f];
					if (frame instanceof File) {
						frame.copy(targetDir.toString() + osPath + frame.name);
					}
				}
			} else {
				var targetFile = new File(
					targetDir.absoluteURI + osPath + item.file.name,
				);
				if (!targetFile.exists)
					item.file.copy(targetDir.absoluteURI + osPath + item.file.name);
			}
		}
	}

	app.project.save(
		new File(projectDir.absoluteURI + osPath + app.project.file.name),
	);
	return projectName;
}

function getAllComps(project) {
	var comps = [];

	for (var i = 1; i <= project.numItems; i++) {
		var item = project.item(i);
		if (item instanceof CompItem) {
			comps.push(item);
		}
	}

	return comps;
}

function getTextLayersByComp(comp) {
	var layers = [];

	for (var i = 1; i <= comp.numLayers; i++) {
		var layer = comp.layer(i);
		if (layer instanceof TextLayer) {
			layers.push(layer);
		}
	}

	return layers;
}

function checkOs() {
	var appOs = $.os.indexOf('Win') != -1 ? 'Windows' : 'Mac';
	return appOs;
}
