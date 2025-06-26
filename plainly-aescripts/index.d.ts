/// <reference path="./node_modules/types-for-adobe/AfterEffects/22.0/index.d.ts" />

// Global XMP types
declare global {
  var XMPMeta:
    | {
        new (xmpPacket?: string): XMPMetaInstance;
        getNamespaceURI(prefix: string): string;
      }
    | undefined;

  interface XMPMetaInstance {
    getProperty(
      schemaNS: string,
      propName: string,
    ): string | number | boolean | null;
    setProperty(schemaNS: string, propName: string, propValue: string): void;
    deleteProperty(schemaNS: string, propName: string): void;
    serialize(): string;
  }

  namespace ExternalObject {
    var AdobeXMPScript: ExternalObject | undefined;
  }
}

export {};
