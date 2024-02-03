[@lsandini/cgmsim-lib - v0.4.0](../README.md) / types

# Module: types

## Table of contents

### Type Aliases

- [Activity](types.md#activity)
- [AnnouncementTreatment](types.md#announcementtreatment)
- [Direction](types.md#direction)
- [Entry](types.md#entry)
- [EntryValueType](types.md#entryvaluetype)
- [GenderType](types.md#gendertype)
- [MainParams](types.md#mainparams)
- [MainParamsBase](types.md#mainparamsbase)
- [MainParamsUVA](types.md#mainparamsuva)
- [MealBolusTreatment](types.md#mealbolustreatment)
- [NSProfile](types.md#nsprofile)
- [NSTreatment](types.md#nstreatment)
- [Note](types.md#note)
- [PatientInfoBase](types.md#patientinfobase)
- [PatientInfoCgmsim](types.md#patientinfocgmsim)
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

[Types.ts:45](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L45)

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

[Types.ts:162](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L162)

___

### Direction

Ƭ **Direction**: ``"DoubleDown"`` \| ``"SingleDown"`` \| ``"FortyFiveDown"`` \| ``"Flat"`` \| ``"FortyFiveUp"`` \| ``"SingleUp"`` \| ``"DoubleUp"``

Represents the direction of blood glucose change.

#### Defined in

[Types.ts:7](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L7)

___

### Entry

Ƭ **Entry**: [`EntryValueType`](types.md#entryvaluetype) & { `date`: `number` ; `dateString`: `string` ; `type`: ``"sgv"``  }

Represents a blood glucose entry with additional date information.

#### Defined in

[Types.ts:77](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L77)

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

[Types.ts:67](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L67)

___

### GenderType

Ƭ **GenderType**: ``"Male"`` \| ``"Female"``

Represents a gender type.

#### Defined in

[Types.ts:211](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L211)

___

### MainParams

Ƭ **MainParams**: [`MainParamsBase`](types.md#mainparamsbase) & { `entries`: [`Sgv`](types.md#sgv)[] ; `patient`: [`PatientInfoCgmsim`](types.md#patientinfocgmsim)  }

Represents main parameters for a simulation.

#### Defined in

[Types.ts:281](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L281)

___

### MainParamsBase

Ƭ **MainParamsBase**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `activities?` | [`Activity`](types.md#activity)[] |
| `patient` | [`PatientInfoBase`](types.md#patientinfobase) |
| `profiles` | [`NSProfile`](types.md#nsprofile)[] |
| `pumpEnabled` | `boolean` |
| `treatments` | [`NSTreatment`](types.md#nstreatment)[] |
| `user` | [`UserParams`](types.md#userparams) |

#### Defined in

[Types.ts:263](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L263)

___

### MainParamsUVA

Ƭ **MainParamsUVA**: [`MainParamsBase`](types.md#mainparamsbase) & { `lastState`: [`UvaPatientState`](types.md#uvapatientstate)  }

Represents main parameters for a UVA simulation.

#### Defined in

[Types.ts:274](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L274)

___

### MealBolusTreatment

Ƭ **MealBolusTreatment**: `Object`

Represents the treatment information for a Meal Bolus event.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `carbs?` | `number` | The number of carbohydrates consumed. |
| `created_at` | [`TypeDateISO`](types.md#typedateiso) | The date of the treatment creation in ISO format. |
| `eventType` | ``"Meal Bolus"`` \| ``"Bolus"`` \| ``"Correction Bolus"`` \| ``"Bolus Wizard"`` \| ``"Carb Correction"`` | The type of event, set to 'Meal Bolus'. |
| `insulin?` | `number` | The amount of insulin administered for the meal bolus. |

#### Defined in

[Types.ts:113](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L113)

___

### NSProfile

Ƭ **NSProfile**: `Object`

Represents a profile with associated profile parameters.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `defaultProfile` | `string` | The default profile name. |
| `startDate` | `string` | The start date of the profile. |
| `store` | { `[profileName: string]`: [`ProfileParams`](types.md#profileparams);  } | The store of profile parameters. |

#### Defined in

[Types.ts:97](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L97)

___

### NSTreatment

Ƭ **NSTreatment**: [`MealBolusTreatment`](types.md#mealbolustreatment) \| [`ProfileSwitchTreatment`](types.md#profileswitchtreatment) \| [`TempBasalTreatment`](types.md#tempbasaltreatment) \| [`AnnouncementTreatment`](types.md#announcementtreatment)

Represents treatment data.

#### Defined in

[Types.ts:174](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L174)

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

[Types.ts:35](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L35)

___

### PatientInfoBase

Ƭ **PatientInfoBase**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `AGE` | `number` | Age of the simulated user. |
| `GENDER` | [`GenderType`](types.md#gendertype) | Gender of the simulated user ('Male' or 'Female'). |
| `WEIGHT` | `number` | Weight of the simulated user (in cm). |

#### Defined in

[Types.ts:232](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L232)

___

### PatientInfoCgmsim

Ƭ **PatientInfoCgmsim**: [`PatientInfoBase`](types.md#patientinfobase) & { `CARBS_ABS_TIME`: `number` ; `CR`: `number` ; `DIA`: `number` ; `ISF`: `number` ; `TP`: `number`  }

Represents patient parameters for a cgmsim simulation.

#### Defined in

[Types.ts:250](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L250)

___

### ProfileParams

Ƭ **ProfileParams**: `Object`

Represents parameters for a profile.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `basal` | `number` \| { `time`: `string` ; `timeAsSecond?`: `number` ; `value`: `number`  }[] | The basal insulin rate. |

#### Defined in

[Types.ts:89](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L89)

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

[Types.ts:132](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L132)

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

[Types.ts:57](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L57)

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

[Types.ts:289](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L289)

___

### TDateISODate

Ƭ **TDateISODate**: \`${TYear}-${TMonth}-${TDay}\`

Represent a string like `2021-01-08`

#### Defined in

[TypeDateISO.ts:12](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/TypeDateISO.ts#L12)

___

### TDateISOTime

Ƭ **TDateISOTime**: \`${THours}:${TMinutes}:${TSeconds}.${TMilliseconds}\`

Represent a string like `14:42:34.678`

#### Defined in

[TypeDateISO.ts:17](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/TypeDateISO.ts#L17)

___

### TDay

Ƭ **TDay**: \`${number}${number}\`

#### Defined in

[TypeDateISO.ts:3](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/TypeDateISO.ts#L3)

___

### THours

Ƭ **THours**: \`${number}${number}\`

#### Defined in

[TypeDateISO.ts:4](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/TypeDateISO.ts#L4)

___

### TMilliseconds

Ƭ **TMilliseconds**: \`${number}${number}${number}\`

#### Defined in

[TypeDateISO.ts:7](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/TypeDateISO.ts#L7)

___

### TMinutes

Ƭ **TMinutes**: \`${number}${number}\`

#### Defined in

[TypeDateISO.ts:5](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/TypeDateISO.ts#L5)

___

### TMonth

Ƭ **TMonth**: \`${number}${number}\`

#### Defined in

[TypeDateISO.ts:2](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/TypeDateISO.ts#L2)

___

### TSeconds

Ƭ **TSeconds**: \`${number}${number}\`

#### Defined in

[TypeDateISO.ts:6](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/TypeDateISO.ts#L6)

___

### TYear

Ƭ **TYear**: \`${number}${number}${number}${number}\`

#### Defined in

[TypeDateISO.ts:1](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/TypeDateISO.ts#L1)

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

[Types.ts:148](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L148)

___

### TypeDateISO

Ƭ **TypeDateISO**: \`${TDateISODate}T${TDateISOTime}Z\`

Represent a string like `2021-01-08T14:42:34.678Z` (format: ISO 8601).

#### Defined in

[TypeDateISO.ts:23](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/TypeDateISO.ts#L23)

___

### UserParams

Ƭ **UserParams**: `Object`

Represents user parameters.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `nsUrl` | `string` |

#### Defined in

[Types.ts:228](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L228)

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

[Types.ts:339](https://github.com/lsandini/cgmsim-lib/blob/9fa3580/src/Types.ts#L339)
