/// <reference types="vite/client" />

declare interface Window {
  Add: any;
}

declare interface global {
  Add: any;
}

declare module '*.vue' {
  import { ComponentOptions } from 'vue';
  const componentOptions: ComponentOptions;
  export default componentOptions;
}

declare module 'postcss-px-to-viewport';