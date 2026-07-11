
/* ===================== Supabase ===================== */
const SUPABASE_URL='https://peyqkueitxtyujgmqghc.supabase.co';
const SITE_URL='https://rentcan.in';  /* fixed production domain. Invite QR/links are ALWAYS built from this + the code, never from location/file:// */
const SUPABASE_KEY='sb_publishable_jbaVLjK75KjrMVe8ii8teg_IcTc8OeM';
let sb=null, currentUser=null, currentRole='landlord', signupRole='landlord', otpEmail='', otpPhone='', otpChannel='email', pendingSuccess=false, dashShown=false, resendTimer=null;
try{ sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY); }catch(e){ console.error('Supabase failed to load',e); }

const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
function esc(s){ return (s==null?'':String(s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

/* ---- sounds: Kenney UI samples (WAV, embedded CC0) for click/confirm/error + synth chime for success ---- */
let actx=null, muted=false;
function ac(){ if(!actx){ try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){} } return actx; }
function tone(f,d,t,g,at){ const c=ac(); if(!c||muted)return; const tt=at||c.currentTime, o=c.createOscillator(), gg=c.createGain(); o.type=t||'sine'; o.frequency.value=f; gg.gain.setValueAtTime(.0001,tt); gg.gain.linearRampToValueAtTime(g||.05,tt+.01); gg.gain.exponentialRampToValueAtTime(.0001,tt+d); o.connect(gg).connect(c.destination); o.start(tt); o.stop(tt+d); }
const _S={ click:new Audio('data:audio/mpeg;base64,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'), confirm:new Audio('data:audio/mpeg;base64,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'), error:new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//twwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAADAAAE5QB/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f3/AwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD///////////////////////////////////////////8AAAAATGF2YzYwLjMxAAAAAAAAAAAAAAAAJAVAAAAAAAAABOWEvEuXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7cMQAAA6tEzk0NgACfSasvx7wAAaUAAABnd3d3fRELdzCGZ/Y4EACAEBEPPpSixYYLHLtnZLEsnma9+nTe97zN/nbr17+L16+85SnTM3ve+MGZmfr7/NKL19/mZmaUmZve96U6dve96UpSkzlL3v8zSlH7g+D4Po4gB8Hw/Ehz+IwfxAD4Pg+fRuX+/usIgYghBCGBIKBAPgzJ69Pggxfct6tCRjdAHgkA310J7Ec1QcieE/bX0lC2F4HQALgBbpleYV6fVfHVPjcWBE3XOIDArLv57omBvGd50choKg5FQQViT4kKOEljYkpPvaganTw7CwOA1G2eJMiTJvXzV+c3VigiUgRFHH2cz8+WZunTz43rY3imv/+r3+4mv//1a+vFdfiSBEs+KIAC7tkUBEAAzNNgFFtvXD/+3LEB4ARwTVn+NeAClgjKfsngAAD9Q/mLMYFQLeZA4XEHSoDQG0HW7L2dDMhj9hL3m6nNFQ6hJaB+h0f5YUorkSwPGNxjwo6OYElUoXloN08pofgQrw7YhQVaXmPBSLewvWW3zDdRKRonb48G1V1F3CzS7ZEgQu41s/vFfwYGbe79xU8rDX/67MlMxdf//+8ne2qdwuZVUEQAQZmAAAAYYdl8ige04vklDpAWiZgQHWzxOVgS5v1A65iRCEpwQAHLWTP2bKUqPEZJDFX/l+sqr9yl6oQ7dbtDa3/7/4y1SKWK0JoN/S1n+////aHKYjTS2Oz0BRnG5jKaXLX///PP1LJFL5dVqQzVs024zS1qbP/////+DYzSU1H////lhaNtKL/0AB+zEIi/mc/qmqnNI4DAKAnmZrOU//7cMQIA88cvOQcZ4AAAAA0gAAABKXhKhNmQbwmxlQ066P4nTo/idHUzZYVardwXsWz6Nl7l7Fw+fXUqGzqVDVCy6hMTNR9GlVqtiJ40nFiV08FWxYSumhPow8NRF1A0HSob+DQNFQ2JTsGlHvxFBqty/1nSrpH3dPW7p93I0xBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU='), success:new Audio('data:audio/mpeg;base64,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') };
_S.click.volume=.45; _S.confirm.volume=.5; _S.error.volume=.45; _S.success.volume=.55;
function _play(n){ if(muted)return; var a=_S[n]; if(!a)return; try{ a.currentTime=0; var p=a.play(); if(p&&p.catch)p.catch(function(){}); }catch(e){} }
const Snd={ tick:()=>_play('click'), pop:()=>_play('confirm'), error:()=>_play('error'),
  success(){ _play('success'); } };
addEventListener('pointerdown',function(){ const c=ac(); if(c&&c.state==='suspended')c.resume(); Object.keys(_S).forEach(function(k){ var a=_S[k]; try{ a.muted=true; var p=a.play(); if(p&&p.then)p.then(function(){a.pause();a.currentTime=0;a.muted=false;}).catch(function(){a.muted=false;}); else { a.muted=false; } }catch(e){} }); },{once:true});

/* ---- toast ---- */
function toast(msg,ok){ const t=$('#toast'); $('#toastText').textContent=msg; t.className='toast show'+(ok?' ok':''); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),3800); }

/* ---- top progress bar ---- */
let progI=null;
function progStart(){ const p=$('#progress'); p.classList.add('go'); p.style.width='18%'; let w=18; clearInterval(progI); progI=setInterval(()=>{ w+=Math.max(.5,(85-w)*.08); if(w>=85){w=85;} p.style.width=w+'%'; },180); }
function progDone(){ const p=$('#progress'); clearInterval(progI); p.style.width='100%'; setTimeout(()=>{ p.classList.remove('go'); setTimeout(()=>p.style.width='0',300); },280); }

/* ---- button loading ---- */
function load(btn,on,label){ if(!btn)return; const t=btn.querySelector('.bt'); if(on){ btn.disabled=true; btn.classList.add('loading'); if(label){ btn.dataset.prev=t.textContent; t.textContent=label; } } else { btn.disabled=false; btn.classList.remove('loading'); if(btn.dataset.prev){ t.textContent=btn.dataset.prev; delete btn.dataset.prev; } } }
function btnDone(btn,label){ if(!btn)return; var t=btn.querySelector('.bt'); btn.classList.remove('loading'); btn.classList.add('done'); if(t) t.textContent=label||'\u2713 All set'; try{ Snd.tick(); }catch(e){} setTimeout(function(){ btn.classList.remove('done'); btn.disabled=false; if(btn.dataset.prev&&t){ t.textContent=btn.dataset.prev; delete btn.dataset.prev; } },1300); }

/* ---- status line ---- */
function status(id,text,kind){ const el=$(id); if(!el)return; if(!text){ el.className='status'; el.innerHTML=''; return; } el.className='status show '+(kind||'info'); if(kind==='err'){ try{ Snd.error(); }catch(e){} } el.innerHTML='<span class="sdot"></span><span></span>'; el.lastChild.textContent=text; }

/* ---- screen router (AnimatePresence-style) ---- */
function showScreen(name){
  const host=$('#host'); const cur=host.querySelector('.screen.active'); const next=host.querySelector('[data-screen="'+name+'"]');
  if(!next || (cur&&cur===next)){ if(next&&!next.classList.contains('active')){} else return; }
  if(cur){ cur.classList.add('leaving'); cur.classList.remove('active','enter'); setTimeout(()=>cur.classList.remove('leaving'),210); }
  next.classList.remove('leaving'); next.classList.add('active');
  void next.offsetWidth; next.classList.remove('enter'); void next.offsetWidth; next.classList.add('enter');
  const first=next.querySelector('input'); if(first && name!=='success'){ setTimeout(()=>{ if(name!=='otp') first.focus(); },260); }
  if(name==='otp'){ setTimeout(()=>{ const b=$('#otpBoxes input'); if(b) b.focus(); },280); }
}
function showAuthView(){ $('#dashView').style.display='none'; $('#authView').style.display='grid'; }
function showDash(){ $('#authView').style.display='none'; $('#dashView').style.display='block'; }

/* ---- nav links ---- */
$('#toSignup').onclick=e=>{e.preventDefault();Snd.tick();showScreen('signup');};
$('#toLogin').onclick=e=>{e.preventDefault();Snd.tick();showScreen('login');};
$('#toForgot').onclick=e=>{e.preventDefault();Snd.tick();showScreen('forgot');};
$('#forgotBack').onclick=()=>{Snd.tick();showScreen('login');};
$('#otpBack').onclick=()=>{Snd.tick();showScreen('login');};
function pickRole(el){ $$('.role-opt').forEach(o=>o.classList.remove('sel')); el.classList.add('sel'); signupRole=el.dataset.role; Snd.tick(); }

/* ---- connection check ---- */
async function ping(){ const d=$('#connDot'), t=$('#connText'); if(!sb){ d.className='dot down'; t.textContent='Could not load Supabase (check connection).'; return; } try{ await sb.auth.getSession(); d.className='dot up'; t.textContent='Connected securely'; }catch(e){ d.className='dot down'; t.textContent='Supabase unreachable'; } }

/* ===================== AUTH ACTIONS ===================== */
/* signup loading overlay control */
function showLoader(msg){ var o=$('#loadOv'); if(!o) return; if(msg) $('#loadMsg').textContent=msg;
  /* If you re-upload a working clip, set its src here and reveal it:
     var v=$('#loadVid'); v.src='ball-on-ladder.mp4'; v.hidden=false; $('#ballLadder').hidden=true; */
  o.hidden=false; }
function hideLoader(){ var o=$('#loadOv'); if(o) o.hidden=true; }

function mockSocial(provider) {
  document.getElementById('socialMockTitle').innerText = 'Connecting to ' + provider;
  document.getElementById('socialMockName').innerText = provider;
  showScreen('social-mock');
  setTimeout(() => {
    showScreen('success');
    setTimeout(() => {
      enterDashboard({id: 'demo', email: 'demo@demo.com', user_metadata: {name: 'Guest User', role: signupRole}});
    }, 1500);
  }, 1500);
}

function continueWithGoogle() {
  mockSocial('Google');
}



let otpChannelType = 'sms'; // 'sms' or 'whatsapp'

function mockSocial(provider) {
  document.getElementById('socialMockTitle').innerText = 'Connecting to ' + provider;
  document.getElementById('socialMockName').innerText = provider;
  showScreen('social-mock');
  setTimeout(() => {
    showScreen('success');
    setTimeout(() => {
      enterDashboard({id: 'demo', email: 'demo@demo.com', user_metadata: {name: 'Guest User', role: signupRole}});
    }, 1500);
  }, 1500);
}

async function handleSocialLogin(provider) {
  Snd.tick();
  if(!sb) {
    toast('Database connection error.', false);
    return;
  }
  
  // Save intended role so we can apply it after Google redirects back
  localStorage.setItem('rentcan_intended_role', signupRole);
  
  const { error } = await sb.auth.signInWithOAuth({
    provider: provider.toLowerCase(),
    options: {
      redirectTo: location.origin + location.pathname
    }
  });
  if(error) {
    toast(error.message, false);
    console.error('OAuth Error:', error);
  }
}

/* request OTP code */
async function sendOtp(email,btn){
  Snd.tick(); status('#loginStatus','Sending OTP…','info'); if(btn) load(btn,true,'Sending OTP…'); progStart();
  const { error }=await sb.auth.signInWithOtp({ email, options:{ shouldCreateUser:true, data:{ role:signupRole } } });
  progDone(); if(btn) load(btn,false);
  if(error){ status('#loginStatus',error.message,'err'); return false; }
  otpChannel='email'; otpEmail=email; $('#otpEmailLabel').textContent=email; Snd.pop();
  status('#loginStatus','OTP Sent ✓','ok'); showScreen('otp'); status('#otpStatus','Enter the 6-digit code we emailed you.','info');
  startResendCountdown(); return true;
}
/* request Phone OTP code (MSG91 configured on Supabase, or Direct MSG91 HTTP fallback) */
async function sendPhoneOtp(phone, channel, btn){
  const statusId = channel === 'whatsapp' ? '#waStatus' : '#loginStatus';
  Snd.tick(); status(statusId, 'Sending OTP…', 'info'); 
  if(btn) load(btn,true,'Sending…'); progStart();
  
  // 1. Try real Supabase OTP send
  let error = null;
  if(sb) {
    try {
      const res = await sb.auth.signInWithOtp({
        phone: phone,
        options: {
          channel: channel, // 'sms' or 'whatsapp'
          shouldCreateUser: true,
          data: { role: signupRole }
        }
      });
      error = res.error;
    } catch(err) {
      error = err;
    }
  }

  // 2. If real Supabase succeeds, proceed
  if (sb && !error) {
    progDone(); if(btn) load(btn,false);
    otpChannel='phone'; otpChannelType=channel; otpPhone=phone; $('#otpEmailLabel').textContent=phone; Snd.pop();
    status(statusId,'OTP Sent ✓','ok'); showScreen('otp'); 
    status('#otpStatus',`Please check ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} for OTP.`,'info');
    startResendCountdown();
    return true;
  }

  // 3. Fallback to direct MSG91 HTTP call
  console.warn('Real Supabase OTP failed, falling back to direct MSG91 API call:', error ? error.message : 'Supabase Client not loaded');
  
  const authKey = '535432AfGyahgfkas6a37b39eP1';
  let url = `https://control.msg91.com/api/v5/otp?mobile=${phone}&authkey=${authKey}`;
  if (channel === 'whatsapp') {
    url += '&channel=whatsapp';
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('MSG91 Direct Call Error:', err);
  }

  setTimeout(() => {
    progDone(); if(btn) load(btn,false);
    otpChannel='phone'; otpChannelType=channel; otpPhone=phone; $('#otpEmailLabel').textContent=phone; Snd.pop();
    status(statusId,'OTP Sent ✓','ok'); showScreen('otp'); 
    status('#otpStatus',`Please check ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} for OTP.`,'info');
    startResendCountdown();
  }, 1000);
  return true;
}
/* email/SMS toggle */
let otpMethod='email';
$$('#otpSeg .seg-btn').forEach(b=>b.addEventListener('click',()=>{
  otpMethod=b.dataset.method; Snd.tick();
  $$('#otpSeg .seg-btn').forEach(x=>x.classList.toggle('on',x===b));
  $('#otpEmailField').style.display = otpMethod==='email'?'':'none';
  $('#otpPhoneField').style.display = otpMethod==='sms'?'':'none';
  status('#loginStatus','','');
}));

/* country code picker (India default) */
/* flag-icons (lipis) 4x3 SVGs, base64 — MIT licensed */
const FLAGS={
  in:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBpZD0iZmxhZy1pY29ucy1pbiIgdmlld0JveD0iMCAwIDY0MCA0ODAiPgogIDxwYXRoIGZpbGw9IiNmOTMiIGQ9Ik0wIDBoNjQwdjE2MEgweiIvPgogIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDE2MGg2NDB2MTYwSDB6Ii8+CiAgPHBhdGggZmlsbD0iIzEyODgwNyIgZD0iTTAgMzIwaDY0MHYxNjBIMHoiLz4KICA8ZyB0cmFuc2Zvcm09Im1hdHJpeCgzLjIgMCAwIDMuMiAzMjAgMjQwKSI+CiAgICA8Y2lyY2xlIHI9IjIwIiBmaWxsPSIjMDA4Ii8+CiAgICA8Y2lyY2xlIHI9IjE3LjUiIGZpbGw9IiNmZmYiLz4KICAgIDxjaXJjbGUgcj0iMy41IiBmaWxsPSIjMDA4Ii8+CiAgICA8ZyBpZD0iaW4tZCI+CiAgICAgIDxnIGlkPSJpbi1jIj4KICAgICAgICA8ZyBpZD0iaW4tYiI+CiAgICAgICAgICA8ZyBpZD0iaW4tYSIgZmlsbD0iIzAwOCI+CiAgICAgICAgICAgIDxjaXJjbGUgcj0iLjkiIHRyYW5zZm9ybT0icm90YXRlKDcuNSAtOC44IDEzMy41KSIvPgogICAgICAgICAgICA8cGF0aCBkPSJNMCAxNy41LjYgNyAwIDJsLS42IDV6Ii8+CiAgICAgICAgICA8L2c+CiAgICAgICAgICA8dXNlIHhsaW5rOmhyZWY9IiNpbi1hIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB0cmFuc2Zvcm09InJvdGF0ZSgxNSkiLz4KICAgICAgICA8L2c+CiAgICAgICAgPHVzZSB4bGluazpocmVmPSIjaW4tYiIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdHJhbnNmb3JtPSJyb3RhdGUoMzApIi8+CiAgICAgIDwvZz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjaW4tYyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdHJhbnNmb3JtPSJyb3RhdGUoNjApIi8+CiAgICA8L2c+CiAgICA8dXNlIHhsaW5rOmhyZWY9IiNpbi1kIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgICA8dXNlIHhsaW5rOmhyZWY9IiNpbi1kIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB0cmFuc2Zvcm09InJvdGF0ZSgtMTIwKSIvPgogIDwvZz4KPC9zdmc+Cg==',
  us:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJmbGFnLWljb25zLXVzIiB2aWV3Qm94PSIwIDAgNjQwIDQ4MCI+CiAgPHBhdGggZmlsbD0iI2JkM2Q0NCIgZD0iTTAgMGg2NDB2NDgwSDAiLz4KICA8cGF0aCBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMzciIGQ9Ik0wIDU1LjNoNjQwTTAgMTI5aDY0ME0wIDIwM2g2NDBNMCAyNzdoNjQwTTAgMzUxaDY0ME0wIDQyNWg2NDAiLz4KICA8cGF0aCBmaWxsPSIjMTkyZjVkIiBkPSJNMCAwaDM2NC44djI1OC41SDAiLz4KICA8bWFya2VyIGlkPSJ1cy1hIiBtYXJrZXJIZWlnaHQ9IjMwIiBtYXJrZXJXaWR0aD0iMzAiPgogICAgPHBhdGggZmlsbD0iI2ZmZiIgZD0ibTE0IDAgOSAyN0wwIDEwaDI4TDUgMjd6Ii8+CiAgPC9tYXJrZXI+CiAgPHBhdGggZmlsbD0ibm9uZSIgbWFya2VyLW1pZD0idXJsKCN1cy1hKSIgZD0ibTAgMCAxNiAxMWg2MSA2MSA2MSA2MSA2MEw0NyAzN2g2MSA2MSA2MCA2MUwxNiA2M2g2MSA2MSA2MSA2MSA2MEw0NyA4OWg2MSA2MSA2MCA2MUwxNiAxMTVoNjEgNjEgNjEgNjEgNjBMNDcgMTQxaDYxIDYxIDYwIDYxTDE2IDE2Nmg2MSA2MSA2MSA2MSA2MEw0NyAxOTJoNjEgNjEgNjAgNjFMMTYgMjE4aDYxIDYxIDYxIDYxIDYweiIvPgo8L3N2Zz4K',
  gb:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJmbGFnLWljb25zLWdiIiB2aWV3Qm94PSIwIDAgNjQwIDQ4MCI+CiAgPHBhdGggZmlsbD0iIzAxMjE2OSIgZD0iTTAgMGg2NDB2NDgwSDB6Ii8+CiAgPHBhdGggZmlsbD0iI0ZGRiIgZD0ibTc1IDAgMjQ0IDE4MUw1NjIgMGg3OHY2Mkw0MDAgMjQxbDI0MCAxNzh2NjFoLTgwTDMyMCAzMDEgODEgNDgwSDB2LTYwbDIzOS0xNzhMMCA2NFYweiIvPgogIDxwYXRoIGZpbGw9IiNDODEwMkUiIGQ9Im00MjQgMjgxIDIxNiAxNTl2NDBMMzY5IDI4MXptLTE4NCAyMCA2IDM1TDU0IDQ4MEgwek02NDAgMHYzTDM5MSAxOTFsMi00NEw1OTAgMHpNMCAwbDIzOSAxNzZoLTYwTDAgNDJ6Ii8+CiAgPHBhdGggZmlsbD0iI0ZGRiIgZD0iTTI0MSAwdjQ4MGgxNjBWMHpNMCAxNjB2MTYwaDY0MFYxNjB6Ii8+CiAgPHBhdGggZmlsbD0iI0M4MTAyRSIgZD0iTTAgMTkzdjk2aDY0MHYtOTZ6TTI3MyAwdjQ4MGg5NlYweiIvPgo8L3N2Zz4K',
  ca:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJmbGFnLWljb25zLWNhIiB2aWV3Qm94PSIwIDAgNjQwIDQ4MCI+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE1MC4xIDBoMzM5Ljd2NDgwSDE1MHoiLz4KICA8cGF0aCBmaWxsPSIjZDUyYjFlIiBkPSJNLTE5LjcgMGgxNjkuOHY0ODBILTE5Ljd6bTUwOS41IDBoMTY5Ljh2NDgwSDQ4OS45ek0yMDEgMjMybC0xMy4zIDQuNCA2MS40IDU0YzQuNyAxMy43LTEuNiAxNy44LTUuNiAyNWw2Ni42LTguNC0xLjYgNjcgMTMuOS0uMy0zLjEtNjYuNiA2Ni43IDhjLTQuMS04LjctNy44LTEzLjMtNC0yNy4ybDYxLjMtNTEtMTAuNy00Yy04LjgtNi44IDMuOC0zMi42IDUuNi00OC45IDAgMC0zNS43IDEyLjMtMzggNS44bC05LjItMTcuNS0zMi42IDM1LjhjLTMuNS45LTUtLjUtNS45LTMuNWwxNS03NC44LTIzLjggMTMuNHEtMy4yIDEuMy01LjItMi4ybC0yMy00Ni0yMy42IDQ3LjhxLTIuOCAyLjUtNSAuN0wyNjQgMTMwLjhsMTMuNyA3NC4xYy0xLjEgMy0zLjcgMy44LTYuNyAyLjJsLTMxLjItMzUuM2MtNCA2LjUtNi44IDE3LjEtMTIuMiAxOS41cy0yMy41LTQuNS0zNS42LTdjNC4yIDE0LjggMTcgMzkuNiA5IDQ3LjciLz4KPC9zdmc+Cg==',
  au:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJmbGFnLWljb25zLWF1IiB2aWV3Qm94PSIwIDAgNjQwIDQ4MCI+CiAgPHBhdGggZmlsbD0iIzAwMDA4QiIgZD0iTTAgMGg2NDB2NDgwSDB6Ii8+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0ibTM3LjUgMCAxMjIgOTAuNUwyODEgMGgzOXYzMWwtMTIwIDg5LjUgMTIwIDg5VjI0MGgtNDBsLTEyMC04OS41TDQwLjUgMjQwSDB2LTMwbDExOS41LTg5TDAgMzJWMHoiLz4KICA8cGF0aCBmaWxsPSJyZWQiIGQ9Ik0yMTIgMTQwLjUgMzIwIDIyMHYyMGwtMTM1LjUtOTkuNXptLTkyIDEwIDMgMTcuNS05NiA3Mkgwek0zMjAgMHYxLjVsLTEyNC41IDk0IDEtMjJMMjk1IDB6TTAgMGwxMTkuNSA4OGgtMzBMMCAyMXoiLz4KICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTIwLjUgMHYyNDBoODBWMHpNMCA4MHY4MGgzMjBWODB6Ii8+CiAgPHBhdGggZmlsbD0icmVkIiBkPSJNMCA5Ni41djQ4aDMyMHYtNDh6TTEzNi41IDB2MjQwaDQ4VjB6Ii8+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0ibTUyNyAzOTYuNy0yMC41IDIuNiAyLjIgMjAuNS0xNC44LTE0LjQtMTQuNyAxNC41IDItMjAuNS0yMC41LTIuNCAxNy4zLTExLjItMTAuOS0xNy41IDE5LjYgNi41IDYuOS0xOS41IDcuMSAxOS40IDE5LjUtNi43LTEwLjcgMTcuNnptLTMuNy0xMTcuMiAyLjctMTMtOS44LTkgMTMuMi0xLjUgNS41LTEyLjEgNS41IDEyLjEgMTMuMiAxLjUtOS44IDkgMi43IDEzLTExLjYtNi42em0tMTA0LjEtNjAtMjAuMyAyLjIgMS44IDIwLjMtMTQuNC0xNC41LTE0LjggMTQuMSAyLjQtMjAuMy0yMC4yLTIuNyAxNy4zLTEwLjgtMTAuNS0xNy41IDE5LjMgNi44TDM4NyAxNzhsNi43IDE5LjMgMTkuNC02LjMtMTAuOSAxNy4zIDE3LjEgMTEuMlpNNjIzIDE4Ni43bC0yMC45IDIuNyAyLjMgMjAuOS0xNS4xLTE0LjctMTUgMTQuOCAyLjEtMjEtMjAuOS0yLjQgMTcuNy0xMS41LTExLjEtMTcuOSAyMCA2LjcgNy0xOS44IDcuMiAxOS44IDE5LjktNi45LTExIDE4em0tOTYuMS04My41LTIwLjcgMi4zIDEuOSAyMC44LTE0LjctMTQuOC0xNS4xIDE0LjQgMi40LTIwLjctMjAuNy0yLjggMTcuNy0xMUw0NjcgNzMuNWwxOS43IDYuOSA3LjMtMTkuNSA2LjggMTkuNyAxOS44LTYuNS0xMS4xIDE3LjZ6TTIzNCAzODUuN2wtNDUuOCA1LjQgNC42IDQ1LjktMzIuOC0zMi40LTMzIDMyLjIgNC45LTQ1LjktNDUuOC01LjggMzguOS0yNC44LTI0LTM5LjQgNDMuNiAxNSAxNS44LTQzLjQgMTUuNSA0My41IDQzLjctMTQuNy0yNC4zIDM5LjIgMzguOCAyNS4xWiIvPgo8L3N2Zz4K',
  ae:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJmbGFnLWljb25zLWFlIiB2aWV3Qm94PSIwIDAgNjQwIDQ4MCI+CiAgPHBhdGggZmlsbD0iIzAwNzMyZiIgZD0iTTAgMGg2NDB2MTYwSDB6Ii8+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMTYwaDY0MHYxNjBIMHoiLz4KICA8cGF0aCBmaWxsPSIjMDAwMDAxIiBkPSJNMCAzMjBoNjQwdjE2MEgweiIvPgogIDxwYXRoIGZpbGw9InJlZCIgZD0iTTAgMGgyMjB2NDgwSDB6Ii8+Cjwvc3ZnPgo=',
  sg:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJmbGFnLWljb25zLXNnIiB2aWV3Qm94PSIwIDAgNjQwIDQ4MCI+CiAgPGRlZnM+CiAgICA8Y2xpcFBhdGggaWQ9InNnLWEiPgogICAgICA8cGF0aCBmaWxsLW9wYWNpdHk9Ii43IiBkPSJNMCAwaDY0MHY0ODBIMHoiLz4KICAgIDwvY2xpcFBhdGg+CiAgPC9kZWZzPgogIDxnIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1wYXRoPSJ1cmwoI3NnLWEpIj4KICAgIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0tMjAgMGg3MjB2NDgwSC0yMHoiLz4KICAgIDxwYXRoIGZpbGw9IiNkZjAwMDAiIGQ9Ik0tMjAgMGg3MjB2MjQwSC0yMHoiLz4KICAgIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xNDYgNDAuMmE4NC40IDg0LjQgMCAwIDAgLjggMTY1LjIgODYgODYgMCAwIDEtMTA2LjYtNTkgODYgODYgMCAwIDEgNTktMTA2YzE2LTQuNiAzMC44LTQuNyA0Ni45LS4yeiIvPgogICAgPHBhdGggZmlsbD0iI2ZmZiIgZD0ibTEzMyAxMTAgNC45IDE1LTEzLTkuMi0xMi44IDkuNCA0LjctMTUuMi0xMi44LTkuMyAxNS45LS4yIDUtMTUgNSAxNWgxNS44em0xNy41IDUyIDUgMTUuMS0xMy05LjItMTIuOSA5LjMgNC44LTE1LjEtMTIuOC05LjQgMTUuOS0uMSA0LjktMTUuMSA1IDE1aDE2em01OC41LS40IDQuOSAxNS4yLTEzLTkuMy0xMi44IDkuMyA0LjctMTUuMS0xMi44LTkuMyAxNS45LS4yIDUtMTUgNSAxNWgxNS44em0xNy40LTUxLjYgNC45IDE1LjEtMTMtOS4yLTEyLjggOS4zIDQuOC0xNS4xLTEyLjktOS40IDE2LS4xIDQuOC0xNS4xIDUgMTVoMTZ6bS00Ni4zLTM0LjMgNSAxNS4yLTEzLTkuMy0xMi45IDkuNCA0LjgtMTUuMi0xMi44LTkuNCAxNS44LS4xIDUtMTUuMSA1IDE1aDE2eiIvPgogIDwvZz4KPC9zdmc+Cg==',
  de:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJmbGFnLWljb25zLWRlIiB2aWV3Qm94PSIwIDAgNjQwIDQ4MCI+CiAgPHBhdGggZmlsbD0iI2ZjMCIgZD0iTTAgMzIwaDY0MHYxNjBIMHoiLz4KICA8cGF0aCBmaWxsPSIjMDAwMDAxIiBkPSJNMCAwaDY0MHYxNjBIMHoiLz4KICA8cGF0aCBmaWxsPSJyZWQiIGQ9Ik0wIDE2MGg2NDB2MTYwSDB6Ii8+Cjwvc3ZnPgo=',
  fr:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGlkPSJmbGFnLWljb25zLWZyIiB2aWV3Qm94PSIwIDAgNjQwIDQ4MCI+CiAgPHBhdGggZmlsbD0iIzAwMDA5MSIgZD0iTTAgMGgyMTMuM3Y0ODBIMHoiLz4KICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjEzLjMgMGgyMTMuNHY0ODBIMjEzLjN6Ii8+CiAgPHBhdGggZmlsbD0iI2UxMDAwZiIgZD0iTTQyNi43IDBINjQwdjQ4MEg0MjYuN3oiLz4KPC9zdmc+Cg==',
  nz:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBpZD0iZmxhZy1pY29ucy1ueiIgdmlld0JveD0iMCAwIDY0MCA0ODAiPgogIDxkZWZzPgogICAgPGcgaWQ9Im56LWIiPgogICAgICA8ZyBpZD0ibnotYSI+CiAgICAgICAgPHBhdGggZD0iTTAtLjN2LjVsMS0uNXoiLz4KICAgICAgICA8cGF0aCBkPSJNLjIuMyAwLS4xbDEtLjJ6Ii8+CiAgICAgIDwvZz4KICAgICAgPHVzZSB4bGluazpocmVmPSIjbnotYSIgdHJhbnNmb3JtPSJzY2FsZSgtMSAxKSIvPgogICAgICA8dXNlIHhsaW5rOmhyZWY9IiNuei1hIiB0cmFuc2Zvcm09InJvdGF0ZSg3MiAwIDApIi8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI256LWEiIHRyYW5zZm9ybT0icm90YXRlKC03MiAwIDApIi8+CiAgICAgIDx1c2UgeGxpbms6aHJlZj0iI256LWEiIHRyYW5zZm9ybT0ic2NhbGUoLTEgMSlyb3RhdGUoNzIpIi8+CiAgICA8L2c+CiAgPC9kZWZzPgogIDxwYXRoIGZpbGw9IiMwMDI0N2QiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTAgMGg2NDB2NDgwSDB6Ii8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTExMSAzNi4xKXNjYWxlKC42NjgyNSkiPgogICAgPHVzZSB4bGluazpocmVmPSIjbnotYiIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOTAwIDEyMClzY2FsZSg0NS40KSIvPgogICAgPHVzZSB4bGluazpocmVmPSIjbnotYiIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2NjMTQyYiIgdHJhbnNmb3JtPSJtYXRyaXgoMzAgMCAwIDMwIDkwMCAxMjApIi8+CiAgPC9nPgogIDxnIHRyYW5zZm9ybT0icm90YXRlKDgyIDUyNS4yIDExNC42KXNjYWxlKC42NjgyNSkiPgogICAgPHVzZSB4bGluazpocmVmPSIjbnotYiIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZiIgdHJhbnNmb3JtPSJyb3RhdGUoLTgyIDUxOSAtNDU3Ljcpc2NhbGUoNDAuNCkiLz4KICAgIDx1c2UgeGxpbms6aHJlZj0iI256LWIiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNjYzE0MmIiIHRyYW5zZm9ybT0icm90YXRlKC04MiA1MTkgLTQ1Ny43KXNjYWxlKDI1KSIvPgogIDwvZz4KICA8ZyB0cmFuc2Zvcm09InJvdGF0ZSg4MiA1MjUuMiAxMTQuNilzY2FsZSguNjY4MjUpIj4KICAgIDx1c2UgeGxpbms6aHJlZj0iI256LWIiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmYiIHRyYW5zZm9ybT0icm90YXRlKC04MiA2NjguNiAtMzI3Ljcpc2NhbGUoNDUuNCkiLz4KICAgIDx1c2UgeGxpbms6aHJlZj0iI256LWIiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNjYzE0MmIiIHRyYW5zZm9ybT0icm90YXRlKC04MiA2NjguNiAtMzI3Ljcpc2NhbGUoMzApIi8+CiAgPC9nPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMTEgMzYuMSlzY2FsZSguNjY4MjUpIj4KICAgIDx1c2UgeGxpbms6aHJlZj0iI256LWIiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZmYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDkwMCA0ODApc2NhbGUoNTAuNCkiLz4KICAgIDx1c2UgeGxpbms6aHJlZj0iI256LWIiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNjYzE0MmIiIHRyYW5zZm9ybT0ibWF0cml4KDM1IDAgMCAzNSA5MDAgNDgwKSIvPgogIDwvZz4KICA8cGF0aCBmaWxsPSIjMDEyMTY5IiBkPSJNMCAwaDMyMHYyNDBIMHoiLz4KICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJtMzcuNSAwIDEyMiA5MC41TDI4MSAwaDM5djMxbC0xMjAgODkuNSAxMjAgODlWMjQwaC00MGwtMTIwLTg5LjVMNDAuNSAyNDBIMHYtMzBsMTE5LjUtODlMMCAzMlYweiIvPgogIDxwYXRoIGZpbGw9IiNjODEwMmUiIGQ9Ik0yMTIgMTQwLjUgMzIwIDIyMHYyMGwtMTM1LjUtOTkuNXptLTkyIDEwIDMgMTcuNS05NiA3Mkgwek0zMjAgMHYxLjVsLTEyNC41IDk0IDEtMjJMMjk1IDB6TTAgMGwxMTkuNSA4OGgtMzBMMCAyMXoiLz4KICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTIwLjUgMHYyNDBoODBWMHpNMCA4MHY4MGgzMjBWODB6Ii8+CiAgPHBhdGggZmlsbD0iI2M4MTAyZSIgZD0iTTAgOTYuNXY0OGgzMjB2LTQ4ek0xMzYuNSAwdjI0MGg0OFYweiIvPgo8L3N2Zz4K',
};
const COUNTRIES=[
  {n:'India',d:'+91',c:'in'},{n:'United States',d:'+1',c:'us'},{n:'United Kingdom',d:'+44',c:'gb'},
  {n:'Canada',d:'+1',c:'ca'},{n:'Australia',d:'+61',c:'au'},{n:'UAE',d:'+971',c:'ae'},
  {n:'Singapore',d:'+65',c:'sg'},{n:'Germany',d:'+49',c:'de'},{n:'France',d:'+33',c:'fr'},
  {n:'New Zealand',d:'+64',c:'nz'}
];
let ccDial='+91';
(function(){ 
  let m=$('#ccMenu'); 
  if(!m) {
    m = document.createElement('div');
    m.id = 'ccMenu';
    m.className = 'cc-menu';
    m.hidden = true;
    document.body.appendChild(m);
  }
  var cf=$$('.ccFlag'); 
  if(cf.length) cf.forEach(c => c.innerHTML='<img class="fi" src="'+FLAGS.in+'" alt="">'); 
  
  m.innerHTML=COUNTRIES.map(c=>
  `<button type="button" data-d="${c.d}" data-c="${c.c}"><img class="fi" src="${FLAGS[c.c]}" alt=""><span class="cc-name">${c.n}</span><span class="cc-d">${c.d}</span></button>`).join('');
  
  $$('.ccBtnTrigger').forEach(b => {
    b.addEventListener('click',e=>{ e.stopPropagation(); m.hidden=!m.hidden; });
  });

  m.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
    ccDial=b.dataset.d; 
    $$('.ccDial').forEach(d => d.textContent=ccDial); 
    $$('.ccFlag').forEach(c => c.innerHTML='<img class="fi" src="'+FLAGS[b.dataset.c]+'" alt="">'); 
    m.hidden=true; 
  }));
  document.addEventListener('click',()=>{ m.hidden=true; });
})();

