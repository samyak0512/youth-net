(function(){
  // ---- Nav dropdowns (desktop hover handled by CSS; this handles mobile tap + a11y) ----
  var navMq = window.matchMedia('(max-width: 900px)');
  function dropMenu(drop){ return drop.querySelector('.nav-drop-menu'); }
  function collapseDrop(drop){
    var menu = dropMenu(drop);
    drop.classList.remove('open');
    if(!menu) return;
    if(!navMq.matches){ menu.style.maxHeight = ''; return; }
    menu.style.maxHeight = menu.scrollHeight + 'px';
    menu.offsetHeight;
    menu.style.maxHeight = '0px';
  }
  function expandDrop(drop){
    var menu = dropMenu(drop);
    drop.classList.add('open');
    if(!menu || !navMq.matches) return;
    menu.style.maxHeight = '0px';
    menu.offsetHeight;
    menu.style.maxHeight = menu.scrollHeight + 'px';
  }
  function resetDropHeights(){
    document.querySelectorAll('.nav-drop-menu').forEach(function(menu){ menu.style.maxHeight = ''; });
    if(!navMq.matches){
      document.querySelectorAll('.nav-drop.open').forEach(function(d){ d.classList.remove('open'); });
    }
  }
  if(navMq.addEventListener) navMq.addEventListener('change', resetDropHeights);
  else if(navMq.addListener) navMq.addListener(resetDropHeights);

  document.querySelectorAll('.nav-drop-toggle').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var drop = btn.closest('.nav-drop');
      var wasOpen = drop.classList.contains('open');
      document.querySelectorAll('.nav-drop.open').forEach(function(d){
        if(d !== drop) collapseDrop(d);
      });
      if(wasOpen) collapseDrop(drop);
      else expandDrop(drop);
    });
  });
  // ---- Woven band SVG generator (signature motif) ----
  function wovenBand(target, opts){
    opts = opts || {};
    var colors = opts.colors || ['#FCB92B','#0E553D','#BF2026','#faf6ec'];
    var w = 1400, h = 40;
    var s = '<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">';
    var bandW = 70;
    for(var x=0, i=0; x<w; x+=bandW, i++){
      var c = colors[i % colors.length];
      s += '<rect x="'+x+'" y="0" width="'+bandW+'" height="'+h+'" fill="'+c+'"/>';
      s += '<path d="M'+x+' '+(h/2)+' L'+(x+bandW/2)+' 0 L'+(x+bandW)+' '+(h/2)+' L'+(x+bandW/2)+' '+h+' Z" fill="rgba(0,0,0,0.08)"/>';
    }
    s += '</svg>';
    target.innerHTML = s;
  }
  var top = document.getElementById('wovenTop');
  var bottom = document.getElementById('wovenBottom');
  if(top) wovenBand(top);
  if(bottom) wovenBand(bottom, {colors:['#BF2026','#FCB92B','#25BCB5','#0E553D']});

  // ---- Mobile nav ----
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('primaryNav');
  if(toggle && nav){
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        nav.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      });
    });
  }

  // ---- Scroll reveal ----
  var reveals = document.querySelectorAll('.reveal');
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});
  reveals.forEach(function(el){ io.observe(el); });

  // ---- Fit hero headline to a single line ----
  function fitHeroTitle(){
    var el = document.querySelector('h1.hero-title');
    if(!el) return;
    var viewport = document.documentElement.clientWidth;
    var wrap = el.closest('.wrap');
    var cs = wrap ? window.getComputedStyle(wrap) : null;
    var pad = cs ? (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0) : 40;
    var maxW = cs ? parseFloat(cs.maxWidth) : NaN;
    if(!maxW || isNaN(maxW)) maxW = viewport;
    var available = Math.max(120, Math.min(viewport, maxW) - pad);
    el.style.whiteSpace = 'nowrap';
    el.style.maxWidth = available + 'px';
    var lo = 12, hi = 56;
    for(var i = 0; i < 22; i++){
      var mid = (lo + hi) / 2;
      el.style.fontSize = mid + 'px';
      if(el.scrollWidth <= available + 0.5) lo = mid;
      else hi = mid;
    }
    el.style.fontSize = (Math.floor(lo * 10) / 10) + 'px';
  }
  fitHeroTitle();
  window.addEventListener('resize', fitHeroTitle);
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(fitHeroTitle);
  } else {
    window.addEventListener('load', fitHeroTitle);
  }

  // ---- Count-up stats (once when in view, 2s) ----
  var counters = document.querySelectorAll('.stat-num');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var counted = false;

  function formatCount(n){
    return Math.floor(n).toLocaleString('en-IN');
  }

  function runCounters(){
    if(counted || !counters.length) return;
    counted = true;
    var duration = reduceMotion ? 0 : 2000;
    counters.forEach(function(el){
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      if(duration === 0){
        el.textContent = formatCount(target);
        return;
      }
      var start = null;
      function step(ts){
        if(!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 2.2);
        el.textContent = formatCount(eased * target);
        if(p < 1) requestAnimationFrame(step);
        else el.textContent = formatCount(target);
      }
      requestAnimationFrame(step);
    });
  }

  if(counters.length){
    counters.forEach(function(el){ el.textContent = '0'; });
    var countRoot = document.querySelector('.stats-grid') || counters[0];
    if('IntersectionObserver' in window){
      var cio = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            runCounters();
            cio.disconnect();
          }
        });
      }, {threshold:0.25});
      cio.observe(countRoot);
    } else {
      runCounters();
    }
  }

  // ---- Map + legend hover/tap sync ----
  document.querySelectorAll('.map-shell').forEach(function(shell){
    var caption = shell.querySelector('.map-caption');
    var card = shell.closest('.presence-card');
    var chips = card ? card.querySelectorAll('.chip[data-slug]') : [];
    var regions = shell.querySelectorAll('.d-region[data-slug]');
    var defaultText = caption ? caption.getAttribute('data-default') : '';

    function setActive(slug){
      regions.forEach(function(r){ r.classList.toggle('active', r.getAttribute('data-slug') === slug); });
      chips.forEach(function(c){ c.classList.toggle('active', c.getAttribute('data-slug') === slug); });
      if(caption){
        if(slug){
          var region = shell.querySelector('.d-region[data-slug="'+slug+'"]');
          caption.textContent = region ? region.getAttribute('data-name') : defaultText;
          caption.classList.add('picked');
        } else {
          caption.textContent = defaultText;
          caption.classList.remove('picked');
        }
      }
    }

    regions.forEach(function(r){
      r.addEventListener('mouseenter', function(){ setActive(r.getAttribute('data-slug')); });
      r.addEventListener('mouseleave', function(){ setActive(null); });
      r.addEventListener('click', function(e){ e.preventDefault(); setActive(r.getAttribute('data-slug')); });
    });
    chips.forEach(function(c){
      c.addEventListener('mouseenter', function(){ setActive(c.getAttribute('data-slug')); });
      c.addEventListener('mouseleave', function(){ setActive(null); });
      c.addEventListener('click', function(){ setActive(c.getAttribute('data-slug')); });
    });
  });
})();
