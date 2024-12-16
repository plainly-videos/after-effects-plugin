export const jsToBottomNoModule = () => {
  return {
    name: 'no-attribute',
    transformIndexHtml(html: string) {
      let replacedHtml = html.replace(`type="module" crossorigin`, '');
      const matchResult = replacedHtml.match(
        /<script[^>]*>(.*?)<\/script[^>]*>/,
      );

      if (matchResult) {
        const scriptTag = matchResult[0];
        console.log('\n SCRIPT TAG', scriptTag, '\n');
        replacedHtml = replacedHtml.replace(scriptTag, '');
        replacedHtml = replacedHtml.replace(
          '<!-- # INSERT SCRIPT HERE -->',
          scriptTag,
        );
      } else {
        console.log('No script tag found.');
      }

      return replacedHtml;
    },
  };
};
