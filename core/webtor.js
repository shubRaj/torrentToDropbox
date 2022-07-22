import WebTorrent from 'webtorrent-hybrid';
import path from "node:path";
import { spawn } from 'node:child_process';
import addQueue from './utils.js';
class TorClient {
    constructor() {
        this.client = new WebTorrent();
        this.odir = path.resolve("./downloads");
    }
    uploadToDropbox(sourceDIR) {
        const pprocess = spawn("python3", ["core/dpbox.py", `${sourceDIR}`,"&"]);
    }
    addMagnet(magnetURI) {
        this.client.add(magnetURI, { path: this.odir, destroyStoreOnDestroy: false, storeCacheSlots: 0 }, async (torrent) => {
            console.log('Client is downloading:', torrent.infoHash);
            torrent.on("error", async () => {
                torrent.destroy();
                await addQueue();
            })
            torrent.on('noPeers', async () => {
                torrent.destroy();
                await addQueue();
            })
            torrent.on("done", async () => {
                torrent.destroy();
                this.uploadToDropbox(path.join(this.odir, torrent.name));
                await addQueue();
            });
        });
    }
}

export { TorClient as WebTorClient };