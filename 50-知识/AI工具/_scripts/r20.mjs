
import fs from 'node:fs';
function parseCards(h) {
  const out = [];
  const re = /<div class="product-card">([\s\S]*?)<\/a><\/div>/g;
  let m;
  while ((m = re.exec(h))) {
    const b = m[1];
    const slug = (b.match(/href="\/product\/([^"]+)"/)||[])[1];
    if (!slug) continue;
    out.push({
      slug, name: ((b.match(/product-card__name">([^<]*)</)||[])[1]||'').trim(),
      tagline: ((b.match(/product-card__tagline">([^<]*)</)||[])[1]||'').trim(),
      monthlyRevenue: ((b.match(/product-card__revenue-number">\$?([\d,\.]+)/)||[])[1]||null),
      revenuePeriod: ((b.match(/product-card__revenue-period">([^<]*)</)||[])[1]||null),
      revenueNote: (((b.match(/product-card__revenue-explanation">([\s\S]*?)<\/span>/)||[])[1]||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()),
      stripeVerified: /class="product-card__stripe-logo"/.test(b),
      url: 'https://www.indiehackers.com/product/'+slug,
    });
  }
  return out;
}
const h = fs.readFileSync('ih_products.html','utf8');
const cards = parseCards(h);
console.log('parsed', cards.length);
console.log(JSON.stringify(cards.slice(0,4), null, 1));
