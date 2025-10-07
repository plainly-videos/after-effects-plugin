function validateProject(): string {
  const textIssues: TextLayerIssues[] | undefined = checkTextLayers();
  let issues: AnyProjectIssue[] = [];

  if (textIssues && textIssues.length > 0) {
    issues = issues.concat(textIssues);
  }

  if (issues.length > 0) {
    return JSON.stringify(issues);
  }

  return 'undefined';
}
