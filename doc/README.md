@lsandini/cgmsim-lib

# @lsandini/cgmsim-lib - v0.2.1

## Table of contents

### Modules

- [types](modules/types.md)

### Functions

- [arrows](README.md#arrows)
- [downloads](README.md#downloads)
- [loadActivity](README.md#loadactivity)
- [simulator](README.md#simulator)
- [simulatorUVA](README.md#simulatoruva)
- [uploadActivity](README.md#uploadactivity)
- [uploadEntries](README.md#uploadentries)
- [uploadLogs](README.md#uploadlogs)
- [uploadNotes](README.md#uploadnotes)

## Functions

### arrows

▸ **arrows**(`sgvLast`, `sgv1`, `sgv2`, `sgv3`): `Object`

Calculates the direction of blood glucose change based on recent data.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sgvLast` | `number` | The most recent blood glucose value. |
| `sgv1` | `number` | Blood glucose value 5 minutes ago. |
| `sgv2` | `number` | Blood glucose value 10 minutes ago. |
| `sgv3` | `number` | Blood glucose value 15 minutes ago. |

#### Returns

`Object`

An object containing the direction of blood glucose change and the variation.

| Name | Type |
| :------ | :------ |
| `direction` | [`Direction`](modules/types.md#direction) |
| `sgvdir` | `number` |

**`Example`**

```ts
// Calculate blood glucose direction based on recent data
const sgvLast = 120;
const sgv1 = 115;
const sgv2 = 110;
const sgv3 = 105;

const result = calculateGlucoseDirection(sgvLast, sgv1, sgv2, sgv3);
console.log("Blood glucose direction:", result.direction);
console.log("Blood glucose variation:", result.sgvdir);
```

#### Defined in

[arrows.ts:22](https://github.com/lsandini/cgmsim-lib/blob/71e7a50/src/arrows.ts#L22)

___

### downloads

▸ **downloads**(`nsUrl`, `apiSecret`): `Promise`<{ `entries`: [`Sgv`](modules/types.md#sgv)[] ; `profiles`: [`NSProfile`](modules/types.md#nsprofile)[] ; `treatments`: [`NSTreatment`](modules/types.md#nstreatment)[]  }\>

Downloads data from the Nightscout API, including treatments, profiles, and entries.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `nsUrl` | `string` | Nightscout URL. |
| `apiSecret` | `string` | Nightscout API secret. |

#### Returns

`Promise`<{ `entries`: [`Sgv`](modules/types.md#sgv)[] ; `profiles`: [`NSProfile`](modules/types.md#nsprofile)[] ; `treatments`: [`NSTreatment`](modules/types.md#nstreatment)[]  }\>

A promise that resolves with downloaded data.

**`Example`**

```ts
// Download data from Nightscout API
const apiUrl = "https://nightscout.example.com";
const apiSecret = "apiSecret123";

downloads(apiUrl, apiSecret)
  .then((downloadedData) => {
    console.log("Downloaded data:", downloadedData);
  })
  .catch((error) => {
    console.error("Error downloading data:", error);
  });
```

#### Defined in

[downloads.ts:34](https://github.com/lsandini/cgmsim-lib/blob/71e7a50/src/downloads.ts#L34)

___

### loadActivity

▸ **loadActivity**(`nsUrl`, `apiSecret`, `fromUtcString?`): `Promise`<([`Note`](modules/types.md#note) \| [`Activity`](modules/types.md#activity) \| [`Entry`](modules/types.md#entry))[]\>

Loads activity data from the Nightscout API based on optional time filter.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `nsUrl` | `string` | `undefined` | Nightscout URL. |
| `apiSecret` | `string` | `undefined` | Nightscout API secret. |
| `fromUtcString` | `string` | `null` | Optional UTC timestamp to filter data from. |

#### Returns

`Promise`<([`Note`](modules/types.md#note) \| [`Activity`](modules/types.md#activity) \| [`Entry`](modules/types.md#entry))[]\>

A promise that resolves with the loaded activity data.

**`Example`**

```ts
// Load activity data from Nightscout
const apiUrl = "https://nightscout.example.com";
const apiSecret = "apiSecret123";
const fromDate = "2023-01-01T00:00:00.000Z"; // Optional UTC timestamp filter

loadActivityData(apiUrl, apiSecret, fromDate)
  .then((activityData) => {
    console.log("Loaded activity data:", activityData);
  })
  .catch((error) => {
    console.error("Error loading activity data:", error);
  });
```

#### Defined in

[load-activity.ts:23](https://github.com/lsandini/cgmsim-lib/blob/71e7a50/src/load-activity.ts#L23)

___

### simulator

▸ **simulator**(`params`): [`SimulationResult`](modules/types.md#simulationresult)

Simulation module for blood glucose data calculation.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MainParams`](modules/types.md#mainparams) | Main parameters for running the simulation. |

#### Returns

[`SimulationResult`](modules/types.md#simulationresult)

Simulation result containing blood glucose data and other parameters.

#### Defined in

[CGMSIMsimulator.ts:19](https://github.com/lsandini/cgmsim-lib/blob/71e7a50/src/CGMSIMsimulator.ts#L19)

___

### simulatorUVA

▸ **simulatorUVA**(`params`): `Object`

Simulates blood glucose levels in response to various parameters and inputs.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `params` | [`MainParamsUVA`](modules/types.md#mainparamsuva) | Main parameters for running the simulation. |

#### Returns

`Object`

Simulation result containing blood glucose data and patient state.

| Name | Type |
| :------ | :------ |
| `sgv` | `number` |
| `state` | { `Gp`: `number` ; `Gt`: `number` ; `I_`: `number` ; `Il`: `number` ; `Ip`: `number` ; `Isc1`: `number` ; `Isc2`: `number` ; `Qgut`: `number` ; `Qsto1`: `number` ; `Qsto2`: `number` ; `W`: `number` ; `X`: `number` ; `XL`: `number` ; `Y`: `number` ; `Z`: `number`  } |
| `state.Gp` | `number` |
| `state.Gt` | `number` |
| `state.I_` | `number` |
| `state.Il` | `number` |
| `state.Ip` | `number` |
| `state.Isc1` | `number` |
| `state.Isc2` | `number` |
| `state.Qgut` | `number` |
| `state.Qsto1` | `number` |
| `state.Qsto2` | `number` |
| `state.W` | `number` |
| `state.X` | `number` |
| `state.XL` | `number` |
| `state.Y` | `number` |
| `state.Z` | `number` |

**`Example`**

```ts
// Run a blood glucose simulation with specified parameters
const simulationParams = {
  env: {
    WEIGHT: "70",
    AGE: "35",
    GENDER: "Male",
    // ... other environment parameters ...
  },
  treatments: [
    // ... treatment data ...
  ],
  profiles: [
    // ... profile data ...
  ],
  lastState: {
    // ... patient state data ...
  },
  entries: [
    // ... blood glucose entry data ...
  ],
  pumpEnabled: true,
  activities: [
    // ... activity data ...
  ],
  user: {
    nsUrl: "https://nightscout.example.com",
    // ... other user-related data ...
  },
};

const simulationResult = simulator(simulationParams);
console.log("Blood glucose simulation result:", simulationResult);
```

#### Defined in

[UVAsimulator.ts:57](https://github.com/lsandini/cgmsim-lib/blob/71e7a50/src/UVAsimulator.ts#L57)

___

### uploadActivity

▸ **uploadActivity**(`activity`, `nsUrl`, `apiSecret`): `Promise`<`void`\>

Uploads activity data to the Nightscout API.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `activity` | [`Activity`](modules/types.md#activity) | Activity data to upload. |
| `nsUrl` | `string` | Nightscout URL. |
| `apiSecret` | `string` | Nightscout API secret. |

#### Returns

`Promise`<`void`\>

A promise that resolves when the upload is complete.

**`Example`**

```ts
// Upload activity data to Nightscout
const activityData = {
  // ... activity data ...
};

uploadActivity(activityData, "https://nightscout.example.com", "apiSecret123")
  .then(() => {
    console.log("Activity data uploaded successfully.");
  })
  .catch((error) => {
    console.error("Error uploading activity data:", error);
  });
```

#### Defined in

[upload.ts:124](https://github.com/lsandini/cgmsim-lib/blob/71e7a50/src/upload.ts#L124)

___

### uploadEntries

▸ **uploadEntries**(`cgmsim`, `nsUrl`, `apiSecret`): `Promise`<`void`\>

Uploads entries (e.g., blood glucose readings) to the Nightscout API.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cgmsim` | [`EntryValueType`](modules/types.md#entryvaluetype) | The entry data to upload. |
| `nsUrl` | `string` | Nightscout URL. |
| `apiSecret` | `string` | Nightscout API secret. |

#### Returns

`Promise`<`void`\>

A promise that resolves when the upload is complete.

**`Example`**

```ts
// Upload a blood glucose entry to Nightscout
const glucoseEntry = {
  // ... glucose entry data ...
};

uploadEntries(glucoseEntry, "https://nightscout.example.com", "apiSecret123")
  .then(() => {
    console.log("Blood glucose entry uploaded successfully.");
  })
  .catch((error) => {
    console.error("Error uploading blood glucose entry:", error);
  });
```

#### Defined in

[upload.ts:87](https://github.com/lsandini/cgmsim-lib/blob/71e7a50/src/upload.ts#L87)

___

### uploadLogs

▸ **uploadLogs**(`simResult`, `nsUrl`, `apiSecret`): `Promise`<`void`\>

Uploads logs to the Nightscout API.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `simResult` | [`SimulationResult`](modules/types.md#simulationresult) & { `notes`: `string`  } | Simulation result with attached notes. |
| `nsUrl` | `string` | Nightscout URL. |
| `apiSecret` | `string` | Nightscout API secret. |

#### Returns

`Promise`<`void`\>

A promise that resolves when the upload is complete.

**`Example`**

```ts
// Upload simulation logs to Nightscout
const simulationResult = {
  // ... simulation result data ...
  notes: "Simulation complete",
};

uploadLogs(simulationResult, "https://nightscout.example.com", "apiSecret123")
  .then(() => {
    console.log("Logs uploaded successfully.");
  })
  .catch((error) => {
    console.error("Error uploading logs:", error);
  });
```

#### Defined in

[upload.ts:51](https://github.com/lsandini/cgmsim-lib/blob/71e7a50/src/upload.ts#L51)

___

### uploadNotes

▸ **uploadNotes**(`notes`, `nsUrl`, `apiSecret`): `Promise`<`void`\>

Uploads notes to the Nightscout API.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `notes` | `string` | The notes to upload. |
| `nsUrl` | `string` | Nightscout URL. |
| `apiSecret` | `string` | Nightscout API secret. |

#### Returns

`Promise`<`void`\>

A promise that resolves when the upload is complete.

**`Example`**

```ts
// Upload a note to Nightscout
uploadNotes("Important note", "https://nightscout.example.com", "apiSecret123")
  .then(() => {
    console.log("Note uploaded successfully.");
  })
  .catch((error) => {
    console.error("Error uploading note:", error);
  });
```

#### Defined in

[upload.ts:24](https://github.com/lsandini/cgmsim-lib/blob/71e7a50/src/upload.ts#L24)
