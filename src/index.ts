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

    /**
     * Validates the MEA ID is within acceptable range.
     * @param meaId - The MEA ID to validate.
     * @throws {Error} If MEA ID is not an integer in range 1-4.
     */
    private validateMEAId(meaId: number): void {
        if (!Number.isInteger(meaId) || meaId < 1 || meaId > 4) {
            throw new Error('MEA ID must be an integer in the range 1-4');
        }
    }

    /**
     * Records a single sample of live MEA data.
     * @param meaId - The MEA ID to use (1-4). Defaults to 1.
     * @throws {Error} If MEA ID is not an integer in range 1-4.
     * @returns Promise that resolves with the recorded live data containing timestamp and 32x4096 electrode data array.
     * @remarks
     * The data processing flow:
     * 1. Connects to socket server
     * 2. Selects MEA device (1-4) which determines which 32 electrodes to read
     * 3. Receives buffer containing all MEA data (128 electrodes x 4096 samples)
     * 4. Extracts specific 32 electrode chunk based on MEA ID
     * 5. Reshapes data into 32x4096 array (32 electrodes, 4096 samples each)
     */
    public async recordSample(meaId: number = 1): Promise<LiveData> {
        this.validateMEAId(meaId);
        
        return new Promise<LiveData>((resolve, reject) => {
            // Create new socket connection for this sample
            const sio = io(MEA_SERVER_URL);

            // Set up event handlers before connecting to prevent race conditions
            sio.on("connect", () => {
                console.log("Connected to server");
                // Server expects 0-based MEA index (0-3)
                sio.emit("meaid", meaId - 1);
            });

            sio.on("livedata", (data: any) => {                
                // Convert ArrayBuffer to Float32Array for numerical processing
                const raw = new Float32Array(data.buffer);
                
                // Calculate starting index for this MEA's 32 electrodes
                // Each MEA has 32 electrodes, each with 4096 samples
                const startIdx = (meaId - 1) * 32 * 4096;
                
                // Reshape the data into 32x4096 array
                // Each row represents one electrode's 4096 samples
                const elecData = Array.from({ length: 32 }, (_, i) =>
                    Array.from(raw.slice(startIdx + i * 4096, startIdx + (i + 1) * 4096))
                );

                // Clean up socket connection
                sio.disconnect();
                resolve({ timestamp: new Date(), data: elecData });
            });

            // Handle connection errors
            sio.on("connect_error", (error) => {
                sio.disconnect();
                reject(new Error(`Failed to connect: ${error.message}`));
            });

            // Initiate connection after all handlers are set up
            sio.connect();
        });
    }

    /**
     * Records multiple samples of live MEA data.
     * @param meaId - The MEA ID to use (1-4). Defaults to 1.
     * @param n - Number of samples to record. Defaults to 10.
     * @throws {Error} If MEA ID is not an integer in range 1-4.
     * @returns Promise that resolves with array of recorded live data samples.
     */
    public async recordNSamples(meaId: number = 1, n: number = 10): Promise<LiveData[]> {
        this.validateMEAId(meaId);

        const data: LiveData[] = [];
        for (let i = 0; i < n; i++) {
            const sample = await this.recordSample(meaId);
            data.push(sample);
        }
        return data;
    }
}