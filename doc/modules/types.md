[@lsandini/cgmsim-lib - v0.1.8](../README.md) / types

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
- [UvaPatientType](types.md#uvapatienttype)

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

[Types.ts:35](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L35)

___

### Direction

Ƭ **Direction**: ``"DoubleDown"`` \| ``"SingleDown"`` \| ``"FortyFiveDown"`` \| ``"Flat"`` \| ``"FortyFiveUp"`` \| ``"SingleUp"`` \| ``"DoubleUp"``

Represents the direction of blood glucose change.

#### Defined in

[Types.ts:4](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L4)

___

### Entry

Ƭ **Entry**: [`EntryValueType`](types.md#entryvaluetype) & { `date`: `number` ; `dateString`: `string` ; `type`: ``"sgv"``  }

Represents a blood glucose entry with additional date information.

#### Defined in

[Types.ts:60](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L60)

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

[Types.ts:52](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L52)

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

[Types.ts:113](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L113)

___

### GenderType

Ƭ **GenderType**: ``"Male"`` \| ``"Female"``

Represents a gender type.

#### Defined in

[Types.ts:108](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L108)

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

[Types.ts:164](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L164)

___

### MainParamsUVA

Ƭ **MainParamsUVA**: `Object`

Represents main parameters for a UVA simulation.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `activities?` | [`Activity`](types.md#activity)[] |
| `defaultPatient` | [`UvaPatientType`](types.md#uvapatienttype) |
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

[Types.ts:145](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L145)

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

[Types.ts:27](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L27)

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

[Types.ts:76](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L76)

___

### ProfileParams

Ƭ **ProfileParams**: `Object`

Represents parameters for a profile.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `basal` | `number` \| { `time`: `string` ; `timeAsSecond?`: `number` ; `value`: `number`  }[] |

#### Defined in

[Types.ts:69](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L69)

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

[Types.ts:44](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L44)

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

[Types.ts:177](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L177)

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

[Types.ts:87](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L87)

___

### UserParams

Ƭ **UserParams**: `Object`

Represents user parameters.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `nsUrl` | `string` |

#### Defined in

[Types.ts:138](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L138)

___

### UvaPatientState

Ƭ **UvaPatientState**: `Object`

Represents the state of a UVA patient.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `Gp` | `number` | Glucose in plasma |
| `Gt` | `number` | Glucose in tissue |
| `I_` | `number` | Insulin delay compartment 1 |
| `Il` | `number` | Insulin in liver |
| `Ip` | `number` | Insulin in plasma |
| `Isc1` | `number` | Subcutaneous insulin in compartment 1 |
| `Isc2` | `number` | Subcutaneous insulin in compartment 2 |
| `Qgut` | `number` | Glucose mass in intestine |
| `Qsto1` | `number` | Carbs in stomach, solid phase |
| `Qsto2` | `number` | Carbs in stomach, liquid phase |
| `W` | `number` |  |
| `X` | `number` | Insulin in the interstitial fluid |
| `XL` | `number` | Insulin delay compartment 2 |
| `Y` | `number` | Increased energy consumption estimated through heart rate |
| `Z` | `number` | Exercise-induced changes in insulin sensitivity |

#### Defined in

[Types.ts:222](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L222)

___

### UvaPatientType

Ƭ **UvaPatientType**: `Object`

Represents parameters for a UVA simulation.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `A` | `number` | Factor for exercise-induced increase in insulin sensitivity |
| `BW` | `number` | Body weight. |
| `Fcns` | `number` | Glucose uptake by the brain and erythrocytes. |
| `Gpeq` | `number` | Steady-state of glucose in plasma. |
| `HEeq` | `number` | Steady-state hepatic extraction of insulin. |
| `HRb` | `number` | Heart rate at rest. |
| `HRmax` | `number` | Maximal heart rate (220-age). |
| `Km0` | `number` | Michaelis-Menten constant (offset). |
| `Tex` | `number` | Time constant for Z |
| `Thr` | `number` | Time constant for Y |
| `Tin` | `number` | Time constant for Z |
| `VG` | `number` | Distribution volume of glucose. |
| `VI` | `number` | Distribution volume of insulin. |
| `Vm0` | `number` | Michaelis-Menten constant (offset). |
| `Vmx` | `number` | Michaelis-Menten constant (slope). |
| `a` | `number` | Parameter for calculating Z |
| `beta` | `number` | Factor for exercise-induced increase in insulin-independent glucose clearance |
| `f` | `number` | Fraction of intestinal absorption. |
| `gamma` | `number` | Factor for exercise-induced increase in glucose uptake |
| `k1` | `number` | Rate parameter from Gp to Gt. |
| `k2` | `number` | Rate parameter from Gt to Gp. |
| `ka1` | `number` | Rate constant of nonmonomeric insulin absorption. |
| `ka2` | `number` | Rate constant of monomeric insulin absorption. |
| `kabs` | `number` | Rate constant of intestinal absorption. |
| `kd` | `number` | Rate constant of insulin dissociation. |
| `ke1` | `number` | Glomerular filtration rate. |
| `ke2` | `number` | Renal threshold of glucose. |
| `kgri` | `number` | Rate of grinding. |
| `ki` | `number` | Delay between insulin signal and insulin action. |
| `kmax` | `number` | Maximal emptying rate of stomach. |
| `kmin` | `number` | Minimal emptying rate of stomach. |
| `kp1` | `number` | Extrapolated at zero glucose and insulin. |
| `kp2` | `number` | Liver glucose effectiveness. |
| `kp3` | `number` | Amplitude of insulin action on the liver. |
| `kp4` | `number` | Amplitude of portal insulin action on the liver. |
| `m1` | `number` | Rate parameter from Il to Ip. |
| `m2` | `number` | Rate parameter from Ip to Il. |
| `m4` | `number` | Rate parameter from Ip to periphery. |
| `m5` | `number` | Rate parameter of hepatic extraction (slope). |
| `m6` | `number` | Rate parameter of hepatic extraction (offset). |
| `n` | `number` | Parameter for calculating Z |
| `p2u` | `number` | Insulin action on the peripheral glucose utilization. |

#### Defined in

[Types.ts:287](https://github.com/lsandini/cgmsim-lib/blob/c3ccd62/src/Types.ts#L287)