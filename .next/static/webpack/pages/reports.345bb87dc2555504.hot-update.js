"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("pages/reports",{

/***/ "./src/data/mockData.js":
/*!******************************!*\
  !*** ./src/data/mockData.js ***!
  \******************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getReportById: function() { return /* binding */ getReportById; },\n/* harmony export */   getReports: function() { return /* binding */ getReports; },\n/* harmony export */   mockReports: function() { return /* binding */ mockReports; }\n/* harmony export */ });\nconst mockReports = [\n    {\n        id: \"1\",\n        clientName: \"John Smith\",\n        propertyAddress: \"123 Main St, Anytown, USA\",\n        inspectionDate: \"2024-01-15\",\n        inspectorName: \"Mike Johnson\",\n        damageType: \"water\",\n        severity: \"high\",\n        status: \"completed\",\n        createdAt: \"2024-01-15T10:30:00Z\"\n    },\n    {\n        id: \"2\",\n        clientName: \"Sarah Wilson\",\n        propertyAddress: \"456 Oak Ave, Somewhere, USA\",\n        inspectionDate: \"2024-01-16\",\n        inspectorName: \"Mike Johnson\",\n        damageType: \"mold\",\n        severity: \"medium\",\n        status: \"in-progress\",\n        createdAt: \"2024-01-16T14:20:00Z\"\n    },\n    {\n        id: \"3\",\n        clientName: \"Robert Brown\",\n        propertyAddress: \"789 Pine Rd, Elsewhere, USA\",\n        inspectionDate: \"2024-01-17\",\n        inspectorName: \"Lisa Davis\",\n        damageType: \"fire\",\n        severity: \"critical\",\n        status: \"completed\",\n        createdAt: \"2024-01-17T09:15:00Z\"\n    }\n];\nconst getReports = ()=>{\n    // Simulate network delay\n    return new Promise((resolve)=>{\n        setTimeout(()=>{\n            resolve(mockReports);\n        }, 1500);\n    });\n};\nconst getReportById = (id)=>{\n    const report = mockReports.find((r)=>r.id === id);\n    return Promise.resolve(report || null);\n};\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvZGF0YS9tb2NrRGF0YS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBTyxNQUFNQSxjQUFjO0lBQ3pCO1FBQ0VDLElBQUk7UUFDSkMsWUFBWTtRQUNaQyxpQkFBaUI7UUFDakJDLGdCQUFnQjtRQUNoQkMsZUFBZTtRQUNmQyxZQUFZO1FBQ1pDLFVBQVU7UUFDVkMsUUFBUTtRQUNSQyxXQUFXO0lBQ2I7SUFDQTtRQUNFUixJQUFJO1FBQ0pDLFlBQVk7UUFDWkMsaUJBQWlCO1FBQ2pCQyxnQkFBZ0I7UUFDaEJDLGVBQWU7UUFDZkMsWUFBWTtRQUNaQyxVQUFVO1FBQ1ZDLFFBQVE7UUFDUkMsV0FBVztJQUNiO0lBQ0E7UUFDRVIsSUFBSTtRQUNKQyxZQUFZO1FBQ1pDLGlCQUFpQjtRQUNqQkMsZ0JBQWdCO1FBQ2hCQyxlQUFlO1FBQ2ZDLFlBQVk7UUFDWkMsVUFBVTtRQUNWQyxRQUFRO1FBQ1JDLFdBQVc7SUFDYjtDQUNELENBQUM7QUFFSyxNQUFNQyxhQUFhO0lBQ3hCLHlCQUF5QjtJQUN6QixPQUFPLElBQUlDLFFBQVEsQ0FBQ0M7UUFDbEJDLFdBQVc7WUFDVEQsUUFBUVo7UUFDVixHQUFHO0lBQ0w7QUFDRixFQUFFO0FBRUssTUFBTWMsZ0JBQWdCLENBQUNiO0lBQzVCLE1BQU1jLFNBQVNmLFlBQVlnQixJQUFJLENBQUNDLENBQUFBLElBQUtBLEVBQUVoQixFQUFFLEtBQUtBO0lBQzlDLE9BQU9VLFFBQVFDLE9BQU8sQ0FBQ0csVUFBVTtBQUNuQyxFQUFFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL3NyYy9kYXRhL21vY2tEYXRhLmpzPzNlMWUiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IG1vY2tSZXBvcnRzID0gW1xyXG4gIHtcclxuICAgIGlkOiAnMScsXHJcbiAgICBjbGllbnROYW1lOiAnSm9obiBTbWl0aCcsXHJcbiAgICBwcm9wZXJ0eUFkZHJlc3M6ICcxMjMgTWFpbiBTdCwgQW55dG93biwgVVNBJyxcclxuICAgIGluc3BlY3Rpb25EYXRlOiAnMjAyNC0wMS0xNScsXHJcbiAgICBpbnNwZWN0b3JOYW1lOiAnTWlrZSBKb2huc29uJyxcclxuICAgIGRhbWFnZVR5cGU6ICd3YXRlcicsXHJcbiAgICBzZXZlcml0eTogJ2hpZ2gnLFxyXG4gICAgc3RhdHVzOiAnY29tcGxldGVkJyxcclxuICAgIGNyZWF0ZWRBdDogJzIwMjQtMDEtMTVUMTA6MzA6MDBaJ1xyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6ICcyJyxcclxuICAgIGNsaWVudE5hbWU6ICdTYXJhaCBXaWxzb24nLFxyXG4gICAgcHJvcGVydHlBZGRyZXNzOiAnNDU2IE9hayBBdmUsIFNvbWV3aGVyZSwgVVNBJyxcclxuICAgIGluc3BlY3Rpb25EYXRlOiAnMjAyNC0wMS0xNicsXHJcbiAgICBpbnNwZWN0b3JOYW1lOiAnTWlrZSBKb2huc29uJyxcclxuICAgIGRhbWFnZVR5cGU6ICdtb2xkJyxcclxuICAgIHNldmVyaXR5OiAnbWVkaXVtJyxcclxuICAgIHN0YXR1czogJ2luLXByb2dyZXNzJyxcclxuICAgIGNyZWF0ZWRBdDogJzIwMjQtMDEtMTZUMTQ6MjA6MDBaJ1xyXG4gIH0sXHJcbiAge1xyXG4gICAgaWQ6ICczJyxcclxuICAgIGNsaWVudE5hbWU6ICdSb2JlcnQgQnJvd24nLFxyXG4gICAgcHJvcGVydHlBZGRyZXNzOiAnNzg5IFBpbmUgUmQsIEVsc2V3aGVyZSwgVVNBJyxcclxuICAgIGluc3BlY3Rpb25EYXRlOiAnMjAyNC0wMS0xNycsXHJcbiAgICBpbnNwZWN0b3JOYW1lOiAnTGlzYSBEYXZpcycsXHJcbiAgICBkYW1hZ2VUeXBlOiAnZmlyZScsXHJcbiAgICBzZXZlcml0eTogJ2NyaXRpY2FsJyxcclxuICAgIHN0YXR1czogJ2NvbXBsZXRlZCcsXHJcbiAgICBjcmVhdGVkQXQ6ICcyMDI0LTAxLTE3VDA5OjE1OjAwWidcclxuICB9XHJcbl07XHJcblxyXG5leHBvcnQgY29uc3QgZ2V0UmVwb3J0cyA9ICgpID0+IHtcclxuICAvLyBTaW11bGF0ZSBuZXR3b3JrIGRlbGF5XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgcmVzb2x2ZShtb2NrUmVwb3J0cyk7XHJcbiAgICB9LCAxNTAwKTtcclxuICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRSZXBvcnRCeUlkID0gKGlkKSA9PiB7XHJcbiAgY29uc3QgcmVwb3J0ID0gbW9ja1JlcG9ydHMuZmluZChyID0+IHIuaWQgPT09IGlkKTtcclxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlcG9ydCB8fCBudWxsKTtcclxufTtcclxuIl0sIm5hbWVzIjpbIm1vY2tSZXBvcnRzIiwiaWQiLCJjbGllbnROYW1lIiwicHJvcGVydHlBZGRyZXNzIiwiaW5zcGVjdGlvbkRhdGUiLCJpbnNwZWN0b3JOYW1lIiwiZGFtYWdlVHlwZSIsInNldmVyaXR5Iiwic3RhdHVzIiwiY3JlYXRlZEF0IiwiZ2V0UmVwb3J0cyIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsImdldFJlcG9ydEJ5SWQiLCJyZXBvcnQiLCJmaW5kIiwiciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/data/mockData.js\n"));

/***/ })

});