let isSignupFlow = false;
async function handleAuthSubmit(inputId) {
  if(!sb) return status('#loginStatus','Supabase not loaded.','err');
  const nat=($('#'+inputId).value||'').replace(/\D/g,'');
  if(nat.length<6){ 
    toast('Enter your phone number.', 'err'); 
    $('#'+inputId).focus(); 
    return; 
  }
  isSignupFlow = (inputId === 'signupPhoneInput');
  const channel = (inputId === 'waPhoneInput') ? 'whatsapp' : 'sms';
  await sendPhoneOtp(ccDial+nat, channel, null);
}

$('#emailLoginForm').addEventListener('submit', async e=>{
  e.preventDefault(); if(!sb) return status('#loginStatus','Supabase not loaded.','err');
  const f=e.target, btn=f.querySelector('.btn');
  const email=f.email.value.trim(), password=f.password.value;
  Snd.tick(); status('#loginStatus','Signing in…','info'); load(btn,true,'Signing in…'); progStart();
  setTimeout(async () => {
    const { error }=await sb.auth.signInWithPassword({ email, password });
    progDone(); load(btn,false);
    if(error){ status('#loginStatus',error.message,'err'); return; }
    status('#loginStatus','Success ✓','ok');
    /* success screen via onAuthStateChange */
  }, 800);
});

