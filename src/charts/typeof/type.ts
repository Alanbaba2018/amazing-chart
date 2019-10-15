import { CSSProperties } from "react";

export interface PanelOptions {
  width: number,
  height: number,
  container: string | HTMLDialogElement
}

export interface CommonObject {
  [k: string]: any;
}

export interface CommonContextProps {
  className?: string;
  style?: CSSProperties;
}