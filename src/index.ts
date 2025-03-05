import { io, Socket } from 'socket.io-client';

/**
 * Interface to define the structure of live data.
 */
export interface LiveData {
    /** Timestamp of the data */
    timestamp: Date;
    /** 2D array of numerical data */
    data: number[][];
}

/** URL of the MEA server */
export const MEA_SERVER_URL = "https://livemeaservice2.alpvision.com";

/**
 * Class to handle live MEA data.
 */
export class LiveMEA {
    private sio: Socket; // Socket.IO client instance
    private meaId: number; // MEA ID

    /**
     * Constructor to initialize the MEA ID and Socket.IO client.
     * @param meaId - The MEA ID to use (default is 1).
     */
    constructor(meaId: number = 1) {
        this.meaId = meaId;
        this.sio = io(MEA_SERVER_URL); // Connect to the MEA server
    }

    /**
     * Private method to listen for socket events and process live data.
     * @returns A promise that resolves with the live data.
     */
    private async listenSocketEvents(): Promise<LiveData> {
        return new Promise((resolve) => {
            // Listen for "livedata" event from the server
            this.sio.on("livedata", (data: any) => {
                const buffer = data.buffer;
                const elecData = new Float32Array(buffer).reduce((acc, val, idx) => {
                    const row = Math.floor(idx / 4096);
                    if (!acc[row]) acc[row] = [];
                    acc[row].push(val);
                    return acc;
                }, [] as number[][]);

                resolve({ timestamp: new Date(), data: elecData });
            });

            this.sio.connect();
            this.sio.emit("meaid", this.meaId - 1);
        });
    }

    /**
     * Public method to record a single sample of live data.
     * @returns A promise that resolves with the recorded live data.
     */
    public async recordSample(): Promise<LiveData> {
        const sample = await this.listenSocketEvents();
        this.sio.disconnect();
        return sample;
    }

    /**
     * Public method to record multiple samples of live data.
     * @param n - The number of samples to record.
     * @returns A promise that resolves with an array of recorded live data.
     */
    public async recordNSamples(n: number): Promise<LiveData[]> {
        const data: LiveData[] = [];
        for (let i = 0; i < n; i++) {
            const sample = await this.listenSocketEvents();
            data.push(sample);
        }
        this.sio.disconnect();
        return data;
    }
}