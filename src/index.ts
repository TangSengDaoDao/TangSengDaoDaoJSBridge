import { AuthResp, ChannelInfo } from "./model";


export class Tsdd {

    private bridge: any

    initBridgeTimeout?: number

    config: Config = new Config();


    private setupWebViewJavascriptBridge(callback: any) {
        console.log("setupWebViewJavascriptBridge");
        const wd = window as any;
        if (wd.WebViewJavascriptBridge) {
            return callback(wd.WebViewJavascriptBridge);
        }
        if (wd.WVJBCallbacks) {
            return wd.WVJBCallbacks.push(callback);
        }
        wd.WVJBCallbacks = [callback];
        var WVJBIframe = document.createElement('iframe');
        WVJBIframe.style.display = 'none';
        WVJBIframe.src = 'https://__bridge_loaded__';
        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function () { document.documentElement.removeChild(WVJBIframe) }, 0)


    }

    //android 注册事件监听
    private connectWebViewJavascriptBridge(callback: any) {
        const wd = window as any;
        if (wd.WebViewJavascriptBridge) {
            callback(wd.WebViewJavascriptBridge)
        } else {
            document.addEventListener(
                'WebViewJavascriptBridgeReady'
                , function () {
                    callback(wd.WebViewJavascriptBridge)
                },
                false
            );
        }
    }

    ready(callback: (err?: Error) => void) {
        const self = this;
        this.initBridgeTimeout = setTimeout(() => {
            callback(new Error("init bridge timeout"));
        }, 1000);

        // ios
        this.setupWebViewJavascriptBridge(function (bridge: any) {
            console.log("setupWebViewJavascriptBridge callback");
            self.bridge = bridge;
            clearTimeout(self.initBridgeTimeout);
            callback();
        });

        // android
        this.connectWebViewJavascriptBridge(function (bridge: any) {
            console.log("connectWebViewJavascriptBridge callback");
            bridge.init(function (message:any, responseCallback:any) {
                responseCallback();
            });
            self.bridge = bridge;
            clearTimeout(self.initBridgeTimeout);
            callback();
        });
    }

    auth(): Promise<AuthResp> {
        return new Promise((resolve, reject) => {
            this.bridge.callHandler('auth', { "app_id": this.config.appID }, (res: any) => {
                const result = JSON.parse(res);
                if (result["error"]) {
                    reject(result["error"]);
                    return;
                }
                resolve(AuthResp.fromMap(result));
            });
        });
    }

    chooseConversation(): Promise<ChannelInfo> {
        return new Promise((resolve, reject) => {
            this.bridge.callHandler('chooseConversation', { "app_id": this.config.appID }, (res: any) => {
                const result = JSON.parse(res);
                resolve(ChannelInfo.fromMap(result));
            });
        });
    }
}

export class Config {
    appID?: string;
}

export const tsdd = new Tsdd();



