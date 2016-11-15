//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { shell } from 'electron';
import * as URL from 'url';
import * as QueryString from 'querystring';
import { InspectorActions, AddressBarActions } from './reducers';
import { getSettings, selectedActivity$, deselectActivity } from './settings';
import { Settings as ServerSettings } from '../types/serverSettingsTypes';
import * as log from './log';


export function navigate(url: string) {
    try {
        const parsed = URL.parse(url);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            shell.openExternal(url, { activate: true });
        } else if (parsed.protocol === "emulator:") {
            const args = QueryString.parse(parsed.query);
            if (parsed.host === 'inspect') {
                navigateInspectUrl(args);
            } else if (parsed.host === 'appsettings') {
                navigateAppSettingsUrl(args);
            } else if (parsed.host === 'botcreds') {
                navigateBotCredsUrl(args);
            }
        } else {
            // Ignore
        }
    } catch (e) {
        console.error(e);
    }
}

function navigateInspectUrl(args: string[]) {
    try {
        const encoded = args['obj'];
        const json = decodeURIComponent(encoded);
        const obj = JSON.parse(json);
        if (obj) {
            if (obj.id) {
                selectedActivity$().next({ id: obj.id });
            } else {
                selectedActivity$().next({});
            }
            InspectorActions.setSelectedObject({ activity: obj });
        } else {
            selectedActivity$().next({});
        }
    } catch (e) {
        selectedActivity$().next({});
        log.error(e.message);
        throw e;
    }
}

function navigateAppSettingsUrl(args: string[]) {
    try {
        AddressBarActions.showAppSettings();
    } catch (e) {
        log.error(e.message);
        throw e;
    }
}

function navigateBotCredsUrl(args: string[]) {
    try {
        args = args || [];
        if (!args.length) {
            const settings = getSettings();
            const activeBotId = settings.serverSettings.activeBot;
            if (activeBotId) {
                const activeBot = new ServerSettings(settings.serverSettings).botById(activeBotId);
                AddressBarActions.selectBot(activeBot);
            }
        } else {
            // todo
        }
        AddressBarActions.showBotCreds();
    } catch (e) {
        log.error(e.message);
        throw e;
    }
}