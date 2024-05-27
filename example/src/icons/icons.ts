import type { ComponentPublicInstance, FunctionalComponent } from 'vue';

export type JSXComponent<Props = any> =
  | { new (): ComponentPublicInstance<Props> }
  | FunctionalComponent<Props>;
export type IconValue =
  | string
  | (string | [path: string, opacity: number])[]
  | JSXComponent;

export interface IconAliases {
  dark: IconValue;
  light: IconValue;
  ltr: IconValue;
  rtl: IconValue;
  palette: IconValue;
  settings: IconValue;
  formatText: IconValue;
  formOnly: IconValue;
  reload: IconValue;
  save: IconValue;
}
