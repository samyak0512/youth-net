(function(){
  // ---- Nav dropdowns (desktop hover handled by CSS; this handles mobile tap + a11y) ----
  document.querySelectorAll('.nav-drop-toggle').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      var drop = btn.closest('.nav-drop');
      var wasOpen = drop.classList.contains('open');
      document.querySelectorAll('.nav-drop.open').forEach(function(d){ d.classList.remove('open'); });
      if(!wasOpen) drop.classList.add('open');
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

  // ---- Hero loom threads ----
  var heroLoom = document.getElementById('heroLoom');
  if(heroLoom){
    var W = 1400, H = 700;
    var svgParts = ['<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">'];
    var rowColors = ['#0E553D','#BF2026','#0E553D','#8A5C10'];
    for(var y=60,i=0; y<H; y+=46, i++){
      svgParts.push('<line x1="-50" y1="'+y+'" x2="'+(W+50)+'" y2="'+y+'" stroke="'+rowColors[i%rowColors.length]+'" stroke-width="1" opacity="0.6"/>');
    }
    var accentColors = ['#FCB92B','#BF2026','#0E553D'];
    for(var x=-40, j=0; x<W+100; x+=90, j++){
      var c = accentColors[j % accentColors.length];
      var dash = 2200;
      svgParts.push('<path class="thread" d="M'+x+' -40 L'+(x+220)+' '+(H+40)+'" stroke="'+c+'" stroke-width="1.4" opacity="0.22" stroke-dasharray="'+dash+'" stroke-dashoffset="'+dash+'"><animate attributeName="stroke-dashoffset" from="'+dash+'" to="0" dur="'+(1.6+ (j%5)*0.18)+'s" begin="'+(j*0.03)+'s" fill="freeze"/></path>');
    }
    svgParts.push('</svg>');
    heroLoom.innerHTML = svgParts.join('');
  }

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

  // ---- Count-up stats ----
  var counters = document.querySelectorAll('.stat-num');
  var counted = new WeakSet();
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting && !counted.has(entry.target)){
        counted.add(entry.target);
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var start = null;
        var dur = 1400;
        function step(ts){
          if(!start) start = ts;
          var p = Math.min((ts-start)/dur, 1);
          var eased = 1 - Math.pow(1-p, 3);
          el.textContent = Math.floor(eased * target).toLocaleString('en-IN');
          if(p < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString('en-IN');
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      }
    });
  }, {threshold:0.4});
  counters.forEach(function(el){ cio.observe(el); });

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
