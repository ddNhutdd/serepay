const GRID_COLOR = "#edebed";
const UP_COLOR = "#299d82";
const DOWN_COLOR = "#e65656";
const NO_CHANGE_COLOR = "#888888";
const MARK_COLOR = "#a3a3a3";

export const chartOption = {
  grid: {
    show: true,
    horizontal: {
      show: true,
      size: 1,
      color: GRID_COLOR,
      style: "solid",
    },
    vertical: {
      show: true,
      size: 1,
      color: GRID_COLOR,
      style: "solid",
    },
  },
  candle: {
    margin: {
      top: 0.2,
      bottom: 0.1,
    },
    type: "candle_solid",
    bar: {
      upColor: UP_COLOR,
      downColor: DOWN_COLOR,
      noChangeColor: NO_CHANGE_COLOR,
    },
    priceMark: {
      show: true,
      high: {
        show: true,
        color: MARK_COLOR,
        textMargin: 5,
        textSize: 12,
        textFamily: "Helvetica Neue",
        textWeight: "normal",
      },
      low: {
        show: true,
        color: MARK_COLOR,
        textMargin: 5,
        textSize: 12,
        textFamily: "Helvetica Neue",
        textWeight: "normal",
      },
      last: {
        show: true,
        upColor: UP_COLOR,
        downColor: DOWN_COLOR,
        noChangeColor: NO_CHANGE_COLOR,
        line: {
          show: true,
          style: "dash",
          dashValue: [5, 5],
          size: 1,
        },
        text: {
          show: true,
          size: 12,
          paddingLeft: 5,
          paddingTop: 5,
          paddingRight: 5,
          paddingBottom: 5,
          color: "#FFFFFF",
          family: "Helvetica Neue",
          weight: "normal",
          borderRadius: 5,
        },
      },
    },
    tooltip: {
      showRule: "always",
      showType: "standard",
      labels: ["Time: ", "O: ", "C: ", "H: ", "L: ", "V: "],
      values: null,
      defaultValue: "n/a",
      text: {
        size: 12,
        family: "Helvetica Neue",
        weight: "normal",
        color: MARK_COLOR,
        marginLeft: 18,
        marginTop: 18,
        marginRight: 18,
        marginBottom: 18,
      },
    },
  },
  technicalIndicator: {
    margin: {
      top: 0.2,
      bottom: 0.1,
    },
    line: {
      size: 1,
      colors: ["#FF9600", "#9D65C9", "#2196F3", "#E11D74", "#01C5C4"],
    },
    tooltip: {
      showRule: "always",
      showType: "standard",
      showName: true,
      showParams: true,
      defaultValue: "n/a",
      text: {
        size: 12,
        family: "Helvetica Neue",
        weight: "normal",
        color: MARK_COLOR,
        marginTop: 8,
        marginRight: 18,
        marginBottom: 18,
        marginLeft: 18,
      },
    },
  },
  xAxis: {
    show: true,
    height: null,
    axisLine: {
      show: true,
      color: "#888888",
      size: 1,
    },
    tickText: {
      show: true,
      color: MARK_COLOR,
      family: "Helvetica Neue",
      weight: "normal",
      size: 12,
      paddingTop: 10,
      paddingBottom: 10,
    },
    tickLine: {
      show: true,
      size: 1,
      length: 3,
      color: "#888888",
    },
  },
  yAxis: {
    show: true,
    width: null,
    position: "right",
    type: "normal",
    inside: false,
    reverse: false,
    axisLine: {
      show: true,
      color: "#888888",
      size: 1,
    },
    tickText: {
      show: true,
      color: MARK_COLOR,
      family: "Helvetica Neue",
      weight: "normal",
      size: 12,
      paddingLeft: 10,
      paddingRight: 10,
    },
    tickLine: {
      show: true,
      size: 1,
      length: 3,
      color: "#888888",
    },
  },
  crosshair: {
    show: true,
    horizontal: {
      show: true,
      line: {
        show: true,
        style: "dash",
        dashValue: [1, 1],
        size: 1,
        color: "#888888",
      },
      text: {
        show: true,
        color: "#D9D9D9",
        size: 12,
        family: "Helvetica Neue",
        weight: "normal",
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 5,
        paddingBottom: 5,
        borderSize: 1,
        borderColor: "#505050",
        borderRadius: 5,
        backgroundColor: "#505050",
      },
    },
    vertical: {
      show: true,
      line: {
        show: true,
        style: "dash",
        dashValue: [1, 1],
        size: 1,
        color: "#888888",
      },
      text: {
        show: true,
        color: "#D9D9D9",
        size: 12,
        family: "Helvetica Neue",
        weight: "normal",
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 5,
        paddingBottom: 5,
        borderSize: 1,
        borderColor: "#505050",
        borderRadius: 5,
        backgroundColor: "#505050",
      },
    },
  },
  shape: {
    point: {
      backgroundColor: "#2196F3",
      borderColor: "#2196F3",
      borderSize: 1,
      radius: 4,
      activeBackgroundColor: "#2196F3",
      activeBorderColor: "#2196F3",
      activeBorderSize: 1,
      activeRadius: 6,
    },
    line: {
      // 'solid'|'dash'
      style: "solid",
      color: "#2196F3",
      size: 1,
      dashValue: [2, 2],
    },
    polygon: {
      // 'stroke'|'fill'
      style: "stroke",
      stroke: {
        // 'solid'|'dash'
        style: "solid",
        size: 1,
        color: "#2196F3",
        dashValue: [2, 2],
      },
      fill: {
        color: "rgba(33, 150, 243, 0.1)",
      },
    },
    arc: {
      // 'stroke'|'fill'
      style: "stroke",
      stroke: {
        // 'solid'|'dash'
        style: "solid",
        size: 1,
        color: "#2196F3",
        dashValue: [2, 2],
      },
      fill: {
        color: "#2196F3",
      },
    },
    text: {
      style: "fill",
      color: "#2196F3",
      size: 12,
      family: "Helvetica Neue",
      weight: "normal",
      offset: [0, 0],
    },
  },
  annotation: {
    // 'top' | 'bottom' | 'point'
    position: "top",
    offset: [20, 0],
    symbol: {
      // 'diamond' | 'circle' | 'rect' | 'triangle' | 'custom' | 'none'
      type: "diamond",
      size: 8,
      color: "#2196F3",
      activeSize: 10,
      activeColor: "#FF9600",
    },
  },
};
