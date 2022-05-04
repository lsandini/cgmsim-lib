import { TreatmentDelta, Treatment } from './Types';
export default function (treatments: Treatment[]): ({
    lastDET: TreatmentDelta[];
    lastGLA: TreatmentDelta[];
    lastTOU: TreatmentDelta[];
    lastDEG: TreatmentDelta[];
});