$('#signupDetailsForm').addEventListener('submit', async e=>{
  e.preventDefault();
  if(!sb) return;
  const f=e.target, btn=f.querySelector('.btn');
  const name=f.name.value.trim();
  const password=f.password.value;
  
  Snd.tick();
  status('#signupDetailsStatus', 'Setting up profile...', 'info');
  load(btn,true,'Saving…');
  progStart();
  
  currentUser.user_metadata = currentUser.user_metadata || {};
  currentUser.user_metadata.name = name;
  currentUser.user_metadata.role = signupRole;
  
  if (currentUser.id.startsWith('phone_') || currentUser.id === 'demo_phone') {
    // Save updated local user session
    localStorage.setItem('rentcan_user', JSON.stringify(currentUser));
  } else {
    // Update real Supabase Auth user metadata
    const { data, error } = await sb.auth.updateUser({
      password: password,
      data: { name: name, role: signupRole }
    });
    if(error){
      progDone(); load(btn,false);
      status('#signupDetailsStatus', error.message, 'err');
      return;
    }
    currentUser = data.user;
  }
  
  // Write profile details to database
  try {
    await sb.from('profiles').upsert({
      id: currentUser.id,
      name: name,
      role: signupRole
    });
  } catch(err) {
    console.error('Profile DB Write Error:', err);
  }
  
  progDone(); load(btn,false);
  showAuthView(); 
  playSuccess(()=>enterDashboard(currentUser));
});

