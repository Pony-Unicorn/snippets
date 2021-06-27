/**
 * 模仿 java BigDecimal.toPlainString 方法, 最好使用 BigNumber 处理
 * @param num
 * @returns string
 */
export const toPlainString = (num: number) => {
  const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
  return num.toFixed(Math.max(0, (m[1] || '').length - Number(m[2])));
};
