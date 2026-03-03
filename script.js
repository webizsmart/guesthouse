/* ============================================================
   자연 쉼터 게스트하우스 — Modern JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initScrollAnimations();
    initGallery();
    initForms();
    initSmoothScrolling();
    initDatePickers();
    initParallax();
    initCounters();
});

/* ============================================================
   NAVIGATION
   ============================================================ */
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('navMenu');
    const navbar    = document.getElementById('navbar');
    const navLinks  = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Navbar scroll effect
    let lastScrollY = 0;
    window.addEventListener('scroll', function () {
        const scrollY = window.scrollY;

        if (scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScrollY = scrollY;
    }, { passive: true });

    // Active nav link highlighting on scroll
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = { threshold: 0.4 };

    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));
}

/* ============================================================
   SCROLL ANIMATIONS (Intersection Observer)
   ============================================================ */
function initScrollAnimations() {
    const animatedEls = document.querySelectorAll('[data-aos]');
    if (!animatedEls.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el    = entry.target;
                const delay = el.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    el.classList.add('aos-animate');
                }, Number(delay));
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    animatedEls.forEach(el => observer.observe(el));
}

/* ============================================================
   GALLERY
   ============================================================ */
function initGallery() {
    const filterBtns   = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const modal        = document.getElementById('galleryModal');
    const modalImg     = document.getElementById('modalImage');
    const closeBtn     = document.getElementById('modalClose');

    /* Filter */
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const filter = this.getAttribute('data-filter');
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            galleryItems.forEach(item => {
                const cat = item.getAttribute('data-category');
                const show = filter === 'all' || cat === filter;
                if (show) {
                    item.style.display = 'block';
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    });
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.85)';
                    setTimeout(() => { item.style.display = 'none'; }, 350);
                }
            });
        });
    });

    /* Lightbox */
    galleryItems.forEach(item => {
        item.addEventListener('click', function () {
            const img = this.querySelector('img');
            modal.classList.add('show');
            modalImg.src = img.src.replace('w=800', 'w=1600');
            modalImg.alt = img.alt;
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ============================================================
   FORMS
   ============================================================ */
function initForms() {
    const reservationForm = document.getElementById('reservationForm');
    const contactForm     = document.getElementById('contactForm');

    if (reservationForm) {
        reservationForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleFormSubmit(this, 'reservation');
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleFormSubmit(this, 'contact');
        });
    }

    // Field-level validation
    document.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });
}

function handleFormSubmit(form, type) {
    const submitBtn   = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;

    // Validate reservation dates
    if (type === 'reservation') {
        const checkin  = new Date(form.querySelector('#checkin')?.value);
        const checkout = new Date(form.querySelector('#checkout')?.value);
        const today    = new Date(); today.setHours(0, 0, 0, 0);
        if (checkin < today) {
            showNotification('체크인 날짜는 오늘 이후여야 합니다.', 'error');
            return;
        }
        if (checkout <= checkin) {
            showNotification('체크아웃 날짜는 체크인 날짜 이후여야 합니다.', 'error');
            return;
        }
    }

    // Loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 처리 중...';
    submitBtn.disabled  = true;

    setTimeout(() => {
        const msg = type === 'reservation'
            ? '🎉 예약이 성공적으로 접수되었습니다! 확인 이메일을 발송해드렸습니다.'
            : '✅ 문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.';
        showNotification(msg, 'success');
        form.reset();
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled  = false;
    }, 1800);
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    clearFieldError(e);

    if (field.hasAttribute('required') && !value) {
        showFieldError(field, '이 필드는 필수입니다.');
        return false;
    }
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showFieldError(field, '올바른 이메일 주소를 입력해주세요.');
        return false;
    }
    if (field.type === 'tel' && value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
        showFieldError(field, '올바른 전화번호를 입력해주세요.');
        return false;
    }
    return true;
}

function showFieldError(field, message) {
    field.style.borderColor = '#e74c3c';
    field.style.boxShadow   = '0 0 0 3px rgba(231,76,60,0.12)';
    let err = field.parentNode.querySelector('.field-error');
    if (!err) {
        err = document.createElement('span');
        err.className = 'field-error';
        Object.assign(err.style, {
            color: '#e74c3c', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block'
        });
        field.parentNode.appendChild(err);
    }
    err.textContent = message;
}

