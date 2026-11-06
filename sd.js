/* Short Squeeze tab — build sq5 · slower ticker · live crypto 1s + TV charts */
(function(){
const tb=document.querySelector('.ndtabs'); if(!tb) return;
const b=document.createElement('button');b.type='button';b.id='t3';b.innerHTML='<img class="sq-tab-eth" src="icons/eth-diamond.svg?v=sq5" alt="" width="16" height="16"> Short Squeeze';tb.appendChild(b);
const sec=document.createElement('section');sec.id='sd';sec.hidden=true;document.getElementById('coin').before(sec);
const E=x=>String(x??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const M=n=>n==null||n!==n?'—':(n<0?'-':'')+'$'+Math.abs(+n).toFixed(2);
const P=n=>n==null||n!==n?'—':((+n>=0?'+':'')+(+n).toFixed(2)+'%');
const X=v=>v==null||v!==v?'—':(+v).toPrecision(6).replace(/\.?0+$/,'');
const age=s=>s==null?'—':s<90?s+' s':Math.round(s/60)+' min';
const T=ts=>new Date(ts*1000).toLocaleTimeString('fr-FR',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit',second:'2-digit'});
const nm=s=>({'GC=F':'GOLD','SI=F':'SILVER','CL=F':'WTI','BZ=F':'BRENT','NG=F':'NATGAS','HG=F':'COPPER'}[s]||s.replace('USDT',''));
const FUT={'GC=F':'COMEX:GC1!','SI=F':'COMEX:SI1!','HG=F':'COMEX:HG1!','CL=F':'NYMEX:CL1!','BZ=F':'NYMEX:BB1!','NG=F':'NYMEX:NG1!'};
function tvSym(sym){
  if(!sym) return '';
  if(/USDT$/.test(sym)) return 'BINANCE:'+sym;
  if(FUT[sym]) return FUT[sym];
  return sym;
}
function on(v){sec.hidden=!v;b.classList.toggle('on',v);if(v){['nd','home','coin'].forEach(i=>{const e=document.getElementById(i);if(e)e.hidden=true});const h=document.querySelector('.hero');if(h)h.hidden=true;['t1','t2'].forEach(i=>document.getElementById(i).classList.remove('on'));document.body.classList.add('nd-on');try{history.replaceState(null,'',location.pathname+location.search+'#tab=sq')}catch(e){};load()}else{stopLive()}}
b.onclick=()=>on(true);
['t1','t2'].forEach(i=>document.getElementById(i).addEventListener('click',()=>on(false)));

let liveTimer=null, feePct=0.1;
function stopLive(){if(liveTimer){clearInterval(liveTimer);liveTimer=null}}

function upnl(fill,last,ticket,fee){
  if(!(fill>0) || !(last>0) || !(ticket>0)) return null;
  return ticket*(1-last/fill)-(fee||0);
}

function paintPos(card,last,u){
  const lastEl=card.querySelector('.sq-last');
  const ageEl=card.querySelector('.sq-age');
  const uEl=card.querySelector('.sq-upnl');
  const pEl=card.querySelector('.sq-upct');
  const ticket=+card.dataset.ticket;
  if(lastEl) lastEl.textContent=X(last);
  if(ageEl) ageEl.textContent='0 s';
  const k=u>=0?'up':'dn';
  if(uEl){uEl.className='sq-upnl '+k;uEl.textContent=M(u)}
  if(pEl){pEl.className='sq-upct '+k;pEl.textContent=P(ticket?u/ticket*100:null)}
}

async function tickCrypto(){
  if(sec.hidden) return;
  const cards=[...sec.querySelectorAll('.sq-pos[data-kind="crypto"]')];
  if(!cards.length) return;
  const syms=[...new Set(cards.map(c=>c.dataset.sym).filter(Boolean))];
  if(!syms.length) return;
  try{
    const url='https://api.binance.com/api/v3/ticker/price?symbols='+encodeURIComponent(JSON.stringify(syms));
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok) return;
    const arr=await r.json();
    const map={}; (arr||[]).forEach(x=>{map[x.symbol]=+x.price});
    cards.forEach(card=>{
      const last=map[card.dataset.sym];
      if(!(last>0)) return;
      const fill=+card.dataset.fill, ticket=+card.dataset.ticket, fee=+card.dataset.fee;
      const u=upnl(fill,last,ticket,fee);
      if(u==null) return;
      paintPos(card,last,u);
    });
  }catch(e){}
}

function startLive(){
  stopLive();
  tickCrypto();
  liveTimer=setInterval(tickCrypto,1000);
}

function bindCards(){
  sec.querySelectorAll('.sq-pos').forEach(card=>{
    card.style.cursor='pointer';
    card.onclick=()=>{
      const s=tvSym(card.dataset.sym);
      if(!s) return;
      window.open('https://www.tradingview.com/chart/?symbol='+encodeURIComponent(s),'_blank','noopener');
    };
  });
}

async function load(){
 if(sec.hidden) return;
 let d;try{const r=await fetch('shortdesk.json?_='+Date.now(),{cache:'no-store'});d=await r.json()}catch(e){sec.innerHTML='<div class="ndt"><div class="ndt-empty">Short Squeeze : pas encore de données</div></div>';stopLive();return}
 feePct=(d.settings&&d.settings.FEE_PCT!=null)?+d.settings.FEE_PCT:0.1;
 const wl=d.watchlist||[],c=d.counts||{},eq=+d.equity,st=+d.start_stack;
 const upd=Math.round((Date.now()-new Date(d.updated_at).getTime())/1000);
 const tick=wl.slice().sort((a,b)=>(a.kind>b.kind?1:-1)).map(w=>`<span class="sq-t"><b>${E(nm(w.sym))}</b> ${X(w.price)} <i class="${(w.chg_pct||0)>=0?'up':'dn'}">${P(w.chg_pct)}</i>${w.stale?' <em>fermé/différé</em>':''}</span>`).join('');
 const opens=(d.open||[]).map(p=>{
   const k=(p.upnl_usd||0)>=0?'up':'dn';
   const fee=(+p.ticket_usd||0)*feePct/100;
   return `<div class="ndf-pcard sq-pos" data-sym="${E(p.symbol)}" data-kind="${E(p.kind||'')}" data-fill="${+p.fill_price}" data-ticket="${+p.ticket_usd}" data-fee="${fee}" style="cursor:pointer"><div class="l"><b>${E(nm(p.symbol))} <small>SHORT</small></b><small>ticket ${M(p.ticket_usd)} · entrée ${X(p.fill_price)} → <span class="sq-last">${X(p.last_price)}</span> · prix il y a <span class="sq-age">${age(p.price_age_s)}</span></small></div><div class="r"><b class="sq-upnl ${k}">${M(p.upnl_usd)}</b><small class="sq-upct ${k}">${P(p.upnl_pct)}</small></div></div>`;
 }).join('')||'<div class="ndt-empty">Aucune position</div>';
 sec.innerHTML=`<div class="ndt sq"><div class="sq-band"><div class="sq-run">${tick}${tick}</div></div>
 <div class="ndt-win"><div class="ndt-titlebar"><span class="dots"><i></i><i></i><i></i></span><span class="tt">Short Squeeze Terminal</span><span class="tr">short-only · actions · matières · crypto</span></div>
 <div class="ndt-head"><div class="logo sq-logo"><img src="icons/eth-diamond.svg?v=sq5" alt="ETH" width="28" height="28"></div><div class="who"><div class="title"><img class="sq-title-eth" src="icons/eth-diamond.svg?v=sq5" alt="" width="22" height="22"> Short Squeeze <span class="ver">sq5</span></div><div class="run"><span class="dot"></span> export il y a ${age(upd)}</div><div class="sub">short only · prix réels · papier · crypto live 1s</div></div>
 <div class="kpi"><div class="ndt-bal ${eq>=st?'up':'dn'}">${M(eq)}</div><div class="badges"><span class="pap">${E(d.mode)}</span><span class="lk">LIVE ${d.live_locked?'🔒':'ON'}</span></div><div class="cnt">départ ${M(st)} · latent ${M(d.unrealized_usd)} · <span class="up">${c.wins||0} W</span> / <span class="dn">${c.losses||0} L</span></div></div></div></div>
 <div class="card"><h3>Shorts ouverts <small>${(d.open||[]).length}</small></h3>${opens}</div>
 <div class="card"><h3>Shorts les plus intéressants <small>score faiblesse/momentum/volume</small></h3>${wl.map((w,i)=>`<div class="sq-row"><span>${i+1}</span><b>${E(nm(w.sym))}</b><span>${X(w.price)}</span><span class="${(w.chg_pct||0)>=0?'up':'dn'}">${P(w.chg_pct)}</span><span>score ${w.score??'—'}</span><small>${w.stale?'fermé/différé · ':''}${age(w.age_s)}${w.signal?' · <b class="dn">SIGNAL</b>':''}</small></div>`).join('')}</div>
 <div class="card"><h3>Clôtures <small>${(d.closes||[]).length}</small></h3>${(d.closes||[]).map(x=>`<div class="sq-row"><b>${E(nm(x.sym))}</b><span>${E(x.rule)}</span><span class="${x.pnl_usd>=0?'up':'dn'}">${M(x.pnl_usd)}</span><small>${T(x.closed_at)}</small></div>`).join('')||'<div class="ndt-empty">Aucune clôture</div>'}</div>
 <div class="card"><h3>Réglages <small>papier</small></h3><div class="ndf-stats ndf-settings">${[['Stop','+'+(-d.settings.STOP_PCT)+' % vs entrée'],['Trailing',d.settings.TRAIL_PCT+' %'],['Max open',d.settings.MAX_OPEN],['Mise',d.settings.POSITION_PCT+' % · max $'+d.settings.POSITION_MAX_USD],['Frais+slip',d.settings.FEE_PCT+'% + '+d.settings.SLIPPAGE_PCT+'%'],['LIVE','verrouillé · $50 max · −10 %/j']].map(([k,v])=>`<div class="st"><i>${E(k)}</i><b>${E(v)}</b></div>`).join('')}</div></div>
 <div class="card"><h3>Log</h3>${(d.events||[]).slice(0,30).map(e=>`<div class="ndt-logrow"><span class="t">${T(e.ts)}</span><span class="tag">${E(e.tag)}</span><span class="sym">${E(nm(e.sym||''))}</span><span class="why">${E(e.msg)}</span></div>`).join('')}</div></div>`;
 bindCards();
 startLive();
}
setInterval(load,15000);
const bootParams=new URLSearchParams(location.hash.slice(1));
const queryParams=new URLSearchParams(location.search);
if(bootParams.get('tab')==='sq'||queryParams.get('tab')==='sq') on(true);
})();
