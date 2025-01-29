const propNameId = 'xmp:PlainlyProjectId';
const propNameRevision = 'xmp:PlainlyProjectRevision';
const propNameName = 'xmp:PlainlyProjectName';

function setProjectData(id: string, revision: string, name: string) {
  const project = app.project;
  project.save();

  if (ExternalObject.AdobeXMPScript === undefined) {
    // load the XMPlibrary as an ExtendScript ExternalObject
    ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
  }

  const mdata = new XMPMeta!(project.xmpPacket); //get the project's XMPmetadata
  // update the Label project metadata's value
  const schemaNS = XMPMeta!.getNamespaceURI('xmp');
  try {
    mdata.setProperty(schemaNS, propNameId, id);
    mdata.setProperty(schemaNS, propNameRevision, revision);
    mdata.setProperty(schemaNS, propNameName, name);
    project.xmpPacket = mdata.serialize();
  } catch (e) {
    return `Error: ${e}`;
  } finally {
    project.save();
  }
}

function getProjectData() {
  const project = app.project;

  if (ExternalObject.AdobeXMPScript === undefined) {
    // load the XMPlibrary as an ExtendScript ExternalObject
    ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
  }

  const mdata = new XMPMeta!(project.xmpPacket); //get the project's XMPmetadata
  const schemaNS = XMPMeta!.getNamespaceURI('xmp');

  const projectData = {
    id: String(mdata.getProperty(schemaNS, propNameId)),
    revision: String(mdata.getProperty(schemaNS, propNameRevision)),
    name: String(mdata.getProperty(schemaNS, propNameName)),
  };

  if (projectData.id === 'undefined') {
    return undefined;
  }

  return JSON.stringify(projectData);
}

// removes project data, not used, left for testing purposes and for future use if needed
function removeProjectData() {
  const project = app.project;
  project.save();

  if (ExternalObject.AdobeXMPScript === undefined) {
    // load the XMPlibrary as an ExtendScript ExternalObject
    ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
  }

  const mdata = new XMPMeta!(project.xmpPacket); //get the project's XMPmetadata
  const schemaNS = XMPMeta!.getNamespaceURI('xmp');

  mdata.deleteProperty(schemaNS, propNameId);
  mdata.deleteProperty(schemaNS, propNameRevision);
  mdata.deleteProperty(schemaNS, propNameName);

  project.xmpPacket = mdata.serialize();

  project.save();
}
