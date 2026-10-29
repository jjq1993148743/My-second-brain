import sys, json
from playwright.sync_api import sync_playwright
url = sys.argv[1]
JS = '''
() => {
  const bad = [];
  document.querySelectorAll('.chip').forEach((c) => {
    const over = c.scrollHeight - c.clientHeight;
    if (over > 1) bad.push('CARD_OVERFLOW ' + c.id);
  });
  document.querySelectorAll('section.chain').forEach((sec, secIdx) => {
    const cn = sec.getAttribute('data-chain-idx') !== null ? sec.getAttribute('data-chain-idx') : secIdx;
    const canvas = sec.querySelector('.canvas'); const cr = canvas.getBoundingClientRect();
    const chips = [...sec.querySelectorAll('.chip')].map(c => { const a = c.getBoundingClientRect();
      return { id: c.id, step: c.dataset.step, l: a.left-cr.left, r: a.right-cr.left, t: a.top-cr.top, b: a.bottom-cr.top }; });
    const idIdx = {}; chips.forEach((c,i) => idIdx[c.id] = i);
    sec.querySelectorAll('path.wire').forEach(w => {
      const d = w.getAttribute('d'); const nums = d.match(/-?\\d+\\.?\\d*/g);
      if (!nums) return;
      const pts = []; for (let i=0;i+1<nums.length;i+=2) pts.push([+nums[i], +nums[i+1]]);
      for (let i=0;i+1<pts.length;i++) {
        const p = pts[i], q = pts[i+1];
        const v = Math.abs(p[0]-q[0]) < 0.6, h = Math.abs(p[1]-q[1]) < 0.6;
        for (const c of chips) {
          if (String(c.step) === String(w.dataset.a) || String(c.step) === String(w.dataset.b)) continue;
          const cx = (c.l + c.r)/2, cy = (c.t + c.b)/2;
          if (v) {
            const y1=Math.min(p[1],q[1]), y2=Math.max(p[1],q[1]);
            if (y1 < c.b && y2 > c.t && p[0] > c.l && p[0] < c.r) bad.push('chain[' + cn + '] WIRE_THROUGH ' + w.dataset.a + '->' + w.dataset.b + ' ' + c.id);
            else if (y1 < c.b && y2 > c.t && (Math.abs(p[0]-c.l) < 6 || Math.abs(p[0]-c.r) < 6)) bad.push('chain[' + cn + '] EDGE_HUG_V ' + w.dataset.a + '->' + w.dataset.b + ' ' + c.id);
          } else if (h) {
            const x1=Math.min(p[0],q[0]), x2=Math.max(p[0],q[0]);
            if (x1 < c.r && x2 > c.l && p[1] > c.t && p[1] < c.b) bad.push('chain[' + cn + '] WIRE_THROUGH ' + w.dataset.a + '->' + w.dataset.b + ' ' + c.id);
            else if (x1 < c.r && x2 > c.l && (Math.abs(p[1]-c.t) < 6 || Math.abs(p[1]-c.b) < 6)) bad.push('chain[' + cn + '] EDGE_HUG_H ' + w.dataset.a + '->' + w.dataset.b + ' ' + c.id);
          }
        }
      }
    });
    const bands = [...sec.querySelectorAll('.band')];
    const ths = [...sec.querySelectorAll('.trow.head .th')];
    if (bands.length !== ths.length) bad.push('LANE_COUNT');
    ths.forEach((h2, i) => {
      const a = h2.getBoundingClientRect(), b = bands[i] && bands[i].getBoundingClientRect();
      if (!b) return;
      if (Math.abs(a.left-b.left) > 1 || Math.abs(a.right-b.right) > 1) bad.push('LANE_MISALIGN col'+i);
    });
  });
  return bad.slice(0, 20);
}
'''
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1920, 'height': 1000})
    pg.goto(url, wait_until='load')
    pg.wait_for_timeout(900)
    res = pg.evaluate(JS)
    print(json.dumps({'problems': res}, ensure_ascii=False))
    b.close()
    sys.exit(1 if res else 0)