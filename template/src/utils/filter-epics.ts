import * as _ from 'lodash';

const search = (data, collection) => {
  Object.entries(data).forEach(([key, value]: [string, any]) => {
    if (_.isFunction(value)) {
      if (key.startsWith('epic') || _.isNumber(parseInt(key))) {
        if (value.length === 0) {
          //如果一个函数的入参是空的,说明是个 tapAction,这种情况需要先执行这个函数才能返回epic
          collection.push(value());
        } else {
          collection.push(value);
        }
      }
    } else if (_.isObject(value)) {
      search(value, collection);
    }
  });
};
export default data => {
  const collection = [];
  search(data, collection);
  return collection;
};
