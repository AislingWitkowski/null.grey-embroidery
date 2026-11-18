/* ================================================================
   EMBROIDERY · the bridge to Seam's shared things (milestone 2). Seam's pocket, its item pictures and their rules are
   used AS THEY ARE: tools/seam-shared.py copies them from null.grey-furusatostation at build time (the masters stay
   there). Seam's files expect a few things of their own engine (a #stage, a caption, where "you" are, a step each
   frame); this file gives them those, standing in for Seam's engine. Embroidery calls EG_SEAM.step() each frame.
   ================================================================ */
var EG_SEAM = window.EG_SEAM = window.EG_SEAM || { say:function(){}, cc:function(){}, steps:[] };
var stage = document.getElementById('stage');
var capEl = document.getElementById('seam-caption');
var capTimer = 0;
function setCaption(t, ms){ EG_SEAM.say(t, ms); }
function say(t, ms){ EG_SEAM.say(t, ms); }
var keys = {}, drag = null, showMap = false;
var me = { x:12.6, y:6.6, a:0, look:0, room:1 };
var CU = { open:false }, LOOK = { open:false };
var WALK_ASK = null;
function walkAskHide(){} function walkAskShow(){} function walkAskPlace(){}
var seamStep = function(now, dt){};
var RIDE_HERE = 2;   /* (the ride's line map: this page is F 03, main street, missing mile) */

/* Seam's world-building calls, standing in: Embroidery draws the world, so these only remember (their pictures and their
   boxes' click names), and Seam's click actions (hubBoxAction) are asked when Embroidery's thing is clicked */
var BENCH = [], OBST = [], SPRITES = [], LATER = [];
function fpic(name, w, h, ppu, vbw, vbh, emit, svg, clear, neon){ FPIC[name] = { w:w, h:h, vbw:vbw, vbh:vbh, emit:emit || '', svg:svg, clear:!!clear }; }
function fRetire(){} function find(fn){ return BENCH.filter(fn); }
function fpicTex(){ return null; } function fPicTex(){ return null; }
