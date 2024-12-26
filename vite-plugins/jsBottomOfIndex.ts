export const jsToBottomNoModule = () => {
  return {
    name: 'no-attribute',
    transformIndexHtml(html: string) {
      let replacedHtml = html.replace(` type="module" crossorigin`, '');
      const matchResult = replacedHtml.match(
        /<script[^>]*>(.*?)<\/script[^>]*>/,
      );

      if (matchResult) {
        const scriptTag = matchResult[0];
        replacedHtml = replacedHtml.replace(scriptTag, '');
        replacedHtml = replacedHtml.replace(
          '</body>',
          `\t${scriptTag}\n</body>`,
        );
      } else {
        console.log('No script tag found.');
      }

      return replacedHtml;
    },
  };
};
