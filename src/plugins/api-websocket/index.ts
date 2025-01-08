import { createPlugin } from '@/utils';

import { defaultAPIWebsocketConfig } from './config';
import { onMenu } from './menu';
import { backend } from './backend';

export default createPlugin({
  name: () => 'API Websocket',
  description: () =>
    'Expose YouTube Music as an Websocket to other applications',
  restartNeeded: false,
  config: defaultAPIWebsocketConfig,
  addedVersion: '3.7.1',
  menu: onMenu,

  renderer: {
    onPlayerApiReady(api, { setConfig }) {
      setConfig({ volume: api.getVolume() });
    },
  },

  backend,
});
