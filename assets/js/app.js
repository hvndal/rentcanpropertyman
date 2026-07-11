
  // sticky nav state
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  // mobile menu
  const toggle = document.getElementById('toggle');
  const links = document.getElementById('links');
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

  // reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  }, {threshold:0.15});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // fade the hero video in only once it can actually play (otherwise the
  // cinematic animated backdrop stays visible — no black box if the clip is missing)
  const v = document.getElementById('heroVideo');
  if (v){
    const show = () => v.classList.add('ready');
    v.addEventListener('canplay', show);
    v.addEventListener('loadeddata', show);
    // if it errors / 404s, do nothing — backdrop remains
  }


/* ---------- RentCan UI sound + toast (self-contained, Web Audio) ---------- */
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var muted = !!reduce;            // start muted if the visitor prefers reduced motion
  var ctx = null;
  function ac(){ if(!ctx){ try{ ctx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return ctx; }
  function tone(freq, dur, type, gain, at){
    var c = ac(); if(!c || muted) return;
    var t = at || c.currentTime;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain || 0.05, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur);
  }
  var Sound = {
    tick:  function(){ tone(430, 0.06, 'sine', 0.045); },
    pop:   function(){ tone(620, 0.09, 'triangle', 0.05); },
    chime: function(){ var c = ac(); if(!c||muted) return; var n = c.currentTime; tone(660,0.18,'sine',0.06,n); tone(990,0.32,'sine',0.05,n+0.1); }
  };
  window.RC = window.RC || {};
  RC.Sound = Sound;
  RC.toast = function(msg){
    var w = document.getElementById('rcToast'); if(!w) return;
    w.textContent = msg; w.classList.add('show');
    clearTimeout(w._t); w._t = setTimeout(function(){ w.classList.remove('show'); }, 4200);
  };
  // unlock audio on first interaction (browser autoplay policy)
  window.addEventListener('pointerdown', function(){ var c = ac(); if(c && c.state === 'suspended'){ c.resume(); } }, {once:true});
  // mute toggle
  var btn = document.getElementById('rcSound');
  function paint(){ if(!btn) return; btn.classList.toggle('muted', muted); btn.setAttribute('aria-pressed', String(!muted)); btn.title = muted ? 'Sound off' : 'Sound on'; }
  if(btn){ btn.addEventListener('click', function(){ muted = !muted; paint(); if(!muted){ var c=ac(); if(c&&c.resume) c.resume(); Sound.tick(); } }); paint(); }
  // subtle clicks on nav + buttons
  document.querySelectorAll('nav.links a, .nav-cta, .btn, .store').forEach(function(el){
    el.addEventListener('click', function(){ Sound.tick(); });
  });
})();

/* ---------- Android APK button (placeholder until you add your EAS link) ---------- */
(function(){
  var APK_URL = "";   /* <<< paste your EAS build .apk download link here (from expo.dev) to turn this into a real download */
  var btn = document.getElementById('apkBtn');
  if(!btn) return;
  btn.addEventListener('click', function(e){
    e.preventDefault();
    if(window.RC && RC.Sound) RC.Sound.chime();
    if(APK_URL){
      var a = document.createElement('a'); a.href = APK_URL; a.download = 'RentCan.apk';
      document.body.appendChild(a); a.click(); a.remove();
      RC.toast('Starting your RentCan APK download\u2026');
    } else {
      RC.toast('RentCan for Android lands at launch \u2014 first month free, no card to start.');
    }
  });
})();

/* ---------- Sign-in: Mock OTP (2-step) ---------- */
(function(){
  function roleOf(card){ return card.classList.contains('owner') ? 'landlord' : 'tenant'; }
  function markSignedIn(role){ RC.role = role || RC.role; document.querySelectorAll('.role-signin').forEach(function(c){ c.classList.add('signed'); }); }
  if(localStorage.getItem('rc_mock_user')){ RC.user = {id: 'mock'}; RC.role = localStorage.getItem('rc_mock_role') || 'tenant'; markSignedIn(RC.role); }
  document.querySelectorAll('.rc-otp').forEach(function(f){
    var card = f.closest('.rc-card'); var role = roleOf(card);
    var s1 = f.querySelector('.otp-step1'), s2 = f.querySelector('.otp-step2');
    var ident = f.querySelector('input[name=ident]'), code = f.querySelector('input[name=code]'), target = f.querySelector('.otp-target');
    f.querySelector('.send-code').addEventListener('click', function(){
      var email = ident.value.trim();
      if(!email || email.indexOf('@') < 0){ card.classList.add('err'); RC.toast('Enter your email to get a sign-in code.'); return; }
      card.classList.remove('err'); if(RC.Sound) RC.Sound.pop();
      var btn = this, old = btn.innerHTML; btn.disabled = true; btn.classList.add('loading'); btn.innerHTML = '<span class="rc-spinner"></span>Please wait\u2026';
      setTimeout(function(){
        btn.disabled = false; btn.classList.remove('loading'); btn.innerHTML = old;
        target.textContent = email; s1.hidden = true; s2.hidden = false; code.focus();
        RC.toast('Mock code sent to ' + email + ' (use any code).');
      }, 800);
    });
    f.querySelector('.otp-edit').addEventListener('click', function(){ s2.hidden = true; s1.hidden = false; ident.focus(); });
    f.addEventListener('submit', function(ev){
      ev.preventDefault();
      var email = ident.value.trim(), token = code.value.trim();
      if(token.length < 4){ card.classList.add('err'); RC.toast('Enter the code from your email.'); return; }
      card.classList.remove('err');
      var btn = f.querySelector('.verify-code'), old = btn.innerHTML; btn.disabled = true; btn.classList.add('loading'); btn.innerHTML = '<span class="rc-spinner"></span>Verifying\u2026';
      setTimeout(function(){
        btn.disabled = false; btn.classList.remove('loading'); btn.innerHTML = old;
        RC.user = {id: 'mock', email: email}; localStorage.setItem('rc_mock_user', '1'); localStorage.setItem('rc_mock_role', role); markSignedIn(role);
        if(RC.Sound) RC.Sound.chime();
        RC.toast('Signed in as ' + role + '. Welcome back!');
        f.reset(); s2.hidden = true; s1.hidden = false;
        if(role === 'landlord'){ var l = document.getElementById('list'); if(l) setTimeout(function(){ l.scrollIntoView({behavior:'smooth'}); }, 650); }
      }, 600);
    });
  });
})();

/* ---------- fade slot videos in once they can play (animated fallback stays if empty) ---------- */
(function(){
  document.querySelectorAll('.slot-vid').forEach(function(v){
    var show = function(){ v.classList.add('ready'); };
    v.addEventListener('canplay', show);
    v.addEventListener('loadeddata', show);
  });
})();

/* ---------- splash: hide once all videos with sources are ready (or after 4s max) ---------- */
(function(){
  var splash = document.getElementById('rcSplash');
  if(!splash) return;
  function dismiss(){ splash.classList.add('hidden'); }
  var vids = Array.from(document.querySelectorAll('video')).filter(function(v){
    return v.querySelector('source[src]') || v.src;
  });
  if(!vids.length){ setTimeout(dismiss, 400); return; }
  var ready = 0;
  var timeout = setTimeout(dismiss, 4000);
  vids.forEach(function(v){
    function check(){ ready++; if(ready >= vids.length){ clearTimeout(timeout); dismiss(); } }
    v.addEventListener('canplay', check, {once:true});
    v.addEventListener('loadeddata', check, {once:true});
    v.addEventListener('error', check, {once:true});
    if(v.readyState >= 3) check();
  });
})();
