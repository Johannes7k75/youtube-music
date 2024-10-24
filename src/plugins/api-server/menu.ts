import prompt from 'custom-electron-prompt';

import { t } from '@/i18n';
import promptOptions from '@/providers/prompt-options';

import {
  type APIServerConfig,
  AuthStrategy,
  defaultAPIServerConfig,
} from './config';

import type { MenuContext } from '@/types/contexts';
import type { MenuTemplate } from '@/menu';
import { unregisterWebsocket } from './backend/routes';

export const onMenu = async ({
  getConfig,
  setConfig,
  window,
}: MenuContext<APIServerConfig>): Promise<MenuTemplate> => {
  const config = await getConfig();

  return [
    {
      label: t('plugins.api-server.menu.hostname.label'),
      type: 'normal',
      async click() {
        const config = await getConfig();

        const newHostname =
          (await prompt(
            {
              title: t('plugins.api-server.prompt.hostname.title'),
              label: t('plugins.api-server.prompt.hostname.label'),
              value: config.hostname,
              type: 'input',
              width: 380,
              ...promptOptions(),
            },
            window,
          )) ??
          config.hostname ??
          defaultAPIServerConfig.hostname;

        setConfig({ ...config, hostname: newHostname });
      },
    },
    {
      label: t('plugins.api-server.menu.port.label'),
      type: 'normal',
      async click() {
        const config = await getConfig();

        const newPort =
          (await prompt(
            {
              title: t('plugins.api-server.prompt.port.title'),
              label: t('plugins.api-server.prompt.port.label'),
              value: config.port,
              type: 'counter',
              counterOptions: { minimum: 0, maximum: 65565 },
              width: 380,
              ...promptOptions(),
            },
            window,
          )) ??
          config.port ??
          defaultAPIServerConfig.port;

        setConfig({ ...config, port: newPort });
      },
    },
    {
      label: t('plugins.api-server.menu.auth-strategy.label'),
      type: 'submenu',
      submenu: [
        {
          label: t(
            'plugins.api-server.menu.auth-strategy.submenu.auth-at-first.label',
          ),
          type: 'radio',
          checked: config.authStrategy === AuthStrategy.AUTH_AT_FIRST,
          click() {
            setConfig({ ...config, authStrategy: AuthStrategy.AUTH_AT_FIRST });
          },
        },
        {
          label: t('plugins.api-server.menu.auth-strategy.submenu.none.label'),
          type: 'radio',
          checked: config.authStrategy === AuthStrategy.NONE,
          click() {
            setConfig({ ...config, authStrategy: AuthStrategy.NONE });
          },
        },
      ],
    },
    {
      label: t("plugins.api-server.menu.websocket.label"),
      type: "submenu",
      submenu: [
        {
          label: t("plugins.api-server.menu.websocket.submenu.enabled.label"),
          type: "checkbox",
          checked: config.websocket,
          click(item) {
            if (!item.checked) {
              unregisterWebsocket();
            }

            setConfig({...config, websocket: item.checked})
          }
        },
        {
          label: t("plugins.api-server.menu.websocket.submenu.port.label"),
          type: "normal", 
          async click() {
            const config = await getConfig();
    
            const newPort =
              (await prompt(
                {
                  title: t('plugins.api-server.prompt.websocket.port.title'),
                  label: t('plugins.api-server.prompt.websocket.port.label'),
                  value: config.websocketPort,
                  type: 'counter',
                  counterOptions: { minimum: 0, maximum: 65565 },
                  width: 380,
                  ...promptOptions(),
                },
                window,
              )) ??
              config.websocketPort ??
              defaultAPIServerConfig.websocketPort;
    
            setConfig({ ...config, websocketPort: newPort });
          },
        }
      ]
    },
  ];
};
