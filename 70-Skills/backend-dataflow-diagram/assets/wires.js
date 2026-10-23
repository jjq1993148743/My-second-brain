(function () {
  var NS = 'http://www.w3.org/2000/svg'
  var R = 12, STUB = 22
  function box(el, base) {
    var br = base.getBoundingClientRect(), a = el.getBoundingClientRect()
    return { id: el.id, col: el.dataset.col, row: parseInt(el.dataset.row, 10),
             l: a.left - br.left, r: a.right - br.left, t: a.top - br.top, b: a.bottom - br.top,
             cx: a.left - br.left + a.width/2, cy: a.top - br.top + a.height/2, w: a.width, h: a.height }
  }
  // 正交保险 + 圆角
  function orth(pts) {
    var out = [pts[0]]
    for (var i = 1; i < pts.length; i++) {
      var p = pts[i], q = out[out.length-1]
      if (Math.abs(p[0]-q[0]) > 0.5 && Math.abs(p[1]-q[1]) > 0.5) out.push([q[0], p[1]])
      out.push(p)
    }
    return out
  }
  function rounded(raw) {
    var pts = orth(raw)
    if (pts.length < 3) return 'M'+pts[0][0]+' '+pts[0][1]+' L'+pts[1][0]+' '+pts[1][1]
    var d = 'M'+pts[0][0]+' '+pts[0][1]
    function u(a,b){var dx=b[0]-a[0],dy=b[1]-a[1],m=Math.hypot(dx,dy)||1;return [dx/m,dy/m,m]}
    for (var i=1;i<pts.length-1;i++){
      var p=pts[i],u1=u(p,pts[i-1]),u2=u(p,pts[i+1])
      var r1=Math.min(R,u1[2]/2), r2=Math.min(R,u2[2]/2)
      d += ' L'+(p[0]+u1[0]*r1)+' '+(p[1]+u1[1]*r1)
      d += ' Q'+p[0]+' '+p[1]+' '+(p[0]+u2[0]*r2)+' '+(p[1]+u2[1]*r2)
    }
    return d + ' L'+pts[pts.length-1][0]+' '+pts[pts.length-1][1]
  }
  function draw() {
    document.querySelectorAll('section.chain').forEach(function (sec) {
      var svg = sec.querySelector('svg.wires'), canvas = sec.querySelector('.canvas')
      if (!svg || !canvas) return
      var W = canvas.scrollWidth, H = canvas.scrollHeight
      svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox','0 0 '+W+' '+H)
      while (svg.firstChild) svg.removeChild(svg.firstChild)
      var defs = document.createElementNS(NS,'defs')
      defs.innerHTML = '<marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#475569"/></marker>'
      svg.appendChild(defs)
      var cr = canvas.getBoundingClientRect()
      // 列空隙中线、行空隙中线
      var head = sec.querySelector('.trow.head')
      var ths = head ? Array.prototype.slice.call(head.querySelectorAll('.th')) : []
      var colGap = []
      for (var i=0;i<ths.length-1;i++){
        var a=ths[i].getBoundingClientRect(), b=ths[i+1].getBoundingClientRect()
        colGap.push((a.right-cr.left + b.left-cr.left)/2)
      }
      var rows = Array.prototype.slice.call(sec.querySelectorAll('.trow:not(.head)'))
      var rowGap = []
      for (var k=0;k<rows.length-1;k++){
        var ra=rows[k].getBoundingClientRect(), rb=rows[k+1].getBoundingClientRect()
        rowGap.push((ra.bottom-cr.top + rb.top-cr.top)/2)
      }
      var ci = {req:0,gw:1,svc:2,mod:3,file:4,method:5,ds:6,table:7}
      var n = parseInt(sec.getAttribute('data-steps')||'0',10)
      function laneX(fromCol, toCol) {
        var lo = Math.min(fromCol,toCol), hi = Math.max(fromCol,toCol)
        // 取两列之间第一个空隙中线
        if (lo < hi) return colGap[lo]
        return null
      }
      for (var j=1;j<n;j++){
        var A = box(document.getElementById('s'+j), canvas), B = box(document.getElementById('s'+(j+1)), canvas)
        if (!A||!B) continue
        var cA=ci[A.col], cB=ci[B.col], rA=A.row, rB=B.row
        var pts
        if (rA===rB && cA===cB) {
          // 同格上下：直上直下，但两端各留短柱，避免贴卡边
          pts = [[A.cx, A.b], [A.cx, B.t]]
        } else if (rA===rB) {
          // 同行：右出 → 列缝中线 → 左入（不贴卡边）
          var goesRight = cB > cA
          var sx = goesRight ? A.r : A.l, ex = goesRight ? B.l : B.r
          var gx = goesRight ? colGap[Math.min(cA, cB)] : colGap[Math.min(cB, cA)]
          pts = [[sx, A.cy], [gx, A.cy], [gx, B.cy], [ex, B.cy]]
        } else if (rB > rA) {
          // 向下：底出（短柱）→ 行缝中线 → 顶入
          var gy = rowGap[Math.max(0, Math.min(rowGap.length-1, rB-1))]
          var mx = (cA===cB) ? A.cx : laneX(cA,cB)
          if (cA === cB) pts = [[A.cx, A.b], [A.cx, B.t]]
          else pts = [[A.cx, A.b], [A.cx, gy], [B.cx, gy], [B.cx, B.t]]
        } else {
          var gy2 = rowGap[Math.max(0, Math.min(rowGap.length-1, rA-1))]
          if (cA === cB) pts = [[A.cx, A.t], [A.cx, B.b]]
          else pts = [[A.cx, A.t], [A.cx, gy2], [B.cx, gy2], [B.cx, B.b]]
        }
        var p = document.createElementNS(NS,'path')
        p.setAttribute('d', rounded(pts))
        p.setAttribute('class','wire' + ((A.col==='req'||B.col==='req')?' dash':''))
        p.setAttribute('data-a', j); p.setAttribute('data-b', j+1)
        svg.appendChild(p)
      }
    })
  }
  function hot(id,on){
    document.querySelectorAll('path.wire').forEach(function(p){
      p.classList.toggle('hot', on && (p.getAttribute('data-a')===String(id)||p.getAttribute('data-b')===String(id)))
    })
  }
  document.addEventListener('mouseover', function(e){var c=e.target.closest&&e.target.closest('.chip'); if(c) hot(c.id.slice(1),true)})
  document.addEventListener('mouseout', function(e){var c=e.target.closest&&e.target.closest('.chip'); if(c) hot(c.id.slice(1),false)})
  window.addEventListener('resize', draw)
  window.addEventListener('load', draw)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw)
  draw()
})()