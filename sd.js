/* Short Squeeze tab — build sq1 */
(function(){
const tb=document.querySelector('.ndtabs'); if(!tb) return;
const b=document.createElement('button');b.type='button';b.id='t3';b.textContent='Short Squeeze';tb.appendChild(b);
const sec=document.createElement('section');sec.id='sd';sec.hidden=true;document.getElementById('coin').before(sec);
const E=x=>String(x??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const M=n=>n==null?'—':(n<0?'-':'')+'$'+Math.abs(+n).toFixed(2);
const P=n=>n==null?'—':((+n>=0?'+':'')+(+n).toFixed(2)+'%');
const X=v=>v==null?'—':(+v).toPrecision(6).replace(/\.?0+$/,'');
const age=s=>s==null?'—':s<90?s+' s':Math.round(s/60)+' min';
const T=ts=>new Date(ts*1000).toLocaleTimeString('fr-FR',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit',second:'2-digit'});
const nm=s=>({'GC=F':'GOLD','SI=F':'SILVER','CL=F':'WTI','BZ=F':'BRENT','NG=F':'NATGAS','HG=F':'COPPER'}[s]||s.replace('USDT',''));
function on(v){sec.hidden=!v;b.classList.toggle('on',v);if(v){['nd','home','coin'].forEach(i=>{const e=document.getElementById(i);if(e)e.hidden=true});const h=document.querySelector('.hero');if(h)h.hidden=true;['t1','t2'].forEach(i=>document.getElementById(i).classList.remove('on'));document.body.classList.add('nd-on');try{history.replaceState(null,'',location.pathname+location.search+'#tab=sq')}catch(e){};load()}}
b.onclick=()=>on(true);
['t1','t2'].forEach(i=>document.getElementById(i).addEventListener('click',()=>on(false)));
async function load(){
 if(sec.hidden) return;
 let d;try{const r=await fetch('shortdesk.json?_='+Date.now(),{cache:'no-store'});d=await r.json()}catch(e){sec.innerHTML='<div class="ndt"><div class="ndt-empty">Short Squeeze : pas encore de données</div></div>';return}
 const wl=d.watchlist||[],c=d.counts||{},eq=+d.equity,st=+d.start_stack;
 const upd=Math.round((Date.now()-new Date(d.updated_at).getTime())/1000);
 const tick=wl.slice().sort((a,b)=>(a.kind>b.kind?1:-1)).map(w=>`<span class="sq-t"><b>${E(nm(w.sym))}</b> ${X(w.price)} <i class="${(w.chg_pct||0)>=0?'up':'dn'}">${P(w.chg_pct)}</i>${w.stale?' <em>fermé/différé</em>':''}</span>`).join('');
 sec.innerHTML=`<div class="ndt sq"><div class="sq-band"><div class="sq-run">${tick}${tick}</div></div>
 <div class="ndt-win"><div class="ndt-titlebar"><span class="dots"><i></i><i></i><i></i></span><span class="tt">Short Squeeze Terminal</span><span class="tr">short-only · actions · matières · crypto</span></div>
 <div class="ndt-head"><div class="logo">SQ</div><div class="who"><div class="title">Short Squeeze <span class="ver">sq1</span></div><div class="run"><span class="dot"></span> export il y a ${age(upd)}</div><div class="sub">short only · prix réels · papier</div></div>
 <div class="kpi"><div class="ndt-bal ${eq>=st?'up':'dn'}">${M(eq)}</div><div class="badges"><span class="pap">${E(d.mode)}</span><span class="lk">LIVE ${d.live_locked?'🔒':'ON'}</span></div><div class="cnt">départ ${M(st)} · latent ${M(d.unrealized_usd)} · <span class="up">${c.wins||0} W</span> / <span class="dn">${c.losses||0} L</span></div></div></div></div>
 <div class="card"><h3>Shorts ouverts <small>${(d.open||[]).length}</small></h3>${(d.open||[]).map(p=>{const k=(p.upnl_usd||0)>=0?'up':'dn';return `<div class="ndf-pcard"><div class="l"><b>${E(nm(p.symbol))} <small>SHORT</small></b><small>ticket ${M(p.ticket_usd)} · entrée ${X(p.fill_price)} → ${X(p.last_price)} · prix il y a ${age(p.price_age_s)}</small></div><div class="r"><b class="${k}">${M(p.upnl_usd)}</b><small class="${k}">${P(p.upnl_pct)}</small></div></div>`}).join('')||'<div class="ndt-empty">Aucune position</div>'}</div>
 <div class="card"><h3>Shorts les plus intéressants <small>score faiblesse/momentum/volume</small></h3>${wl.map((w,i)=>`<div class="sq-row"><span>${i+1}</span><b>${E(nm(w.sym))}</b><span>${X(w.price)}</span><span class="${(w.chg_pct||0)>=0?'up':'dn'}">${P(w.chg_pct)}</span><span>score ${w.score??'—'}</span><small>${w.stale?'fermé/différé · ':''}${age(w.age_s)}${w.signal?' · <b class="dn">SIGNAL</b>':''}</small></div>`).join('')}</div>
 <div class="card"><h3>Clôtures <small>${(d.closes||[]).length}</small></h3>${(d.closes||[]).map(x=>`<div class="sq-row"><b>${E(nm(x.sym))}</b><span>${E(x.rule)}</span><span class="${x.pnl_usd>=0?'up':'dn'}">${M(x.pnl_usd)}</span><small>${T(x.closed_at)}</small></div>`).join('')||'<div class="ndt-empty">Aucune clôture</div>'}</div>
 <div class="card"><h3>Réglages <small>papier</small></h3><div class="ndf-stats ndf-settings">${[['Stop','+'+(-d.settings.STOP_PCT)+' % vs entrée'],['Trailing',d.settings.TRAIL_PCT+' %'],['Max open',d.settings.MAX_OPEN],['Mise',d.settings.POSITION_PCT+' % · max $'+d.settings.POSITION_MAX_USD],['Frais+slip',d.settings.FEE_PCT+'% + '+d.settings.SLIPPAGE_PCT+'%'],['LIVE','verrouillé · $50 max · −10 %/j']].map(([k,v])=>`<div class="st"><i>${E(k)}</i><b>${E(v)}</b></div>`).join('')}</div></div>
 <div class="card"><h3>Log</h3>${(d.events||[]).slice(0,30).map(e=>`<div class="ndt-logrow"><span class="t">${T(e.ts)}</span><span class="tag">${E(e.tag)}</span><span class="sym">${E(nm(e.sym||''))}</span><span class="why">${E(e.msg)}</span></div>`).join('')}</div></div>`;
}
setInterval(load,10000);
const h=new URLSearchParams(location.hash.slice(1));if(h.get('tab')==='sq')on(true);
})();
