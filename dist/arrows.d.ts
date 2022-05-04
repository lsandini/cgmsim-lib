import { Sgv, Direction } from './Types';
export default function (sgvs: Pick<Sgv, 'sgv'>[]): {
    sgvdir: number;
    direction: Direction;
}[];
