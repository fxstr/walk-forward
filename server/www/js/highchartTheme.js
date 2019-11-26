// Source https://raw.githubusercontent.com/jbkunst/highcharts-themes-collection/gh-pages/themes/db.js
const theme = {
  "colors": ["#A9CF54", "#C23C2A", "#FFFFFF", "#979797", "#FBB829"],
  "chart": {
    "backgroundColor": "#242F39",
    "style": {
      "color": "white"
    }
  },
  "legend": {
    "enabled": true,
    "align": "right",
    "verticalAlign": "bottom",
    "itemStyle": {
      "color": "#C0C0C0"
    },
    "itemHoverStyle": {
      "color": "#C0C0C0"
    },
    "itemHiddenStyle": {
      "color": "#444444"
    }
  },
  "title": {
    "text": {},
    "style": {
      "color": "#FFFFFF"
    }
  },
  "tooltip": {
    "backgroundColor": "#1C242D",
    "borderColor": "#1C242D",
    "borderWidth": 1,
    "borderRadius": 0,
    "style": {
      "color": "#FFFFFF"
    }
  },
  "subtitle": {
    "style": {
      "color": "#666666"
    }
  },
  "xAxis": {
    "gridLineColor": "#2E3740",
    "gridLineWidth": 1,
    "labels": {
      "style": {
        "color": "#c2c2c2"
      }
    },
    "lineColor": "#2E3740",
    "tickColor": "#2E3740",
    "title": {
      "style": {
        "color": "#FFFFFF"
      },
    }
  },
  "yAxis": {
    "gridLineColor": "#2E3740",
    "gridLineWidth": 1,
    "labels": {
      "style": {
        "color": "#c2c2c2"
      },
      "lineColor": "#2E3740",
      "tickColor": "#2E3740",
      "title": {
        "style": {
          "color": "#FFFFFF"
        },
        "text": {}
      }
    }
  }
}

Highcharts.setOptions(theme);