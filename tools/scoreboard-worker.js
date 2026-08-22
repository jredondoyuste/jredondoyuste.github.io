// The shared catalog for the wiggle minigame — a Cloudflare Worker, deployed
// separately from the site (GitHub Pages can't accept writes). It lives here so
// the whole game is in one repo. js/wigglegame.js points REMOTE at it.
//
//   GET  →  [{name, score, ts}, …]   best first, top 100
//   POST ←  {name, score}            one finished run
//
// Needs a KV namespace bound as CATALOG. To wipe the board, delete the
// 'scores' key in that namespace. Two people finishing in the same instant can
// cost one of the two scores — read-modify-write on one key.
//
// The checks below only keep the catalog looking like a catalog; a public
// scoreboard with no accounts can't stop anyone determined to curl a fake in.

export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

    if (req.method === 'GET') {
      const list = JSON.parse((await env.CATALOG.get('scores')) || '[]');
      return Response.json(list, { headers: cors });
    }

    if (req.method === 'POST') {
      let e;
      try { e = await req.json(); } catch { return new Response('bad json', { status: 400, headers: cors }); }
      const name = String(e.name || '');
      const score = Number(e.score);
      if (!/^GW\d{6}_\d{6}$/.test(name) ||
          !Number.isFinite(score) || score < 0 || score > 100000) {
        return new Response('not a detection', { status: 400, headers: cors });
      }
      const list = JSON.parse((await env.CATALOG.get('scores')) || '[]');
      // SNRs carry one decimal
      list.push({ name, score: Math.round(score * 10) / 10, ts: Date.now() });
      list.sort((a, b) => b.score - a.score);
      await env.CATALOG.put('scores', JSON.stringify(list.slice(0, 100)));
      return Response.json({ ok: true }, { headers: cors });
    }

    return new Response('nope', { status: 405, headers: cors });
  },
};
