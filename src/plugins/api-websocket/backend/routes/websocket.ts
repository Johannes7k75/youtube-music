import WebSocket, { WebSocketServer } from 'ws';
import { BackendContext } from '@/types/contexts';
import { APIWebsocketConfig } from '../../config';
import registerCallback, { SongInfo } from '@/providers/song-info';
import getSongControls from '@/providers/song-controls';
import { ipcMain } from 'electron';
import { RepeatMode } from '@/types/datahost-get-state';

let websocket: WebSocketServer | null = null;

let volume: number = 0;
let repeat: RepeatMode = 'NONE' as RepeatMode;

const nextRepeat = (repeat: RepeatMode) => {
  switch (repeat) {
    case 'NONE':
      return 'ALL' as const;
    case 'ALL':
      return 'ONE' as const;
    case 'ONE':
      return 'NONE' as const;
  }
};

function createPlayerState(
  songInfo: SongInfo | null,
  volume: number,
  repeat: RepeatMode,
) {
  return JSON.stringify({
    type: 'PLAYER_STATE',
    song: songInfo,
    isPlaying: songInfo ? !songInfo.isPaused : false,
    position: songInfo?.elapsedSeconds ?? 0,
    volume,
    repeat,
  });
}

export const register = async ({
  window,
  getConfig,
}: BackendContext<APIWebsocketConfig>) => {
  const config = await getConfig();
  const sockets = new Set<WebSocket>();
  volume = config.volume;

  let lastSongInfo: SongInfo | null = null;

  const controller = getSongControls(window);

  ipcMain.on('ytmd:volume-changed', (_, newVolume) => {
    volume = newVolume;
    sockets.forEach((socket) =>
      socket.send(JSON.stringify({ type: 'PLAYER_STATE', volume: volume })),
    );
  });

  ipcMain.on('ytmd:repeat-changed', (_, mode) => {
    repeat = mode;
    sockets.forEach((socket) =>
      socket.send(JSON.stringify({ type: 'PLAYER_STATE', repeat: repeat })),
    );
  });

  registerCallback((songInfo) => {
    for (const socket of sockets) {
      const playerState = {
        type: 'PLAYER_STATE',
      };

      if (lastSongInfo?.videoId !== songInfo.videoId) {
        Object.assign(playerState, { song: songInfo });
      }

      if (lastSongInfo?.isPaused !== songInfo.isPaused) {
        Object.assign(playerState, {
          isPlaying: songInfo ? !songInfo.isPaused : false,
        });
      }

      if (lastSongInfo?.elapsedSeconds !== songInfo.elapsedSeconds) {
        Object.assign(playerState, { position: songInfo?.elapsedSeconds ?? 0 });
      }

      socket.send(JSON.stringify(playerState));
    }

    lastSongInfo = { ...songInfo };
  });

  websocket = new WebSocket.Server({
    host: config.hostname,
    port: config.port,
  });

  type Message =
    | {
        type: 'ACTION';
        action: 'play' | 'pause' | 'next' | 'previous' | 'shuffle' | 'repeat';
      }
    | { type: 'ACTION'; action: 'seek'; data: number }
    | { type: 'ACTION'; action: 'getVolume' }
    | { type: 'ACTION'; action: 'setVolume'; data: number };

  websocket.on('connection', (ws: WebSocket) => {
    ws.send(createPlayerState(lastSongInfo, volume, repeat));
    sockets.add(ws);

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString()) as Message;

      switch (message.type) {
        case 'ACTION':
          switch (message.action) {
            case 'play':
              controller.play();
              break;
            case 'pause':
              controller.pause();
              break;
            case 'next':
              controller.next();
              break;
            case 'previous':
              controller.previous();
              break;
            case 'shuffle':
              controller.shuffle();
              break;
            case 'repeat':
              controller.switchRepeat();
              repeat = nextRepeat(repeat);
              break;
            case 'seek':
              if (message.data > 0) {
                controller.goForward(Math.abs(message.data));
              } else {
                controller.goBack(Math.abs(message.data));
              }
              break;
            case 'setVolume':
              controller.setVolume(message.data);
              break;
          }
          break;
      }
      ws.send(createPlayerState(lastSongInfo, volume, repeat));
    });

    ws.on('close', () => {
      sockets.delete(ws);
    });
  });
};

export const unregister = () => {
  websocket?.close();
};
