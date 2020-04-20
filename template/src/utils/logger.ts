import pino from 'pino';
import * as _ from 'lodash';

/**
 * 如何日志包含参数customKeys ,那么日志将用这个keys 里面的每个自定义属性为%O 或者%o 重命名,并用对象的方式加到 kibana 方便后期索引
 * @param payload
 * @param options
 * @param message
 */
const parseCustomKeys = (payload, message: any[], options?: any[]) => {
  options?.forEach(element => {
    if (element.hasOwnProperty('customKeys')) {
      const allItem = (message[0] as string)?.match(/%s|%O|%o/g);
      const matchItem = (message[0] as string)?.match(/%O|%o/g);
      const targetLength = matchItem?.length ?? 0;
      if (targetLength !== element['customKeys'].length) {
        throw Error(
          `需要自定义的数据不配对,模板包含的 %O 或者 %o 为 ${targetLength} 个,但是 customKeys 包含的长度为 ${element['customKeys'].length}`
        );
      }

      if (allItem) {
        let index = 0;
        allItem.forEach((item, idx) => {
          if (item.match(/%O|%o/g)) {
            const data = message[idx + 1];
            payload[element['customKeys'][index]] = data;
            index++;
          }
        });
      }
    }
  });

  return payload;
};
const logger = pino({
  browser: {
    asObject: true,
    //@ts-ignore
    transmit: {
      level: 'info',
      send: (level, logEvent) => {
        const eventName = logEvent.bindings.map(bind => bind.name).join('_');

        const getOptions = (input?: string) => input?.match(/%s|%O|%o/g);
        const length = getOptions(logEvent.messages[0])?.length ?? 0;

        let finalMessage: any[];
        let options: any[];
        if (length > 0) {
          options = logEvent.messages.slice(length + 1);
          finalMessage = logEvent.messages.slice(0, length + 1);
        } else {
          finalMessage = logEvent.messages;
        }

        const payload = _.mapValues(
          _.mapKeys(finalMessage, (value, idx) => `key_${idx}`),
          value => {
            if (_.isObject(value)) {
              try {
                return JSON.stringify(value);
              } catch (e) {
                return '转成字符串失败';
              }
            } else {
              return value == null ? 'null or undefined' : value.toString();
            }
          }
        );
        const finalPayload = parseCustomKeys(payload, finalMessage, options!);
        // eventLogger.event(eventName, finalPayload, level);
      },
    },
    write: data => {
      const levels = {
        values: {
          fatal: 60,
          error: 50,
          warn: 40,
          info: 30,
          debug: 20,
          trace: 10,
        },
        labels: {
          10: 'debug', //'trace',
          20: 'debug',
          30: 'info',
          40: 'warn',
          50: 'error',
          60: 'error', //'fatal'
        },
      };

      const level = levels.labels[data['level']];

      console[level](data);
      /**
       * 所有的 error 日志非生产情况下 alert 一下以表重视..
       */
      if (process.env.NODE_ENV !== 'production') {
        //50 是 error 以上
        if (data['level'] >= 50) {
          alert(data['msg']);
        }
      }
    },
  },
  level: process.env.NODE_ENV === 'production' ? 'info' : 'trace',
});

export const createLogger = name => {
  return logger.child({ name });
};
export default logger;