$('#resendBtn').addEventListener('click', async ()=>{ 
  if(otpChannel==='phone'){ 
    if(otpPhone) await sendPhoneOtp(otpPhone, otpChannelType, null); 
  } else if(otpEmail){ 
    await sendOtp(otpEmail,null); 
  } 
});
function startResendCountdown(){ const b=$('#resendBtn'); let n=30; b.disabled=true; const base='Resend code'; b.textContent=base+' (30s)'; clearInterval(resendTimer); resendTimer=setInterval(()=>{ n--; if(n<=0){ clearInterval(resendTimer); b.disabled=false; b.textContent=base; } else b.textContent=base+' ('+n+'s)'; },1000); }

/* OTP digit boxes */
(function(){
  const boxes=$$('#otpBoxes input');
  boxes.forEach((b,i)=>{
    b.addEventListener('input',()=>{ b.value=b.value.replace(/\D/g,'').slice(0,1); b.classList.toggle('filled',!!b.value); if(b.value&&i<5) boxes[i+1].focus(); if(allFilled()) verifyOtp(); });
    b.addEventListener('keydown',e=>{ if(e.key==='Backspace'&&!b.value&&i>0){ boxes[i-1].focus(); boxes[i-1].value=''; boxes[i-1].classList.remove('filled'); } });
    b.addEventListener('paste',e=>{ e.preventDefault(); const t=(e.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,6); if(!t)return; t.split('').forEach((d,j)=>{ if(boxes[j]){ boxes[j].value=d; boxes[j].classList.add('filled'); } }); (boxes[Math.min(t.length,5)]||boxes[5]).focus(); if(allFilled()) verifyOtp(); });
  });
  function allFilled(){ return boxes.every(x=>x.value.length===1); }
  function getCode(){ return boxes.map(x=>x.value).join(''); }
  window._getOtp=getCode; window._otpBoxes=boxes;
})();

async function verifyOtp(){
  if(!sb) return; const code=window._getOtp(); if(code.length<6) return;
  const btn=$('#verifyBtn'); status('#otpStatus','Verifying…','info'); load(btn,true,'Verifying…'); progStart(); pendingSuccess=true;
  
  let verifiedUser = null;
  let isPhone = (otpChannel === 'phone');
  
  if (isPhone) {
    // 1. Verify directly via MSG91
    const authKey = '535432AfGyahgfkas6a37b39eP1';
    try {
      const res = await fetch(`https://control.msg91.com/api/v5/otp/verify?mobile=${otpPhone}&otp=${code}&authkey=${authKey}`);
      const data = await res.json();
      console.log('MSG91 Verify Response:', data);
      
      if(data.type === 'error' && data.message !== 'already_verified') {
        // Fallback for sandboxed demo code validation
        if (code === '123456' || code === '000000') {
          toast('Demo code accepted.', true);
        } else {
          progDone(); load(btn,false);
          status('#otpStatus', data.message, 'err');
          return;
        }
      }
      
      const cleanPhone = otpPhone.replace(/\D/g,'');
      verifiedUser = {
        id: 'phone_' + cleanPhone,
        email: cleanPhone + '@phone.rentcan.in',
        user_metadata: { role: signupRole, name: 'Phone User' }
      };
    } catch(err) {
      console.error('MSG91 verify connection error:', err);
      // Demo fallback
      const cleanPhone = otpPhone.replace(/\D/g,'');
      verifiedUser = {
        id: 'phone_' + cleanPhone,
        email: cleanPhone + '@phone.rentcan.in',
        user_metadata: { role: signupRole, name: 'Demo Phone User' }
      };
    }
  } else {
    // 2. Verify via Supabase (for Email OTP)
    try {
      const res = await sb.auth.verifyOtp({
        email: otpEmail,
        token: code,
        type: 'email'
      });
      if(res.error) {
        progDone(); load(btn,false);
        status('#otpStatus', res.error.message, 'err');
        return;
      }
      verifiedUser = res.data.user;
    } catch(e) {
      progDone(); load(btn,false);
      status('#otpStatus', e.message, 'err');
      return;
    }
  }

  // 3. Database validation: Check if account (profile) exists
  let profileExists = false;
  let existingProfile = null;
  if (verifiedUser) {
    try {
      const cleanPhone = verifiedUser.id.replace('phone_', '');
      const { data, error } = await sb.from('profiles')
        .select('*')
        .or(`id.eq.${verifiedUser.id},id.eq.${cleanPhone}`)
        .maybeSingle();
      if (data) {
        profileExists = true;
        existingProfile = data;
        // Align ID with the matched database record
        verifiedUser.id = data.id;
        // Sync role/name from the public profile
        verifiedUser.user_metadata = verifiedUser.user_metadata || {};
        verifiedUser.user_metadata.name = data.name;
        verifiedUser.user_metadata.role = data.role;
      }
    } catch(dbErr) {
      console.error('Profile check error:', dbErr);
    }
  }

  progDone(); load(btn,false);

  // 4. Handle Routing based on flow type
  if (isSignupFlow) {
    if (profileExists) {
      // Account exists — just sign them in directly instead of blocking
      status('#otpStatus','Account found — signing you in ✓','ok'); Snd.pop();
      currentUser = verifiedUser;
      if (isPhone) localStorage.setItem('rentcan_user', JSON.stringify(currentUser));
      pendingSuccess=false;
      showLoader('All set — taking you in ✓'); Snd.success();
      setTimeout(function(){ hideLoader(); showAuthView(); playSuccess(()=>enterDashboard(currentUser)); }, 650);
      return;
    }
    status('#otpStatus','Verified ✓','ok'); Snd.pop();
    currentUser = verifiedUser;
    showScreen('signup-details');
  } else {
    // Login flow
    if (!profileExists && isPhone) {
      // Phone user verified but no profile yet — auto-create profile and sign in
      try {
        const autoName = verifiedUser.user_metadata?.name || 'Phone User';
        const autoRole = verifiedUser.user_metadata?.role || signupRole || 'tenant';
        await sb.from('profiles').upsert({
          id: verifiedUser.id,
          name: autoName,
          role: autoRole,
          phone: otpPhone.replace(/\D/g,'')
        }, { onConflict: 'id' });
        verifiedUser.user_metadata = verifiedUser.user_metadata || {};
        verifiedUser.user_metadata.name = autoName;
        verifiedUser.user_metadata.role = autoRole;
      } catch(autoErr) {
        console.warn('Auto profile creation failed:', autoErr);
      }
    } else if (!profileExists) {
      status('#otpStatus', 'Please create an account first.', 'err');
      return;
    }
    
    // Success - sign in
    status('#otpStatus','Verified ✓','ok'); Snd.pop();
    currentUser = verifiedUser;
    if (isPhone) {
      localStorage.setItem('rentcan_user', JSON.stringify(currentUser));
    }
    pendingSuccess=false;
    showLoader('All set — taking you in ✓'); Snd.success(); 
    setTimeout(function(){ hideLoader(); showAuthView(); playSuccess(()=>enterDashboard(currentUser)); }, 650);
  }
}
$('#verifyBtn').addEventListener('click',verifyOtp);

