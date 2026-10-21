import * as React from "react";

declare global {
  namespace JSX {
    // Usamos any para evitar o conflito estrito de tipo de elemento do React 19 no RNW
    type Element = any;
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module "react" {
  namespace JSX {
    type Element = any;
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
