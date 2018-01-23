import { sum } from 'd3-array';

class PartiteLayout {

    constructor(_data, _height, _buffMargin, _minHeight) {
        this.data = _data;
        this.height = _height;
        this.buffMargin = _buffMargin;
        this.minHeight = _minHeight;
    }


    layout() {
        let layout = {};

        layout.mainBars = [
            this._calculatePosition( this.data.data[0].map((d)=>{ return sum(d);}), 0, this.height, this.buffMargin, this.minHeight),
            this._calculatePosition( this.data.data[1].map((d)=>{ return sum(d);}), 0, this.height, this.buffMargin, this.minHeight)
        ];

        layout.subBars = [[],[]];
        layout.mainBars.forEach((pos,p)=>{
            pos.forEach((bar, i)=>{
                this._calculatePosition(this.data.data[p][i], bar.y, bar.y+bar.h, 0, 0).forEach((sBar,j)=>{
                    sBar.key1=(p==0 ? i : j);
                    sBar.key2=(p==0 ? j : i);
                    layout.subBars[p].push(sBar);
                });
            });
        });
        layout.subBars.forEach((sBar)=>{
            sBar.sort((a,b)=> {
                return (a.key1 < b.key1 ? -1 : a.key1 > b.key1 ?
                    1 : a.key2 < b.key2 ? -1 : a.key2 > b.key2 ? 1: 0 )});
        });

        layout.edges = layout.subBars[0].map((p,i)=>{
            return {
                key1: p.key1,
                key2: p.key2,
                y1:p.y,
                y2:layout.subBars[1][i].y,
                h1:p.h,
                h2:layout.subBars[1][i].h
            };
        });

        layout.keys=this.data.keys;

        return layout;
    };

    _calculatePosition(a, s, e, b, m){
        let total=sum(a);

        let _sum=0, neededHeight=0, leftoverHeight= e-s-2*b*a.length;
        let ret =[];

        a.forEach(
            function(d){
                let v={};
                v.percent = (total == 0 ? 0 : d/total);
                v.value=d;
                v.height=Math.max(v.percent*(e-s-2*b*a.length), m);
                (v.height==m ? leftoverHeight-=m : neededHeight+=v.height );
                ret.push(v);
            }
        );

        let scaleFact=leftoverHeight/Math.max(neededHeight,1);

        ret.forEach(
            (d)=> {
                d.percent = scaleFact*d.percent;
                d.height=(d.height==m? m : d.height*scaleFact);
                d.middle=_sum+b+d.height/2;
                d.y=s + d.middle - d.percent*(e-s-2*b*a.length)/2;
                d.h= d.percent*(e-s-2*b*a.length);
                d.percent = (total == 0 ? 0 : d.value/total);
                _sum+=2*b+d.height;
            }
        );
        return ret;
    }

    data (_data) {
        if (!arguments.length) { return this.data; }

        this.data = _data;
        return this;
    };

    height(_height) {
        if (!arguments.length) { return this.height; }

        this.height = _height;
        return this;
    };

    buffMargin(_buffMargin) {
        if (!arguments.length) { return this.buffMargin; }

        this.buffMargin = _buffMargin;
        return this;
    };

    minHeight(_minHeight) {
        if (!arguments.length) { return this.minHeight; }

        this.minHeight = _minHeight;
        return this;
    };

}

export default PartiteLayout