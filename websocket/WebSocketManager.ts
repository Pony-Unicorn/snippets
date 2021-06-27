import type { IConfWS, IMessageAdapter, ISocketChangeListener } from "./types";
import { EventEnumMsg } from "./EventEnumMsg";
import EventEmitter from "../event/EventEmitter";

/**
 * 套接字
 * 基于观察者，订阅出次数，
 * 基于状态模式，状态
 * 基于适配器，发送和接收，字符串还是二进制的处理方式
 * 延迟调用派发
 * @author Created by pony on 2021/05/06.
 */
class WebSocketManager {
  private readonly conf: IConfWS; // 配置
  private readonly msgAdapter: IMessageAdapter; // 消息处理
  private eventHandler: EventEmitter<EventEnumMsg>; // 事件管理器
  private ws: WebSocket; //

  // state

  constructor(_conf: IConfWS, _msgAdapter: IMessageAdapter) {
    this.conf = _conf;
    this.msgAdapter = _msgAdapter;
  }

  public start(): boolean {
    // 判断状态

    this.ws = new WebSocket(this.conf.wsUri);

    if (this.conf.binaryType) {
      this.ws.binaryType = this.conf.binaryType;
    }
    
    this.ws.addEventListener("open", this._onSocketConnect);
    this.ws.addEventListener("message", this._onSocketData);
    this.ws.addEventListener("error", this._onSocketError);
    this.ws.addEventListener("close", this._onSocketClose);

    // 更改状态
  }

  sendMsg(msg): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(this.msgAdapter.senSerialize(msg));
      return true;
    }
    return false;
  }

  close() {
    // 判断状态

    this.ws.removeEventListener("open", this._onSocketConnect);
    this.ws.removeEventListener("message", this._onSocketData);
    this.ws.removeEventListener("error", this._onSocketError);
    this.ws.removeEventListener("close", this._onSocketClose);
    // 更改状态
    this.ws.close();
  }

  // 重连
  public reConnect() {
    this.eventHandler.emit(EventEnumMsg.EVE_RECONNECT);
  }

  private _onSocketConnect(): void {
    this.eventHandler.emit(EventEnumMsg.EVE_OPEN);
  }

  // 网络异常触发
  private _onSocketError(evt): void {
    this.eventHandler.emit(EventEnumMsg.EVE_ERROR);
  }

  // 前后端主动断开触发
  private _onSocketClose(evt): void {
    this.eventHandler.emit(EventEnumMsg.EVE_CLOSED);
  }

  private _onSocketData(byteArray): void {
    this.eventHandler.emit(EventEnumMsg);
  }

  private _heart(): void {}

  //====== 以下为添加状态变化语法糖 ======

  public addAllStateListener(context: ISocketChangeListener): void {
    this.addOpenListener(context.onSocketOpen, context);
    this.addClosedListener(context.onSocketClosed, context);
    this.addReconnectListener(context.onSocketReconnect, context);
    this.addErrorListener(context.onSocketError, context);
  }

  public addOpenListener(listener: () => void, context?): void {
    this.eventHandler.on(EventEnumMsg.EVE_OPEN, listener, context);
  }

  public addClosedListener(listener: () => void, context?): void {
    this.eventHandler.on(EventEnumMsg.EVE_CLOSED, listener, context);
  }

  public addReconnectListener(listener: () => void, context?): void {
    this.eventHandler.on(EventEnumMsg.EVE_RECONNECT, listener, context);
  }

  public addErrorListener(listener: () => void, context?): void {
    this.eventHandler.on(EventEnumMsg.EVE_ERROR, listener, context);
  }

  public offAllStateListener(context: ISocketChangeListener): void {
    this.offOpenListener(context.onSocketOpen, context);
    this.offClosedListener(context.onSocketClosed, context);
    this.offReconnectListener(context.onSocketReconnect, context);
    this.offErrorListener(context.onSocketError, context);
  }

  public offOpenListener(listener: () => void, context?): void {
    this.eventHandler.off(EventEnumMsg.EVE_OPEN, listener, context);
  }

  public offClosedListener(listener: () => void, context?): void {
    this.eventHandler.off(EventEnumMsg.EVE_CLOSED, listener, context);
  }

  public offReconnectListener(listener: () => void, context?): void {
    this.eventHandler.off(EventEnumMsg.EVE_RECONNECT, listener, context);
  }

  public offErrorListener(listener: () => void, context?): void {
    this.eventHandler.off(EventEnumMsg.EVE_ERROR, listener, context);
  }
}

const webSocketMap = new Map<string, WebSocketManager>();

export const factoryWebSocketManager = (
  name: string,
  config: IConfWS,
  adapter: IMessageAdapter
) => {
  const instance = new WebSocketManager(config, adapter);
  webSocketMap.set(name, instance);
};

const getWs = (name: string) => {
  return webSocketMap.get(name);
};

export default getWs;
