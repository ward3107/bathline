/* Market-calibrated, quantity-aware estimate engine. */
(function (root) {
  'use strict';
  const workOrder = ['demolition','plumbing','movePoints','waterproofing','flooring','cladding','sanitary','toilet','shower','vanity','showerSet','drainChannel','electric','ceiling','niche','accessories','finish'];
  const core = ['demolition','plumbing','waterproofing','flooring','cladding','sanitary','toilet','shower','vanity','showerSet','electric','finish'];

  function clamp(value, min, max) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : min;
  }

  function roomFactor(floorSqm, wallSqm) {
    // Normalized so a typical ~6 m² floor + ~28 m² walls is close to ×1.00.
    return Math.max(0.82, Math.min(1.28, 0.55 + floorSqm * 0.035 + wallSqm * 0.009));
  }

  function floorFactor(floorSqm) {
    // Typical 6 m² bathroom ≈ ×1.00.
    return Math.max(0.85, Math.min(1.30, 0.70 + floorSqm * 0.05));
  }

  function quantityFor(key, state, prices) {
    const limits = prices.quantityLimits?.[key];
    if (!limits) return 1;
    const fallback = prices.quantityDefaults?.[key] ?? limits.min;
    return Math.round(clamp(state.quantities?.[key] ?? fallback, limits.min, limits.max));
  }

  function calculate(state, prices) {
    const floorSqm = clamp(state.floor, 0, 20);
    const wallSqm = clamp(state.walls, 0, 80);
    const installments = Math.round(clamp(state.installments, 1, 36));
    const requested = new Set(Array.isArray(state.works) ? state.works : []);
    const works = workOrder.filter(key => requested.has(key));
    const rFactor = roomFactor(floorSqm, wallSqm);
    const fFactor = floorFactor(floorSqm);

    const quantities = {};
    const rows = [];
    const missing = [];

    for (const [key, quantity] of [['flooring', floorSqm], ['cladding', wallSqm]]) {
      if (!works.includes(key)) continue;
      if (quantity <= 0) { missing.push(key); continue; }
      const p = prices.areaRates[key];
      rows.push({
        key, quantity, unit: 'area', adjusted: false,
        min: quantity * p.minPerSqm,
        max: quantity * p.maxPerSqm
      });
    }

    for (const key of works) {
      if (key === 'flooring' || key === 'cladding') continue;
      const p = prices.works[key];
      if (!p) continue;

      const qty = quantityFor(key, state, prices);
      quantities[key] = qty;

      let scale = 1;
      if (p.scale === 'room') scale = rFactor;
      else if (p.scale === 'floor') scale = fFactor;

      rows.push({
        key,
        quantity: qty,
        unit: p.unit || 'job',
        adjusted: scale !== 1,
        scale,
        min: p.min * qty * scale,
        max: p.max * qty * scale
      });
    }

    const min = rows.reduce((sum, row) => sum + row.min, 0);
    const max = rows.reduce((sum, row) => sum + row.max, 0);

    return {
      floorSqm, wallSqm, installments, works, quantities,
      factor: rFactor, floorFactor: fFactor,
      rows, missing, min, max,
      monthlyMin: min / installments,
      monthlyMax: max / installments,
      hasAny: rows.length > 0
    };
  }

  const api = Object.freeze({
    calculate,
    workOrder: Object.freeze(workOrder),
    core: Object.freeze(core),
    clamp,
    roomFactor,
    floorFactor
  });

  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BATHLINE_ENGINE = api;
})(typeof window !== 'undefined' ? window : globalThis);
