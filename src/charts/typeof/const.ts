export const CommonKeys: {[k: string]: string} = {
  Change: 'CHANGE'
}

// alphabetic ： (默认)文本基线是普通的字母基线。 英文字母底部对齐
// top ： 文本基线是 em 方框的顶端。顶部对齐
// hanging ： 文本基线是悬挂基线。 顶部对齐
// middle ： 文本基线是 em 方框的正中。中部对齐
// ideographic： 文本基线是em基线。底部对齐
// bottom ： 文本基线是 em 方框的底端。底部对齐
export enum TextBaseLine {
  Alphabetic = 'alphabetic',
  Top ='top',
  Hanging = 'hanging',
  Middle = 'middle',
  Ideographic = 'ideographic',
  Bottom = 'bottom'
}

export enum TextAlign {
  Start = 'start', // 默认。文本在指定的位置开始。
  End = 'end', // end : 文本在指定的位置结束。
  Center = 'center', // center: 文本的中心被放置在指定的位置。
  Left = 'left', // left : 文本左对齐。
  Right = 'right' // right : 文本右对齐。
}

export const Zero: number = 1e-5;

export const CanvasContextProps: Array<string | number> = [
  'strokeStyle', 
  'fillStyle', 
  'globalAlpha', 
  'lineWidth', 
  'lineCap', 
  'lineJoin', 
  'miterLimit', 
  'shadowOffsetX', 
  'shadowOffsetY', 
  'shadowBlur', 
  'shadowColor', 
  'globalCompositeOperation', 
  'font', 
  'textAlign', 
  'textBaseline'
];

export const ShortMonthLabel: string[] = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

export const DevicePixelRatio = window.devicePixelRatio || 1;

