import WebTorrent from 'webtorrent-hybrid';
import path from "node:path";
import { spawn } from 'node:child_process';
import { topseeds } from './yts.js';
class TorClient {
    constructor() {
        this.client = new WebTorrent();
        this.odir = path.resolve("./downloads");
    }
    uploadToDropbox(sourceDIR) {
        const pprocess = spawn("python3", ["core/dpbox.py", `${sourceDIR}`, "&"]);
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
                this.uploadToDropbox(path.join(this.odir, torrent.name));
                torrent.destroy();
                await addQueue();
            });
        });
    }
}
const client = new TorClient();
async function addQueue() {
    let movie = (await topseeds.next()).value;
    client.addMagnet(`magnet:?xt=urn:btih:${movie.torrents[0].hash}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=http%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce`);
}
export { TorClient as WebTorClient, addQueue };