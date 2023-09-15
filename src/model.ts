
export class AuthResp {
    code?: string;

    static fromMap(map: any): AuthResp {
        const obj = new AuthResp();
        obj.code = map["code"];
        return obj;
    }
}

export class ChannelInfo {
    channelID?: string;
    channelType?: number;

    static fromMap(map: any): ChannelInfo {
        const obj = new ChannelInfo();
        obj.channelID = map["channelID"];
        obj.channelType = map["channelType"];
        return obj;
    }
}