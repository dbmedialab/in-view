/**
* Check whether an element is in the viewport by
* more than offset px.
*/
export function inViewport (element, options) {

    const { top, right, bottom, left, width, height } = element.getBoundingClientRect();

    const intersection = {
        t: bottom,
        r: window.innerWidth - left,
        b: window.innerHeight - top,
        l: right
    };

    const threshold = {
        x: options.threshold * width,
        y: options.threshold * height
    };

    const verticalCheck = (
        intersection.t > (options.offset.top    + threshold.y) &&
        intersection.b > (options.offset.bottom + threshold.y)
    ) || (
        intersection.t < -options.offset.top &&
        intersection.b < -options.offset.bottom
    );

    const horizontalCheck = (
        intersection.r > (options.offset.right  + threshold.x) &&
        intersection.l > (options.offset.left   + threshold.x)
    ) || (
        intersection.r < -options.offset.right &&
        intersection.l < -options.offset.left
    );

    return verticalCheck && horizontalCheck;

}
