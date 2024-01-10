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

Represents data related to physical activity.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `created_at` | [`TypeDateISO`](types.md#typedateiso) | The timestamp indicating when the activity data was recorded in ISO format. |
| `heartRate?` | `number` | The heart rate during the activity (optional). |
| `steps?` | `number` | The number of steps taken (optional). |

#### Defined in

[Types.ts:45](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L45)

___

### AnnouncementTreatment

Ƭ **AnnouncementTreatment**: `Object`

Represents the announcement as treatment.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `created_at` | [`TypeDateISO`](types.md#typedateiso) | The date of the treatment creation in ISO format. |
| `eventType` | ``"Announcement"`` | The type of event, set to 'Announcement'. |
| `notes` | `string` | Additional notes for the treatment. |

#### Defined in

[Types.ts:167](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L167)

___

### CarbCorrectionTreatment

Ƭ **CarbCorrectionTreatment**: `Object`

Represents the treatment information for a Carb Correction event.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `carbs` | `number` | The number of carbohydrates considered for correction. |
| `created_at` | [`TypeDateISO`](types.md#typedateiso) | The date of the treatment creation in ISO format. |
| `eventType` | ``"Carb Correction"`` | The type of event, set to 'Carb Correction'. |

#### Defined in

[Types.ts:155](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L155)

___

### Direction

Ƭ **Direction**: ``"DoubleDown"`` \| ``"SingleDown"`` \| ``"FortyFiveDown"`` \| ``"Flat"`` \| ``"FortyFiveUp"`` \| ``"SingleUp"`` \| ``"DoubleUp"``

Represents the direction of blood glucose change.

#### Defined in

[Types.ts:7](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L7)

___

### Entry

Ƭ **Entry**: [`EntryValueType`](types.md#entryvaluetype) & \{ `date`: `number` ; `dateString`: `string` ; `type`: ``"sgv"``  }

Represents a blood glucose entry with additional date information.

#### Defined in

[Types.ts:77](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L77)

___

### EntryValueType

Ƭ **EntryValueType**: `Object`

Represents a blood glucose entry value type.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `direction` | `string` | The direction of blood glucose change. |
| `sgv` | `number` | The blood glucose value. |

#### Defined in

[Types.ts:67](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L67)

___

### EnvParam

Ƭ **EnvParam**: `Object`

Represents environmental parameters for a simulation.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `AGE` | `number` | Age of the simulated user. |
| `CARBS_ABS_TIME` | `number` | Time taken for carbohydrates to be absorbed (in minutes default 360). |
| `CR` | `number` | Carbohydrate Ratio (CR) for insulin calculation. |
| `DIA` | `number` | Duration of Insulin Action (DIA) (in hours default: 6). |
| `GENDER` | [`GenderType`](types.md#gendertype) | Gender of the simulated user ('Male' or 'Female'). |
| `ISF` | `number` | Insulin Sensitivity Factor (ISF) for insulin calculation. |
| `SEED?` | `string` | Seed value for randomization (optional). |
| `TP` | `number` | Time period for insulin activity (Time Peak) (in minutes default 75). |
| `WEIGHT` | `number` | Weight of the simulated user (in cm). |

#### Defined in

[Types.ts:224](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L224)

___

### GenderType

Ƭ **GenderType**: ``"Male"`` \| ``"Female"``

Represents a gender type.

#### Defined in

[Types.ts:219](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L219)

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

[Types.ts:286](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L286)

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
| `env` | \{ `AGE`: `string` ; `GENDER`: [`GenderType`](types.md#gendertype) ; `WEIGHT`: `string`  } |
| `env.AGE` | `string` |
| `env.GENDER` | [`GenderType`](types.md#gendertype) |
| `env.WEIGHT` | `string` |
| `lastState` | [`UvaPatientState`](types.md#uvapatientstate) |
| `profiles` | [`NSProfile`](types.md#nsprofile)[] |
| `pumpEnabled` | `boolean` |
| `treatments` | [`NSTreatment`](types.md#nstreatment)[] |
| `user` | [`UserParams`](types.md#userparams) |

#### Defined in

[Types.ts:267](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L267)

___

### MealBolusTreatment

Ƭ **MealBolusTreatment**: `Object`

Represents the treatment information for a Meal Bolus event.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `carbs` | `number` | The number of carbohydrates consumed. |
| `created_at` | [`TypeDateISO`](types.md#typedateiso) | The date of the treatment creation in ISO format. |
| `eventType` | ``"Meal Bolus"`` | The type of event, set to 'Meal Bolus'. |
| `insulin` | `number` | The amount of insulin administered for the meal bolus. |

#### Defined in

[Types.ts:111](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L111)

___

### NSProfile

Ƭ **NSProfile**: `Object`

Represents a profile with associated profile parameters.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `defaultProfile` | `string` | The default profile name. |
| `startDate` | `string` | The start date of the profile. |
| `store` | \{ `[profileName: string]`: [`ProfileParams`](types.md#profileparams);  } | The store of profile parameters. |

#### Defined in

[Types.ts:97](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L97)

___

### NSTreatment

Ƭ **NSTreatment**: [`MealBolusTreatment`](types.md#mealbolustreatment) \| [`ProfileSwitchTreatment`](types.md#profileswitchtreatment) \| [`TempBasalTreatment`](types.md#tempbasaltreatment) \| [`CarbCorrectionTreatment`](types.md#carbcorrectiontreatment) \| [`AnnouncementTreatment`](types.md#announcementtreatment)

Represents treatment data.

#### Defined in

[Types.ts:179](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L179)

___

### Note

Ƭ **Note**: `Object`

Represents a note with associated notes.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `notes` | `string` | The content of the note. |
| `type` | ``"Note"`` | The type of note. |

#### Defined in

[Types.ts:35](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L35)

___

### ProfileParams

Ƭ **ProfileParams**: `Object`

Represents parameters for a profile.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `basal` | `number` \| \{ `time`: `string` ; `timeAsSecond?`: `number` ; `value`: `number`  }[] | The basal insulin rate. |

#### Defined in

[Types.ts:89](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L89)

___

### ProfileSwitchTreatment

Ƭ **ProfileSwitchTreatment**: `Object`

Represents the treatment information for a Profile Switch event.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `created_at` | [`TypeDateISO`](types.md#typedateiso) | The date of the treatment creation in ISO format. |
| `duration` | `number` | The duration of the profile switch in minutes. |
| `eventType` | ``"Profile Switch"`` | The type of event, set to 'Profile Switch'. |
| `percentage` | `number` | The percentage change applied during the profile switch. |
| `profileJson` | `string` | The JSON representation of the new profile. |

#### Defined in

[Types.ts:125](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L125)

___

### Sgv

Ƭ **Sgv**: `Object`

Represents a blood glucose entry.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `mills` | `number` | The timestamp of the blood glucose entry in milliseconds. |
| `sgv` | `number` | The blood glucose value. |

#### Defined in

[Types.ts:57](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L57)

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
| `isf` | \{ `constant`: `number` ; `dynamic`: `number`  } |
| `isf.constant` | `number` |
| `isf.dynamic` | `number` |
| `liverActivity` | `number` |
| `sgv` | `number` |

#### Defined in

[Types.ts:299](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L299)

___

### TDateISODate

Ƭ **TDateISODate**: \`$\{TYear}-$\{TMonth}-$\{TDay}\`

Represent a string like `2021-01-08`

#### Defined in

[TypeDateISO.ts:12](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/TypeDateISO.ts#L12)

___

### TDateISOTime

Ƭ **TDateISOTime**: \`$\{THours}:$\{TMinutes}:$\{TSeconds}.$\{TMilliseconds}\`

Represent a string like `14:42:34.678`

#### Defined in

[TypeDateISO.ts:17](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/TypeDateISO.ts#L17)

___

### TDay

Ƭ **TDay**: \`$\{number}$\{number}\`

#### Defined in

[TypeDateISO.ts:3](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/TypeDateISO.ts#L3)

___

### THours

Ƭ **THours**: \`$\{number}$\{number}\`

#### Defined in

[TypeDateISO.ts:4](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/TypeDateISO.ts#L4)

___

### TMilliseconds

Ƭ **TMilliseconds**: \`$\{number}$\{number}$\{number}\`

#### Defined in

[TypeDateISO.ts:7](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/TypeDateISO.ts#L7)

___

### TMinutes

Ƭ **TMinutes**: \`$\{number}$\{number}\`

#### Defined in

[TypeDateISO.ts:5](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/TypeDateISO.ts#L5)

___

### TMonth

Ƭ **TMonth**: \`$\{number}$\{number}\`

#### Defined in

[TypeDateISO.ts:2](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/TypeDateISO.ts#L2)

___

### TSeconds

Ƭ **TSeconds**: \`$\{number}$\{number}\`

#### Defined in

[TypeDateISO.ts:6](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/TypeDateISO.ts#L6)

___

### TYear

Ƭ **TYear**: \`$\{number}$\{number}$\{number}$\{number}\`

#### Defined in

[TypeDateISO.ts:1](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/TypeDateISO.ts#L1)

___

### TempBasalTreatment

Ƭ **TempBasalTreatment**: `Object`

Represents the treatment information for a Temporary Basal event.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `absolute` | `number` | The absolute insulin rate for the temporary basal. |
| `created_at` | [`TypeDateISO`](types.md#typedateiso) | The date of the treatment creation in ISO format. |
| `duration` | `number` | The duration of the temporary basal in minutes. |
| `eventType` | ``"Temp Basal"`` | The type of event, set to 'Temp Basal'. |

#### Defined in

[Types.ts:141](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L141)

___

### TypeDateISO

Ƭ **TypeDateISO**: \`$\{TDateISODate}T$\{TDateISOTime}Z\`

Represent a string like `2021-01-08T14:42:34.678Z` (format: ISO 8601).

#### Defined in

[TypeDateISO.ts:23](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/TypeDateISO.ts#L23)

___

### UserParams

Ƭ **UserParams**: `Object`

Represents user parameters.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `nsUrl` | `string` |

#### Defined in

[Types.ts:260](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L260)

___

### UvaPatientState

Ƭ **UvaPatientState**: `Object`

Represents the state of a UVA patient.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `Gp` | `number` | Glucose in plasma. |
| `Gt` | `number` | Glucose in tissue. |
| `I_` | `number` | Insulin delay compartment 1. |
| `Il` | `number` | Insulin in liver. |
| `Ip` | `number` | Insulin in plasma. |
| `Isc1` | `number` | Subcutaneous insulin in compartment 1. |
| `Isc2` | `number` | Subcutaneous insulin in compartment 2. |
| `Qgut` | `number` | Glucose mass in intestine. |
| `Qsto1` | `number` | Carbs in stomach, solid phase. |
| `Qsto2` | `number` | Carbs in stomach, liquid phase. |
| `W` | `number` | W. |
| `X` | `number` | Insulin in the interstitial fluid. |
| `XL` | `number` | Insulin delay compartment 2. |
| `Y` | `number` | Increased energy consumption estimated through heart rate. |
| `Z` | `number` | Exercise-induced changes in insulin sensitivity. |

#### Defined in

[Types.ts:349](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L349)

___

### UvaPatientType

Ƭ **UvaPatientType**: `Object`

Represents parameters for a UVA simulation.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `A` | `number` | Factor for exercise-induced increase in insulin sensitivity. |
| `BW` | `number` | Body weight. |
| `Fcns` | `number` | Glucose uptake by the brain and erythrocytes. |
| `Gpeq` | `number` | Steady-state of glucose in plasma. |
| `HEeq` | `number` | Steady-state hepatic extraction of insulin. |
| `HRb` | `number` | Heart rate at rest. |
| `HRmax` | `number` | Maximal heart rate (220-age). |
| `Km0` | `number` | Michaelis-Menten constant (offset). |
| `Tex` | `number` | Time constant for Z. |
| `Thr` | `number` | Time constant for Y. |
| `Tin` | `number` | Time constant for Z. |
| `VG` | `number` | Distribution volume of glucose. |
| `VI` | `number` | Distribution volume of insulin. |
| `Vm0` | `number` | Michaelis-Menten constant (offset). |
| `Vmx` | `number` | Michaelis-Menten constant (slope). |
| `a` | `number` | Parameter for calculating Z. |
| `beta` | `number` | Factor for exercise-induced increase in insulin-independent glucose clearance. |
| `f` | `number` | Fraction of intestinal absorption. |
| `gamma` | `number` | Factor for exercise-induced increase in glucose uptake. |
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
| `n` | `number` | Parameter for calculating Z. |
| `p2u` | `number` | Insulin action on the peripheral glucose utilization. |

#### Defined in

[Types.ts:385](https://github.com/lsandini/cgmsim-lib/blob/1548d52/src/Types.ts#L385)