function clearFieldError(e) {
    const field = e.target;
    field.style.borderColor = '';
    field.style.boxShadow   = '';
    const err = field.parentNode.querySelector('.field-error');
    if (err) err.remove();
}

/* ============================================================
   SMOOTH SCROLLING
   ============================================================ */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                const offset = target.offsetTop - 80;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        });
    });
}

/* ============================================================
   DATE PICKERS
   ============================================================ */
function initDatePickers() {
    const checkin  = document.getElementById('checkin');
    const checkout = document.getElementById('checkout');
    if (!checkin || !checkout) return;

    const today = new Date().toISOString().split('T')[0];
    checkin.min  = today;
    checkout.min = today;

    checkin.addEventListener('change', function () {
        const d = new Date(this.value);
        d.setDate(d.getDate() + 1);
        const nextDay = d.toISOString().split('T')[0];
        checkout.min = nextDay;
        if (checkout.value && checkout.value <= this.value) {
            checkout.value = '';
        }
    });
}

/* ============================================================
   PARALLAX HERO
   ============================================================ */
function initParallax() {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const speed    = scrolled * 0.35;
                heroBg.style.transform = `translateY(${speed}px)`;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function initCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
}

function animateCounter(el) {
    const text = el.textContent.trim();
    const numericPart = parseFloat(text.replace(/[^\d.]/g, ''));
    const suffix = text.replace(/[\d.]/g, '');
    if (isNaN(numericPart)) return;

    const duration = 1500;
    const start = Date.now();

    function update() {
        const elapsed  = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = numericPart * ease;

        el.textContent = (Number.isInteger(numericPart) ? Math.floor(current) : current.toFixed(1)) + suffix;

        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

/* ============================================================
   NOTIFICATION SYSTEM
   ============================================================ */
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const colors = {
        success: { bg: '#1a3a2a', border: '#4a8c6a', icon: 'check-circle' },
        error:   { bg: '#3a1a1a', border: '#c0392b',  icon: 'exclamation-circle' },
        info:    { bg: '#1a2a3a', border: '#2980b9',  icon: 'info-circle' }
    };
    const c = colors[type] || colors.info;

    const el = document.createElement('div');
    el.className = 'notification';
    el.innerHTML = `
        <div class="notif-inner">
            <i class="fas fa-${c.icon}"></i>
            <span>${message}</span>
            <button class="notif-close">&#10005;</button>
        </div>
    `;

    Object.assign(el.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: 'white',
        padding: '1rem 1.4rem',
        borderRadius: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        zIndex: '99999',
        maxWidth: '420px',
        transform: 'translateX(calc(100% + 40px))',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        fontFamily: 'Noto Sans KR, sans-serif',
        fontSize: '0.9rem',
        lineHeight: '1.5',
        backdropFilter: 'blur(10px)'
    });

    el.querySelector('.notif-inner').style.cssText = 'display:flex;align-items:flex-start;gap:12px;';
    el.querySelector('.notif-inner i').style.cssText = `color:${c.border};font-size:1.2rem;margin-top:2px;flex-shrink:0;`;
    el.querySelector('.notif-close').style.cssText = 'background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:1rem;padding:0;margin-left:auto;flex-shrink:0;';

    document.body.appendChild(el);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => { el.style.transform = 'translateX(0)'; });
    });

    const close = () => {
        el.style.transform = 'translateX(calc(100% + 40px))';
        setTimeout(() => el.remove(), 400);
    };

    el.querySelector('.notif-close').addEventListener('click', close);
    setTimeout(close, 5500);
}

/* ============================================================
   ROOM DETAILS (View Details button handler)
   ============================================================ */
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('view-details')) {
        const roomType = e.target.getAttribute('data-room');
        const roomData = {
            standard: { name: '스탠다드 룸', price: '₩45,000', capacity: '1~2명' },
            family:   { name: '패밀리 룸',   price: '₩85,000', capacity: '최대 4명' },
            deluxe:   { name: '디럭스 룸',   price: '₩120,000', capacity: '1~2명' }
        };
        const room = roomData[roomType];
        if (room) {
            showNotification(`<strong>${room.name}</strong> — ${room.price}/박 · 수용 ${room.capacity}`, 'info');
        }
    }
});