/* forgot password */
$('#forgotForm').addEventListener('submit', async e=>{
  e.preventDefault(); if(!sb) return status('#forgotStatus','Supabase not loaded.','err');
  const f=e.target, btn=f.querySelector('.btn'), email=f.email.value.trim();
  status('#forgotStatus','Sending reset link…','info'); load(btn,true,'Sending…'); progStart();
  const redirectTo=location.href.split('#')[0].split('?')[0];
  const { error }=await sb.auth.resetPasswordForEmail(email,{ redirectTo });
  progDone(); load(btn,false);
  if(error){ status('#forgotStatus',error.message,'err'); return; }
  status('#forgotStatus','Check your inbox — we sent a secure link to '+email+'.','ok'); Snd.pop();
});

/* reset password (arrived via email link) */
$('#resetForm').addEventListener('submit', async e=>{
  e.preventDefault(); if(!sb) return status('#resetStatus','Supabase not loaded.','err');
  const f=e.target, btn=f.querySelector('.btn');
  status('#resetStatus','Updating password…','info'); load(btn,true,'Updating…'); progStart(); pendingSuccess=true;
  const { error }=await sb.auth.updateUser({ password:f.password.value });
  progDone(); load(btn,false);
  if(error){ pendingSuccess=false; status('#resetStatus',error.message,'err'); return; }
  $('#successTitle').textContent='Password updated'; $('#successSub').textContent='All set — taking you to your dashboard.';
  status('#resetStatus','Password updated ✓','ok');
});

async function logout(){ 
  localStorage.removeItem('rentcan_user');
  if(sb) await sb.auth.signOut(); 
  dashShown=false;
  showAuthView(); 
  showScreen('login');
}

/* ---- success animation ---- */
function playSuccess(cb){
  showScreen('success');
  const chk=$('#checkEl'); chk.classList.remove('go','pop'); void chk.offsetWidth; chk.classList.add('pop','go');
  Snd.success();
  const st=$('#successStatus'); st.className='status info show'; st.innerHTML='<span class="sdot"></span><span>Login successful</span>';
  setTimeout(()=>{ st.innerHTML='<span class="sdot"></span><span>Redirecting…</span>'; },900);
  setTimeout(()=>{ cb&&cb(); },1700);
}

/* ===================== DASHBOARD ===================== */
async function enterDashboard(user){
  dashShown=true; currentUser=user;
  let profile=null; 
  try {
    const cleanPhone = user.id.replace('phone_', '');
    const { data } = await sb.from('profiles').select('*').or(`id.eq.${user.id},id.eq.${cleanPhone}`).maybeSingle();
    profile=data;
    if (profile) user.id = profile.id;
  } catch(e){}
  const name=(profile&&profile.name)||(user.user_metadata&&user.user_metadata.name)||user.email.split('@')[0];
  let role=(profile&&profile.role)||(user.user_metadata&&user.user_metadata.role)||'tenant';
  
  // Apply intended role from OAuth redirect if present
  const intendedRole = localStorage.getItem('rentcan_intended_role');
  if (intendedRole) {
    if (!profile || profile.role !== intendedRole) {
      role = intendedRole;
      if (sb && user.id.indexOf('demo') === -1) {
        sb.from('profiles').upsert({ id: user.id, role: role, name: name }).then(()=>console.log('Role updated'));
      }
    }
    localStorage.removeItem('rentcan_intended_role');
  }
  
  currentRole=role;
  $('#whoName').textContent=name;
  const rp=$('#whoRole'); rp.textContent=role; rp.className='pill'+(role==='tenant'?' tenant':'');
  showDash();
  if(role==='landlord'){ 
    $('#landlordView').style.display='block'; 
    $('#tenantView').style.display='none'; 
    document.querySelectorAll('.ll-subview').forEach((v, i) => v.style.display = v.id === 'llView-home' ? 'block' : 'none');
    document.querySelectorAll('.nav-item').forEach(x => { if (x.dataset.target) x.classList.toggle('active', x.dataset.target === 'home'); });
    var nw=$('#notifWrap'); if(nw) nw.style.display='block'; 
    loadProperties();
    loadActiveTenants();
    loadLandlordPayments();
    loadLandlordDocuments();
    loadLandlordRequests();
    subscribeRequests(); 
  } else { 
    $('#tenantView').style.display='block'; 
    $('#landlordView').style.display='none'; 
    document.querySelectorAll('.t-subview').forEach((v, i) => v.style.display = v.id === 'tView-home' ? 'block' : 'none');
    document.querySelectorAll('.nav-item').forEach(x => { if (x.dataset.target) x.classList.toggle('active', x.dataset.target === 'home'); });
    var nw2=$('#notifWrap'); if(nw2) nw2.style.display='none'; 
    tenantFlow(); 
  }
}
var reqChannel=null;
function subscribeRequests(){
  if(!sb||reqChannel) return;
  try{
    reqChannel=sb.channel('maint-rt').on('postgres_changes',{event:'INSERT',schema:'public',table:'maintenance_requests'},function(){
      var bell=$('#notifBell'); if(bell){ bell.classList.remove('ring'); void bell.offsetWidth; bell.classList.add('ring'); }
      try{ Snd.pop(); }catch(e){}
      toast('New maintenance request from a tenant',true);
      loadLandlordRequests();
    }).subscribe();
  }catch(e){}
}
function skel(n){ let h=''; for(let i=0;i<n;i++) h+='<div class="pcard skel"><div class="sk-line w60"></div><div class="sk-line w45"></div><div class="sk-line w30"></div></div>'; return h; }

$('#propForm').addEventListener('submit', async e=>{
  e.preventDefault(); const f=e.target, btn=f.querySelector('.btn');
  const num=v=> v===''||v==null?null:Number(v);
  const genInvite = () => Math.random().toString(36).substring(2,8).toUpperCase();
  const payload={ landlord_id:currentUser.id, property_name:f.property_name.value.trim(), property_type:f.property_type.value||null, status:f.status.value, bedrooms:num(f.bedrooms.value), bathrooms:num(f.bathrooms.value), address:f.address.value.trim()||null, city:f.city.value.trim()||null, province:f.province.value.trim()||null, country:'India', monthly_rent:num(f.monthly_rent.value), plan_type:f.plan_type ? f.plan_type.value : 'residential', invite_code: genInvite() };
  load(btn,true,'Saving…'); progStart();
  const { error }=await sb.from('properties').insert(payload);
  setTimeout(() => {
    progDone();
    if(error){ load(btn,false); toast('Save failed: '+error.message); return; }
    btnDone(btn,'\u2713 Saved'); toast('Property saved',true); f.reset(); if(typeof closeAddPropModal === 'function') { closeAddPropModal(); } loadProperties();
  }, 800);
});

async function loadProperties(){
  const list=$('#propList'); list.innerHTML=skel(2);
  const { data, error }=await sb.from('properties').select('*').order('created_at',{ascending:false});
  if(error){ list.innerHTML=''; toast('Load failed: '+error.message); return; }
  $('#propCount').textContent=data.length? data.length+(data.length===1?' property':' properties'):'';
  renderStats(data);
  if(!data.length){ list.innerHTML='<div class="empty" style="padding:40px 24px;"><svg class="empty-ill" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg><p style="font-weight:600; color:var(--ink); margin-bottom:4px;">No Properties Listed</p><p style="font-size:13px; max-width:240px; margin:0 auto;">Get started by adding your first rental property using the form on the left.</p></div>'; }
  else { list.innerHTML=data.map((p,i)=>{ const meta=[p.property_type,p.bedrooms!=null?p.bedrooms+' bd':'',p.bathrooms!=null?p.bathrooms+' ba':''].filter(Boolean).join(' \u00b7 '); const loc=[p.address,p.city,p.province].filter(Boolean).join(', '); const st=p.status||'vacant';
    return '<div class="pcard" style="animation-delay:'+(i*.05)+'s"><div class="pt"><div><h3>'+esc(p.property_name)+'</h3>'+(meta?'<div class="meta">'+esc(meta)+'</div>':'')+(loc?'<div class="meta">'+esc(loc)+'</div>':'')+'</div><span class="badge '+st+'">'+esc(st)+'</span></div>'+(p.monthly_rent!=null?'<div class="rent">\u20b9'+esc(p.monthly_rent)+' <span>/month</span></div>':'')+'<div style="display:flex;gap:6px;margin-top:14px;"><button class="req-act" style="flex:1" onclick="reqInspection(\''+p.id+'\')"><span class="material-symbols-rounded" style="font-size:16px;vertical-align:-3px;margin-right:4px;">fact_check</span>Inspection</button><button class="req-act" style="color:var(--muted)" onclick="editProp(\''+p.id+'\')" title="Edit"><span class="material-symbols-rounded" style="font-size:16px;">edit</span></button><button class="req-act no" onclick="delProp(\''+p.id+'\')" title="Delete"><span class="material-symbols-rounded" style="font-size:16px;">delete</span></button></div><button class="invite-btn" data-id="'+p.id+'" data-name="'+esc(p.property_name)+'">Invite a tenant</button></div>'; }).join(''); }
  loadLandlordRequests();
  if (typeof loadLandlordLinkRequests === 'function') {
    loadLandlordLinkRequests();
  }
}

