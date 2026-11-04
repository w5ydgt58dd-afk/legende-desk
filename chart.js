function line(c,pts){const x=c.getContext('2d'),W=c.width=c.clientWidth*2,H=c.height=320;x.clearRect(0,0,W,H);if(pts.length<2){x.fillStyle='#8a96a3';x.font='24px monospace';x.fillText('pas encore de données',20,H/2);return}
const v=pts.map(p=>p[1]),mn=Math.min(...v),mx=Math.max(...v),t0=pts[0][0],t1=pts[pts.length-1][0];x.strokeStyle=v[v.length-1]>=v[0]?'#ffffff':'#ff5c5c';x.lineWidth=3;x.beginPath();
pts.forEach((p,i)=>{const X=(p[0]-t0)/(t1-t0||1)*W,Y=H-10-(p[1]-mn)/(mx-mn||1)*(H-20);i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke()}
