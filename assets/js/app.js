
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


  window.RC = window.RC || {};
  try { window.RC.sb = window.supabase.createClient('https://peyqkueitxtyujgmqghc.supabase.co','sb_publishable_jbaVLjK75KjrMVe8ii8teg_IcTc8OeM'); }
  catch(e){ console.warn('Supabase init failed', e); }


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

/* ---------- Sign-in: Supabase email OTP (2-step) ---------- */
(function(){
  var SB = (window.RC && RC.sb) ? RC.sb : null;
  function roleOf(card){ return card.classList.contains('owner') ? 'landlord' : 'tenant'; }
  function markSignedIn(role){ RC.role = role || RC.role; document.querySelectorAll('.role-signin').forEach(function(c){ c.classList.add('signed'); }); }
  if(SB){ SB.auth.getUser().then(function(r){ var u = r && r.data && r.data.user; if(u){ RC.user = u; RC.role = (u.user_metadata && u.user_metadata.role) || 'tenant'; markSignedIn(RC.role); } }).catch(function(){}); }
  document.querySelectorAll('.rc-otp').forEach(function(f){
    var card = f.closest('.rc-card'); var role = roleOf(card);
    var s1 = f.querySelector('.otp-step1'), s2 = f.querySelector('.otp-step2');
    var ident = f.querySelector('input[name=ident]'), code = f.querySelector('input[name=code]'), target = f.querySelector('.otp-target');
    f.querySelector('.send-code').addEventListener('click', function(){
      var email = ident.value.trim();
      if(!email || email.indexOf('@') < 0){ card.classList.add('err'); RC.toast('Enter your email to get a sign-in code.'); return; }
      card.classList.remove('err'); if(RC.Sound) RC.Sound.pop();
      if(!SB){ RC.toast('Sign-in is being set up \u2014 try again shortly.'); return; }
      var btn = this, old = btn.textContent; btn.disabled = true; btn.textContent = 'Sending\u2026';
      SB.auth.signInWithOtp({ email: email, options: { shouldCreateUser: true, data: { role: role, name: email.split('@')[0] } } }).then(function(res){
        btn.disabled = false; btn.textContent = old;
        if(res.error){ RC.toast(res.error.message); return; }
        target.textContent = email; s1.hidden = true; s2.hidden = false; code.focus();
        RC.toast('Code sent to ' + email + ' \u2014 check your inbox.');
      });
    });
    f.querySelector('.otp-edit').addEventListener('click', function(){ s2.hidden = true; s1.hidden = false; ident.focus(); });
    f.addEventListener('submit', function(ev){
      ev.preventDefault();
      var email = ident.value.trim(), token = code.value.trim();
      if(token.length < 4){ card.classList.add('err'); RC.toast('Enter the code from your email.'); return; }
      card.classList.remove('err');
      if(!SB){ RC.toast('Sign-in is being set up \u2014 try again shortly.'); return; }
      var btn = f.querySelector('.verify-code'), old = btn.textContent; btn.disabled = true; btn.textContent = 'Verifying\u2026';
      SB.auth.verifyOtp({ email: email, token: token, type: 'email' }).then(function(res){
        btn.disabled = false; btn.textContent = old;
        if(res.error){ RC.toast(res.error.message); return; }
        RC.user = res.data.user; markSignedIn(role);
        if(RC.Sound) RC.Sound.chime();
        RC.toast('Signed in as ' + role + '. Welcome back!');
        f.reset(); s2.hidden = true; s1.hidden = false;
        if(role === 'landlord'){ var l = document.getElementById('list'); if(l) setTimeout(function(){ l.scrollIntoView({behavior:'smooth'}); }, 650); }
      });
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


/* ---------- List your property (Supabase insert for signed-in owners) ---------- */
(function(){
  var form = document.querySelector('.rc-listform'); if(!form) return;
  var grid = document.getElementById('rlGrid'), empty = document.getElementById('rlEmpty');
  var fileInput = form.querySelector('input[type=file]'); var photoData = null;
  if(fileInput){ fileInput.addEventListener('change', function(){ var f = fileInput.files && fileInput.files[0]; if(!f){ photoData = null; return; } var r = new FileReader(); r.onload = function(){ photoData = r.result; }; r.readAsDataURL(f); }); }
  function val(n){ var el = form.querySelector('[name='+n+']'); return el ? el.value.trim() : ''; }
  function esc(s){ return s.replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var title = val('title'), city = val('city'), config = val('config');
    if(!title || !city || !config){ form.classList.add('err'); RC.toast('Add at least a title, city and configuration.'); return; }
    form.classList.remove('err'); if(empty) empty.style.display = 'none';
    var area = val('area'), type = val('type'), furnish = val('furnish'), rent = val('rent'), desc = val('desc');
    var meta = [config, type, furnish].filter(Boolean).join(' \u00b7 ');
    var loc  = [area, city].filter(Boolean).join(', ');
    var img  = photoData ? '<img class="rl-img" src="'+photoData+'" alt="">' : '<div class="rl-img"></div>';
    var saved = !!(RC.user && RC.role === 'landlord' && RC.sb);
    var card = document.createElement('div'); card.className = 'rl-card';
    card.innerHTML = img + '<div class="rl-body"><h4>'+esc(title)+'</h4>'
      + (loc ? '<div class="rl-meta">'+esc(loc)+'</div>' : '')
      + (meta ? '<div class="rl-meta">'+esc(meta)+'</div>' : '')
      + (rent ? '<div class="rl-rent">\u20b9'+esc(rent)+' <span>/month</span></div>' : '')
      + (desc ? '<div class="rl-desc">'+esc(desc)+'</div>' : '')
      + '<span class="rl-tag">'+(saved ? 'Saving\u2026' : (RC.user ? 'Preview' : 'Preview \u00b7 sign in to save'))+'</span></div>';
    grid.insertBefore(card, grid.firstChild);
    if(RC.Sound) RC.Sound.chime(); form.reset(); photoData = null;
    if(saved){
      var m = (config || '').match(/\d+/); var bed = m ? parseInt(m[0], 10) : null;
      RC.sb.from('properties').insert({ landlord_id: RC.user.id, property_name: title, address: area || null, city: city, country: 'India', bedrooms: bed, property_type: type || null, furnishing: furnish || null, monthly_rent: rent ? Number(rent) : null, description: desc || null, status: 'vacant' }).then(function(res){
        var tag = card.querySelector('.rl-tag');
        if(res.error){ if(tag) tag.textContent = 'Saved locally (sync failed)'; RC.toast('Listed, but save failed: ' + res.error.message); }
        else { if(tag) tag.textContent = 'Saved to your account'; RC.toast('Property saved to your RentCan account.'); }
      });
    } else { RC.toast(RC.user ? 'Listed (preview).' : 'Listed as preview \u2014 sign in as an owner to save it.'); }
  });
})();


// Sticky Header Logic
const header = document.querySelector('.header');
if(header) {
  window.addEventListener('scroll', () => {
    if(window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}