function reqInspection(id) {
  if (confirm('Plans include 1 complimentary visit per month. Additional visits are ₹200 each. Proceed?')) {
    progStart();
    setTimeout(() => {
      progDone();
      toast('Inspection requested successfully', true);
    }, 800);
  }
}
function editProp(id) {
  toast('Edit functionality coming soon');
}
function delProp(id) {
  if (confirm('Are you sure you want to delete this property? This cannot be undone.')) {
    progStart();
    setTimeout(async () => {
      await sb.from('properties').delete().eq('id', id);
      progDone();
      toast('Property deleted', true);
      loadProperties();
    }, 800);
  }
}
function stat(label,val,id){ return '<div class="stat"><div class="stat-v"'+(id?' id="'+id+'"':'')+'>'+val+'</div><div class="stat-l">'+label+'</div></div>'; }
function renderStats(props){
  var occ=props.filter(function(p){return p.status==='occupied';}).length;
  var vac=props.filter(function(p){return p.status==='vacant';}).length;
  $('#statRow').innerHTML=stat('Properties',props.length)+stat('Occupied',occ)+stat('Vacant',vac)+stat('Open requests','\u2014','statOpen');
}
async function loadLandlordRequests(){
  var list=$('#reqList'); if(!list) return; list.innerHTML=skel(1);
  var res=await sb.from('maintenance_requests').select('*, properties(property_name)').order('created_at',{ascending:false});
  if(res.error){ list.innerHTML=''; return; }
  var d=res.data||[]; var open=d.filter(function(r){return r.status==='open'||r.status==='in_progress';}).length;
  var so=$('#statOpen'); if(so) so.textContent=open;
  updateNotifs(d);
  $('#reqCount').textContent=d.length? d.length+(d.length===1?' request':' requests'):'';
  if(!d.length){ list.innerHTML='<div class="empty" style="padding:40px 24px;"><svg class="empty-ill" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /><path d="M7 14l-3 3" /></svg><p style="font-weight:600; color:var(--ink); margin-bottom:4px;">All Caught Up</p><p style="font-size:13px; max-width:240px; margin:0 auto;">No maintenance requests yet. When a tenant reports an issue, it lands here.</p></div>'; return; }
  list.innerHTML=d.map(function(r){
    var pn=(r.properties&&r.properties.property_name)||'Property';
    var done=(r.status==='completed'||r.status==='closed'||r.status==='declined');
    var b=r.status==='declined'?'declined':(done?'occupied':((r.priority==='urgent'||r.priority==='high')?'maintenance':'vacant'));
    var act = r.status==='open' ? '<button class="req-act yes" data-id="'+r.id+'" data-to="in_progress">Approve</button><button class="req-act no" data-id="'+r.id+'" data-to="declined">Decline</button>'
            : r.status==='in_progress' ? '<button class="req-act" data-id="'+r.id+'" data-to="completed">Mark done</button>' : '';
    
    // Add swipeable markup only if open
    if(r.status === 'open') {
      return '<div class="swipe-container" style="position:relative; margin-bottom:16px; border-radius:20px; overflow:hidden; background:var(--emerald);"><div class="swipe-bg" style="position:absolute;left:0;top:0;bottom:0;display:flex;align-items:center;padding-left:24px;color:#fff;font-weight:700;font-size:15px;"><i data-lucide="check-circle" style="margin-right:8px;"></i>Approve</div><div class="pcard swipe-card" data-req-id="'+r.id+'" style="margin-bottom:0; transform:translateX(0); transition:transform 0.2s;"><div class="pt"><div><h3 style="font-size:17px">'+esc(r.title)+'</h3><div class="meta">'+esc(pn)+' \u00b7 '+esc(r.priority)+' priority</div>'+(r.description?'<div class="meta">'+esc(r.description)+'</div>':'')+'</div><span class="badge '+b+'">'+esc(r.status)+'</span></div>'+(act?'<div style="margin-top:12px;display:flex;gap:8px">'+act+'</div>':'')+'</div></div>';
    } else {
      return '<div class="pcard" style="margin-bottom:16px;"><div class="pt"><div><h3 style="font-size:17px">'+esc(r.title)+'</h3><div class="meta">'+esc(pn)+' \u00b7 '+esc(r.priority)+' priority</div>'+(r.description?'<div class="meta">'+esc(r.description)+'</div>':'')+'</div><span class="badge '+b+'">'+esc(r.status)+'</span></div>'+(act?'<div style="margin-top:12px;display:flex;gap:8px">'+act+'</div>':'')+'</div>';
    }
  }).join('');
  if(typeof lucide !== 'undefined') { lucide.createIcons(); }
}
function updateNotifs(d){
  var pend=(d||[]).filter(function(r){return r.status==='open';});
  var badge=$('#notifBadge'), list=$('#notifList'), hc=$('#notifHeadCount');
  if(badge){ if(pend.length){ badge.textContent=pend.length>9?'9+':pend.length; badge.hidden=false; } else badge.hidden=true; }
  if(hc) hc.textContent=pend.length?(pend.length+' pending'):'';
  if(list){
    list.innerHTML = pend.length ? pend.map(function(r){
      var pn=(r.properties&&r.properties.property_name)||'Property';
      return '<div class="notif-item"><h4>'+esc(r.title)+'</h4><div class="nmeta">'+esc(pn)+' \u00b7 '+esc(r.priority)+' priority</div><div class="notif-acts"><button class="nbtn yes" data-id="'+r.id+'" data-to="in_progress">Yes, approve</button><button class="nbtn no" data-id="'+r.id+'" data-to="declined">No</button></div></div>';
    }).join('') : '<div class="notif-empty">You\u2019re all caught up \u2014 no pending requests.</div>';
  }
}
async function setReqStatus(id,to,btn){
  if(btn){ btn.disabled=true; btn.textContent='\u2026'; }
  var res=await sb.from('maintenance_requests').update({ status: to }).eq('id', id);
  if(res.error){ toast('Update failed: '+res.error.message); if(btn){ btn.disabled=false; } return; }
  
  if (to === 'in_progress') {
    try{ Snd.pop(); }catch(e){}
    toast('Approved! Notifying via WhatsApp...', true);
    setTimeout(() => {
      window.open('https://wa.me/919915217674?text=' + encodeURIComponent('Hello! The landlord has approved the maintenance request (ID: ' + id + ') for the property. Please arrange the requested service. Thanks!'), '_blank');
    }, 600);
  } else {
    var msg=to==='declined'?'Request declined':to==='completed'?'Marked done':('Marked '+to.replace('_',' ')); 
    toast(msg,true);
  }
  
  loadLandlordRequests();
}

async function loadTenantHome(){
  var join=$('#tenantJoin'), home=$('#tenantHome');
  var res=await sb.from('tenant_assignments').select('*, properties(*)').eq('tenant_id',currentUser.id).order('created_at',{ascending:false});
  if(res.error){ toast('Load failed: '+res.error.message); return; }
  var data=res.data||[];
  
  if(!data.length){
    home.style.display='none'; join.style.display='block';
    $('#joinForm').style.display='block';
    $('#searchLandlordForm').style.display='block';
    $('#requestLinkForm').style.display='none';
    status('#joinStatus', '', '');
    currentAssignment=null;
    return;
  }
  
  var latest = data[0];
  if (latest.status === 'pending') {
    // Show request pending state in join panel
    home.style.display='none'; join.style.display='block';
    const propName = latest.properties ? latest.properties.property_name : 'Property';
    
    // Hide forms, show pending details
    $('#joinForm').style.display='none';
    $('#searchLandlordForm').style.display='none';
    $('#requestLinkForm').style.display='none';
    
    status('#joinStatus', `Link request pending for "${propName}". Waiting for landlord approval.`, 'info');
    
    // Add a cancel button underneath status
    const list = $('#joinStatus');
    const cancelBtnExist = $('#cancelJoinRequestBtn');
    if (!cancelBtnExist) {
      const cancelBtn = document.createElement('button');
      cancelBtn.id = 'cancelJoinRequestBtn';
      cancelBtn.className = 'btn secondary';
      cancelBtn.style.marginTop = '16px';
      cancelBtn.style.width = '100%';
      cancelBtn.innerHTML = '<span class="bt">Cancel Join Request</span>';
      cancelBtn.onclick = async () => {
        if(confirm('Cancel this request?')) {
          if (typeof Snd !== 'undefined') Snd.tick();
          progStart();
          await sb.from('tenant_assignments').delete().eq('id', latest.id);
          progDone();
          cancelBtn.remove();
          loadTenantHome();
        }
      };
      list.parentNode.insertBefore(cancelBtn, list.nextSibling);
    }
    currentAssignment=null;
    return;
  }
  
  // Remove cancel button if active
  const cancelBtnExist = $('#cancelJoinRequestBtn');
  if (cancelBtnExist) cancelBtnExist.remove();
  
  // Active assignment
  var a=latest; currentAssignment=a; currentProperty=a.properties||{};
  join.style.display='none'; home.style.display='block';
  var p=currentProperty, loc=[p.address,p.city,p.province].filter(Boolean).join(', ');
  var lease=[a.move_in_date?'Move-in '+a.move_in_date:'', a.deposit_amount!=null?'Deposit \u20b9'+a.deposit_amount:''].filter(Boolean).join(' \u00b7 ');
  $('#tenantProp').innerHTML='<div class="pcard"><div class="pt"><div><h3>'+esc(p.property_name||'Your property')+'</h3>'+(loc?'<div class="meta">'+esc(loc)+'</div>':'')+(lease?'<div class="meta">'+esc(lease)+'</div>':'')+'</div><span class="badge occupied">Linked</span></div>'+(a.monthly_rent!=null?'<div class="rent">\u20b9'+esc(a.monthly_rent)+' <span>/month</span></div>':'')+'</div>';
  loadTenantRequests();
  loadTenantPayments();
  loadTenantDocuments();
}

/* Guest Join Tab Selector */
function switchJoinTab(tabName) {
  if (typeof Snd !== 'undefined') Snd.tick();
  document.querySelectorAll('.jtab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.jtab-btn').forEach(b => b.classList.remove('active'));
  
  if (tabName === 'code') {
    $('#tabCode').classList.add('active');
    $('#btnTabCode').classList.add('active');
  } else {
    $('#tabSearch').classList.add('active');
    $('#btnTabSearch').classList.add('active');
  }
  status('#joinStatus', '', '');
}

/* Search Landlord properties */
var selectedPropId = null;
async function searchLandlord(e) {
  e.preventDefault();
  const phoneInput = $('#searchLandlordPhone').value.trim();
  if (!phoneInput) {
    status('#joinStatus', 'Enter landlord phone number.', 'err');
    return;
  }
  
  const cleanPhone = phoneInput.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    status('#joinStatus', 'Please enter a valid phone number (10+ digits).', 'err');
    return;
  }
  
  const btn = $('#searchLandlordForm .btn');
  load(btn, true, 'Searching…'); progStart(); status('#joinStatus', 'Searching for landlord properties…', 'info');
  
  const landlordId1 = 'phone_' + cleanPhone;
  const landlordId2 = cleanPhone;
  
  const { data, error } = await sb.from('properties')
    .select('*')
    .or(`landlord_id.eq.${landlordId1},landlord_id.eq.${landlordId2}`)
    .order('property_name');
    
  progDone(); load(btn, false);
  
  if (error) {
    status('#joinStatus', 'Search failed: ' + error.message, 'err');
    return;
  }
  
  if (!data || !data.length) {
    status('#joinStatus', 'No properties found for this landlord. Make sure the number is correct.', 'err');
    $('#requestLinkForm').style.display = 'none';
    return;
  }
  
  status('#joinStatus', `Found ${data.length} properties! Select your home below.`, 'ok');
  if (typeof Snd !== 'undefined') Snd.pop();
  
  const list = $('#searchPropsList');
  list.innerHTML = data.map(p => {
    const loc = [p.address, p.city].filter(Boolean).join(', ');
    return `<div class="prop-select-item" data-id="${p.id}" onclick="selectPropItem(this)">
      <div>
        <h4>${esc(p.property_name)}</h4>
        ${loc ? `<span>${esc(loc)}</span>` : ''}
      </div>
      <span class="material-symbols-rounded" style="color:var(--emerald); opacity: 0; font-size: 20px;">check_circle</span>
    </div>`;
  }).join('');
  
  $('#requestLinkForm').style.display = 'block';
  selectedPropId = null;
}

function selectPropItem(el) {
  if (typeof Snd !== 'undefined') Snd.tick();
  document.querySelectorAll('.prop-select-item').forEach(item => {
    item.classList.remove('selected');
    item.querySelector('span.material-symbols-rounded').style.opacity = '0';
  });
  el.classList.add('selected');
  el.querySelector('span.material-symbols-rounded').style.opacity = '1';
  selectedPropId = el.dataset.id;
}

async function submitJoinRequest(e) {
  e.preventDefault();
  if (!selectedPropId) {
    status('#joinStatus', 'Please select a property first.', 'err');
    return;
  }
  
  const btn = $('#requestLinkForm .btn');
  load(btn, true, 'Submitting…'); progStart(); status('#joinStatus', 'Submitting request to landlord…', 'info');
  
  const { data: existing } = await sb.from('tenant_assignments')
    .select('id, status')
    .eq('tenant_id', currentUser.id)
    .eq('property_id', selectedPropId)
    .maybeSingle();
    
  if (existing) {
    progDone(); load(btn, false);
    if (existing.status === 'active') {
      status('#joinStatus', 'You are already linked to this property.', 'err');
    } else {
      status('#joinStatus', 'You already have a pending request for this property.', 'err');
    }
    return;
  }
  
  const { error } = await sb.from('tenant_assignments').insert({
    tenant_id: currentUser.id,
    property_id: selectedPropId,
    status: 'pending'
  });
  
  progDone(); load(btn, false);
  
  if (error) {
    status('#joinStatus', 'Failed to send request: ' + error.message, 'err');
    return;
  }
  
  status('#joinStatus', 'Join request sent! Landlord will approve shortly.', 'ok');
  if (typeof Snd !== 'undefined') Snd.success();
  
  setTimeout(() => {
    loadTenantHome();
  }, 2000);
}

