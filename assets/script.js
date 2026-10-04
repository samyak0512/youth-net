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

  // ---- YJC job listings from a local snapshot (no old-site calls) ----
  var jobRoot = document.getElementById('jobListings');
  if(jobRoot){
    var JOBS_DATA = 'assets/jobs.json';
    var JOBS_EMBEDDED = window.YOUTHNET_JOBS;
    var JOBS_EMAIL = 'ops.yjc@gmail.com';
    var perPage = 8;
    var page = 1;
    var loading = false;
    var allJobs = [];
    var jobsById = {};
    var lastFocus = null;
    var listEl = jobRoot.querySelector('.job-list');
    var statusEl = jobRoot.querySelector('.job-status');
    var moreBtn = jobRoot.querySelector('.job-more');
    var modal = document.getElementById('jobModal');
    var modalTitle = document.getElementById('jobModalTitle');
    var modalMeta = document.getElementById('jobModalMeta');
    var modalBody = document.getElementById('jobModalBody');
    var modalApply = document.getElementById('jobModalApply');
    var modalDialog = modal ? modal.querySelector('.job-modal-dialog') : null;

    function decodeHtml(s){
      var t = document.createElement('textarea');
      t.innerHTML = s || '';
      return t.value;
    }
    function cleanTitle(s){
      return decodeHtml(s)
        .replace(/\s*Job Vacancy in\s+.+$/i, '')
        .replace(/\s+Job\s*$/i, '')
        .trim();
    }
    function formatDate(iso){
      var d = new Date(iso);
      if(isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'});
    }
    function esc(s){
      return String(s || '').replace(/[&<>"']/g, function(c){
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
      });
    }
    function jobTitle(job){
      return cleanTitle(job && job.title && job.title.rendered);
    }
    function jobLocation(job){
      return (job && job.meta && job.meta._job_location) || 'Location on request';
    }
    function jobApplyHref(job){
      var apply = (job && job.meta && job.meta._application) || JOBS_EMAIL;
      return 'mailto:' + apply + '?subject=' + encodeURIComponent('Application: ' + jobTitle(job));
    }
    function sanitizeJobHtml(html){
      var doc = new DOMParser().parseFromString(html || '', 'text/html');
      doc.querySelectorAll('script,style,iframe,object,embed,form,link,meta,noscript').forEach(function(el){ el.remove(); });
      doc.body.querySelectorAll('*').forEach(function(el){
        Array.from(el.attributes).forEach(function(attr){
          var n = attr.name.toLowerCase();
          if(n.indexOf('on') === 0 || n === 'style' || n === 'class' || n === 'id' || n === 'src' || n === 'srcset'){
            el.removeAttribute(attr.name);
          }
        });
        if(el.tagName === 'A'){
          var href = el.getAttribute('href') || '';
          if(!/^(mailto:|tel:)/i.test(href)){
            el.removeAttribute('href');
            el.removeAttribute('target');
            el.removeAttribute('rel');
          }
        }
      });
      return doc.body.innerHTML.trim();
    }
    function setStatus(msg, isError){
      if(!statusEl) return;
      statusEl.hidden = !msg;
      statusEl.textContent = msg || '';
      statusEl.classList.toggle('is-error', !!isError);
    }
    function closeJobModal(){
      if(!modal) return;
      modal.classList.remove('is-open');
      modal.hidden = true;
      document.body.classList.remove('job-modal-open');
      if(lastFocus && lastFocus.focus) lastFocus.focus();
      lastFocus = null;
    }
    function fillJobModal(job){
      var title = jobTitle(job);
      var loc = jobLocation(job);
      var date = formatDate(job.date);
      var body = sanitizeJobHtml(job.content && job.content.rendered);
      modalTitle.textContent = title;
      modalMeta.textContent = [loc, date ? 'Posted ' + date : ''].filter(Boolean).join(' · ');
      modalBody.innerHTML = body || '<p>Write to ' + esc(JOBS_EMAIL) + ' for the full description of this opening.</p>';
      modalApply.href = jobApplyHref(job);
    }
    function openJobModal(id, trigger){
      if(!modal) return;
      var job = jobsById[id];
      if(!job) return;
      lastFocus = trigger || document.activeElement;
      fillJobModal(job);
      modal.hidden = false;
      modal.classList.add('is-open');
      document.body.classList.add('job-modal-open');
      if(modalDialog) modalDialog.focus();
    }
    function renderJobs(jobs){
      var html = jobs.map(function(job){
        jobsById[job.id] = job;
        var title = jobTitle(job);
        var loc = jobLocation(job);
        var date = formatDate(job.date);
        return '<article class="job-card" data-job-id="' + esc(String(job.id)) + '">' +
          '<div>' +
            '<h3><button type="button" class="job-open" data-job-id="' + esc(String(job.id)) + '">' + esc(title) + '</button></h3>' +
            '<div class="job-meta">' +
              '<span>' + esc(loc) + '</span>' +
              (date ? '<span>Posted ' + esc(date) + '</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="job-card-actions">' +
            '<button type="button" class="btn btn-line job-open" data-job-id="' + esc(String(job.id)) + '">Details</button>' +
            '<a class="btn btn-gold" href="' + esc(jobApplyHref(job)) + '">Apply</a>' +
          '</div>' +
        '</article>';
      }).join('');
      listEl.insertAdjacentHTML('beforeend', html);
    }
    function showPage(){
      var start = (page - 1) * perPage;
      var slice = allJobs.slice(start, start + perPage);
      if(!slice.length){
        if(page === 1) setStatus('No current openings are listed right now. Write to ' + JOBS_EMAIL + ' to register or enquire.');
        if(moreBtn) moreBtn.hidden = true;
        return;
      }
      setStatus('');
      renderJobs(slice);
      page += 1;
      if(moreBtn){
        moreBtn.hidden = start + perPage >= allJobs.length;
        moreBtn.disabled = false;
      }
    }
    function jobsFromPayload(data){
      return (data && data.jobs) || (Array.isArray(data) ? data : []);
    }
    function load(){
      if(loading) return;
      if(allJobs.length){
        showPage();
        return;
      }
      function useJobs(data){
        allJobs = jobsFromPayload(data);
        if(!allJobs.length){
          setStatus('No current openings are listed right now. Write to ' + JOBS_EMAIL + ' to register or enquire.');
          if(moreBtn) moreBtn.hidden = true;
          return;
        }
        showPage();
      }
      if(JOBS_EMBEDDED){
        useJobs(JOBS_EMBEDDED);
        return;
      }
      loading = true;
      if(moreBtn) moreBtn.disabled = true;
      setStatus('Loading current openings…');
      fetch(JOBS_DATA).then(function(res){
        if(!res.ok) throw new Error('Could not load listings');
        return res.json();
      }).then(useJobs).catch(function(){
        setStatus('Listings could not be loaded just now. Write to ' + JOBS_EMAIL + ' or visit a Job Centre office for current openings.', true);
        if(moreBtn) moreBtn.hidden = true;
      }).then(function(){ loading = false; });
    }
    if(listEl){
      listEl.addEventListener('click', function(e){
        var btn = e.target.closest('.job-open');
        if(!btn) return;
        openJobModal(btn.getAttribute('data-job-id'), btn);
      });
    }
    if(modal){
      modal.addEventListener('click', function(e){
        if(e.target.closest('[data-close-job-modal]')) closeJobModal();
      });
      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape' && modal.classList.contains('is-open')) closeJobModal();
      });
    }
    if(moreBtn) moreBtn.addEventListener('click', load);
    load();
  }

  // ---- Contact form: jobs enquiries go to the YJC desk ----
  var contactForm = document.querySelector('form[action^="mailto:"]');
  if(contactForm){
    var reason = contactForm.querySelector('#reason');
    function syncMailto(){
      var jobs = reason && /job/i.test(reason.value || '');
      contactForm.setAttribute('action', jobs ? 'mailto:ops.yjc@gmail.com' : 'mailto:youthnet@youthnet.org.in');
    }
    if(reason){
      reason.addEventListener('change', syncMailto);
      syncMailto();
    }
  }
})();
