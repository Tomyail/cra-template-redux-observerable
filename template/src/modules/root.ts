import {
  combineEpics,
  ActionsObservable,
  StateObservable,
} from 'redux-observable';
import * as _ from 'lodash';
import {
  bindActionCreators,
  combineReducers,
  Dispatch,
  AnyAction,
} from 'redux';
import filterEpics from '../utils/filter-epics';

import { getGlobalStore } from '../configureStore';

import { IDependency } from '../dependency';
import { catchError } from 'rxjs/operators';
import { createLogger } from '../utils/logger';
import { debugInfo } from '../utils/runtime';

const logger = createLogger('全局异常');

const epicList = [...filterEpics({})];

export const rootEpic = (
  action$: ActionsObservable<AnyAction>,
  store$: StateObservable<void>,
  deps: IDependency
) =>
  combineEpics(...epicList)(action$, store$, deps).pipe(
    // 将epic异常捕捉
    catchError((e, source) => {
      logger.error(
        '未捕获的 epic 错误,错误信息 %s, 错误堆栈 %s',
        e ? e.message : '',
        e ? e.stack : ''
      );
      const fundebug = require('fundebug-javascript');
      fundebug.notifyError(e, {
        metaData: debugInfo(),
      });
      // sendErrorLog('unhandled_epic_error', ERROR_EPIC_UNKNOWN, LONG_NAME, e, { erroStack: e.stack });
      // todo 如果知道这个 source 发了什么 action type?
      return source;
    })
  );

export const rootReducer = (history) =>
  combineReducers({
    // app: app.reducer,
    // loading: loading.reducer,
    // scoreProgress: scoreProgress.reducer,
    // spokenAnswer: spokenAnswer.reducer,
    // bridge: bridge.reducer,
    // router: connectRouter(history),
    // footer: footer.reducer,
    // feedback: feedback.reducer,
    // userInfo: userInfo.reducer,
  });

//fixme 如何动态生成而不会 ts 报错?
export const AppAction = {
  // asyncExercise,
  // app: app.actions,
  // loading: loading.actions,
  // scoreProgress: scoreProgress.actions,
  // spokenAnswer: spokenAnswer.actions,
  // bridge: bridge.actions,
  // footer: footer.actions,
  // feedback: feedback.actions,
  // userInfo: userInfo.actions,
};

export const mapAppActions = (dispatch: Dispatch): IAppActionProps => {
  return {
    actions: _.mapValues(AppAction, (action) =>
      bindActionCreators(action, dispatch)
    ) as ActionList,
  };
};

export const getReduxAppActions = () => {
  return mapAppActions(getGlobalStore().dispatch);
};

// AppAction.loading.addPending();
// export const connectActions = connect(null, mapAppActions);
type ActionList = typeof AppAction;

export interface IAppActionProps {
  actions: ActionList;
}

export type AppStore = ReturnType<ReturnType<typeof rootReducer>>;
