# FinalSpark TS

This is a minimal TypeScript library that provides an interface to handle live MEA data.

## Installation

You can install the library using npm:

```
npm install @maidenlabs/finalspark-ts
```

## Usage

To use the library, import the `LiveMEA` class from the library:

```typescript
import { LiveMEA } from '@maidenlabs/finalspark-ts';

const liveMEA = new LiveMEA(1);
liveMEA.recordSample().then((data) => {
  console.log(data); // Outputs the recorded live data sample
});
```

## API

### `LiveMEA`

#### `constructor(meaId: number = 1)`

Creates a new instance of the `LiveMEA` class.

- `meaId` (optional): The MEA ID to use (default is 1).

#### `recordSample(): Promise<LiveData>`

Records a single sample of live data.

#### `recordNSamples(n: number): Promise<LiveData[]>`

Records multiple samples of live data.

- `n`: The number of samples to record.

## License

This project is licensed under the MIT License.