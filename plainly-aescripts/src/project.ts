const propNameId = 'xmp:PlainlyProjectId';
const propNameRevisionCount = 'xmp:PlainlyProjectRevisionCount';

function setProjectData(id: string, revisionCount: number) {
  const project = app.project;

  if (ExternalObject.AdobeXMPScript === undefined) {
    // load the XMPlibrary as an ExtendScript ExternalObject
    ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
  }

  if (!XMPMeta) {
    return 'Error: XMPMeta is not available';
  }

  const mdata = new XMPMeta(project.xmpPacket); //get the project's XMPmetadata
  // update the Label project metadata's value
  const schemaNS = XMPMeta.getNamespaceURI('xmp');
  try {
    mdata.setProperty(schemaNS, propNameId, id);
    mdata.setProperty(
      schemaNS,
      propNameRevisionCount,
      revisionCount.toString(),
    );
    project.xmpPacket = mdata.serialize();
  } catch (e) {
    return `Error: ${e}`;
  }

  project.save();
}

interface ProjectData {
  documentId: string;
  id: string;
  revisionCount: number;
}

function getProjectData() {
  const project = app.project;

  if (ExternalObject.AdobeXMPScript === undefined) {
    // load the XMPlibrary as an ExtendScript ExternalObject
    ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
  }

  if (!XMPMeta) {
    throw new Error('XMPMeta is not available');
  }

  const mdata = new XMPMeta(project.xmpPacket); //get the project's XMPmetadata
  const schemaNS = XMPMeta.getNamespaceURI('xmp');
  const schemaNSMM = XMPMeta.getNamespaceURI('xmpMM');

  const projectData: ProjectData = {
    documentId: String(mdata.getProperty(schemaNSMM, 'DocumentID')),
    id: String(mdata.getProperty(schemaNS, propNameId)),
    revisionCount: Number(mdata.getProperty(schemaNS, propNameRevisionCount)),
  };

  return JSON.stringify(projectData);
}

function removeProjectData() {
  const project = app.project;

  if (ExternalObject.AdobeXMPScript === undefined) {
    // load the XMPlibrary as an ExtendScript ExternalObject
    ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
  }

  if (!XMPMeta) {
    throw new Error('XMPMeta is not available');
  }

  const mdata = new XMPMeta(project.xmpPacket); // get the project's XMPmetadata
  const schemaNS = XMPMeta.getNamespaceURI('xmp');

  mdata.deleteProperty(schemaNS, propNameId);
  mdata.deleteProperty(schemaNS, propNameRevisionCount);

  project.xmpPacket = mdata.serialize();

  project.save();
}

function getProjectPath() {
  return app.project.file?.absoluteURI;
}

function saveProject() {
  app.project.save();
}
