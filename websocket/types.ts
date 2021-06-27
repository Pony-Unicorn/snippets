/**
 * 配置
 * @author Created by pony on 2021/05/06.
 */
export interface IConfWS {
  wsUri: string; // uri
  binaryType?: BinaryType;
  heartTime: number; // 心跳时间, 毫秒
  reconnectInterval: number; // 重复尝试连接次数，-1 为永远尝试，0 为重复尝试
  reconnectTime: number; // 重复尝试连接间隔时间
}

export interface ISocketChangeListener {
  onSocketOpen: () => void;
  onSocketClosed: () => void;
  onSocketReconnect: () => void;
  onSocketError: () => void;
}

export interface IMessageAdapter<M> {
  senSerialize: (msg: M) => ArrayBuffer | string;
  receiveSerialize: () => void;
}
