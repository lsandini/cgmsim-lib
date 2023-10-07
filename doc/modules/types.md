[@lsandini/cgmsim-lib](../README.md) / [Exports](../modules.md) / types

# Module: types

## Table of contents

### Type Aliases

- [Activity](types.md#activity)
- [Direction](types.md#direction)
- [Entry](types.md#entry)
- [EntryValueType](types.md#entryvaluetype)
- [EnvParam](types.md#envparam)
- [GenderType](types.md#gendertype)
- [MainParams](types.md#mainparams)
- [MainParamsUVA](types.md#mainparamsuva)
- [Note](types.md#note)
- [Profile](types.md#profile)
- [ProfileParams](types.md#profileparams)
- [Sgv](types.md#sgv)
- [SimulationResult](types.md#simulationresult)
- [Treatment](types.md#treatment)
- [UserParams](types.md#userparams)
- [UvaPatientState](types.md#uvapatientstate)

## Type Aliases

### Activity

Ƭ **Activity**: `Object`

Represents physical activity data.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `created_at` | `string` |
| `heartRate?` | `number` |
| `steps?` | `number` |

#### Defined in

[Types.ts:35](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L35)

___

### Direction

Ƭ **Direction**: ``"DoubleDown"`` \| ``"SingleDown"`` \| ``"FortyFiveDown"`` \| ``"Flat"`` \| ``"FortyFiveUp"`` \| ``"SingleUp"`` \| ``"DoubleUp"``

Represents the direction of blood glucose change.

#### Defined in

[Types.ts:4](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L4)

___

### Entry

Ƭ **Entry**: [`EntryValueType`](types.md#entryvaluetype) & { `date`: `number` ; `dateString`: `string` ; `type`: ``"sgv"``  }

Represents a blood glucose entry with additional date information.

#### Defined in

[Types.ts:60](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L60)

___

### EntryValueType

Ƭ **EntryValueType**: `Object`

Represents a blood glucose entry value type.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `direction` | `string` |
| `sgv` | `number` |

#### Defined in

[Types.ts:52](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L52)

___

### EnvParam

Ƭ **EnvParam**: `Object`

Represents environmental parameters.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `AGE` | `string` |
| `CARBS_ABS_TIME` | `string` |
| `CR` | `string` |
| `DIA` | `string` |
| `GENDER` | [`GenderType`](types.md#gendertype) |
| `ISF` | `string` |
| `SEED?` | `string` |
| `TP` | `string` |
| `WEIGHT` | `string` |

#### Defined in

[Types.ts:113](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L113)

___

### GenderType

Ƭ **GenderType**: ``"Male"`` \| ``"Female"``

Represents a gender type.

#### Defined in

[Types.ts:108](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L108)

___

### MainParams

Ƭ **MainParams**: `Object`

Represents main parameters for a simulation.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `activities?` | [`Activity`](types.md#activity)[] |
| `entries` | [`Sgv`](types.md#sgv)[] |
| `env` | [`EnvParam`](types.md#envparam) |
| `profiles` | [`Profile`](types.md#profile)[] |
| `pumpEnabled?` | `boolean` |
| `treatments` | [`Treatment`](types.md#treatment)[] |
| `user` | [`UserParams`](types.md#userparams) |

#### Defined in

[Types.ts:163](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L163)

___

### MainParamsUVA

Ƭ **MainParamsUVA**: `Object`

Represents main parameters for a UVA simulation.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `activities?` | [`Activity`](types.md#activity)[] |
| `entries` | [`Sgv`](types.md#sgv)[] |
| `env` | { `AGE`: `string` ; `GENDER`: [`GenderType`](types.md#gendertype) ; `WEIGHT`: `string`  } |
| `env.AGE` | `string` |
| `env.GENDER` | [`GenderType`](types.md#gendertype) |
| `env.WEIGHT` | `string` |
| `lastState` | [`UvaPatientState`](types.md#uvapatientstate) |
| `profiles` | [`Profile`](types.md#profile)[] |
| `pumpEnabled` | `boolean` |
| `treatments` | [`Treatment`](types.md#treatment)[] |
| `user` | [`UserParams`](types.md#userparams) |

#### Defined in

[Types.ts:145](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L145)

___

### Note

Ƭ **Note**: `Object`

Represents a note with associated notes.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `notes` | `string` |
| `type` | ``"Note"`` |

#### Defined in

[Types.ts:27](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L27)

___

### Profile

Ƭ **Profile**: `Object`

Represents a profile with associated profile parameters.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `defaultProfile` | `string` |
| `startDate` | `string` |
| `store` | { `[profileName: string]`: [`ProfileParams`](types.md#profileparams);  } |

#### Defined in

[Types.ts:76](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L76)

___

### ProfileParams

Ƭ **ProfileParams**: `Object`

Represents parameters for a profile.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `basal` | `number` \| { `time`: `string` ; `timeAsSecond?`: `number` ; `value`: `number`  }[] |

#### Defined in

[Types.ts:69](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L69)

___

### Sgv

Ƭ **Sgv**: `Object`

Represents a blood glucose entry.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `mills` | `number` |
| `sgv` | `number` |

#### Defined in

[Types.ts:44](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L44)

___

### SimulationResult

Ƭ **SimulationResult**: `Object`

Represents the result of a simulation.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `activityFactor` | `number` |
| `basalActivity` | `number` |
| `bolusActivity` | `number` |
| `carbsActivity` | `number` |
| `deltaMinutes` | `number` |
| `isf` | { `constant`: `number` ; `dynamic`: `number`  } |
| `isf.constant` | `number` |
| `isf.dynamic` | `number` |
| `liverActivity` | `number` |
| `sgv` | `number` |

#### Defined in

[Types.ts:176](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L176)

___

### Treatment

Ƭ **Treatment**: `Object`

Represents treatment data.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `absolute?` | `any` |
| `carbs?` | `number` |
| `created_at` | `string` |
| `duration?` | `number` |
| `eventType?` | `string` |
| `insulin?` | `number` |
| `notes?` | `string` |

#### Defined in

[Types.ts:87](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L87)

___

### UserParams

Ƭ **UserParams**: `Object`

Represents user parameters.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `nsUrl` | `string` |

#### Defined in

[Types.ts:138](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L138)

___

### UvaPatientState

Ƭ **UvaPatientState**: `Object`

Represents the state of a UVA patient.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `Gp` | `number` |
| `Gt` | `number` |
| `I_` | `number` |
| `Il` | `number` |
| `Ip` | `number` |
| `Isc1` | `number` |
| `Isc2` | `number` |
| `Qgut` | `number` |
| `Qsto1` | `number` |
| `Qsto2` | `number` |
| `W` | `number` |
| `X` | `number` |
| `XL` | `number` |
| `Y` | `number` |
| `Z` | `number` |

#### Defined in

[Types.ts:218](https://github.com/lsandini/cgmsim-lib/blob/0e15ed0/src/Types.ts#L218)
