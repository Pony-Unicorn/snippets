import { CancelledError, RepeatableError } from './commonError';

/**
 *
 */
export type typeMapStringOrNumber = {
  [index: string]: string | number;
};

/**
 * 沉睡一段时间
 * @param ms 延迟的毫秒数
 */
export const sleep: (ms: number) => Promise<void> = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 根据对象的 key 返回一个排序后的数组
 * 一般做 md5 需要对象 key 进行排序
 * @param sortedOut 待排序的对象
 * 备注，使用 URLSearchParams sort 函数代替
 */
export const sortObjKey: (sortedOut: typeMapStringOrNumber) => string[] = (
  sortedOut
) => Object.keys(sortedOut).sort();

/**
 * 拼接 get 请求字符串
 * @param {*} argsObj - 待拼接的对象
 * @returns {string} - 拼接成的请求字符串
 */
export function splicingQueryString(
  argsObj: typeMapStringOrNumber,
  format = (v: string | number) => v as string
): string {
  if (!argsObj) return '';
  const argsObjKeys = Object.keys(argsObj);
  if (argsObjKeys.length === 0) return '';
  const params = argsObjKeys.map((key) => `${key}=${format(argsObj[key])}`);
  return '?' + params.join('&');
}

/**
 * 解析 URL 中参数。
 * @author Created by pony on 2020/10/01.
 */
export const getUrlParams = (urlStr = window.location.search) =>
  new URLSearchParams(urlStr);

/**
 *
 * @param fn function to loop
 * @param wait wait between loop in ms
 */
export const loopAsync = (
  fn: () => Promise<void>,
  wait: number
): (() => void) => {
  let closure = true;

  const start = async () => {
    while (closure) {
      try {
        await fn();
      } catch (err) {
        console.error('loopAsync error>>>', err);
      }
      await sleep(wait);
    }
  };

  start();

  return () => {
    closure = false;
  };
};

/**
 * Retries the function that returns the promise until the promise successfully resolves up to n retries
 * @param fn function to retry
 * @param n how many times to retry
 * @param wait wait between retries in ms
 * @author Created by pony on 2020/10/01.
 */
export function retry<T>(
  fn: () => Promise<T>,
  { n, wait }: { n: number; wait: number }
): { promise: Promise<T>; cancel: () => void } {
  let completed = false;
  let rejectCancelled: (error: Error) => void;

  const promise = new Promise<T>(async (resolve, reject) => {
    rejectCancelled = reject;

    while (true) {
      let result: T;
      try {
        result = await fn();
        if (!completed) {
          resolve(result);
          completed = true;
        }
        break;
      } catch (error) {
        if (completed) {
          break;
        }
        if (n <= 0 || !(error instanceof RepeatableError)) {
          reject(error);
          completed = true;
          break;
        }
        n--;
      }
      await sleep(wait);
    }
  });
  return {
    promise,
    cancel: () => {
      if (completed) return;
      completed = true;
      rejectCancelled(new CancelledError());
    }
  };
}