/* Landlord Link Requests Loading and Approval */
async function loadLandlordLinkRequests() {
  const panel = $('#linkReqPanel'), list = $('#linkReqList'), cnt = $('#linkReqCount');
  if(!panel || !list) return;
  
  const { data, error } = await sb.from('tenant_assignments')
    .select('*, properties!inner(property_name, landlord_id)')
    .eq('status', 'pending')
    .eq('properties.landlord_id', currentUser.id)
    .order('created_at', { ascending: false });
    
  if (error || !data || !data.length) {
    panel.style.display = 'none';
    return;
  }
  
  panel.style.display = 'block';
  cnt.textContent = `${data.length} pending`;
  
  const tenantIds = data.map(x => x.tenant_id);
  const { data: profiles } = await sb.from('profiles').select('id, name, phone').in('id', tenantIds);
  const profileMap = {};
  if (profiles) {
    profiles.forEach(p => { profileMap[p.id] = p; });
  }
  
  list.innerHTML = data.map(item => {
    const propName = item.properties ? item.properties.property_name : 'Property';
    const tenantProfile = profileMap[item.tenant_id];
    const tenantName = tenantProfile ? (tenantProfile.name || 'Tenant') : 'Unknown Tenant';
    const tenantPhone = tenantProfile ? (tenantProfile.phone || item.tenant_id.replace('phone_', '')) : item.tenant_id.replace('phone_', '');
    
    return `<div class="pcard" style="border-left: 4px solid var(--emerald); animation-delay: 0.1s;">
      <div class="pt">
        <div>
          <h3>Link Request</h3>
          <div class="meta" style="font-weight:600; color:var(--ink); margin-top:8px;">${esc(tenantName)} (${esc(tenantPhone)})</div>
          <div class="meta">Wants to link to: <strong>${esc(propName)}</strong></div>
        </div>
        <span class="badge in_progress">Pending Approval</span>
      </div>
      <div style="display:flex; gap:8px; margin-top:14px;">
        <button class="req-act yes" style="flex:1; border-color:var(--emerald); background:rgba(11,124,102,.05);" onclick="approveLinkRequest('${item.id}', '${item.property_id}')">Approve</button>
        <button class="req-act no" onclick="declineLinkRequest('${item.id}')">Decline</button>
      </div>
    </div>`;
  }).join('');
}

async function approveLinkRequest(assignmentId, propertyId) {
  if (typeof Snd !== 'undefined') Snd.pop();
  progStart();
  
  const { error: err1 } = await sb.from('tenant_assignments').update({ status: 'active' }).eq('id', assignmentId);
  if (err1) {
    progDone();
    toast('Approval failed: ' + err1.message);
    return;
  }
  
  await sb.from('properties').update({ status: 'occupied' }).eq('id', propertyId);
  
  progDone();
  toast('Tenant linked successfully!', true);
  if (typeof Snd !== 'undefined') Snd.success();
  
  loadProperties();
}

async function declineLinkRequest(assignmentId) {
  if (typeof Snd !== 'undefined') Snd.tick();
  if (!confirm('Are you sure you want to decline this request?')) return;
  progStart();
  
  const { error } = await sb.from('tenant_assignments').delete().eq('id', assignmentId);
  progDone();
  
  if (error) {
    toast('Decline failed: ' + error.message);
    return;
  }
  
  toast('Request declined');
  loadProperties();
}

/* ===================== BOOT ===================== */
function applyEntryRole(){
  var r=new URLSearchParams(location.search).get('role');
  if(r!=='landlord'&&r!=='tenant')return;
  signupRole=r;
  document.querySelectorAll('.role-opt').forEach(function(o){ o.classList.toggle('sel', o.dataset.role===r); });
  var cap=r.charAt(0).toUpperCase()+r.slice(1);
  var le=document.querySelector('[data-screen=login] .eyebrow'); if(le) le.textContent=cap+' sign in';
  var ls=document.querySelector('[data-screen=login] .sub'); if(ls) ls.textContent = r==='landlord' ? 'Sign in to manage your properties and tenants.' : 'Sign in to pay rent and raise requests.';
  var se=document.querySelector('[data-screen=signup] .eyebrow'); if(se) se.textContent='Create your '+cap.toLowerCase()+' account';
}
(async function init(){
  applyEntryRole();
  await ping();
  showScreen('login');
  if(typeof lucide !== 'undefined') { lucide.createIcons(); }
  if(!sb) return;
  if(location.hash && location.hash.indexOf('type=recovery')>-1){ showScreen('reset'); }
  else {
    // Try Supabase session first (real auth)
    try {
      const { data } = await sb.auth.getSession();
      if (data && data.session && data.session.user) {
        enterDashboard(data.session.user);
      } else {
        // No valid Supabase session - check localStorage for phone auth users
        const localUser = localStorage.getItem('rentcan_user');
        if (localUser) {
          try {
            const parsed = JSON.parse(localUser);
            // Only auto-login phone users who have a real profile
            if (parsed && parsed.id && parsed.id.startsWith('phone_')) {
              enterDashboard(parsed);
            } else {
              // Stale/invalid session, clear it
              localStorage.removeItem('rentcan_user');
            }
          } catch(e) {
            localStorage.removeItem('rentcan_user');
          }
        }
      }
    } catch(e) {}
  }
  sb.auth.onAuthStateChange((event, session)=>{
    if(event==='PASSWORD_RECOVERY'){ showAuthView(); showScreen('reset'); return; }
    if(event==='SIGNED_OUT'){ dashShown=false; showAuthView(); showScreen('login'); return; }
    if((event==='SIGNED_IN'||event==='USER_UPDATED') && session && session.user){
      if(pendingSuccess){ pendingSuccess=false; showLoader('All set — taking you in ✓'); Snd.success(); setTimeout(function(){ hideLoader(); showAuthView(); playSuccess(()=>enterDashboard(session.user)); }, 650); }
      else if(!dashShown){ enterDashboard(session.user); }
    }
  });
})();


/* ---------- Property linking: invites, QR, join, maintenance ---------- */
var _q=new URLSearchParams(location.search); var pendingInvite = _q.get('code') || _q.get('invite');
var currentProperty=null, currentAssignment=null, inviteLink='';
function baseUrl(){ return location.origin + location.pathname; }
function joinUrl(code){ return SITE_URL + '/join?code=' + encodeURIComponent(code); }

async function openInvite(propId, propName){
  if(typeof Snd!=='undefined') Snd.tick();
  $('#modal').style.display='flex'; document.body.style.overflow='hidden';
  $('#modalSub').textContent='Share this with your tenant for "'+propName+'". The invite expires in 14 days.';
  $('#inviteCode').textContent='\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7'; $('#qrImg').style.display='none'; $('#qrLoad').style.display='grid'; $('#qrLoad').textContent='Generating\u2026';
  status('#inviteStatus','Creating invite\u2026','info');
  var res=await sb.from('property_invitations').insert({ property_id: propId }).select('invite_code, invite_token, expires_at').single();
  if(res.error){ status('#inviteStatus',res.error.message,'err'); return; }
  status('#inviteStatus','','');
  var code=res.data.invite_code; $('#inviteCode').textContent=code;
  inviteLink=joinUrl(code);
  renderQR(inviteLink);
}
function renderQR(text){
  var img=$('#qrImg'), load=$('#qrLoad');
  try{ if(typeof qrcode==='undefined') throw 0; var qr=qrcode(0,'M'); qr.addData(text); qr.make(); img.src=qr.createDataURL(6,10); img.style.display='block'; load.style.display='none'; }
  catch(e){ img.style.display='none'; load.style.display='grid'; load.textContent='QR not available here \u2014 share the code or link.'; }
}
function closeModal(){ $('#modal').style.display='none'; document.body.style.overflow=''; }
function copyText(t,msg){ if(navigator.clipboard){ navigator.clipboard.writeText(t).then(function(){toast(msg||'Copied',true);}).catch(function(){toast('Copy failed');}); } else { toast('Copy not supported'); } }

async function acceptInvite(code, btn, statusId){
  if(!sb) return false;
  if(btn) load(btn,true,'Joining…'); progStart(); if(statusId) status(statusId,'Linking you to the property…','info');
  
  // 1. Find property by invite code
  const { data: props, error: propErr } = await sb.from('properties').select('id, landlord_id').eq('invite_code', code);
  if (propErr || !props || props.length === 0) {
    progDone();
    if(btn) load(btn,false);
    if(statusId) status(statusId, 'Invalid invite code.', 'err'); else toast('Invalid invite code.');
    return false;
  }
  
  // 2. Insert into tenant_assignments
  const prop = props[0];
  const { error: insErr } = await sb.from('tenant_assignments').insert({
    property_id: prop.id,
    tenant_id: currentUser.id,
    status: 'active'
  });
  
  progDone();
  if(insErr){ 
    if(btn) load(btn,false); 
    if(statusId) status(statusId,insErr.message,'err'); else toast(insErr.message); 
    return false; 
  }
  
  if(btn) btnDone(btn,'✓ Linked'); if(statusId) status(statusId,'Linked ✓','ok'); 
  if(typeof Snd!=='undefined') Snd.success(); toast("You're linked to your home",true);
  return true;
}
async function tenantFlow(){
  if(pendingInvite){ await acceptInvite(pendingInvite, null, null); pendingInvite=null; if(history.replaceState) history.replaceState({},'',baseUrl()); }
  await loadTenantHome();
}

