/**
 * 网络事件从 10000 开始
 * @author Created by pony on 2021/05/06.
 */
export enum EventEnumMsg {
  //====== 打开/关闭/重连/错误 ======
  EVE_OPEN = 10001, // websocket 打开
  EVE_CLOSED = 10002, // websocket 关闭
  EVE_RECONNECT = 10003, // websocket 重连
  EVE_ERROR = 10004, // websocket 错误
}
