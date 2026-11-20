/* copy of nullgrey-seam/src/e-portal.js: the stepping-disc portal, the home button on every page (the master lives there; copy it over when it changes).
   Needs <a id="home-portal" href="/"><canvas id="home-icon" width="70" height="70"></canvas></a> on the page.
   Differences from the master: finds its canvas each frame (for pages that redraw), works without Seam's siteNavigate/HOME_HREF, and holds still for visitors who ask for reduced motion. */
(function(){
  let homeDisplayCanvas=null,hdctx=null; /* found again each frame, so pages that redraw themselves keep their portal */
  const H_SIZE=120;
  const homeSrcCanvas=document.createElement('canvas');
  homeSrcCanvas.width=H_SIZE;homeSrcCanvas.height=H_SIZE;
  const hctx=homeSrcCanvas.getContext('2d');
  const H_CX=60,H_CY=60,H_BASE_R=14,H_N_FLAMES=13;
  const h_deepPlum='rgba(72,62,70,255)',h_plum='rgba(118,100,112,255)',h_brightPlum='rgba(168,148,158,255)',h_emberAccent='rgba(185,98,80,255)',h_rustMix='rgba(150,88,78,255)',h_cream='rgba(225,210,220,255)',h_outlineDark='rgba(20,14,22,0.9)';
  const h_tendrilColors=[h_deepPlum,h_plum,h_brightPlum,h_rustMix,h_emberAccent];
  const h_flameStates=Array.from({length:H_N_FLAMES},()=>({target:0.62+Math.random()*0.3,current:0.62+Math.random()*0.3,nextChangeAt:Math.random()*90,lean:(Math.random()-0.5)*0.5,leanPhase:Math.random()*Math.PI*2}));
  let homeFrame=0,h_innerRingAngle=0;
  const h_sparkles=Array.from({length:7},()=>({x:H_CX,y:H_CY,life:Math.random()*50,maxLife:30+Math.random()*50}));
  const H_N_TENDRILS=46;
  const h_tendrils=Array.from({length:H_N_TENDRILS},()=>({angle:Math.random()*Math.PI*2,angleDrift:(Math.random()-0.5)*0.0015,color:h_tendrilColors[Math.floor(Math.random()*h_tendrilColors.length)],curl:(Math.random()-0.5)*0.9,lenBase:5+Math.random()*9,lenPhase:Math.random()*Math.PI*2,lenSpeed:0.01+Math.random()*0.015,lifePhase:Math.random()*Math.PI*2,lifeSpeed:0.015+Math.random()*0.02}));
  function h_flameOutline(angle,heightFrac,lean){const height=H_BASE_R*(0.5+heightFrac*1.6);const tipLean=lean*height*0.4;const dirX=Math.cos(angle),dirY=Math.sin(angle)*0.85;const perpX=-dirY,perpY=dirX;function pt(along,across){const r=H_BASE_R+along;return[H_CX+dirX*r+perpX*across+tipLean*(along/height)*perpX,H_CY+dirY*r+perpY*across*0.85+tipLean*(along/height)*perpY*0.85];}return[pt(0,-3.4),pt(height*0.28,-4.6),pt(height*0.55,-1.8),pt(height*0.8,-0.6),pt(height*1.02,0.4),pt(height*0.8,2.2),pt(height*0.5,1.4),pt(height*0.22,3.8),pt(0,3.4)];}
  function h_drawFlame(angle,heightFrac,lean,color){const pts=h_flameOutline(angle,heightFrac,lean);hctx.beginPath();hctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)hctx.lineTo(pts[i][0],pts[i][1]);hctx.closePath();hctx.fillStyle=color;hctx.fill();hctx.beginPath();hctx.moveTo(pts[1][0],pts[1][1]);for(let i=2;i<=7;i++)hctx.lineTo(pts[i][0],pts[i][1]);hctx.strokeStyle=h_outlineDark;hctx.lineWidth=0.8;hctx.stroke();}
  function drawHomeIcon(){
    homeFrame+=1;hctx.clearRect(0,0,H_SIZE,H_SIZE);
    const globalPulse=0.5+0.5*Math.sin(homeFrame*0.009);
    h_flameStates.forEach(f=>{if(homeFrame>f.nextChangeAt){f.target=0.25+Math.random()*1.15;f.nextChangeAt=homeFrame+40+Math.random()*40;}f.current+=(f.target-f.current)*0.075;});
    function flicker(i){return h_flameStates[i].current+globalPulse*0.14+Math.sin(homeFrame*0.09+i*1.7)*0.08+Math.sin(homeFrame*0.4+i*3.1)*0.03;}
    const glowGrad=hctx.createRadialGradient(H_CX,H_CY,H_BASE_R*0.7,H_CX,H_CY,H_BASE_R+26);glowGrad.addColorStop(0,'rgba(155,128,145,0.55)');glowGrad.addColorStop(0.55,'rgba(145,120,135,0.22)');glowGrad.addColorStop(1,'rgba(145,120,135,0)');hctx.fillStyle=glowGrad;hctx.beginPath();hctx.arc(H_CX,H_CY,H_BASE_R+26,0,Math.PI*2);hctx.fill();
    const outerGlowGrad=hctx.createRadialGradient(H_CX,H_CY,H_BASE_R,H_CX,H_CY,H_BASE_R+38);outerGlowGrad.addColorStop(0,'rgba(160,135,150,0.12)');outerGlowGrad.addColorStop(1,'rgba(160,135,150,0)');hctx.fillStyle=outerGlowGrad;hctx.beginPath();hctx.arc(H_CX,H_CY,H_BASE_R+38,0,Math.PI*2);hctx.fill();
    for(let i=0;i<H_N_FLAMES;i++){const angle=(i/H_N_FLAMES)*Math.PI*2;const lean=h_flameStates[i].lean+Math.sin(homeFrame*0.01+h_flameStates[i].leanPhase)*0.15;h_drawFlame(angle,flicker(i)*0.9,lean,h_deepPlum);}
    for(let i=0;i<H_N_FLAMES;i++){const angle=(i/H_N_FLAMES)*Math.PI*2+(Math.PI/H_N_FLAMES)*0.6;const lean=h_flameStates[i].lean+Math.sin(homeFrame*0.013+h_flameStates[i].leanPhase)*0.2;h_drawFlame(angle,flicker(i)*0.62,lean,h_plum);}
    if(Math.random()<0.035){const i=Math.floor(Math.random()*H_N_FLAMES);const angle=(i/H_N_FLAMES)*Math.PI*2;h_drawFlame(angle,flicker(i)*0.75,h_flameStates[i].lean,h_emberAccent);}
    h_tendrils.forEach(tn=>{tn.angle+=tn.angleDrift;const lifeVal=0.5+0.5*Math.sin(homeFrame*tn.lifeSpeed+tn.lifePhase);if(lifeVal<0.12)return;const lenVal=tn.lenBase*(0.6+0.5*Math.sin(homeFrame*tn.lenSpeed+tn.lenPhase));const startX=H_CX+Math.cos(tn.angle)*H_BASE_R;const startY=H_CY+Math.sin(tn.angle)*H_BASE_R*0.85;const midAngle=tn.angle+tn.curl*0.12;const midR=H_BASE_R+lenVal*0.55;const midX=H_CX+Math.cos(midAngle)*midR;const midY=H_CY+Math.sin(midAngle)*midR*0.85;const endAngle=tn.angle+tn.curl*0.28;const endR=H_BASE_R+lenVal;const endX=H_CX+Math.cos(endAngle)*endR;const endY=H_CY+Math.sin(endAngle)*endR*0.85;hctx.beginPath();hctx.moveTo(startX,startY);hctx.quadraticCurveTo(midX,midY,endX,endY);hctx.strokeStyle=tn.color;hctx.lineWidth=1;hctx.globalAlpha=lifeVal*0.65;hctx.stroke();hctx.globalAlpha=1;});
    const centerGlow=hctx.createRadialGradient(H_CX,H_CY,0,H_CX,H_CY,H_BASE_R);centerGlow.addColorStop(0,'rgba(10,8,9,255)');centerGlow.addColorStop(0.68,'rgba(14,10,11,255)');centerGlow.addColorStop(0.88,'rgba(70,38,34,0.55)');centerGlow.addColorStop(1,'rgba(130,70,58,0.4)');hctx.save();hctx.globalAlpha=0.9;hctx.fillStyle=centerGlow;hctx.beginPath();hctx.ellipse(H_CX,H_CY,H_BASE_R,H_BASE_R*0.85,0,0,Math.PI*2);hctx.fill();hctx.restore();
    hctx.strokeStyle=h_cream;hctx.lineWidth=0.65;hctx.globalAlpha=0.75;hctx.beginPath();hctx.ellipse(H_CX,H_CY,H_BASE_R,H_BASE_R*0.85,0,0,Math.PI*2);hctx.stroke();hctx.globalAlpha=1;
    h_innerRingAngle+=0.005;const innerR=H_BASE_R*0.55;hctx.strokeStyle='rgba(130,95,140,0.35)';hctx.lineWidth=0.7;hctx.beginPath();hctx.ellipse(H_CX,H_CY,innerR,innerR*0.85,0,0,Math.PI*2);hctx.stroke();
    for(let i=0;i<6;i++){const a=h_innerRingAngle+(i/6)*Math.PI*2;const x=H_CX+Math.cos(a)*innerR;const y=H_CY+Math.sin(a)*innerR*0.85;hctx.fillStyle='rgba(160,120,170,0.4)';hctx.fillRect(x,y,1,1);}
    if(Math.random()<0.15){const a=Math.random()*Math.PI*2;const r=Math.random()*H_BASE_R*0.4;hctx.fillStyle='rgba(140,100,150,0.3)';hctx.fillRect(H_CX+Math.cos(a)*r,H_CY+Math.sin(a)*r*0.85,1,1);}
    h_sparkles.forEach(s=>{s.life+=1;if(s.life>s.maxLife){const a=Math.random()*Math.PI*2;const r=H_BASE_R+8+Math.random()*20;s.x=H_CX+Math.cos(a)*r;s.y=H_CY+Math.sin(a)*r*0.85;s.life=0;s.maxLife=30+Math.random()*50;}const twinkle=Math.sin((s.life/s.maxLife)*Math.PI);hctx.fillStyle=`rgba(220,200,225,${(twinkle*0.5).toFixed(2)})`;hctx.fillRect(s.x,s.y,1,1);});
    const cv=document.getElementById('home-icon'); if(cv!==homeDisplayCanvas){homeDisplayCanvas=cv;hdctx=cv?cv.getContext('2d'):null;if(cv)cv.style.imageRendering='pixelated';}
    if(hdctx){hdctx.imageSmoothingEnabled=false;hdctx.clearRect(0,0,70,70);hdctx.drawImage(homeSrcCanvas,0,0,H_SIZE,H_SIZE,0,0,70,70);}
    if(!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches&&homeFrame>90))requestAnimationFrame(drawHomeIcon);
  }
  requestAnimationFrame(drawHomeIcon);
  document.addEventListener('click',function(e){
    if(!e.target.closest||!e.target.closest('#home-portal'))return;
    e.preventDefault(); e.stopPropagation(); if(window.TX_PREVIEW)return; var h=(typeof HOME_HREF!=='undefined'?HOME_HREF:'/'); if(typeof siteNavigate==='function')siteNavigate(h); else window.open(h,'_top');
  },true);
})();
