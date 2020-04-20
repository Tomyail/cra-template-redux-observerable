import { Action, AnyAction, Dispatch } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic, rootReducer } from './modules/root';
import {
  configureStore as config,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';
import getDependency from './dependency';
import { createLogger } from './utils/logger';
// import { isMobile } from '../util/runtime';
import { createBrowserHistory, createHashHistory } from 'history';

const logger = createLogger('全局异常');

declare global {
  interface Window {}
}

let history: ReturnType<typeof createHashHistory>;

export const getHistory = () => {
  if (history) return history;
  const hostname = window.location.hostname;
  // if (
  //   hostname.indexOf('assignment-ui') >= 0
  //   // hostname.indexOf('localhost') >= 0 ||
  //   // hostname.indexOf('0.0.0.0') >= 0
  // ) {
  //   history = createBrowserHistory();
  // } else {
  history = createHashHistory();
  // }
  return history;
};

const catchErrorMiddleware = (store: any) => (next: Dispatch<AnyAction>) => (
  action: Action
) => {
  try {
    next(action);
  } catch (e) {
    setTimeout(() => {
      logger.error(
        '未捕获的 epic 错误: %s,堆栈 %s',
        e && e.message,
        e && e.stack
      );
    });
  }
};

export default function configureStore() {
  const epicMiddleware = createEpicMiddleware({
    dependencies: getDependency(),
  });

  const store = config({
    reducer: rootReducer(getHistory()),
    middleware: [
      ...getDefaultMiddleware(),
      // routerMiddleware(getHistory()),
      catchErrorMiddleware,
      epicMiddleware,
    ],
    // enhancers: isMobile()
    //   ? [devToolsEnhancer({ realtime: true, hostname: '0.0.0.0', port: 8000 })]
    //   : [],
  });
  epicMiddleware.run(rootEpic);

  return store;
}

let globalStore: ReturnType<typeof configureStore>;

export const getGlobalStore = () => {
  if (globalStore) {
    return globalStore;
  }
  globalStore = configureStore();
  window['__REDUX_STORE__'] = globalStore;

  return globalStore;
};
