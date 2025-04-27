export enum AuthStrategy {
  AUTH_AT_FIRST = 'AUTH_AT_FIRST',
  NONE = 'NONE',
}

export interface APIServerConfig {
  enabled: boolean;
  hostname: string;
  port: number;
  authStrategy: AuthStrategy;
  secret: string;
  websocket: boolean;
  websocketPort: number;

  authorizedClients: string[];

  volume: number;
}

export const defaultAPIServerConfig: APIServerConfig = {
  enabled: false,
  hostname: '0.0.0.0',
  port: 26538,
  authStrategy: AuthStrategy.AUTH_AT_FIRST,
  secret: Date.now().toString(36),
  websocket: false,
  websocketPort: 26539,

  authorizedClients: [],
  
  volume: 0,
};
