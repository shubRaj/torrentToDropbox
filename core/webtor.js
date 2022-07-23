import WebTorrent from 'webtorrent-hybrid';
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import addQueue from './utils.js';

const execP = promisify(exec);
class TorClient {
    constructor() {
        this.client = new WebTorrent();
        this.odir = path.resolve("./downloads");
    }
    // uploadToDropbox(sourceDIR) {
    //     spawn("python3", ["core/dpbox.py", `${sourceDIR}`, "&"]);
    // }
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
                const { stdout, stderr } = await execP(`python3 core/dpbox.py "${path.join(this.odir, torrent.name)}"`);
                await addQueue();
            });
        });
    }
}

export { TorClient as WebTorClient };