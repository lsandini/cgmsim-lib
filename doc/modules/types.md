[@lsandini/cgmsim-lib - v0.2.1](../README.md) / types

# Module: types

## Table of contents

### Type Aliases

- [Activity](types.md#activity)
- [AnnouncementTreatment](types.md#announcementtreatment)
- [CarbCorrectionTreatment](types.md#carbcorrectiontreatment)
- [Direction](types.md#direction)
- [Entry](types.md#entry)
- [EntryValueType](types.md#entryvaluetype)
- [EnvParam](types.md#envparam)
- [GenderType](types.md#gendertype)
- [MainParams](types.md#mainparams)
- [MainParamsUVA](types.md#mainparamsuva)
- [MealBolusTreatment](types.md#mealbolustreatment)
- [NSProfile](types.md#nsprofile)
- [NSTreatment](types.md#nstreatment)
- [Note](types.md#note)
- [ProfileParams](types.md#profileparams)
- [ProfileSwitchTreatment](types.md#profileswitchtreatment)
- [Sgv](types.md#sgv)
- [SimulationResult](types.md#simulationresult)
- [TDateISODate](types.md#tdateisodate)
- [TDateISOTime](types.md#tdateisotime)
- [TDay](types.md#tday)
- [THours](types.md#thours)
- [TMilliseconds](types.md#tmilliseconds)
- [TMinutes](types.md#tminutes)
- [TMonth](types.md#tmonth)
- [TSeconds](types.md#tseconds)
- [TYear](types.md#tyear)
- [TempBasalTreatment](types.md#tempbasaltreatment)
- [TypeDateISO](types.md#typedateiso)
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
| `created_at` | [`TypeDateISO`](types.md#typedateiso) |
| `heartRate?` | `number` |
| `steps?` | `number` |

#### Defined in

[Types.ts:38](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L38)

___

### AnnouncementTreatment

Ƭ **AnnouncementTreatment**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `created_at` | [`TypeDateISO`](types.md#typedateiso) |
| `eventType` | ``"Announcement"`` |
| `notes` | `string` |

#### Defined in

[Types.ts:115](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L115)

___

### CarbCorrectionTreatment

Ƭ **CarbCorrectionTreatment**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `carbs` | `number` |
| `created_at` | [`TypeDateISO`](types.md#typedateiso) |
| `eventType` | ``"Carb Correction"`` |

#### Defined in

[Types.ts:109](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L109)

___

### Direction

Ƭ **Direction**: ``"DoubleDown"`` \| ``"SingleDown"`` \| ``"FortyFiveDown"`` \| ``"Flat"`` \| ``"FortyFiveUp"`` \| ``"SingleUp"`` \| ``"DoubleUp"``

Represents the direction of blood glucose change.

#### Defined in

[Types.ts:7](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L7)

___

### Entry

Ƭ **Entry**: [`EntryValueType`](types.md#entryvaluetype) & { `date`: `number` ; `dateString`: `string` ; `type`: ``"sgv"``  }

Represents a blood glucose entry with additional date information.

#### Defined in

[Types.ts:63](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L63)

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

[Types.ts:55](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L55)

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

[Types.ts:168](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L168)

___

### GenderType

Ƭ **GenderType**: ``"Male"`` \| ``"Female"``

Represents a gender type.

#### Defined in

[Types.ts:163](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L163)

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
| `profiles` | [`NSProfile`](types.md#nsprofile)[] |
| `pumpEnabled?` | `boolean` |
| `treatments` | [`NSTreatment`](types.md#nstreatment)[] |
| `user` | [`UserParams`](types.md#userparams) |

#### Defined in

[Types.ts:221](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L221)

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
| `profiles` | [`NSProfile`](types.md#nsprofile)[] |
| `pumpEnabled` | `boolean` |
| `treatments` | [`NSTreatment`](types.md#nstreatment)[] |
| `user` | [`UserParams`](types.md#userparams) |

#### Defined in

[Types.ts:202](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L202)

___

### MealBolusTreatment

Ƭ **MealBolusTreatment**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `carbs` | `number` |
| `created_at` | [`TypeDateISO`](types.md#typedateiso) |
| `eventType` | ``"Meal Bolus"`` |
| `insulin` | `number` |

#### Defined in

[Types.ts:87](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L87)

___

### NSProfile

Ƭ **NSProfile**: `Object`

Represents a profile with associated profile parameters.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `defaultProfile` | `string` |
| `startDate` | `string` |
| `store` | { `[profileName: string]`: [`ProfileParams`](types.md#profileparams);  } |

#### Defined in

[Types.ts:79](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L79)

___

### NSTreatment

Ƭ **NSTreatment**: [`MealBolusTreatment`](types.md#mealbolustreatment) \| [`ProfileSwitchTreatment`](types.md#profileswitchtreatment) \| [`TempBasalTreatment`](types.md#tempbasaltreatment) \| [`CarbCorrectionTreatment`](types.md#carbcorrectiontreatment) \| [`AnnouncementTreatment`](types.md#announcementtreatment)

Represents treatment data.

#### Defined in

[Types.ts:123](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L123)

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

[Types.ts:30](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L30)

___

### ProfileParams

Ƭ **ProfileParams**: `Object`

Represents parameters for a profile.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `basal` | `number` \| { `time`: `string` ; `timeAsSecond?`: `number` ; `value`: `number`  }[] |

#### Defined in

[Types.ts:72](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L72)

___

### ProfileSwitchTreatment

Ƭ **ProfileSwitchTreatment**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `created_at` | [`TypeDateISO`](types.md#typedateiso) |
| `duration` | `number` |
| `eventType` | ``"Profile Switch"`` |
| `percentage` | `number` |
| `profileJson` | `string` |

#### Defined in

[Types.ts:94](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L94)

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

[Types.ts:47](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L47)

___

### SimulationResult

Ƭ **SimulationResult**: `Object`

Represents the result of a simulation.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `activityFactor` | `number` |
| `alcoholActivity` | `number` |
| `basalActivity` | `number` |
| `bolusActivity` | `number` |
| `carbsActivity` | `number` |
| `cortisoneActivity` | `number` |
| `deltaMinutes` | `number` |
| `isf` | { `constant`: `number` ; `dynamic`: `number`  } |
| `isf.constant` | `number` |
| `isf.dynamic` | `number` |
| `liverActivity` | `number` |
| `sgv` | `number` |

#### Defined in

[Types.ts:234](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L234)

___

### TDateISODate

Ƭ **TDateISODate**: \`${TYear}-${TMonth}-${TDay}\`

Represent a string like `2021-01-08`

#### Defined in

[TypeDateISO.ts:12](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/TypeDateISO.ts#L12)

___

### TDateISOTime

Ƭ **TDateISOTime**: \`${THours}:${TMinutes}:${TSeconds}.${TMilliseconds}\`

Represent a string like `14:42:34.678`

#### Defined in

[TypeDateISO.ts:17](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/TypeDateISO.ts#L17)

___

### TDay

Ƭ **TDay**: \`${number}${number}\`

#### Defined in

[TypeDateISO.ts:3](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/TypeDateISO.ts#L3)

___

### THours

Ƭ **THours**: \`${number}${number}\`

#### Defined in

[TypeDateISO.ts:4](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/TypeDateISO.ts#L4)

___

### TMilliseconds

Ƭ **TMilliseconds**: \`${number}${number}${number}\`

#### Defined in

[TypeDateISO.ts:7](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/TypeDateISO.ts#L7)

___

### TMinutes

Ƭ **TMinutes**: \`${number}${number}\`

#### Defined in

[TypeDateISO.ts:5](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/TypeDateISO.ts#L5)

___

### TMonth

Ƭ **TMonth**: \`${number}${number}\`

#### Defined in

[TypeDateISO.ts:2](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/TypeDateISO.ts#L2)

___

### TSeconds

Ƭ **TSeconds**: \`${number}${number}\`

#### Defined in

[TypeDateISO.ts:6](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/TypeDateISO.ts#L6)

___

### TYear

Ƭ **TYear**: \`${number}${number}${number}${number}\`

#### Defined in

[TypeDateISO.ts:1](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/TypeDateISO.ts#L1)

___

### TempBasalTreatment

Ƭ **TempBasalTreatment**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `absolute` | `number` |
| `created_at` | [`TypeDateISO`](types.md#typedateiso) |
| `duration` | `number` |
| `eventType` | ``"Temp Basal"`` |

#### Defined in

[Types.ts:102](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L102)

___

### TypeDateISO

Ƭ **TypeDateISO**: \`${TDateISODate}T${TDateISOTime}Z\`

Represent a string like `2021-01-08T14:42:34.678Z` (format: ISO 8601).

#### Defined in

[TypeDateISO.ts:23](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/TypeDateISO.ts#L23)

___

### UserParams

Ƭ **UserParams**: `Object`

Represents user parameters.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `nsUrl` | `string` |

#### Defined in

[Types.ts:195](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L195)

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

[Types.ts:281](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L281)

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

[Types.ts:346](https://github.com/lsandini/cgmsim-lib/blob/1e109d0/src/Types.ts#L346)
