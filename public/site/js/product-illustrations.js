/* eslint-disable */
// EchoWAI — Product illustrations (SVG, on-brand)
// Style: line + flat fill, navy/blue/sky palette, ~180x110

const SVGBase = ({
  children
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 180 110",
  fill: "none",
  style: {
    width: "100%",
    height: "100%",
    display: "block"
  },
  preserveAspectRatio: "xMidYMid meet"
}, children);

// 1. Insulation roll — side view of a rolled insulation mat
const InsulationIllustration = () => /*#__PURE__*/React.createElement(SVGBase, null, /*#__PURE__*/React.createElement("rect", {
  x: "32",
  y: "32",
  width: "120",
  height: "50",
  rx: "3",
  fill: "var(--volt-soft)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), /*#__PURE__*/React.createElement("ellipse", {
  cx: "32",
  cy: "57",
  rx: "5",
  ry: "25",
  fill: "var(--card)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), /*#__PURE__*/React.createElement("ellipse", {
  cx: "32",
  cy: "57",
  rx: "2.5",
  ry: "14",
  stroke: "var(--ink)",
  strokeWidth: "1",
  strokeOpacity: "0.5",
  fill: "none"
}), [42, 50, 58, 66, 74].map((y, i) => /*#__PURE__*/React.createElement("path", {
  key: y,
  d: `M 42 ${y} Q 62 ${y - 2 + i % 2 * 4}, 82 ${y} T 122 ${y} T 152 ${y}`,
  stroke: "var(--ink)",
  strokeWidth: "0.8",
  strokeOpacity: "0.32",
  fill: "none"
})), /*#__PURE__*/React.createElement("path", {
  d: "M 152 32 Q 162 42, 162 57 T 152 82",
  stroke: "var(--ink)",
  strokeWidth: "1.4",
  fill: "none"
}), /*#__PURE__*/React.createElement("line", {
  x1: "20",
  y1: "92",
  x2: "168",
  y2: "92",
  stroke: "var(--ink)",
  strokeOpacity: "0.12",
  strokeWidth: "1"
}));

// 2. Heat pump — outdoor unit with fan grille
const HeatPumpIllustration = () => /*#__PURE__*/React.createElement(SVGBase, null, /*#__PURE__*/React.createElement("rect", {
  x: "36",
  y: "28",
  width: "108",
  height: "62",
  rx: "3",
  fill: "var(--card)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "90",
  cy: "59",
  r: "22",
  fill: "var(--volt-soft)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), [0, 60, 120, 180, 240, 300].map(deg => /*#__PURE__*/React.createElement("path", {
  key: deg,
  d: `M 90 59 L ${90 + 18 * Math.cos((deg - 60) * Math.PI / 180)} ${59 + 18 * Math.sin((deg - 60) * Math.PI / 180)}`,
  stroke: "var(--ink)",
  strokeWidth: "1.2",
  strokeLinecap: "round"
})), /*#__PURE__*/React.createElement("circle", {
  cx: "90",
  cy: "59",
  r: "4",
  fill: "var(--ink)"
}), /*#__PURE__*/React.createElement("line", {
  x1: "42",
  y1: "40",
  x2: "56",
  y2: "40",
  stroke: "var(--ink)",
  strokeWidth: "1",
  strokeOpacity: "0.5"
}), /*#__PURE__*/React.createElement("line", {
  x1: "42",
  y1: "46",
  x2: "56",
  y2: "46",
  stroke: "var(--ink)",
  strokeWidth: "1",
  strokeOpacity: "0.5"
}), /*#__PURE__*/React.createElement("line", {
  x1: "124",
  y1: "40",
  x2: "138",
  y2: "40",
  stroke: "var(--ink)",
  strokeWidth: "1",
  strokeOpacity: "0.5"
}), /*#__PURE__*/React.createElement("line", {
  x1: "124",
  y1: "46",
  x2: "138",
  y2: "46",
  stroke: "var(--ink)",
  strokeWidth: "1",
  strokeOpacity: "0.5"
}), /*#__PURE__*/React.createElement("rect", {
  x: "46",
  y: "90",
  width: "14",
  height: "4",
  fill: "var(--ink)"
}), /*#__PURE__*/React.createElement("rect", {
  x: "120",
  y: "90",
  width: "14",
  height: "4",
  fill: "var(--ink)"
}), /*#__PURE__*/React.createElement("rect", {
  x: "64",
  y: "32",
  width: "52",
  height: "3",
  fill: "var(--volt)"
}));

