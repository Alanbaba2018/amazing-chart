import { CommonObject } from '../typeof/type';

const propsToSkip: {[k: string]: boolean} = {
  children: true,
  ref: true,
  key: true,
  style: true,
  forwardedRef: true,
  unstable_applyCache: true,
  unstable_applyDrawHitFromCache: true
};

let zIndexWarningShowed = false;
let dragWarningShowed = false;

export const EVENTS_NAMESPACE = '.react-konva-event';

let useStrictMode: boolean = false;
export function toggleStrictMode(value: boolean) {
  useStrictMode = value;
}

const Z_INDEX_WARNING = `ReactChart: You are using "zIndex" attribute for a render node.
react-chart may get confused with ordering. Just define correct order of elements in your render function of a component.
`;

export function applyNodeProps(instance: any, props: CommonObject, oldProps: CommonObject = {}) {
  if (!zIndexWarningShowed && 'zIndex' in props) {
    console.warn(Z_INDEX_WARNING);
    zIndexWarningShowed = true;
  }

  if (!dragWarningShowed && props.draggable) {
    const hasPosition = props.x !== undefined || props.y !== undefined;
    const hasEvents = props.onDragEnd || props.onDragMove;
    if (hasPosition && !hasEvents) {
      dragWarningShowed = true;
    }
  }

  for (const key in oldProps) {
    if (propsToSkip[key]) {
      continue;
    }
    const isEvent = key.slice(0, 2) === 'on';
    const propChanged = oldProps[key] !== props[key];
    if (isEvent && propChanged) {
      let eventName = key.substr(2).toLowerCase();
      if (eventName.substr(0, 7) === 'content') {
        eventName =
          'content' +
          eventName.substr(7, 1).toUpperCase() +
          eventName.substr(8);
      }
      instance.off(eventName, oldProps[key]);
    }
    const toRemove = !props.hasOwnProperty(key);
    if (toRemove) {
      instance.setAttr(key, undefined);
    }
  }

  const strictUpdate = useStrictMode || props._useStrictMode;
  const updatedProps: CommonObject = {};
  let hasUpdates = false;

  for (const key in props) {
    if (propsToSkip[key]) {
      continue;
    }
    const isEvent = key.slice(0, 2) === 'on';
    const toAdd = oldProps[key] !== props[key];
    if (isEvent && toAdd) {
      let eventName = key.substr(2).toLowerCase();
      if (eventName.substr(0, 7) === 'content') {
        eventName =
          'content' +
          eventName.substr(7, 1).toUpperCase() +
          eventName.substr(8);
      }
      if (props[key]) {
        instance.on(eventName + EVENTS_NAMESPACE, props[key]);
      }
    }
    if (
      !isEvent &&
      (props[key] !== oldProps[key] ||
        (strictUpdate && props[key] !== instance.getAttr(key)))
    ) {
      hasUpdates = true;
      updatedProps[key] = props[key];
    }
  }

  if (hasUpdates) {
    instance.setAttrs(updatedProps);
    updatePicture(instance);
  }
}

export function updatePicture(node: any) {
  // const drawingNode = node.getLayer() || node.getStage();
  // drawingNode && drawingNode.batchDraw();
}
