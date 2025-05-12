declare module 'react-helmet' {
  import * as React from 'react';
  
  interface HelmetProps {
    htmlAttributes?: any;
    title?: string;
    titleTemplate?: string;
    defaultTitle?: string;
    base?: any;
    meta?: any[];
    link?: any[];
    script?: any[];
    noscript?: any[];
    style?: any[];
    onChangeClientState?: (newState: any, addedTags: any, removedTags: any) => void;
  }
  
  export class Helmet extends React.Component<HelmetProps> {
    static renderStatic(): {
      base: any;
      bodyAttributes: any;
      htmlAttributes: any;
      link: any;
      meta: any;
      noscript: any;
      script: any;
      style: any;
      title: any;
    };
  }
  
  export default Helmet;
}
