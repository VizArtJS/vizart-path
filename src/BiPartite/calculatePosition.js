import {sum} from "d3-array";

const calculatePosition = (a, s, e, b, m)=> {
    const total = sum(a);

    let _sum = 0,
        neededHeight = 0,
        leftoverHeight = e - s - 2 * b * a.length;

    const ret = a.map(d=>{
        const percent = total === 0 ? 0 : d / total;
        const height = Math.max(percent * (e - s - 2 * b * a.length), m);
        height === m ? (leftoverHeight -= m) : (neededHeight += height);

        return {
            percent,
            value: d,
            height,
        };
    });

    const scaleFact = leftoverHeight / Math.max(neededHeight, 1);

    ret.forEach(d => {
        d.percent = scaleFact * d.percent;
        d.height = d.height == m ? m : d.height * scaleFact;
        d.middle = _sum + b + d.height / 2;
        d.y = s + d.middle - d.percent * (e - s - 2 * b * a.length) / 2;
        d.h = d.percent * (e - s - 2 * b * a.length);
        d.percent = total == 0 ? 0 : d.value / total;
        _sum += 2 * b + d.height;
    });
    return ret;
}

export default calculatePosition;