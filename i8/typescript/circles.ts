interface CircleMetadata {
    level: number;
}

// https://github.com/lodash/lodash/issues/2173
function _rotate_list_right(arr:any[]): any[] {
    var arr_copy = _.concat([], arr);
    arr_copy.push(arr_copy.shift())
    return arr_copy;
}

class Circle {

    constructor(public x:number, public y:number, public r:number, private _metadata?:CircleMetadata) {}

    get id() {
        return `x:${Math.ceil(this.x)}-y:${Math.ceil(this.y)}-r:${this.r}`;
    }

    get metadata(): CircleMetadata | any {
        return _.isEmpty(this._metadata) ? {} : (<CircleMetadata>this._metadata);
    }

    pointsOnCircumference(numberOfPoints:number, shift_in_radians=0) {
        const {x, y, r} = this;
        return _.map(
            _.range(0, 2 * Math.PI, 2 * Math.PI / numberOfPoints),
            radians => new Point(
                x + (Math.cos(radians + shift_in_radians) * r),
                y + (Math.sin(radians + shift_in_radians) * r),
            )
        );
    }
    // circlesAround
    // https://stackoverflow.com/questions/17186566/how-do-i-fix-error-ts1015-parameter-cannot-have-question-mark-and-initializer
    surroundingCircles(count:number, distance_modifier=1, shift_in_radians=0, metadata:CircleMetadata|undefined=undefined) {
        const {x, y, r} = this;
        var circles = _.map(
            _.range(0, 2 * Math.PI, 2 * Math.PI / count),
            radians => new Circle(
                x + (Math.cos(radians + shift_in_radians) * r * distance_modifier),
                y + (Math.sin(radians + shift_in_radians) * r * distance_modifier),
                r,
                _.isEmpty(metadata) ? undefined : _.merge({}, metadata),
            )
        );
        return circles;
    }

    // flowersAround
    surroundWithFlower(metadata?:CircleMetadata) {
        return this.surroundingCircles(6, 1, 0, metadata);
    }

    static indexCircles(circles:Circle[]) {
        return _.fromPairs(_.map(
            circles,
            (c) => [c.id, c],
        ));
    }
    // appendFlowersRecursively
    _surroundWithFlowersRecursively(recursionLevel:number) {
        // Returns Circles that will get drawn ...
        var circlesToDraw = {};
        var aroundCenter = Circle.indexCircles(
            this.surroundWithFlower({level: recursionLevel})
        );
        console.log("around center", aroundCenter);
        circlesToDraw = _.merge({}, aroundCenter);
        if (recursionLevel > 1) {
            var recursiveCircles =  _.flatMap(
                this.surroundWithFlower({level: recursionLevel - 1}),
                (c) => c._surroundWithFlowersRecursively(recursionLevel - 1)
            );
            console.log("recursiveCircles", recursiveCircles);
            circlesToDraw = _.mergeWith({}, circlesToDraw, ...recursiveCircles, Circle.pickHigherLevel);
        }
        // console.log("circlesToDraw", circlesToDraw);
        return circlesToDraw;
    }

    surroundWithFlowersRecursively(recursionLevel:number): Circle[] {
        return _.values(this._surroundWithFlowersRecursively(recursionLevel));
    }

    get midpoint() {
        return new Point(this.x, this.y);
    }

    static lineBetweenMidpoints(c1:Circle, c2:Circle) {
        return new Line(c1.midpoint, c2.midpoint);
    }

    static pickHigherLevel(ca?: Circle, cb?: Circle) {
        if (_.isUndefined(ca) || _.isUndefined(cb)) {
            return undefined;
        }

        // https://dzone.com/articles/using-casting-typescript
        if ((<CircleMetadata>ca.metadata).level >= (<CircleMetadata>cb.metadata).level) {
            // console.log('picked ca over cb', ca, cb);
            return ca;
        }
        // console.log('picked cb over ca', ca, cb);
        return cb;
    }

    // https://codepen.io/Elf/details/rOrRaw
    // https://www.d3indepth.com/shapes/
    hexagonWithinCircle(shift_in_radians=Math.PI/2): Line[] {
        var points_of_hexagon = this.pointsOnCircumference(6, shift_in_radians);
        return _.map(
            // https://www.tutorialsteacher.com/typescript/typescript-tuple
            (<[Point, Point][]>_.zip(
                points_of_hexagon,
                _rotate_list_right(points_of_hexagon)
            )),
            ([p1, p2]) => new Line(p1, p2),
        );
    }

};
