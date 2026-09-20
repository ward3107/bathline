/* Market-calibrated competitive estimate model for Israel, Sep 2026.
   Preliminary estimator only. Finish products are excluded unless explicitly stated. */
window.BATHLINE_PRICES = {
  "areaRates": {
    "flooring": {
      "label": "ריצוף רצפה",
      "minPerSqm": 175,
      "maxPerSqm": 205
    },
    "cladding": {
      "label": "חיפוי קירות",
      "minPerSqm": 150,
      "maxPerSqm": 180
    }
  },
  "works": {
    "demolition": {
      "label": "פירוק ופינוי",
      "min": 4200,
      "max": 4550,
      "scale": "room"
    },
    "plumbing": {
      "label": "נקודת מים / ניקוז",
      "min": 1450,
      "max": 1550,
      "unit": "point"
    },
    "movePoints": {
      "label": "הזזת נקודת מים / ניקוז",
      "min": 800,
      "max": 950,
      "unit": "point"
    },
    "waterproofing": {
      "label": "איטום",
      "min": 1900,
      "max": 2150,
      "scale": "floor"
    },
    "sanitary": {
      "label": "התקנת כלים סניטריים",
      "min": 550,
      "max": 650
    },
    "toilet": {
      "label": "ניאגרה סמויה / אסלה תלויה",
      "min": 2100,
      "max": 2300
    },
    "shower": {
      "label": "התקנת מקלחון",
      "min": 750,
      "max": 900
    },
    "vanity": {
      "label": "התקנת ארון אמבטיה + כיור",
      "min": 520,
      "max": 620
    },
    "showerSet": {
      "label": "אינטרפוץ",
      "min": 2250,
      "max": 2450,
      "unit": "unit"
    },
    "drainChannel": {
      "label": "תעלת ניקוז",
      "min": 1050,
      "max": 1150
    },
    "electric": {
      "label": "נקודת חשמל / תאורה",
      "min": 480,
      "max": 540,
      "unit": "point"
    },
    "ceiling": {
      "label": "תקרה / צבע",
      "min": 900,
      "max": 1050,
      "scale": "floor"
    },
    "niche": {
      "label": "נישה / מדף בנוי",
      "min": 800,
      "max": 950
    },
    "accessories": {
      "label": "אביזרים משלימים",
      "min": 300,
      "max": 450
    },
    "finish": {
      "label": "גמרים וניקיון",
      "min": 800,
      "max": 950,
      "scale": "room"
    }
  },
  "quantityDefaults": {
    "plumbing": 3,
    "movePoints": 1,
    "electric": 2,
    "showerSet": 1
  },
  "quantityLimits": {
    "plumbing": {
      "min": 1,
      "max": 8
    },
    "movePoints": {
      "min": 1,
      "max": 6
    },
    "electric": {
      "min": 1,
      "max": 8
    },
    "showerSet": {
      "min": 1,
      "max": 2
    }
  }
};
