import ReactFiberReconciler from 'react-reconciler';
import * as HostConfig from './hostConfig';
import React from 'react';
import { getClosestInstanceFromNode } from './ReactDOMComponentTree';

const ChartRenderer = ReactFiberReconciler(HostConfig as any);

ChartRenderer.injectIntoDevTools({
  findFiberByHostInstance: getClosestInstanceFromNode,
  bundleType: process.env.NODE_ENV !== 'production' ? 1 : 0,
  rendererPackageName: '@binance-chart',
  version: React.version,
  getInspectorDataForViewTag: (...args) => {
    console.log(args);
    return {}
  }
});

export default ChartRenderer;

