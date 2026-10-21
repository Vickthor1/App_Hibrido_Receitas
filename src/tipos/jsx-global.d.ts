import * as React from "react";

declare module "react" {
  namespace JSX {
    interface Element extends React.ReactElement<unknown, string | React.JSXElementConstructor<any>> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<unknown, string | React.JSXElementConstructor<any>> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
