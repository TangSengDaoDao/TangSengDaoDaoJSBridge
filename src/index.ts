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

    call<T>(method: string, params: any) {
        if (this.bridge) {
            const self = this
            return new Promise<T>(function (resolve, reject) {
                self.bridge.callHandler(method, params ? params : undefined, function (response: string) {
                    let result = JSON.parse(response)
                    if (result.err_code == undefined || result.err_code == 200) { // 正确请求
                        resolve(result)
                    } else {
                        // 错误
                        reject(result)
                    }
                })
            })
        }
        return Promise.reject("bridge not ready");
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
            console.log("connectWebViewJavascriptBridge callback-->",bridge);
            self.bridge = bridge;
            clearTimeout(self.initBridgeTimeout);
            bridge.init(function (message: any, responseCallback: any) {
                responseCallback();
            });
            callback();
        });
    }

    auth(): Promise<AuthResp> {
        return this.call<AuthResp>('auth', { "app_id": this.config.appID })?.then((res: any) => {
            return AuthResp.fromMap(res);
        });
    }

    chooseConversation(): Promise<ChannelInfo> {

        return this.call<ChannelInfo>('chooseConversation', { "app_id": this.config.appID })?.then((res: any) => {
            return ChannelInfo.fromMap(res);
        })
    }
}

export class Config {
    appID?: string;
}

export const tsdd = new Tsdd();



