function setProjectData(
  id: string,
  revision: string | undefined,
  name: string,
) {
  const project = app.project;
  project.save();

  if (ExternalObject.AdobeXMPScript === undefined) {
    // load the XMPlibrary as an ExtendScript ExternalObject
    ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
  }

  const mdata = new XMPMeta!(project.xmpPacket); //get the project's XMPmetadata
  // update the Label project metadata's value
  const schemaNS = XMPMeta!.getNamespaceURI('xmp');
  const propNameId = 'xmp:PlainlyProjectId';
  const propNameRevision = 'xmp:PlainlyProjectRevision';
  const propNameName = 'xmp:PlainlyProjectName';
  try {
    mdata.setProperty(schemaNS, propNameId, id);
    revision && mdata.setProperty(schemaNS, propNameRevision, revision);
    mdata.setProperty(schemaNS, propNameName, name);
    project.xmpPacket = mdata.serialize();
  } catch (e) {
    alert('failed');
  } finally {
    project.save();
  }
}

function getProjectData() {
  const project = app.project;
  const mdata = new XMPMeta!(project.xmpPacket); //get the project's XMPmetadata
  const schemaNS = XMPMeta!.getNamespaceURI('xmp');

  const projectData = {
    id: String(mdata.getProperty(schemaNS, 'xmp:PlainlyProjectId')),
    revision: String(mdata.getProperty(schemaNS, 'xmp:PlainlyProjectRevision')),
    name: String(mdata.getProperty(schemaNS, 'xmp:PlainlyProjectName')),
  };

  return JSON.stringify(projectData);
}
