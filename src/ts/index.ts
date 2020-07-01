import * as _ from "lodash";
import {Circle} from "./circles"
import {Hexagon, Nonagon, PolygonWithSides} from "./polygons"
import {Point} from "./points"
import {Star} from "./star"
import * as d3 from 'd3'
import {_map_even_odd} from "./helpers"
import {appendPolygon, appendCircle, appendCircleWithMidpoint, d3SVG, d3CIRCLE} from "./canvas"


export function appendSVGToDOM(id: string, width:number, height:number): d3SVG {
    return <d3SVG>(
        d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", id)
    );
}

// eslint-disable-next-line no-unused-vars
export function drawDifferentPolygons(drawingId:string, radius:number, size:number) {
    let svg:d3SVG;
    _.forOwn(
        PolygonWithSides,
        (cls, num_sides) => {
            console.log(cls, num_sides);
            svg = appendSVGToDOM(drawingId, radius * size, radius * size);
            appendPolygon(svg, new cls(new Point(radius * size / 2, radius * size / 2), radius).lines);
            // appendCircleWithMidpoint(svg, star.outerCircle);
        }
    )
}

// eslint-disable-next-line no-unused-vars
export function drawStarGrid(drawingId:string, radius:number, size:number) {
    let star = new Star(new Point(radius * size / 2, radius * size / 2), 6, radius);
    let svg = appendSVGToDOM(drawingId, radius * size, radius * size);
    appendPolygon(svg, star.lines);
    appendPolygon(svg, star.rotate(Math.PI/2).lines);
    appendPolygon(svg, Hexagon.withinCircle(star.outerCircle).lines);
    appendPolygon(svg, star.right().lines);
    appendPolygon(svg, star.right().rotate(Math.PI/2).lines);
    appendPolygon(svg, Hexagon.withinCircle(star.right().outerCircle).lines);
    appendPolygon(svg, star.above().lines);
    appendPolygon(svg, star.above().rotate(Math.PI/2).lines);
    appendPolygon(svg, Hexagon.withinCircle(star.above().outerCircle).lines);
    appendPolygon(svg, star.above().right().lines);
    appendPolygon(svg, star.above().right().rotate(Math.PI/2).lines);
    appendPolygon(svg, Hexagon.withinCircle(star.above().right().outerCircle).lines);
}
// eslint-disable-next-line no-unused-vars
export function drawRotatedStar(drawingId:string, radius:number, size:number) {
    let star = new Star(new Point(radius * size / 2, radius * size / 2), 6, radius);
    let svg = appendSVGToDOM(drawingId, radius * size, radius * size);
    appendPolygon(svg, star.rotate(Math.PI/4).lines);
    _.forEach(
        star.rotate(Math.PI/4).circles,
        c => {
            appendCircleWithMidpoint(svg, c);
            true;
        }
    );
}

// eslint-disable-next-line no-unused-vars
export function drawDifferentStars(drawingId:string, radius:number, size:number) {
    let star:Star;
    let svg:d3SVG;
    _.forEach(
        _.range(6, 12, 1),
        points => {
            star = new Star(new Point(radius * size / 2, radius * size / 2), points, radius);
            svg = appendSVGToDOM(drawingId, radius * size, radius * size);
            appendPolygon(svg, star.lines);
            appendCircleWithMidpoint(svg, star.outerCircle);
        }
    )
}

// eslint-disable-next-line no-unused-vars
export function rotateOuterCircles(centralCircle:Circle, currentShift:number, outerCirclesSVGS:d3CIRCLE[]) {
    let newShift = currentShift + 1;
    console.log("Current shfit", newShift);
    let newOuterCircles = centralCircle.surroundingCircles(6, 1, (newShift/10)*Math.PI*2/6);
    _.forEach(
        _.zip(newOuterCircles, outerCirclesSVGS),
        ([newCircle, circleToTransition]) => {
            (<d3CIRCLE>circleToTransition)
                .transition()
                .ease(d3.easeLinear)
                .duration(50)
                .attr('cx', (<Circle>newCircle).x)
                .attr('cy', (<Circle>newCircle).y)
                .attr('r', (<Circle>newCircle).r);
        }
    )
    return <[number,Circle[]]>[newShift, newOuterCircles];
}

// eslint-disable-next-line no-unused-vars
export function drawRotatingCircles(drawingId:string, radius:number, size:number) {
    let svg = appendSVGToDOM(drawingId, radius * size, radius * size);
    let centralCircle = new Circle(radius * size / 2, radius * size / 2, radius);
    // let centralSVGS = appendCircle(svg, centralCircle);
    let currentShift = 0;
    let outerCircles = centralCircle.surroundingCircles(6, 1, currentShift*Math.PI*2/6);
    let outerCirclesSVGS = <d3CIRCLE[]>(_.map(outerCircles, c => appendCircle(svg, c)));
    let outerCirclesL2 = _.flatMap(
        centralCircle.surroundingCircles(6, 1, currentShift*Math.PI*2/6),
        c => c.surroundingCircles(6, 1, currentShift*Math.PI*2/6)
    );
    _.map(outerCirclesL2, c => appendCircle(svg, c));

    // I wanted the central ring to completely rotate ... but the problem with the flowers ... is that they get drawn by other surrounding circles ...
    setInterval(function () {
        [currentShift, outerCircles] = rotateOuterCircles(centralCircle, currentShift, outerCirclesSVGS);
    }, 50);
}

