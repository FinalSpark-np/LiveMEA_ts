![NPM Version](https://img.shields.io/npm/v/%40maidenlabs%2Ffinalspark-ts)

# FinalSpark TS

This is a minimal TypeScript library that provides an interface to handle live MEA data.

## Authors: Maiden Labs [[github](https://github.com/maidenlabs)]

Maiden Labs is a non profit user research lab committed to open-source scientific discovery through biocomputing. Utilizing decentralized technologies, we improve access to biocomputing research, advancing interdisciplinary AI and biocomputing related efforts for greater scientific impact and innovation.

## Installation

You can install the library using npm:

```bash
npm install @maidenlabs/finalspark-ts
```

## Usage

To use the library, import the `LiveMEA` class from the library:

```typescript
import { LiveMEA } from '@maidenlabs/finalspark-ts';

// Create instance
const liveMEA = new LiveMEA();

// Record a single sample of MEA 1
liveMEA.recordSample(1)
  .then((data) => {
    console.log(data); // Contains timestamp and 32x4096 electrode data array
  });

// Record multiple samples of MEA 1
liveMEA.recordNSamples(1, 10)
  .then((samples) => {
    console.log(samples); // Array of samples, each with timestamp and electrode data
  });
```

## API

### `LiveMEA`

The main class for interacting with live MEA data from the FinalSpark service.

#### Methods

##### `recordSample(meaId?: number): Promise<LiveData>`

Records a single sample of live MEA data.

- `meaId` (optional): The MEA ID to use (1-4). Defaults to 1.
- Returns: Promise resolving to `LiveData` containing:
  - `timestamp`: Date object when the sample was recorded
  - `data`: 32x4096 array where each row represents one electrode's samples

##### `recordNSamples(meaId?: number, n?: number): Promise<LiveData[]>`

Records multiple samples of live MEA data.

- `meaId` (optional): The MEA ID to use (1-4). Defaults to 1.
- `n` (optional): Number of samples to record. Defaults to 10.
- Returns: Promise resolving to array of `LiveData` objects

#### Types

```typescript
interface LiveData {
    timestamp: Date;
    data: number[][];  // 32x4096 array
}
```

#### Error Handling

The methods will throw errors in these cases:
- Invalid MEA ID (must be 1-4)
- Connection failures
- Server timeout


## License

This project is licensed under the MIT License.
