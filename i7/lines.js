

const Line = class {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    get dx() {
        return this.p2.x - this.p1.x;
    }

    get dy() {
        return this.p2.y - this.p1.y;
    }

    slope() {
        return this.dy / this.dx;
    }

    isHorizontal() {
        if ( this.p1.y === this.p2.y || Math.abs(this.slope()) < (1.0/1000000.0) ) {
            return true;
        }
        return false;
    }

    isVerticle() {
        if (this.p1.x === this.p2.x || Math.abs(this.slope()) > 1000000) {
            return true;
        }
        return false;
    }

    distanceBetweenPoints() {
        return Point.distanceBetweenPoints(this.p1, this.p2);
    }

    replaceEndingPoint(p2) {
        return new Line(this.p1, p2);
    }

    extendLineRight(newDistance) {
        if (this.isHorizontal()) {
            return this.replaceEndingPoint(
                new Point(
                    this.p1.x + newDistance,
                    this.p1.y
                )
            );
        }
        var currentDistance = this.distanceBetweenPoints();
        if (this.slope() > 0) {
            return this.replaceEndingPoint(
                new Point(
                    this.p1.x + ((newDistance*Math.abs(this.dx))/currentDistance),
                    this.p1.y + ((newDistance*Math.abs(this.dy))/currentDistance)
                )
            );
        }
        else {
            return this.replaceEndingPoint(
                new Point(
                    this.p1.x + ((newDistance*Math.abs(this.dx))/currentDistance),
                    this.p1.y - ((newDistance*Math.abs(this.dy))/currentDistance)
                )
            );
        }
    }

    extendLineLeft(newDistance) {
        if (this.isHorizontal()) {
            return this.replaceEndingPoint(
                new Point(
                    this.p1.x - newDistance,
                    this.p1.y
                )
            );
        }
        var currentDistance = this.distanceBetweenPoints();
        if (this.slope() > 0) {
            return this.replaceEndingPoint(
                new Point(
                    this.p1.x - ((newDistance*Math.abs(this.dx))/currentDistance),
                    this.p1.y - ((newDistance*Math.abs(this.dy))/currentDistance)
                )
            );
        }
        else {
            return this.replaceEndingPoint(
                new Point(
                    this.p1.x - ((newDistance*Math.abs(this.dx))/currentDistance),
                    this.p1.y + ((newDistance*Math.abs(this.dy))/currentDistance)
                )
            );
        }
    }

    extendLine(newDistance) {
        console.log("Extending line between", this.p1, this.p2);
        // var [x1, y1] = p1;
        // var [x2, y2] = p2;
        if (this.isVerticle()) {
            if (this.p2.isUnder(this.p1)) {
                return this.replaceEndingPoint(
                    new Point(this.p2.x, this.p1.y-newDistance)
                );
            }
            return this.replaceEndingPoint(
                new Point(this.p2.x, this.p1.y+newDistance)
            );
        }
        if (this.p1.isInQuadrant2(this.p2) || this.p1.isInQuadrant3(this.p2)) {
            return this.extendLineLeft(newDistance);
        }
        return this.extendLineRight(newDistance);
    }
}