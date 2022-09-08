"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
;
exports.config = {
    httpIp: "0.0.0.0",
    httpPort: 3000,
    httpPeerStale: 360000,
    mediasoup: {
        worker: {
            rtcMinPort: 40000,
            rtcMaxPort: 49999,
            logLevel: "debug",
            logTags: [
                "info",
                "ice",
                "dtls",
                "rtp",
                "srtp",
                "rtcp",
            ],
        },
        router: {
            mediaCodecs: [
                {
                    kind: "audio",
                    mimeType: "audio/opus",
                    clockRate: 48000,
                    channels: 2,
                },
            ],
        },
        webRtcTransport: {
            listenIps: [
                { ip: "127.0.0.1", announcedIp: undefined }
            ],
            initialAvailableOutgoingBitrate: 800000,
        },
    },
};
//# sourceMappingURL=config.js.map