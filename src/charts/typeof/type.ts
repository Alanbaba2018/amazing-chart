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

export interface AxisData {
  xAxisData: TickData[];
  yAxisData: TickData[];
}

export interface Bound {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum Trend {
  Up = 'up',
  Down = 'down',
}
export interface CandlestickBar extends Bound, CandlestickItem {
  type: Trend;
  openY: number;
  closeY: number;
  highY: number;
  lowY: number;
}

export interface Point {
  x: number;
  y: number;
}

export enum TimeScaleType {
  Day = 'Day',
  Hour = 'Hour',
  Minute = 'Minute',
  Second = 'Second',
}

export enum TimeScaleStep {
  Day = 1,
  Hour = 4,
  Minute = 30,
  Second = 15,
}