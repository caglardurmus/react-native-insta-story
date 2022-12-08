"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePrevious = void 0;
const react_1 = require("react");
function usePrevious(value) {
    const ref = (0, react_1.useRef)();
    (0, react_1.useEffect)(() => {
        ref.current = value;
    });
    return ref.current;
}
exports.usePrevious = usePrevious;