// 3. VMC double flux — central unit with ducts
const VMCIllustration = () => /*#__PURE__*/React.createElement(SVGBase, null, /*#__PURE__*/React.createElement("rect", {
  x: "60",
  y: "38",
  width: "60",
  height: "44",
  rx: "3",
  fill: "var(--volt-soft)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "74",
  cy: "50",
  r: "2.5",
  fill: "var(--volt)"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "84",
  cy: "50",
  r: "2.5",
  fill: "var(--ink)",
  fillOpacity: "0.3"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "94",
  cy: "50",
  r: "2.5",
  fill: "var(--ink)",
  fillOpacity: "0.3"
}), /*#__PURE__*/React.createElement("rect", {
  x: "70",
  y: "60",
  width: "40",
  height: "14",
  rx: "1",
  fill: "var(--ink)"
}), /*#__PURE__*/React.createElement("text", {
  x: "90",
  y: "71",
  fontSize: "7",
  fill: "var(--volt)",
  textAnchor: "middle",
  fontFamily: "monospace"
}, "19\xB0C"), /*#__PURE__*/React.createElement("path", {
  d: "M 60 42 L 30 32 L 18 22",
  stroke: "var(--ink)",
  strokeWidth: "1.6",
  fill: "none",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "18",
  cy: "22",
  r: "4",
  fill: "var(--card)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 120 42 L 150 32 L 162 22",
  stroke: "var(--ink)",
  strokeWidth: "1.6",
  fill: "none",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "162",
  cy: "22",
  r: "4",
  fill: "var(--card)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 60 78 L 30 88 L 18 96",
  stroke: "var(--ink)",
  strokeWidth: "1.6",
  fill: "none",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "18",
  cy: "96",
  r: "4",
  fill: "var(--card)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 120 78 L 150 88 L 162 96",
  stroke: "var(--ink)",
  strokeWidth: "1.6",
  fill: "none",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "162",
  cy: "96",
  r: "4",
  fill: "var(--card)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 36 32 L 32 28 M 36 32 L 32 36",
  stroke: "var(--volt)",
  strokeWidth: "1.3",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 144 88 L 148 84 M 144 88 L 148 92",
  stroke: "var(--volt)",
  strokeWidth: "1.3",
  strokeLinecap: "round"
}));

// 4. Smart thermostat — round dial with screen
const ThermostatIllustration = () => /*#__PURE__*/React.createElement(SVGBase, null, /*#__PURE__*/React.createElement("circle", {
  cx: "90",
  cy: "55",
  r: "38",
  fill: "var(--card)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "90",
  cy: "55",
  r: "30",
  fill: "var(--volt-soft)",
  stroke: "var(--ink)",
  strokeWidth: "1",
  strokeOpacity: "0.6"
}), /*#__PURE__*/React.createElement("text", {
  x: "90",
  y: "56",
  fontSize: "18",
  fill: "var(--ink)",
  textAnchor: "middle",
  fontFamily: "var(--font-display)",
  fontWeight: "500"
}, "20\xB0"), /*#__PURE__*/React.createElement("text", {
  x: "90",
  y: "68",
  fontSize: "6",
  fill: "var(--ink)",
  fillOpacity: "0.6",
  textAnchor: "middle",
  fontFamily: "monospace",
  letterSpacing: "1"
}, "CONFORT"), Array.from({
  length: 24
}).map((_, i) => {
  const angle = i / 24 * 2 * Math.PI - Math.PI / 2;
  const x1 = 90 + 35 * Math.cos(angle);
  const y1 = 55 + 35 * Math.sin(angle);
  const x2 = 90 + 32 * Math.cos(angle);
  const y2 = 55 + 32 * Math.sin(angle);
  return /*#__PURE__*/React.createElement("line", {
    key: i,
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
    stroke: "var(--ink)",
    strokeWidth: i % 6 === 0 ? "1.5" : "0.8",
    strokeOpacity: i % 6 === 0 ? "0.7" : "0.35"
  });
}), /*#__PURE__*/React.createElement("circle", {
  cx: "118",
  cy: "42",
  r: "2.5",
  fill: "var(--volt)"
}), /*#__PURE__*/React.createElement("line", {
  x1: "20",
  y1: "98",
  x2: "160",
  y2: "98",
  stroke: "var(--ink)",
  strokeOpacity: "0.12",
  strokeWidth: "1"
}));

