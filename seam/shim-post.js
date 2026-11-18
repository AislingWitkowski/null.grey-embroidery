/* ---- Seam's sound engine is here only for the pocket's own sounds (picking things up, cans, bottles, a bite, a
   wrapper). Embroidery has its own switch and its own world sounds, so Seam's switch is never made, its footsteps and
   tube hum are turned off, and its volume follows Embroidery's switch. ---- */
SND.el = document.createElement('button');   /* (never shown) */
sndStep = function(){};
var _egSndBuild = sndBuild;
sndBuild = function(){ _egSndBuild(); SND.master.gain.value = SND_VOL; };
var _egOneShot = sndOneShot;
sndOneShot = function(k){ var r = _egOneShot.apply(null, arguments); try { if (CC_TEXT[k]) EG_SEAM.cc(k, CC_TEXT[k]); } catch (e) {} return r; };
EG_SEAM.soundOn = function(heard, cc){
  SND.on = !!(heard || cc);
  if (SND.on) { try { if (!SND.ctx) sndBuild(); SND.ctx.resume(); SND.master.gain.setTargetAtTime(heard ? SND_VOL : 0, SND.ctx.currentTime, 0.05); } catch (e) {} }
  else if (SND.ctx) SND.master.gain.setTargetAtTime(0, SND.ctx.currentTime, 0.05);
};
/* ---- (the bridge, end) hand Embroidery what it needs from inside Seam's closure, then close it ---- */
EG_SEAM.pocket = {
  open:function(){ if (typeof pkOpen === 'function') pkOpen(); },
  close:function(){ if (typeof pkClose === 'function') pkClose(); },
  isOpen:function(){ return !!(typeof POK !== 'undefined' && POK.open); },
  put:function(id){ if (typeof pocketPut === 'function') return pocketPut(id); },
  have:function(){ return typeof PK_HAVE !== 'undefined' ? PK_HAVE.slice() : []; },
  art:function(){ return typeof PK_ART !== 'undefined' ? Object.keys(PK_ART).length : 0; }
};
/* clicking a thing: Seam's own click actions first (close-ups, the dumpster, the pit...); true if one answered */
EG_SEAM.click = function(sayKey){
  var hit = false;
  try { hubBoxAction({ box:{ say:sayKey } }, function(d, fn){ hit = true; fn(); return true; }); } catch (e) { console.error(e); }
  return hit;
};
EG_SEAM.where = function(x, z, a){ me.x = x; me.y = z; me.a = a; };
EG_SEAM.closeUpOpen = function(){ return !!((typeof F3C !== 'undefined' && F3C.open) || (typeof FVM !== 'undefined' && FVM.open)); };
EG_SEAM.closeAll = function(){ try { if (typeof F3C !== 'undefined' && F3C.open) f3Close(); } catch (e) {} try { if (typeof FVM !== 'undefined' && FVM.open) fvmClose(); } catch (e) {} };
EG_SEAM.pic = function(name){ return FPIC[name] || null; };
EG_SEAM.step = function(now, dt){ try { if (POK.open) pkFrame(now); seamStep(now, dt); }   /* (as Seam's d2-frame: while the pocket is open, it's what's drawn) */ catch (e) { if (!EG_SEAM.err) { EG_SEAM.err = e; console.error(e); } } };
})();
