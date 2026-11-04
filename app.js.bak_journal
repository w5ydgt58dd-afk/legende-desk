const h=new URLSearchParams(location.hash.slice(1));if(h.get('d')){localStorage.dp=h.get('d')}
const B='d/'+(localStorage.dp||'')+'/';const $=id=>document.getElementById(id);const f=n=>(+n).toFixed(2);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const pill=v=>v==null?'':`<span class="pill ${v>=0?'up':'dn'}">${v>=0?'+':''}${Math.abs(v)>=1000?Math.round(v).toLocaleString('fr'):(+v).toFixed(1)}%</span>`;
const k=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':Math.round(n);
async function j(p){const r=await fetch(B+p+'?_='+Date.now());if(!r.ok)throw r.status;return r.json()}
function show(m){$('home').hidden=!!m;$('coin').hidden=!m;if(m)coin(m)}
async function tick(){try{const s=await j('state.json'),c=await j('chart.json'),a=await j('activity.json');let t=null;try{t=await j('stats.json')}catch(e){}
$('mode').textContent=s.mode+(s.paused?' · ⏸ PAUSE':'');$('mode').className='paper'+(s.paused?' pz':'');const fresh=Date.now()/1000-s.ts<300;$('live').className='live'+(fresh?'':' off');$('live').textContent=fresh?'● Live':'● Hors ligne';
$('bal').textContent='$'+f(s.stack);const d=s.stack-s.start;$('mult').textContent=(s.stack/s.start).toFixed(2)+'x';$('eqlbl').textContent='Equity · départ $'+s.start;
$('pnl').innerHTML=`<span class="pill ${d>=0?'up':'dn'}">${d>=0?'+':''}$${f(d)} (${(d/s.start*100).toFixed(1)}%)</span> · ${s.closed.length} trades clos`;
line($('chart'),c.map(r=>[r.ts,r.value]));
$('pos').innerHTML=s.open.length?s.open.map(p=>`<div class="row" onclick="show('${E(p.mint)}')">${E(p.symbol)} $${f(p.size_usd)} ${pill(p.upnl/(p.tp1_done?p.size_usd/(1-((s.settings||{}).tp1_frac||0.5)):p.size_usd)*100)}<small>stop ${(+p.stop_price).toPrecision(4)}${p.trail_active?' · trail':''}</small></div>`).join(''):'<div class="row">Aucune position ouverte</div>';
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
tick();setInterval(tick,15000);
