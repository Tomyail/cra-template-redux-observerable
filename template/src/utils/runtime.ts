import uuidv1 from 'uuid/v1';

let _machineId;

/**
 * 当前机器 id(只要不清缓存,每次启动都一样)
 */
export const getMachineId = (): void => {
  if (_machineId) return _machineId;
  const localId = localStorage.getItem('alo7-assignment:abtest:uuid');
  if (localId) {
    _machineId = localId;
  } else {
    _machineId = uuidv1();
    localStorage.setItem('alo7-assignment:abtest:uuid', _machineId);
  }
  return _machineId;
};

let _sessionId;

/**
 * 当前会话 id(每次启动都不一样)
 */
export const getSessionId = (): string => {
  if (!_sessionId) {
    _sessionId = uuidv1();
  }
  return _sessionId;
};

export const appVersion = (): string => {
  return process.env['VERSION']!;
};

export const build = (): string => {
  return process.env['COMMIT_HASH'] as string;
};

export const env = (): string => {
  return process.env['NODE_ENV'];
};

export const debugInfo = () => {
  return {
    machineId: getMachineId(),
    sessionId: getSessionId(),
    url: window.location.href,
    version: appVersion(),
    build: build(),
  };
};
