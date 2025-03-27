function getSelectedLayers() {
  const selectedLayers: { id: number; name: string }[] = [];

  for (let i = 1; i <= app.project.numItems; i++) {
    const item = app.project.item(i);
    if (item instanceof CompItem) {
      for (let j = 0; j < item.selectedLayers.length; j++) {
        if (item.selectedLayers[j].selected) {
          selectedLayers.push({
            id: item.selectedLayers[j].id,
            name: item.selectedLayers[j].name,
          });
        }
      }
    }
  }

  return JSON.stringify(selectedLayers);
}
