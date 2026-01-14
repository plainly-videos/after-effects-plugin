declare module 'fontkit' {
  interface Font {
    postscriptName?: string;
  }

  interface FontCollection {
    fonts: Font[];
  }

  function openSync(path: string): Font | FontCollection;

  const fontkit: {
    openSync: typeof openSync;
  };

  export default fontkit;
}