// 5. LED tube T8
const LEDIllustration = () => /*#__PURE__*/React.createElement(SVGBase, null, /*#__PURE__*/React.createElement("rect", {
  x: "18",
  y: "48",
  width: "144",
  height: "14",
  rx: "7",
  fill: "var(--volt-soft)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), /*#__PURE__*/React.createElement("rect", {
  x: "22",
  y: "50",
  width: "136",
  height: "3",
  rx: "1.5",
  fill: "var(--volt)",
  fillOpacity: "0.7"
}), /*#__PURE__*/React.createElement("rect", {
  x: "14",
  y: "44",
  width: "8",
  height: "22",
  rx: "1.5",
  fill: "var(--ink)"
}), /*#__PURE__*/React.createElement("rect", {
  x: "158",
  y: "44",
  width: "8",
  height: "22",
  rx: "1.5",
  fill: "var(--ink)"
}), /*#__PURE__*/React.createElement("line", {
  x1: "11",
  y1: "48",
  x2: "11",
  y2: "52",
  stroke: "var(--ink)",
  strokeWidth: "1.5",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("line", {
  x1: "11",
  y1: "58",
  x2: "11",
  y2: "62",
  stroke: "var(--ink)",
  strokeWidth: "1.5",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("line", {
  x1: "169",
  y1: "48",
  x2: "169",
  y2: "52",
  stroke: "var(--ink)",
  strokeWidth: "1.5",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("line", {
  x1: "169",
  y1: "58",
  x2: "169",
  y2: "62",
  stroke: "var(--ink)",
  strokeWidth: "1.5",
  strokeLinecap: "round"
}), [40, 70, 100, 130].map((x, i) => /*#__PURE__*/React.createElement("line", {
  key: i,
  x1: x,
  y1: "68",
  x2: x,
  y2: "88",
  stroke: "var(--volt)",
  strokeWidth: "1",
  strokeOpacity: 0.5 - Math.abs(i - 1.5) * 0.1,
  strokeLinecap: "round"
})), /*#__PURE__*/React.createElement("text", {
  x: "90",
  y: "38",
  fontSize: "7",
  fill: "var(--ink)",
  fillOpacity: "0.5",
  textAnchor: "middle",
  fontFamily: "monospace"
}, "T8 \xB7 22W"));

// 6. Industrial heat pump — agricultural/industrial unit
const IndustrialPumpIllustration = () => /*#__PURE__*/React.createElement(SVGBase, null, /*#__PURE__*/React.createElement("rect", {
  x: "28",
  y: "20",
  width: "124",
  height: "68",
  rx: "3",
  fill: "var(--card)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "62",
  cy: "54",
  r: "18",
  fill: "var(--volt-soft)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "118",
  cy: "54",
  r: "18",
  fill: "var(--volt-soft)",
  stroke: "var(--ink)",
  strokeWidth: "1.4"
}), [0, 90, 180, 270].map(deg => /*#__PURE__*/React.createElement(React.Fragment, {
  key: deg
}, /*#__PURE__*/React.createElement("path", {
  d: `M 62 54 L ${62 + 15 * Math.cos((deg - 45) * Math.PI / 180)} ${54 + 15 * Math.sin((deg - 45) * Math.PI / 180)}`,
  stroke: "var(--ink)",
  strokeWidth: "1.2"
}), /*#__PURE__*/React.createElement("path", {
  d: `M 118 54 L ${118 + 15 * Math.cos((deg + 45) * Math.PI / 180)} ${54 + 15 * Math.sin((deg + 45) * Math.PI / 180)}`,
  stroke: "var(--ink)",
  strokeWidth: "1.2"
}))), /*#__PURE__*/React.createElement("circle", {
  cx: "62",
  cy: "54",
  r: "3",
  fill: "var(--ink)"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "118",
  cy: "54",
  r: "3",
  fill: "var(--ink)"
}), /*#__PURE__*/React.createElement("rect", {
  x: "36",
  y: "26",
  width: "108",
  height: "2",
  fill: "var(--ink)",
  fillOpacity: "0.6"
}), /*#__PURE__*/React.createElement("rect", {
  x: "36",
  y: "30",
  width: "108",
  height: "1",
  fill: "var(--ink)",
  fillOpacity: "0.4"
}), /*#__PURE__*/React.createElement("rect", {
  x: "38",
  y: "88",
  width: "20",
  height: "6",
  fill: "var(--ink)"
}), /*#__PURE__*/React.createElement("rect", {
  x: "122",
  y: "88",
  width: "20",
  height: "6",
  fill: "var(--ink)"
}), /*#__PURE__*/React.createElement("rect", {
  x: "86",
  y: "38",
  width: "8",
  height: "3",
  fill: "var(--volt)"
}), /*#__PURE__*/React.createElement("rect", {
  x: "86",
  y: "44",
  width: "8",
  height: "3",
  fill: "var(--ink)",
  fillOpacity: "0.4"
}), /*#__PURE__*/React.createElement("text", {
  x: "90",
  y: "80",
  fontSize: "7",
  fill: "var(--ink)",
  fillOpacity: "0.6",
  textAnchor: "middle",
  fontFamily: "monospace"
}, "18 kW"));

// Registry — lookup by code prefix
const PRODUCT_ILLUSTRATIONS = {
  "ISO": InsulationIllustration,
  "PAC": HeatPumpIllustration,
  "RT": VMCIllustration,
  "TH": ThermostatIllustration,
  "ECL": LEDIllustration,
  "AGR": IndustrialPumpIllustration
};
const ProductIllustration = ({
  code
}) => {
  const prefix = code.split("-")[0];
  const Comp = PRODUCT_ILLUSTRATIONS[prefix] || InsulationIllustration;
  return /*#__PURE__*/React.createElement(Comp, null);
};
Object.assign(window, {
  InsulationIllustration,
  HeatPumpIllustration,
  VMCIllustration,
  ThermostatIllustration,
  LEDIllustration,
  IndustrialPumpIllustration,
  ProductIllustration,
  PRODUCT_ILLUSTRATIONS
});