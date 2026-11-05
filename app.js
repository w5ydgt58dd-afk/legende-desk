/* build settings-mom-1 */
const h=new URLSearchParams(location.hash.slice(1));if(h.get('d')){localStorage.dp=h.get('d')}
const qs=new URLSearchParams(location.search);if(qs.get('d')){localStorage.dp=qs.get('d')}
const B='d/'+(localStorage.dp||'')+'/';const $=id=>document.getElementById(id);const f=n=>(+n).toFixed(2);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const pill=v=>v==null?'':`<span class="pill ${v>=0?'up':'dn'}">${v>=0?'+':''}${Math.abs(v)>=1000?Math.round(v).toLocaleString('fr'):(+v).toFixed(1)}%</span>`;
const k=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':Math.round(n);
async function j(p){const r=await fetch(B+p+'?_='+Date.now(),{cache:'no-store'});if(!r.ok)throw r.status;return r.json()}
function show(m){$('home').hidden=!!m;$('coin').hidden=!m;if(m)coin(m)}
async function tick(){try{const s=await j('state.json'),c=await j('chart.json'),a=await j('activity.json');let t=null;try{t=await j('stats.json')}catch(e){}
let nd=null;try{const r=await fetch('nightdesk.json?_='+Date.now(),{cache:'no-store'});if(r.ok)nd=await r.json()}catch(e){}
$('mode').textContent=s.mode+(s.paused?' · ⏸ PAUSE':'');$('mode').className='paper'+(s.paused?' pz':'');const fresh=Date.now()/1000-s.ts<300;$('live').className='live'+(fresh?'':' off');$('live').textContent=fresh?'● Live':'● Hors ligne';
const ND=!!s.nd_style;const SN=!ND&&s.sn_stack!=null;const cs=ND?s.stack:(SN?s.sn_stack:s.stack),c0=ND?s.start:(SN?s.sn_start:s.start);$('bal').textContent='$'+f(cs);const d=cs-c0;$('mult').textContent=(cs/c0).toFixed(2)+'x';$('eqlbl').textContent=(SN?'Capital sniper · départ $'+c0+' · Exécutant $'+f(s.stack):'Equity · départ $'+s.start);
$('pnl').innerHTML=`<span class="pill ${d>=0?'up':'dn'}">${d>=0?'+':''}$${f(d)} (${(d/c0*100).toFixed(1)}%)</span> · ${(ND?s.closed.filter(x=>x.source==='nd-style'):s.closed).length} trades clos`;
line($('chart'),c.map(r=>[r.ts,r.value]));
const J=s.journal||[],fp=x=>x==null?'–':(x>=0?'+':'')+(+x).toFixed(1)+'%';$('jsum').textContent=J.length?`${J.length} trades · ${J.filter(x=>(x.close_calls||[]).length).length} ⚠️ de justesse`:'';
$('journal').innerHTML=J.map(x=>{const cc=x.close_calls||[],dt=new Date(x.opened_at*1000).toLocaleString('fr',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});return `<div class="row hs ${x.pnl_usd>0?'w':x.pnl_usd<0?'l':''}" onclick="show('${E(x.mint)}')"><b>${cc.length?'⚠️ ':''}${E(x.symbol||x.mint.slice(0,4))}</b> ${dt} · $${f(x.size_usd)} @ ${(+x.entry_price).toPrecision(4)} · ${x.closed_at?`${E(x.exit_reason)} · ${x.pnl_usd>=0?'+':''}$${f(x.pnl_usd)} (${fp(x.pnl_pct_on_initial)}) · ${Math.round(x.duration_min)} min`:'ouvert'}<small>score ${x.score??'–'} · alive ${x.alive_6h??'–'} · organic ${x.organic??'–'} · chase ${x.chase??'–'}${cc.length?' · ⚠️ '+cc.map(c=>E(c.name)+' '+c.value+(c.kind=='max'?' ≤ ':' ≥ ')+c.threshold).join(', '):''}<br>${E(x.entry_reason||'')}</small></div>`}).join('')||'<div class="row">Aucun trade journalisé</div>';

const money=(n,signed)=>{if(n==null||Number.isNaN(+n))return '–';const v=+n;return (signed&&v>=0?'+':'')+'$'+f(v)};
const leg=s.open.length?s.open.map(p=>{
  const entry=+p.entry_price||0, cur=(p.last_price!=null?+p.last_price:null);
  const upnl=(p.upnl!=null?+p.upnl:null);
  const pct=(p.upnl_pct!=null?+p.upnl_pct:(entry&&cur!=null?((cur/entry-1)*100):null));
  const cls=pct==null?'':(pct>=0?'up':'dn');
  const src=p.source==='nd-style'?' · ND-style':'';
  return `<div class="row poscard ${cls}" onclick="show('${E(p.mint)}')"><div class="poshead"><b>${E(p.symbol||p.mint.slice(0,4))}</b> <span class="pill ${cls}">${pct==null?'–':((pct>=0?'+':'')+(+pct).toFixed(1)+'%')}</span> <span class="pill ${cls}">${money(upnl,true)}</span></div><small>mise $${f(p.size_usd||0)} · entrée ${entry?entry.toPrecision(4):'–'} · actuel ${cur!=null?cur.toPrecision(4):'–'}${p.stop_price?(' · stop '+(+p.stop_price).toPrecision(4)):''}${p.trail_active?' · trail':''}${src}</small></div>`;
}).join(''):'';
const ndRows=(nd&&nd.open&&nd.open.length)?nd.open.map(o=>{
  const entry=+o.fill_price||0, cur=(o.last_price!=null?+o.last_price:null);
  const upnl=(o.upnl_usd!=null?+o.upnl_usd:null), pct=(o.upnl_pct!=null?+o.upnl_pct:null);
  const cls=pct==null?'':(pct>=0?'up':'dn');
  return `<div class="row poscard ${cls}"><div class="poshead"><b>🌙 ${E(o.symbol)}</b> <span class="pill ${cls}">${pct==null?'–':((pct>=0?'+':'')+(+pct).toFixed(1)+'%')}</span> <span class="pill ${cls}">${money(upnl,true)}</span></div><small>Night Desk · mise $${f(o.ticket_usd||0)} · entrée ${entry?entry.toPrecision(4):'–'} · actuel ${cur!=null?cur.toPrecision(4):'–'} · stop ${o.stop_price?(+o.stop_price).toPrecision(4):'–'}</small></div>`;
}).join(''):'';
$('pos').innerHTML=(leg||ndRows)?(leg+ndRows):'<div class="row">Aucune position ouverte</div>';
const LS=s.settings||{}; const LSg=$('legSettings'); const LSsub=$('legSetSub');
if(LSg){
  const active=!!LS.momentum_gate_active;
  const rows=[
    ['Stop', LS.STOP_PCT!=null?(LS.STOP_PCT+' %'):(LS.stop_pct!=null?(LS.stop_pct+' %'):'–')],
    ['Trailing', LS.TRAIL_PCT!=null?(LS.TRAIL_PCT+' %'):(LS.trail_pct!=null?(LS.trail_pct+' %'):'–')],
    ['Max open', LS.MAX_OPEN!=null?String(LS.MAX_OPEN):'–'],
    ['Score mini', LS.ANALYST_PASS!=null?String(LS.ANALYST_PASS):'–'],
    ['Mise', LS.POSITION_PCT!=null?(LS.POSITION_PCT+' %'):'–'],
    ['Momentum', LS.MOMENTUM_TOP_PCT!=null?('top '+LS.MOMENTUM_TOP_PCT+' %'+(LS.MOMENTUM_WINDOW?' · '+LS.MOMENTUM_WINDOW:'')):'–'],
    ['Gate mom.', active?'actif':'off'],
  ];
  LSg.innerHTML=rows.map(([k,v])=>`<div class="st"><i>${k}</i><b class="${k==='Gate mom.'?(active?'up':''):''}">${E(v)}</b></div>`).join('');
  if(LSsub) LSsub.textContent=(s.nd_style?'ND-style · ':'')+(active?'momentum on':'momentum off');
}

if(s.nd_style){const el=$('eqlbl'); if(el) el.textContent='Equity Legende (ND-style) · départ $'+(+s.start).toFixed(0)+(s.unrealized!=null?' · latent '+(s.unrealized>=0?'+':'')+'$'+f(s.unrealized):'');}
$('act').innerHTML=a.slice(0,30).map(r=>`<div class="row" onclick="show('${E(r.mint)}')">${new Date(r.ts*1000).toLocaleTimeString('fr')} <b>${E(r.agent)}</b> ${E(r.title)}<small>${E(r.subtitle)}</small></div>`).join('')||'<div class="row">Rien pour l’instant</div>';
if(t){$('tick').innerHTML=t.ticker.map(x=>`<span class="ti" onclick="show('${E(x.mint)}')"><b>${E(x.symbol||x.mint.slice(0,4))}</b> $${k(x.liquidity_usd||0)} ${pill(x.h1_change_pct)}</span>`).join('');
const F=t.funnel,ags=[['🔍','#2563eb','Scout','scanne les migrations',`${F.scout.seen} vus`],['⛔','#ea580c','Filter','règles dures + audit',`${F.filter.killed+F.filter.audit_fail} rejetés`],
['🧠','#7c3aed','Analyst','contrôle approfondi',`${F.analyst.passed}/${F.analyst.checked} validés`],['🎯','#16a34a','Sniper','exécuteur (paper)',`${F.sniper.signals} signaux`],['🛡️','#db2777','Guard','stops & risque',`${F.sniper.open} ouvert · ${F.guard.closed} clos`]];
$('funnel').innerHTML=ags.map(g=>`<div class="ag"><i style="background:${g[1]}">${g[0]}</i><div><b>${g[2]}</b><small>${g[3]}</small></div><span class="n">${g[4]}</span></div>`).join('');
$('fsum').textContent=`${F.scout.scanned} scannés · ${F.sniper.signals} signaux`;$('askip').textContent=t.total_skipped+' rejetés';
const H=t.history||[],P=v=>v==null?'–':pill(v);$('hsum').textContent=H.length?`${H.filter(x=>(x.pnl||0)>0).length} gagnants / ${H.filter(x=>(x.pnl||0)<0).length} perdants`:'';
$('hist').innerHTML=H.map(x=>`<div class="row hs ${x.pnl>0?'w':x.pnl<0?'l':''}" onclick="show('${E(x.mint)}')"><b>${E(x.symbol||x.mint.slice(0,4))}</b> ${new Date(x.ts*1000).toLocaleString('fr',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})} · entrée ${(+x.entry).toPrecision(4)} · P&L ${x.pnl==null?'–':(x.pnl>=0?'+':'')+'$'+f(x.pnl)}${x.closed?' ('+E(x.exit)+')':''}<small>1h ${P(x.h1)} 4h ${P(x.h4)} 24h ${P(x.h24)} · max ${P(x.max_gain)} · dd ${P(x.max_dd)}</small></div>`).join('')||'<div class="row">Aucun signal pour l’instant</div>';
const mx=Math.max(1,...t.skips.map(x=>x.n));$('skips').innerHTML=t.skips.map(x=>`<div class="sk"><div><span>${E(x.reason)}</span><b>${x.n}</b></div><div class="bar"><span style="width:${x.n/mx*100}%"></span></div></div>`).join('')||'<div class="row">Aucun rejet</div>'}
}catch(e){$('bal').textContent='hors ligne'}}
async function coin(m){const c=await j('coin/'+m+'.json');$('ctitle').textContent=(c.coin&&c.coin.symbol||'')+' '+m.slice(0,6)+'…';line($('cchart'),c.prices.map(p=>[p.ts,p.price]));
$('cbody').innerHTML=c.audits.map(a=>`<div class="row">${a.pass?'✅':'❌'} L${a.layer} ${E(a.name)}<small>${E(a.value_text)}</small></div>`).join('')+c.verdicts.map(v=>`<div class="row">Score ${v.score}<small>alive ${v.alive_6h} organic ${v.organic} flush ${v.flush} chase ${v.chase} · ${E(v.reason)}</small></div>`).join('')}
tick();setInterval(tick,5000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)tick()});
