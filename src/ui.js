/* ================================================================
   EMBROIDERY · the shared things on screen, the way Seam shows them (milestone 2, Nov 17, 2026):
   - the story's captions: one quiet line at the bottom (Seam's #caption, same look), say(text, ms);
   - the sound switch (音 · sound on/off) and the captions-for-sounds switch (字幕 · cc on/off), top right, remembered
     in the same places in the browser as Seam's (nullgrey.between.sound, nullgrey.cc), so a choice made on one page
     holds on the next;
   - ccSay(key, text, gap): a sound written down, in brackets, lowercase, above the story's line; each key at most
     once every few seconds (Seam's cc.js, same rules). Aisling (Nov 16): "Cc important".
   ================================================================ */
export const UI = { heard:false, cc:false, onChange:null, last:{}, hideAt:0 };
try { UI.heard = localStorage.getItem('nullgrey.between.sound') === 'on'; UI.cc = localStorage.getItem('nullgrey.cc') === 'on'; } catch (e) {}

const css = `
#caption{position:fixed;left:50%;transform:translateX(-50%);width:max-content;max-width:88%;bottom:4%;z-index:6;text-align:center;font-size:11px;letter-spacing:.16em;color:rgba(228,220,208,.62);pointer-events:none;padding:3px 10px;min-height:1.4em;transition:opacity .5s;background:rgba(10,9,8,.72);box-sizing:border-box;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;line-height:1.55}
#caption.off{opacity:0}
#ccline{position:fixed;left:50%;transform:translateX(-50%);width:max-content;max-width:80%;bottom:calc(4% + 2.6em);z-index:6;text-align:center;font-size:10px;letter-spacing:.12em;color:rgba(228,220,208,.7);pointer-events:none;padding:2px 8px;background:rgba(10,9,8,.55);opacity:0;transition:opacity .6s;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace}
.sw{position:fixed;right:2%;z-index:30;font:10px 'IBM Plex Mono',ui-monospace,Menlo,monospace;letter-spacing:.08em;color:rgba(228,220,208,.55);background:rgba(10,9,8,.35);border:0;padding:3px 7px;cursor:pointer}
.sw:hover{color:rgba(228,220,208,.9)}
@media (max-width:640px),(max-aspect-ratio:9/10){ #caption{font-size:10px;letter-spacing:.1em} }
`;
let cap, ccl, capT = 0;
export function initUI(){
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  cap = document.createElement('div'); cap.id = 'caption'; cap.className = 'off'; document.body.appendChild(cap);
  ccl = document.createElement('div'); ccl.id = 'ccline'; document.body.appendChild(ccl);
  const mk = top => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sw'; b.style.top = top;
    ['pointerdown', 'mousedown', 'touchstart'].forEach(t => b.addEventListener(t, e => e.stopPropagation())); document.body.appendChild(b); return b; };
  const s = mk('3%'), c = mk('calc(3% + 21px)');
  const lab = () => { s.textContent = '音 · sound ' + (UI.heard ? 'on' : 'off'); c.textContent = '字幕 · cc ' + (UI.cc ? 'on' : 'off'); };
  lab();
  s.addEventListener('click', e => { e.stopPropagation(); UI.heard = !UI.heard; lab(); try { localStorage.setItem('nullgrey.between.sound', UI.heard ? 'on' : 'off'); } catch (er) {} if (UI.onChange) UI.onChange(); });
  c.addEventListener('click', e => { e.stopPropagation(); UI.cc = !UI.cc; lab(); try { localStorage.setItem('nullgrey.cc', UI.cc ? 'on' : 'off'); } catch (er) {}
    if (UI.onChange) UI.onChange(); if (UI.cc) { UI.last = {}; ccSay('cc', 'captions on. sounds are written here.', 0); } else ccl.style.opacity = '0'; });
}
export function say(t, ms){
  clearTimeout(capT); cap.textContent = t || ''; cap.classList.toggle('off', !t);
  if (t && ms) capT = setTimeout(() => cap.classList.add('off'), ms);
}
export function ccSay(key, text, gap){
  if (!UI.cc || !text) return;
  const now = performance.now();
  if (UI.last[key] && now - UI.last[key] < (gap == null ? 6000 : gap)) return;
  UI.last[key] = now;
  ccl.textContent = '[' + text + ']'; ccl.style.opacity = '1';
  UI.hideAt = now + 2800 + Math.max(0, text.length - 30)*45;
}
export function tickUI(now){ if (UI.hideAt && now > UI.hideAt) { ccl.style.opacity = '0'; UI.hideAt = 0; } }