// // eslint-disable-next-line no-unused-vars
// function drawHexagonWithSurroundingNonagons() {
//     // let svg = <d3SVG>(d3.select("body").append("svg").attr("width", radius * size).attr("height", radius * size));
//     let svg = <d3SVG>(d3.select("body").append("svg").attr("width", radius * size).attr("height", radius * size).style("background", "RGBA(118,215,196,0.9)"));
//     let centralCircle = new Circle(radius * size / 2, radius * size / 2, radius);
//     let outerCircles = centralCircle.surroundingCircles(6, 1);
//     // appendPolygon(svg, new Hexagon(centralCircle.midpoint, centralCircle.r).lines);
//     let surroundingPolygons = _.map(outerCircles, c => new Nonagon(c.midpoint, centralCircle.r * 0.75));
//     // Rotate every other polygon ...
//     surroundingPolygons = _map_even_odd(
//         surroundingPolygons,
//         nonagon => (<Nonagon>nonagon).rotate(Math.PI),
//     );
//     _.forEach(surroundingPolygons, p => {
//         appendPolygon(svg, p.lines, {
//             // "fill": "RGBA(118,215,196,0.5)",
//             // "fill": "RGBA(118,215,196,0.75)",
//             "stroke": "RGB(244,208,63)",
//             "stroke-width": "5",
//         });
//     });
// }


export function nonagonsThatFormA6PointStarCenteredAt(centralHexagon:Hexagon) {
    let centralCircle = centralHexagon.outerCircle;
    let outerCircles = centralCircle.surroundingCircles(6, 1);
    // appendPolygon(svg, new Hexagon(centralCircle.midpoint, centralCircle.r).lines);
    let surroundingPolygons = _.map(
        outerCircles,
        function (c) {
            return new Nonagon(c.midpoint, centralCircle.r * 0.75);
        }
    );
    // Rotate every other polygon ...
    surroundingPolygons = _map_even_odd(
        surroundingPolygons,
        function (nonagon) {
            return nonagon.rotate(Math.PI);
        }
    );
    return _.concat(
        // Nonagons
        surroundingPolygons,
        // Hexagons
        centralHexagon
    );
}

export function surroundingHexagons(circle:Circle) {
    return [
        // - [ ] How do I make this cleaner ...?
        // https://medium.com/@rossbulat/typescript-generics-explained-15c6493b510f
        Hexagon.withinCircle<Hexagon>(circle).northWest(),
        Hexagon.withinCircle<Hexagon>(circle).northEast(),
        Hexagon.withinCircle<Hexagon>(circle).above(),
        Hexagon.withinCircle<Hexagon>(circle).below(),
        Hexagon.withinCircle<Hexagon>(circle).southWest(),
        Hexagon.withinCircle<Hexagon>(circle).southEast(),
    ];
}

// eslint-disable-next-line no-unused-vars
export function drawHexagonWithSurroundingNonagons(drawingId:string, radius:number, size:number, background_theme:object, lines_theme:object) {
    let svg = appendSVGToDOM(drawingId, radius * size, radius * size);

    _.forOwn(background_theme, (v, k) => {
        console.log(k, v);
        svg.style(k, v);
    })

    let circle = new Circle(radius * size / 2, radius * size / 2, radius);
    let hexagons = _.concat(
        _.flatMap(
            _.map(surroundingHexagons(circle), 'outerCircle'),
            surroundingHexagons
        ),
        Hexagon.withinCircle<Hexagon>(circle),
    );
    _.forEach(
        _.flatMap(
            hexagons,
            nonagonsThatFormA6PointStarCenteredAt
        ),
        function (p) {
            appendPolygon(svg, p.lines, lines_theme);
        }
    );
}

// eslint-disable-next-line no-unused-vars
export function drawCirclesRecursively(drawingId:string, radius:number, size:number, maxLevels:number) {
    let svg = appendSVGToDOM(drawingId, radius * size, radius * size);
    // Recursively Add circles around middle circle ...
    let circle = new Circle(radius*size/2, radius*size/2,radius*2/5.25);
    let circles = (circle).surroundWithFlowersRecursively(maxLevels);
    _.forEach(
        circles,
        c => {
            console.log("appending c", c);
            appendCircleWithMidpoint(<d3SVG>svg, c, maxLevels);
            appendPolygon(<d3SVG>svg, Hexagon.withinCircle(c).lines);
        }
    );
    // appendCircleWithMidpoint(<d3SVG>svg, circle);
}