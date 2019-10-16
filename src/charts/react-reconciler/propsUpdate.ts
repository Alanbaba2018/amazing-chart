import { CommonObject } from '../typeof/type';
import BasePanel from '../core/basePanel';
import IWidget from '../core/widgets/iWidget';

const propsToSkip: {[k: string]: boolean} = {
  children: true,
  className: true,
  ref: true,
  key: true,
  style: true,
  forwardedRef: true,
  unstable_applyCache: true,
  unstable_applyDrawHitFromCache: true
};

let useStrictMode: boolean = false;
export function toggleStrictMode(value: boolean) {
  useStrictMode = value;
}


export function applyNodeProps(instance: any, props: CommonObject, oldProps: CommonObject = {}) {
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
        instance.on(eventName, props[key]);
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
    updateScene(instance);
  }
}

export function updateScene(node: BasePanel | IWidget) {
  const panel = node instanceof IWidget ? node.getParent() : node;
  panel && panel.update();
}
