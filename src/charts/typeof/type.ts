import { CSSProperties, ReactNode } from "react";

export interface PanelOptions {
  width?: number,
  height?: number,
  container: HTMLElement;
}

export interface CommonObject {
  [k: string]: any;
}

export interface CommonContextProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode | any[];
}

export interface ChangedAttr {
  oldVal: any;
  newVal: any;
}

export interface CandlestickItem {
  time: string | number;
  open: number;
  high: number; 
  low: number;
  close: number;
}

export interface TickData {
  p: number;
  v: number | string;
}

export interface Bound {
  x: number;
  y: number;
  width: number;
  height: number;
}