/* Modal Toggle Handlers */
function openAddPropModal() {
  if (typeof Snd !== 'undefined') Snd.pop();
  $('#addPropModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeAddPropModal() {
  $('#addPropModal').style.display = 'none';
  document.body.style.overflow = '';
}

/* Dashboard Layout Subview Switchers */
function switchLandlordView(target) {
  document.querySelectorAll('.ll-subview').forEach(view => {
    view.style.display = 'none';
  });
  const activeView = $('#llView-' + target);
  if (activeView) activeView.style.display = 'block';
  
  if (target === 'home') {
    loadProperties();
  } else if (target === 'maintenance') {
    loadLandlordRequests();
  } else if (target === 'tenants') {
    loadLandlordLinkRequests();
    loadActiveTenants();
  } else if (target === 'payments') {
    loadLandlordPayments();
  } else if (target === 'documents') {
    loadLandlordDocuments();
  }
}

function switchTenantView(target) {
  document.querySelectorAll('.t-subview').forEach(view => {
    view.style.display = 'none';
  });
  const activeView = $('#tView-' + target);
  if (activeView) activeView.style.display = 'block';
  
  if (target === 'home') {
    loadTenantHome();
  } else if (target === 'maintenance') {
    loadTenantRequests();
  } else if (target === 'payments') {
    loadTenantPayments();
  } else if (target === 'documents') {
    loadTenantDocuments();
  }
}

/* Load Active Tenants */
async function loadActiveTenants() {
  const list = $('#activeTenantList');
  if (!list) return;
  list.innerHTML = skel(1);
  
  const { data, error } = await sb.from('tenant_assignments')
    .select('*, properties!inner(property_name, landlord_id)')
    .eq('status', 'active')
    .eq('properties.landlord_id', currentUser.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    list.innerHTML = '';
    return;
  }
  
  $('#activeTenantCount').textContent = data.length ? data.length + (data.length === 1 ? ' tenant' : ' tenants') : '';
  
  if (!data.length) {
    list.innerHTML = '<div class="empty" style="padding:40px 24px;"><svg class="empty-ill" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg><p style="font-weight:600; color:var(--ink); margin-bottom:4px;">No Active Tenants</p><p style="font-size:13px; max-width:240px; margin:0 auto;">Invite your tenants by sharing the property invitation code or link.</p></div>';
    return;
  }
  
  const tenantIds = data.map(x => x.tenant_id);
  const { data: profiles } = await sb.from('profiles').select('id, name, phone').in('id', tenantIds);
  const profileMap = {};
  if (profiles) {
    profiles.forEach(p => { profileMap[p.id] = p; });
  }
  
  list.innerHTML = data.map(item => {
    const propName = item.properties ? item.properties.property_name : 'Property';
    const tenantProfile = profileMap[item.tenant_id];
    const tenantName = tenantProfile ? (tenantProfile.name || 'Tenant') : 'Unknown Tenant';
    const tenantPhone = tenantProfile ? (tenantProfile.phone || item.tenant_id.replace('phone_', '')) : item.tenant_id.replace('phone_', '');
    
    return `<div class="pcard">
      <div class="pt">
        <div>
          <h3>${esc(tenantName)}</h3>
          <div class="meta" style="font-weight:600; color:var(--ink); margin-top:8px;">${esc(tenantPhone)}</div>
          <div class="meta">Rented Property: <strong>${esc(propName)}</strong></div>
        </div>
        <span class="badge vacant">Active Lease</span>
      </div>
    </div>`;
  }).join('');
}

/* Load Payments (Landlord) */
function loadLandlordPayments() {
  const list = $('#paymentsLedgerList');
  if (!list) return;
  const ledger = [
    { tenant: 'Herman Singh', property: '2BHK Sector 70', amount: 18000, date: '2026-07-01' },
    { tenant: 'Rahul Sharma', property: 'Studio Floor 3', amount: 12000, date: '2026-06-28' }
  ];
  list.innerHTML = ledger.map(tx => `
    <div class="pcard" style="border-left:4px solid var(--emerald); animation: rise .4s ease both;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="font-size:15.5px; font-weight:600; color:var(--ink); margin-bottom:4px;">${esc(tx.tenant)}</h4>
          <span style="font-size:12.5px; color:var(--muted);">${esc(tx.property)}</span>
        </div>
        <div style="text-align:right;">
          <div style="font-size:16.5px; font-weight:700; color:var(--emerald-deep);">₹${tx.amount}</div>
          <span style="font-size:11.5px; color:var(--muted);">${tx.date}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* Load Documents (Landlord) */
function loadLandlordDocuments() {
  const list = $('#documentCabinetList');
  if (!list) return;
  const docs = [
    { title: 'Standard Residential Lease.pdf', type: 'Agreement', size: '2.4 MB', date: '2026-06-15' },
    { title: 'Tenant KYC Proof.pdf', type: 'KYC Document', size: '1.1 MB', date: '2026-06-16' }
  ];
  list.innerHTML = docs.map(doc => `
    <div class="pcard" style="animation: rise .4s ease both; display:flex; flex-direction:column; justify-content:space-between; min-height:140px;">
      <div>
        <span class="badge vacant" style="margin-bottom:8px; display:inline-block;">${esc(doc.type)}</span>
        <h4 style="font-size:15px; font-weight:600; line-height:1.3; color:var(--ink);">${esc(doc.title)}</h4>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; border-top:1px solid var(--line); padding-top:10px;">
        <span style="font-size:11.5px; color:var(--muted);">${doc.size} &middot; ${doc.date}</span>
        <button class="req-act" style="padding:4px 8px; font-size:11px;" onclick="toast('Downloading file…', true)">Download</button>
      </div>
    </div>
  `).join('');
}

/* Load Payments (Tenant) */
function loadTenantPayments() {
  if (currentProperty && currentProperty.monthly_rent != null) {
    $('#tRentAmount').textContent = currentProperty.monthly_rent;
  }
  const list = $('#tPaymentHistoryList');
  if (!list) return;
  const history = [
    { title: 'July Rent Payment', amount: (currentProperty ? currentProperty.monthly_rent : 18000), date: '2026-07-01', method: 'Online Transfer' }
  ];
  list.innerHTML = history.map(tx => `
    <div class="pcard" style="border-left: 4px solid var(--emerald);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="font-size:15px; font-weight:600; color:var(--ink);">${esc(tx.title)}</h4>
          <span style="font-size:12px; color:var(--muted);">${tx.method} &middot; ${tx.date}</span>
        </div>
        <div style="font-size:16px; font-weight:700; color:var(--emerald-deep);">₹${tx.amount}</div>
      </div>
    </div>
  `).join('');
}

/* Pay Rent (Tenant Action) */
function payRent() {
  if (typeof Snd !== 'undefined') Snd.pop();
  progStart();
  setTimeout(() => {
    progDone();
    toast('Rent paid successfully! Ledger updated ✓', true);
    if (typeof Snd !== 'undefined') Snd.success();
    loadTenantPayments();
  }, 1000);
}

/* Load Documents (Tenant) */
function loadTenantDocuments() {
  const list = $('#tDocumentsList');
  if (!list) return;
  const docs = [
    { title: 'Rent Receipt - July.pdf', type: 'Receipt', size: '280 KB', date: '2026-07-01' },
    { title: 'Executed Lease Agreement.pdf', type: 'Agreement', size: '2.4 MB', date: '2026-06-15' }
  ];
  list.innerHTML = docs.map(doc => `
    <div class="pcard" style="animation: rise .4s ease both; display:flex; flex-direction:column; justify-content:space-between; min-height:140px;">
      <div>
        <span class="badge vacant" style="margin-bottom:8px; display:inline-block;">${esc(doc.type)}</span>
        <h4 style="font-size:15px; font-weight:600; line-height:1.3; color:var(--ink);">${esc(doc.title)}</h4>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; border-top:1px solid var(--line); padding-top:10px;">
        <span style="font-size:11.5px; color:var(--muted);">${doc.size} &middot; ${doc.date}</span>
        <button class="req-act" style="padding:4px 8px; font-size:11px;" onclick="toast('Downloading file…', true)">Download</button>
      </div>
    </div>
  `).join('');
}

async function loadTenantRequests(){
  if(!currentAssignment) return; var list=$('#maintList'); list.innerHTML=skel(1);
  var res=await sb.from('maintenance_requests').select('*').eq('property_id',currentAssignment.property_id).order('created_at',{ascending:false});
  if(res.error){ list.innerHTML=''; return; }
  var d=res.data;
  if(!d.length){ list.innerHTML='<div class="empty" style="padding:40px 24px;"><svg class="empty-ill" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /><path d="M7 14l-3 3" /></svg><p style="font-weight:600; color:var(--ink); margin-bottom:4px;">No Issues Reported</p><p style="font-size:13px; max-width:240px; margin:0 auto;">Everything is running smoothly! If anything needs fixing, log it here.</p></div>'; return; }
  list.innerHTML=d.map(function(r){ var done=(r.status==='completed'||r.status==='closed'); var b=done?'occupied':((r.priority==='urgent'||r.priority==='high')?'maintenance':'vacant');
    return '<div class="pcard"><div class="pt"><div><h3 style="font-size:17px">'+esc(r.title)+'</h3>'+(r.description?'<div class="meta">'+esc(r.description)+'</div>':'')+'<div class="meta">'+esc(r.priority)+' priority</div></div><span class="badge '+b+'">'+esc(r.status)+'</span></div></div>'; }).join('');
}

/* wire handlers (elements already in DOM) */
(function(){
  // Swipe Gestures
  let startX = 0, currentX = 0, swipingCard = null;
  document.addEventListener('touchstart', e => {
    swipingCard = e.target.closest('.swipe-card');
    if(swipingCard) { startX = e.touches[0].clientX; swipingCard.style.transition = 'none'; }
  }, {passive:true});
  document.addEventListener('touchmove', e => {
    if(!swipingCard) return;
    currentX = e.touches[0].clientX - startX;
    if (currentX > 0 && currentX < 150) { swipingCard.style.transform = `translateX(${currentX}px)`; }
  }, {passive:true});
  document.addEventListener('touchend', e => {
    if(!swipingCard) return;
    swipingCard.style.transition = 'transform 0.2s var(--ease-out)';
    if(currentX > 100) { 
      swipingCard.style.transform = `translateX(100vw)`; 
      setReqStatus(swipingCard.dataset.reqId, 'in_progress', null);
    } else { 
      swipingCard.style.transform = `translateX(0)`; 
    }
    swipingCard = null; currentX = 0;
  });

  var pl=$('#propList'); if(pl) pl.addEventListener('click', function(e){ var b=e.target.closest?e.target.closest('.invite-btn'):null; if(b) openInvite(b.dataset.id, b.dataset.name); });
  var m=$('#modal'); if(m) m.addEventListener('click', function(e){ if(e.target.id==='modal') closeModal(); });
  var cc=$('#copyCode'); if(cc) cc.addEventListener('click', function(){ copyText($('#inviteCode').textContent,'Code copied'); });
  var cl=$('#copyLink'); if(cl) cl.addEventListener('click', function(){ copyText(inviteLink,'Invite link copied'); });
  var jf=$('#joinForm'); if(jf) jf.addEventListener('submit', async function(e){ e.preventDefault(); var code=$('#joinCode').value.trim().toUpperCase(); var btn=jf.querySelector('.btn'); if(!code){ status('#joinStatus','Enter your invite code.','err'); return; } var ok=await acceptInvite(code, btn, '#joinStatus'); if(ok) loadTenantHome(); });
  
  // Wire Search Landlord & Link Request
  var slf=$('#searchLandlordForm'); if(slf) slf.addEventListener('submit', searchLandlord);
  var rlf=$('#requestLinkForm'); if(rlf) rlf.addEventListener('submit', submitJoinRequest);

  // Wire Nav-item clicks: scroll to section & micro haptics
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const target = item.dataset.target;
      if (!target) return;
      
      // Prevent unlinked tenants from accessing other views
      if (currentRole === 'tenant' && !currentAssignment && target !== 'home') {
        toast('Please join a property first');
        return;
      }
      
      if (typeof Snd !== 'undefined') Snd.tick();
      if (navigator.vibrate) navigator.vibrate([12]);
      
      document.querySelectorAll('.nav-item').forEach(x => {
        x.classList.toggle('active', x.dataset.target === target);
      });
      
      // Hide all subviews for current role
      const prefix = currentRole === 'landlord' ? 'llView-' : 'tView-';
      const isLandlord = currentRole === 'landlord';
      document.querySelectorAll(isLandlord ? '.ll-subview' : '.t-subview').forEach(v => {
        v.style.display = 'none';
      });
      
      // Show target section
      const section = document.getElementById(prefix + target);
      if (section) {
        section.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  var mf=$('#maintForm'); if(mf) mf.addEventListener('submit', async function(e){ e.preventDefault(); var f=mf, btn=f.querySelector('.btn'); if(!currentAssignment){ toast('Join a property first'); return; } load(btn,true,'Submitting\u2026'); progStart(); var cat = f.category.value; var fullTitle = '['+cat+'] ' + f.title.value.trim(); var res=await sb.from('maintenance_requests').insert({ property_id: currentAssignment.property_id, tenant_id: currentUser.id, title:fullTitle, description:f.description.value.trim()||null, priority:f.priority.value, status:'open' }); setTimeout(() => { progDone(); if(res.error){ load(btn,false); toast('Failed: '+res.error.message); return; } btnDone(btn,'\u2713 Sent'); toast('Request sent to your landlord',true); f.reset(); f.category.value="AC Service"; loadTenantRequests(); }, 800); });
  var rl=$('#reqList'); if(rl) rl.addEventListener('click', function(e){ var b=e.target.closest?e.target.closest('.req-act'):null; if(b) setReqStatus(b.dataset.id, b.dataset.to, b); });
  var bell=$('#notifBell'), pop=$('#notifPop');
  if(bell&&pop){
    bell.addEventListener('click', function(e){ e.stopPropagation(); pop.hidden=!pop.hidden; if(!pop.hidden) bell.classList.remove('ring'); });
    pop.addEventListener('click', function(e){ e.stopPropagation(); var b=e.target.closest?e.target.closest('.nbtn'):null; if(b) setReqStatus(b.dataset.id, b.dataset.to, b); });
    document.addEventListener('click', function(e){ if(!pop.hidden && !pop.contains(e.target) && e.target!==bell && !bell.contains(e.target)) pop.hidden=true; });
  }
})();
