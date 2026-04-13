/* =============================================
   EAST COAST INFLATE-A-PALOOZA — Scripts
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // --- Sticky Navbar ---
  const navbar = document.querySelector('.navbar');
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // --- Mobile Hamburger Menu ---
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Smooth Scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Scroll-triggered Animations ---
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animateElements.forEach(el => observer.observe(el));

  // --- Animated Stat Counters ---
  const counters = document.querySelectorAll('.stat-number');
  let counterAnimated = false;

  const animateCounters = () => {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 2000;
      const start = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.round(eased * target);
        counter.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        }
      };

      requestAnimationFrame(updateCounter);
    });
  };

  if (counters.length > 0) {
    const statsSection = counters[0].closest('.stats-row') || counters[0].closest('.about');
    if (statsSection) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !counterAnimated) {
            counterAnimated = true;
            animateCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      statsObserver.observe(statsSection);
    }
  }

  // --- Confetti in Hero ---
  const confettiContainer = document.querySelector('.confetti-container');
  if (confettiContainer) {
    const colors = ['#FFD700', '#FF4757', '#00D2FF', '#FF6B81', '#FFE44D', '#00A8CC', '#FFFFFF'];
    const confettiCount = 30;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 6 + 5) + 's';
      confetti.style.animationDelay = (Math.random() * 8) + 's';
      confetti.style.width = (Math.random() * 10 + 6) + 'px';
      confetti.style.height = (Math.random() * 10 + 6) + 'px';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      confettiContainer.appendChild(confetti);
    }
  }

  // --- FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all others
      faqItems.forEach(other => {
        other.classList.remove('active');
        other.querySelector('.faq-answer').style.maxHeight = null;
      });

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // --- Contact Form (FormSubmit.co) ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      try {
        const response = await fetch('https://formsubmit.co/ajax/info@ecpalooza.ca', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(contactForm)
        });
        const data = await response.json();
        if (data.success === 'true' || data.success === true) {
          btn.textContent = 'Message Sent! ✓';
          btn.style.background = 'linear-gradient(135deg, #00D2FF, #00A8CC)';
          contactForm.reset();
        } else {
          throw new Error('Failed');
        }
      } catch {
        btn.textContent = 'Error — Try Again';
        btn.style.background = 'linear-gradient(135deg, #FF4757, #FF6B81)';
      }

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    });
  }

});
