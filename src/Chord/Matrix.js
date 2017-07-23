import { interpolateObject } from 'd3-interpolate';

class Matrix {
    constructor() {
        this._id = 0;
        this._matrix = [];
        this._dataStore;

        this._matrixIndex;
        this._indexHash;

        this._chordLayout;
        this._chordData = [];
        this._layoutCache = {groups: {}, chords: {}};

        this._filter = ()=> {};
        this._reduce = ()=> {};
    }


    update() {
        let objs = [];
        let entry = {};
        this._matrix = [];

        for (let group of this.groups()) {
            this._layoutCache.groups[group._id] = {
                startAngle: group.startAngle,
                endAngle: group.endAngle
            };
        }

        for (let chord of this.chords()) {
            this._layoutCache.chords[this.chordID(chord)] = {
                source: {
                    _id: chord.source._id,
                    startAngle: chord.source.startAngle,
                    endAngle: chord.source.endAngle
                },
                target: {
                    _id: chord.target._id,
                    startAngle: chord.target.startAngle,
                    endAngle: chord.target.endAngle
                }
            };
        }

        this._matrixIndex = Object.keys(this._indexHash);

        for (let i = 0; i < this._matrixIndex.length; i++) {
            if (!this._matrix[i]) {
                this._matrix[i] = [];
            }
            for (let j = 0; j < this._matrixIndex.length; j++) {
                objs = this._dataStore.filter( (obj)=> {
                    return this._filter(obj, this._indexHash[this._matrixIndex[i]], this._indexHash[this._matrixIndex[j]]);
                });
                entry = this._reduce(objs, this._indexHash[this._matrixIndex[i]], this._indexHash[this._matrixIndex[j]]);
                entry.valueOf = function () {
                    return +this.value
                };
                this._matrix[i][j] = entry;
            }
        }

        this._chordData = this._chordLayout(this._matrix);
        return this._chordData;


    };

    data(data) {
        this._dataStore = data;
        return this;
    };

    filter(func) {
        this._filter = func;
        return this;
    };

    reduce(func) {
        this._reduce = func;
        return this;
    };

    layout(d3_chordLayout) {
        this._chordLayout = d3_chordLayout;
        return this;
    };

    groups() {
        return this._chordData.groups
            ? this._chordData.groups.map( (group)=> {
                group._id = this._matrixIndex[group.index];
                return group;
            })
            : [];
    };

    chords() {
        return this._chordData
            ? this._chordData.map((chord)=> {
                chord._id = this.chordID(chord);
                chord.source._id = this._matrixIndex[chord.source.index];
                chord.target._id = this._matrixIndex[chord.target.index];
                return chord;
            })
            : [];
    };

    addKey(key, data) {
        if (!this._indexHash[key]) {
            this._indexHash[key] = {name: key, data: data || {}};
        }
    };

    addKeys(props, fun) {
        for (let i = 0; i < this._dataStore.length; i++) {
            for (let j = 0; j < props.length; j++) {
                this.addKey(this._dataStore[i][props[j]], fun ? fun(this._dataStore[i], props[j]) : {});
            }
        }
        return this;
    };

    resetKeys() {
        this._indexHash = {};
        return this;
    };

    chordID(d) {
        let s = this._matrixIndex[d.source.index];
        let t = this._matrixIndex[d.target.index];
        return (s < t) ? s + "__" + t : t + "__" + s;
    }

    groupTween(d3_arc) {
        return  (d, i)=> {
            let tween;
            let cached = this._layoutCache.groups[d._id];

            if (cached) {
                tween = interpolateObject(cached, d);
            } else {
                tween = interpolateObject({
                    startAngle: d.startAngle,
                    endAngle: d.startAngle
                }, d);
            }

            return  (t)=> {
                return d3_arc(tween(t));
            };
        };
    };

    chordTween(d3_path) {
        return (d, i)=> {
            let tween, groups;
            let cached = this._layoutCache.chords[d._id];

            if (cached) {
                if (d.source._id !== cached.source._id) {
                    cached = {source: cached.target, target: cached.source};
                }
                tween = interpolateObject(cached, d);
            } else {
                if (this._layoutCache.groups) {
                    groups = [];
                    for (let key in this._layoutCache.groups) {
                        cached = this._layoutCache.groups[key];
                        if (cached._id === d.source._id || cached._id === d.target._id) {
                            groups.push(cached);
                        }
                    }
                    if (groups.length > 0) {
                        cached = {source: groups[0], target: groups[1] || groups[0]};
                        if (d.source._id !== cached.source._id) {
                            cached = {source: cached.target, target: cached.source};
                        }
                    } else {
                        cached = d;
                    }
                } else {
                    cached = d;
                }

                tween = interpolateObject({
                    source: {
                        startAngle: cached.source.startAngle,
                        endAngle: cached.source.startAngle
                    },
                    target: {
                        startAngle: cached.target.startAngle,
                        endAngle: cached.target.startAngle
                    }
                }, d);
            }

            return  (t)=> {
                return d3_path(tween(t));
            };
        };
    };

    read(d) {
        let g, m = {};

        if (d.source) {
            m.sname = d.source._id;
            m.sdata = d.source.value;
            m.svalue = +d.source.value;
            m.stotal = this._matrix[d.source.index].reduce( (k, n)=> {
                return k + n;
            }, 0);
            m.tname = d.target._id;
            m.tdata = d.target.value;
            m.tvalue = +d.target.value;
            m.ttotal = this._matrix[d.target.index].reduce( (k, n)=> {
                return k + n;
            }, 0);
        } else {
            g = this._indexHash[d._id];
            m.gname = g.name;
            m.gdata = g.data;
            m.gvalue = d.value;
        }
        m.mtotal = this._matrix.reduce( (m1, n1)=> {
            return m1 + n1.reduce( (m2, n2)=> {
                    return m2 + n2;
                }, 0);
        }, 0);
        return m;
    };
}

export default Matrix