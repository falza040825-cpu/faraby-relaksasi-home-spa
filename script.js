/* ===================================================
   FARABY RELAKSASI - JAVASCRIPT
   Navbar, Tabs, Menu Option Picker, Booking & WhatsApp
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== NAVBAR: Scroll Behavior =====
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    const btt = document.getElementById('backToTop');
    if (window.scrollY > 400) {
      btt.classList.add('visible');
    } else {
      btt.classList.remove('visible');
    }
  });

  // ===== HAMBURGER MENU =====
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  let menuOverlay = null;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);

    if (isOpen) {
      menuOverlay = document.createElement('div');
      menuOverlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(21,40,31,0.35);
        z-index: 998; backdrop-filter: blur(4px);
      `;
      menuOverlay.addEventListener('click', closeMenu);
      document.body.appendChild(menuOverlay);
      document.body.style.overflow = 'hidden';
    } else {
      closeMenu();
    }
  });

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    if (menuOverlay && menuOverlay.parentNode) {
      menuOverlay.parentNode.removeChild(menuOverlay);
    }
    menuOverlay = null;
    document.body.style.overflow = '';
  }

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
      closeMenu();
    }
  });

  // ===== BACK TO TOP =====
  document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== TABS (Layanan) =====
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const content = document.getElementById(`tab-content-${target}`);
      if (content) {
        content.classList.add('active');
        content.querySelectorAll('[data-aos]').forEach(el => el.classList.add('aos-animate'));
      }
    });
  });

  // ===== INTERSECTION OBSERVER (AOS) =====
  const aosElements = document.querySelectorAll('[data-aos]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  aosElements.forEach(el => observer.observe(el));

  const animatableCards = document.querySelectorAll(
    '.menu-card, .keunggulan-card, .area-card, .persiapan-item'
  );
  animatableCards.forEach((el, idx) => {
    el.setAttribute('data-aos', 'fade-up');
    el.style.transitionDelay = `${(idx % 4) * 60}ms`;
    observer.observe(el);
  });

  // ===== MENU CARD OPTION SELECTION (Image 2 style) =====
  document.querySelectorAll('.menu-card').forEach(card => {
    const options = card.querySelectorAll('.menu-option-row');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    const pesanBtn = card.querySelector('.btn-pesan');
    if (pesanBtn) {
      pesanBtn.addEventListener('click', () => {
        const selected = card.querySelector('.menu-option-row.selected') || options[0];
        if (!selected) return;
        const itemName = selected.dataset.item;
        const itemPrice = parseInt(selected.dataset.price || '0', 10);
        pilihLayanan(itemName, itemPrice);
      });
    }
  });

  // ===== SELECTED SERVICES CART (BOOKING FORM) =====
  const selectedServices = [];
  const selectedListEl = document.getElementById('selectedServicesList');
  const selectedTotalEl = document.getElementById('selectedTotalPrice');
  const servicePicker = document.getElementById('servicePicker');
  const addServiceBtn = document.getElementById('addServiceBtn');

  function formatRupiah(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }

  function renderSelectedServices(flashName = '') {
    if (!selectedListEl || !selectedTotalEl) return;

    if (selectedServices.length === 0) {
      selectedListEl.innerHTML = '<div class="selected-empty">Belum ada layanan dipilih. Klik "Pesan Sekarang" pada menu di atas atau pilih lewat daftar di atas.</div>';
      selectedTotalEl.textContent = 'Rp 0';
      return;
    }

    let total = 0;
    const listWrap = document.createElement('div');
    listWrap.className = 'selected-chip-list';

    selectedServices.forEach((svc, idx) => {
      total += svc.price;
      const chip = document.createElement('div');
      chip.className = 'selected-chip' + (svc.name === flashName ? ' flash' : '');
      chip.innerHTML = `
        <div class="selected-chip-info">
          <span class="selected-chip-name">${svc.name}</span>
          <span class="selected-chip-price">${formatRupiah(svc.price)}</span>
        </div>
        <button type="button" class="selected-chip-remove" aria-label="Hapus ${svc.name}" data-idx="${idx}">&times;</button>
      `;
      listWrap.appendChild(chip);
    });

    selectedListEl.innerHTML = '';
    selectedListEl.appendChild(listWrap);
    selectedTotalEl.textContent = formatRupiah(total);

    selectedListEl.querySelectorAll('.selected-chip-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        selectedServices.splice(idx, 1);
        renderSelectedServices();
      });
    });

    if (flashName) {
      setTimeout(() => {
        selectedListEl.querySelectorAll('.selected-chip.flash').forEach(c => c.classList.remove('flash'));
      }, 1800);
    }
  }

  function addServiceItem(name, price) {
    if (!name) return;
    const exists = selectedServices.some(s => s.name === name);
    if (!exists) {
      selectedServices.push({ name, price });
    }
    clearError('error-layanan');
    renderSelectedServices(name);
  }

  if (servicePicker) {
    servicePicker.addEventListener('change', () => {
      const opt = servicePicker.options[servicePicker.selectedIndex];
      if (opt && opt.value) {
        addServiceItem(opt.value, parseInt(opt.dataset.price || '0', 10));
        servicePicker.value = '';
      }
    });
  }

  if (addServiceBtn && servicePicker) {
    addServiceBtn.addEventListener('click', () => {
      const opt = servicePicker.options[servicePicker.selectedIndex];
      if (opt && opt.value) {
        addServiceItem(opt.value, parseInt(opt.dataset.price || '0', 10));
        servicePicker.value = '';
      } else {
        servicePicker.focus();
      }
    });
  }

  window.pilihLayanan = function(namaLayanan, harga = 0) {
    addServiceItem(namaLayanan, harga);
    showToast(`✓ Dipilih: ${namaLayanan}`);
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      const navH = navbar ? navbar.offsetHeight : 70;
      const y = bookingEl.getBoundingClientRect().top + window.pageYOffset - navH;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  renderSelectedServices();

  // ===== MIN DATE FOR BOOKING =====
  const tanggalInput = document.getElementById('tanggal');
  if (tanggalInput) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = today.toISOString().split('T')[0];
    const maxDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    tanggalInput.setAttribute('min', minDate);
    tanggalInput.setAttribute('max', maxDate);
    tanggalInput.setAttribute('value', minDate);
  }

  // ===== FORM VALIDATION =====
  function showError(fieldId, message) {
    const errEl = document.getElementById(fieldId);
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add('visible');
    }
  }

  function clearError(fieldId) {
    const errEl = document.getElementById(fieldId);
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.remove('visible');
    }
  }

  function clearAllErrors() {
    ['error-nama', 'error-wa', 'error-layanan', 'error-tanggal', 'error-jam', 'error-kota', 'error-alamat'].forEach(clearError);
  }

  function validateForm() {
    clearAllErrors();
    let valid = true;

    const nama = document.getElementById('nama').value.trim();
    if (!nama) {
      showError('error-nama', 'Nama lengkap wajib diisi.');
      valid = false;
    }

    const wa = document.getElementById('whatsapp').value.trim();
    if (!wa) {
      showError('error-wa', 'Nomor WhatsApp wajib diisi.');
      valid = false;
    } else if (!/^[0-9+\-\s]{8,16}$/.test(wa)) {
      showError('error-wa', 'Format nomor WhatsApp tidak valid.');
      valid = false;
    }

    if (selectedServices.length === 0) {
      showError('error-layanan', 'Pilih minimal satu layanan atau paket.');
      valid = false;
    }

    const tanggal = document.getElementById('tanggal').value;
    if (!tanggal) {
      showError('error-tanggal', 'Tanggal kunjungan wajib diisi.');
      valid = false;
    }

    const jam = document.getElementById('jam').value;
    if (!jam) {
      showError('error-jam', 'Jam kunjungan wajib dipilih.');
      valid = false;
    }

    const kota = document.getElementById('kota').value;
    if (!kota) {
      showError('error-kota', 'Wilayah wajib dipilih.');
      valid = false;
    }

    const alamat = document.getElementById('alamat').value.trim();
    if (!alamat) {
      showError('error-alamat', 'Alamat lengkap wajib diisi.');
      valid = false;
    }

    return valid;
  }

  // ===== BUILD WHATSAPP MESSAGE =====
  function buildMessage() {
    const nama = document.getElementById('nama').value.trim();
    const wa = document.getElementById('whatsapp').value.trim();
    const tanggal = document.getElementById('tanggal').value;
    const jam = document.getElementById('jam').value;
    const kota = document.getElementById('kota').value;
    const alamat = document.getElementById('alamat').value.trim();
    const catatan = document.getElementById('catatan').value.trim();

    const tgl = new Date(tanggal + 'T00:00:00');
    const tglFormatted = tgl.toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    let total = 0;
    let msg = `*RESERVASI HOME SPA FARABY RELAKSASI* ✨\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    msg += `👤 *Nama:* ${nama}\n`;
    msg += `📱 *WhatsApp:* ${wa}\n\n`;
    msg += `💆 *Layanan & Pilihan:*\n`;
    selectedServices.forEach((l, i) => {
      total += l.price;
      msg += `   ${i + 1}. ${l.name} — ${formatRupiah(l.price)}\n`;
    });
    msg += `💰 *Estimasi Total:* ${formatRupiah(total)}\n`;
    msg += `\n📅 *Tanggal:* ${tglFormatted}\n`;
    msg += `⏰ *Jam:* ${jam} WIB\n\n`;
    msg += `📍 *Wilayah:* ${kota}\n`;
    msg += `🏠 *Alamat:* ${alamat}\n`;
    if (catatan) {
      msg += `\n📝 *Catatan:* ${catatan}\n`;
    }
    msg += `\n━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `_Terima kasih, kami akan segera konfirmasi jadwal Anda!_ 🙏`;

    return msg;
  }

  // ===== PREVIEW BUTTON =====
  window.previewPesan = function() {
    if (!validateForm()) return;
    const msg = buildMessage();
    const preview = document.getElementById('messagePreview');
    const previewText = document.getElementById('previewText');
    previewText.textContent = msg;
    preview.style.display = 'block';
    preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // ===== FORM SUBMIT → WHATSAPP =====
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const msg = buildMessage();
      const encoded = encodeURIComponent(msg);
      const waNumber = '6281220009477';
      const waUrl = `https://wa.me/${waNumber}?text=${encoded}`;

      const submitBtn = document.getElementById('submitBtn');
      submitBtn.textContent = '⏳ Membuka WhatsApp...';
      submitBtn.disabled = true;

      setTimeout(() => {
        window.open(waUrl, '_blank');
        submitBtn.innerHTML = '<span class="btn-icon">💬</span> Kirim ke WhatsApp';
        submitBtn.disabled = false;
        showToast('✅ Pesan berhasil dibuat! Silakan kirim di WhatsApp yang terbuka.');
      }, 600);
    });
  }

  // ===== TOAST NOTIFICATION =====
  function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 1.5rem;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background: linear-gradient(135deg, #1d362a, #2f5543);
      color: #f8f7f2;
      padding: 0.9rem 1.5rem;
      border-radius: 9999px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.88rem;
      font-weight: 600;
      box-shadow: 0 12px 32px rgba(21,40,31,0.32);
      z-index: 99999;
      max-width: 90vw;
      text-align: center;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255,255,255,0.15);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(-100px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH = navbar ? navbar.offsetHeight : 70;
        const y = target.getBoundingClientRect().top + window.pageYOffset - navH;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // ===== ACTIVE NAV LINK on SCROLL =====
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinkEls.forEach(link => {
      link.classList.remove('active-nav');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active-nav');
      }
    });
  });

  // ===== REAL-TIME FORM CLEAR ERRORS =====
  ['nama', 'whatsapp', 'tanggal', 'jam', 'kota', 'alamat'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        const prefix = id === 'whatsapp' ? 'error-wa' : `error-${id}`;
        clearError(prefix);
      });
      el.addEventListener('change', () => {
        const prefix = id === 'whatsapp' ? 'error-wa' : `error-${id}`;
        clearError(prefix);
      });
    }
  });

  console.log('🌿 Faraby Relaksasi Website — Loaded Successfully');
});
