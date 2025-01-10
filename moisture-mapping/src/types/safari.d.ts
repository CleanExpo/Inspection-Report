interface CSSStyleDeclaration {
    webkitTouchCallout?: string;
    webkitUserSelect?: string;
    webkitTapHighlightColor?: string;
}

interface TouchEvent {
    readonly scale?: number;
    readonly rotation?: number;
}

interface TouchList {
    readonly identifiedTouch?: (identifier: number) => Touch;
}

interface Touch {
    readonly webkitForce?: number;
    readonly webkitRadiusX?: number;
    readonly webkitRadiusY?: number;
    readonly webkitRotationAngle?: number;
}
