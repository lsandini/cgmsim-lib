import { Profile, Sgv, Treatment } from './Types';
declare const downloads: (nsUrl: string, apiSecret: string) => Promise<{
    treatments: Treatment[];
    profiles: Profile[];
    entries: Sgv[];
}>;
export default downloads;
