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
        const pprocess = spawn("python3", ["core/dpbox.py", `${sourceDIR}`, "&"]);
        pprocess.on("close", async (code) => {
            await addQueue();
        })
    }
    addMagnet(magnetURI) {
        this.client.add(magnetURI, { path: this.odir, destroyStoreOnDestroy: false, storeCacheSlots: 0 }, async (torrent) => {
            console.log(`Started downloading ${torrent.name}`);
            torrent.on("download", (bytes) => {
                let downloadSpeed = (torrent.downloadSpeed/(1024*1024)).toFixed(2);
                if (downloadSpeed < 0.2){
                    torrent.emit("noPeers");
                }
                console.log(`Downloading ${torrent.name}\tProgress: ${torrent.progress.toFixed(2)}\tSpeed: ${downloadSpeed}`);
            })
            console.log('Client is downloading:', torrent.infoHash);
            torrent.on("error", async () => {
                torrent.destroy();
                await addQueue();
            })
            torrent.on('noPeers', async () => {
                console.log(`Downloaded Aborted no/weak Peers Found`);
                torrent.destroy();
                await addQueue();
            })
            torrent.on("done", async () => {
                console.log(`Done downloading ${torrent.name}`);
                torrent.destroy();
                this.uploadToDropbox(path.join(this.odir, torrent.name));
            });
        });
    }
}

export { TorClient as WebTorClient };