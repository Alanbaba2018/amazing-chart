import invariant from './invariant';
import { applyNodeProps, updateScene } from './propsUpdate';
import {
  unstable_scheduleCallback as scheduleDeferredCallback,
  unstable_cancelCallback as cancelDeferredCallback
} from 'scheduler';
import { ReactElement } from 'react';
import * as BinanceChart from '../core/index';

export * from './HostConfigWithNoPersistence';
export * from './HostConfigWithNoHydration';

export {
  unstable_now as now,
  unstable_scheduleCallback as scheduleDeferredCallback,
  unstable_shouldYield as shouldYield,
  unstable_cancelCallback as cancelDeferredCallback
} from 'scheduler';

const NO_CONTEXT = {};
const UPDATE_SIGNAL = {};

export function createInstance(type: string, props: { [k: string]: any }, internalInstanceHandle: any) {
  console.log('createInstance');
  const NodeClass = (BinanceChart as any)[type];
  if (!NodeClass) {
    invariant(false, '@binance/chart has no node');
    return;
  }
  const instance = new NodeClass();
  applyNodeProps(instance, props);
  return instance;
}

export function createTextInstance(text: string) {
  console.log('createTextInstance');
  invariant(false, 'Text components are not supported. You text is: "' + text + '"');
}

export function finalizeInitialChildren(domElement: ReactElement, type: string, props: { [k: string]: any }) {
  console.log('finalizeInitialChildren');
  return false;
}

export function getPublicInstance(instance: any) {
  console.log('getPublicInstance');
  console.log('------------------------');
  return instance;
}

export function prepareForCommit() {
  console.log('prepareForCommit');
  // Noop
}

export function prepareUpdate(domElement: ReactElement, type: string, oldProps: { [k: string]: any }, newProps: { [k: string]: any }) {
  console.log('prepareUpdate');
  return UPDATE_SIGNAL;
}

export function resetAfterCommit() {
  console.log('resetAfterCommit');
  // Noop
}

export function resetTextContent(domElement: ReactElement) {
  console.log('resetTextContent');
  // Noop
}

export function shouldDeprioritizeSubtree(type: string, props: { [k: string]: any }) {
  console.log('shouldDeprioritizeSubtree');
  return false;
}

export function getRootHostContext() {
  console.log('getRootHostContext');
  return NO_CONTEXT;
}

export function getChildHostContext() {
  console.log('getChildHostContext');
  return NO_CONTEXT;
}

export const scheduleTimeout = setTimeout;
export const cancelTimeout = clearTimeout;
export const noTimeout = -1;
export const schedulePassiveEffects = scheduleDeferredCallback;
export const cancelPassiveEffects = cancelDeferredCallback;

export function shouldSetTextContent(type: string, props: { [k: string]: any }) {
  console.log('shouldSetTextContent');
  return false;
}

// The xCanvas renderer is secondary to the React DOM renderer.
export const isPrimaryRenderer = false;

export const supportsMutation = true;

export function appendChildToContainer(parentInstance: any, child: any) {
  console.log('appendChildToContainer', parentInstance, child);
  // if (child.getParent && child.getParent() === parentInstance) {
  //   parentInstance.addWidget(child);
  // }
  parentInstance.addWidget(child);
  updateScene(parentInstance);
}

export function insertBefore(parentInstance: any, child: any, beforeChild: any) {
  console.log('insertBefore');
  invariant(
    child !== beforeChild,
    'ReactxCanvas: Can not insert node before itself'
  );
  // child._remove() will not stop dragging
  // but child.remove() will stop it, but we don't need it
  // removing will reset zIndexes
  child.remove();
  parentInstance.addWidget(child);
  child.setZIndex(beforeChild.getZIndex());
  updateScene(parentInstance);
}

export function insertInContainerBefore(parentInstance: any, child: any, beforeChild: any) {
  console.log('insertInContainerBefore');
  insertBefore(parentInstance, child, beforeChild);
}

export function removeChild(parentInstance: any, child: any) {
  console.log('removeChild');
  child.destroy();
  updateScene(parentInstance);
}

export function removeChildFromContainer(parentInstance: any, child: any) {
  console.log('removeChildFromContainer');
  child.destroy();
  updateScene(parentInstance);
}

export function commitTextUpdate(textInstance: any, oldText: string, newText: string) {
  console.log('commitTextUpdate');
  invariant(
    false,
    'Text components are not yet supported in ReactxCanvas. You text is: "' +
    newText +
    '"'
  );
}

export function commitMount() { 
  console.log('commitMount')
}

export function commitUpdate(
  instance: any,
  updatePayload: any,
  type: string,
  oldProps: { [k: string]: any },
  newProps: { [k: string]: any }
) {
  console.log('commitUpdate')
  applyNodeProps(instance, newProps, oldProps);
}

export function hideInstance(instance: any) {
  console.log('hideInstance');
  instance.hide();
  updateScene(instance);
}

export function hideTextInstance() { 
  console.log('hideTextInstance');
}

export function unhideInstance(instance: any, props: { [k: string]: any }) {
  console.log('unhideInstance');
  if (props.visible == null || props.visible) {
    instance.show();
  }
}

export function unhideTextInstance() { 
  console.log('unhideTextInstance');
}
