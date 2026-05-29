// Add js-loaded class IMMEDIATELY so CSS knows JS is active.
// This enables the opacity:0 reveal guard only when JS is confirmed running.
// Without this, mobile browsers show a blank white page.
document.documentElement.classList.add('js-loaded');

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       Theme Toggle (Dark / Light)
       ========================================================================== */
    const html         = document.documentElement;
    const themeBtn     = document.getElementById('theme-toggle');
    const themeIcon    = themeBtn.querySelector('i');

    const savedTheme = localStorage.getItem('aa-theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    applyThemeIcon(savedTheme);

    themeBtn.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('aa-theme', next);
        applyThemeIcon(next);
    });

    function applyThemeIcon(theme) {
        themeIcon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }

    /* ==========================================================================
       Mobile Navigation
       ========================================================================== */
    const menuBtn   = document.getElementById('mobile-menu-btn');
    const navLinks  = document.querySelector('.nav-links');
    const navItems  = document.querySelectorAll('.nav-link');

    menuBtn.addEventListener('click', () => {
        const open = navLinks.classList.toggle('active');
        menuBtn.querySelector('i').className = open ? 'fas fa-times' : 'fas fa-bars';
    });

    navItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuBtn.querySelector('i').className = 'fas fa-bars';
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
            navLinks.classList.remove('active');
            menuBtn.querySelector('i').className = 'fas fa-bars';
        }
    });

    /* ==========================================================================
       Navbar – Scroll shrink & Active link tracking
       ========================================================================== */
    const navbar   = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');

    function onScroll() {
        // Shrink navbar
        navbar.classList.toggle('scrolled', window.scrollY > 40);

        // Highlight active nav link
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 140) {
                current = sec.getAttribute('id');
            }
        });

        navItems.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ==========================================================================
       Scroll-Reveal Animations
       ========================================================================== */
    const revealEls = document.querySelectorAll('.reveal');

    // Mobile-safe fallback: if IntersectionObserver doesn't fire within 2s
    // (elements already in viewport on load, or slow mobile browser),
    // force all reveal elements visible immediately.
    const revealFallbackTimer = setTimeout(() => {
        revealEls.forEach(el => el.classList.add('active'));
    }, 2000);

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
        );

        revealEls.forEach(el => observer.observe(el));

        // If hero elements are already in viewport on load, trigger them instantly
        setTimeout(() => {
            revealEls.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    el.classList.add('active');
                    clearTimeout(revealFallbackTimer);
                }
            });
        }, 100);
    } else {
        // No IntersectionObserver support — show everything immediately
        revealEls.forEach(el => el.classList.add('active'));
        clearTimeout(revealFallbackTimer);
    }

    /* ==========================================================================
       Background Canvas – Subtle Corporate Tech Grid
       ========================================================================== */
    const canvas = document.getElementById('particles-canvas');
    const ctx    = canvas.getContext('2d');

    let W, H, nodes = [], raf;

    const CONFIG = {
        nodeCount:     55,
        maxDist:       160,
        speed:         0.25,
        nodeRadius:    1.4,
        lineOpacity:   0.08,
        nodeOpacity:   0.35,
    };

    // ── Responsive resize ──────────────────────────────────────────────────────
    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', () => { resize(); initNodes(); }, { passive: true });
    resize();

    // ── Node Class ─────────────────────────────────────────────────────────────
    class Node {
        constructor() { this.reset(true); }

        reset(init = false) {
            this.x  = Math.random() * W;
            this.y  = init ? Math.random() * H : -10;
            this.vx = (Math.random() - 0.5) * CONFIG.speed;
            this.vy = (Math.random() - 0.5) * CONFIG.speed;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < -10)  this.x = W + 10;
            if (this.x > W+10) this.x = -10;
            if (this.y < -10)  this.y = H + 10;
            if (this.y > H+10) this.y = -10;
        }
    }

    function initNodes() {
        nodes = Array.from({ length: CONFIG.nodeCount }, () => new Node());
    }

    // ── Get accent color based on theme ────────────────────────────────────────
    function accentColor(alpha) {
        if (html.getAttribute('data-theme') === 'light') {
            return `rgba(42, 110, 245, ${alpha})`;
        }
        return `rgba(74, 154, 245, ${alpha})`;
    }

    // ── Draw frame ─────────────────────────────────────────────────────────────
    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Update & draw nodes
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].update();
        }

        // Draw connecting lines
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx   = nodes[i].x - nodes[j].x;
                const dy   = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.maxDist) {
                    const alpha = (1 - dist / CONFIG.maxDist) * CONFIG.lineOpacity;
                    ctx.beginPath();
                    ctx.strokeStyle = accentColor(alpha);
                    ctx.lineWidth   = 0.8;
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw node dots
        for (let i = 0; i < nodes.length; i++) {
            ctx.beginPath();
            ctx.arc(nodes[i].x, nodes[i].y, CONFIG.nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = accentColor(CONFIG.nodeOpacity);
            ctx.fill();
        }

        raf = requestAnimationFrame(draw);
    }

    initNodes();
    draw();

    // Pause animation when tab is hidden (performance)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(raf);
        } else {
            draw();
        }
    });

});
