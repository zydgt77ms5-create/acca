
let cart = JSON.parse(localStorage.getItem('cart')) || [];


function updateCartCount() {
  const badge = document.getElementById('cart-count');
  if (badge) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = totalItems;
  }
}


function addToCart(name, price, image) {
  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, image, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert(name + " has been added to your cart!");
}


function displayCart() {
  const tbody = document.getElementById('cart-item-rows');
  const subtotalElem = document.getElementById('cart-subtotal');
  const totalElem = document.getElementById('cart-total');

  if (!tbody) return;

  tbody.innerHTML = '';
  let subtotal = 0;

  if (cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">Your cart is currently empty.</td></tr>`;
    if (subtotalElem) subtotalElem.innerText = '$0.00';
    if (totalElem) totalElem.innerText = '$0.00';
    return;
  }

  cart.forEach((item, index) => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td><input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${index}, this.value)" style="width: 50px; text-align: center;"></td>
      <td>$${itemSubtotal.toFixed(2)}</td>
      <td><button class="btn" style="background-color: #d9534f; padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="removeFromCart(${index})">Remove</button></td>
    `;
    tbody.appendChild(row);
  });

  if (subtotalElem) subtotalElem.innerText = '$' + subtotal.toFixed(2);
  const shipping = subtotal > 0 ? 5.00 : 0.00;
  if (totalElem) totalElem.innerText = '$' + (subtotal + shipping).toFixed(2);
}


function updateQuantity(index, quantity) {
  const qty = parseInt(quantity);
  if (qty > 0) {
    cart[index].quantity = qty;
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
  }
}


function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
  updateCartCount();
}


document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  setupFeaturedSlider();

  const whatsappChat = document.createElement('a');
  whatsappChat.className = 'whatsapp-chat';
  whatsappChat.href = 'https://wa.me/959260070066?text=Hello%20Bean%20Boutique%2C%20I%20have%20a%20question.';
  whatsappChat.target = '_blank';
  whatsappChat.rel = 'noopener noreferrer';
  whatsappChat.setAttribute('aria-label', 'Chat with Bean Boutique on WhatsApp');
  whatsappChat.innerHTML = '<span class="whatsapp-chat-mark" aria-hidden="true">WA</span><span>WhatsApp Chat</span>';
  document.body.appendChild(whatsappChat);

  if (document.getElementById('cart-item-rows')) {
    displayCart();
  }

  const checkoutButton = document.getElementById('checkout-button');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your cart is already empty.');
        return;
      }

      cart = [];
      localStorage.removeItem('cart');
      displayCart();
      updateCartCount();
      alert('Your cart has been cleared.');
    });
  }
});


function setupFeaturedSlider() {
  const slider = document.getElementById('featured-products-slider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.featured-slide'));
  const indicators = Array.from(document.querySelectorAll('.featured-slider-indicator'));
  const previousButton = document.querySelector('[data-slider-direction="previous"]');
  const nextButton = document.querySelector('[data-slider-direction="next"]');
  const autoSlideToggle = document.querySelector('[data-slider-toggle]');
  const sliderRegion = slider.closest('.featured-products') || slider;
  if (slides.length === 0) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeIndex = 0;
  let autoSlideTimer;
  let userPaused = false;

  const updateIndicators = () => {
    indicators.forEach((indicator, index) => {
      const isActive = index === activeIndex;
      indicator.classList.toggle('active', isActive);
      if (isActive) {
        indicator.setAttribute('aria-current', 'true');
      } else {
        indicator.removeAttribute('aria-current');
      }
    });
  };

  const updateActiveSlide = () => {
    const sliderLeft = slider.getBoundingClientRect().left;
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 2) {
      nearestIndex = slides.length - 1;
    } else {
      slides.forEach((slide, index) => {
        const distance = Math.abs(slide.getBoundingClientRect().left - sliderLeft);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
    }

    activeIndex = nearestIndex;
    updateIndicators();
  };

  const goToSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    const sliderLeft = slider.getBoundingClientRect().left;
    const slideLeft = slides[activeIndex].getBoundingClientRect().left;
    const scrollLeft = slider.scrollLeft + slideLeft - sliderLeft;
    updateIndicators();
    slider.scrollTo({ left: scrollLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const stopAutoSlide = () => {
    clearInterval(autoSlideTimer);
  };

  const startAutoSlide = (force = false) => {
    const hasHover = window.matchMedia('(hover: hover)').matches;
    const isInteracting = (hasHover && sliderRegion.matches(':hover')) || sliderRegion.contains(document.activeElement);
    if (reduceMotion || document.hidden || userPaused || (isInteracting && !force)) return;
    stopAutoSlide();
    autoSlideTimer = setInterval(() => goToSlide(activeIndex + 1), 5000);
  };

  if (previousButton) {
    previousButton.addEventListener('click', () => goToSlide(activeIndex - 1));
  }
  if (nextButton) {
    nextButton.addEventListener('click', () => goToSlide(activeIndex + 1));
  }
  if (autoSlideToggle) {
    if (reduceMotion) {
      autoSlideToggle.textContent = 'Auto-slide off';
      autoSlideToggle.disabled = true;
      autoSlideToggle.setAttribute('aria-label', 'Automatic slides are disabled by your reduced-motion setting');
    } else {
      autoSlideToggle.addEventListener('click', () => {
        userPaused = !userPaused;
        autoSlideToggle.textContent = userPaused ? 'Play' : 'Pause';
        autoSlideToggle.setAttribute('aria-pressed', String(userPaused));
        if (userPaused) {
          stopAutoSlide();
        } else {
          startAutoSlide(true);
        }
      });
    }
  }
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => goToSlide(index));
  });
  slider.addEventListener('scroll', updateActiveSlide, { passive: true });
  sliderRegion.addEventListener('mouseenter', stopAutoSlide);
  sliderRegion.addEventListener('mouseleave', startAutoSlide);
  sliderRegion.addEventListener('focusin', stopAutoSlide);
  sliderRegion.addEventListener('focusout', (event) => {
    if (!sliderRegion.contains(event.relatedTarget)) startAutoSlide();
  });
  sliderRegion.addEventListener('touchstart', stopAutoSlide, { passive: true });
  sliderRegion.addEventListener('touchend', startAutoSlide, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoSlide();
    } else {
      startAutoSlide();
    }
  });
  startAutoSlide();
}


function startCountdown() {
  
  const countDownDate = new Date().getTime() + (3 * 24 * 60 * 60 * 1000); 

  const timer = setInterval(function() {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    if (distance < 0) {
      clearInterval(timer);
      document.getElementById("days").innerText = "00";
      document.getElementById("hours").innerText = "00";
      document.getElementById("minutes").innerText = "00";
      document.getElementById("seconds").innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    
    const daysElem = document.getElementById("days");
    const hoursElem = document.getElementById("hours");
    const minutesElem = document.getElementById("minutes");
    const secondsElem = document.getElementById("seconds");

    if (daysElem) daysElem.innerText = String(days).padStart(2, '0');
    if (hoursElem) hoursElem.innerText = String(hours).padStart(2, '0');
    if (minutesElem) minutesElem.innerText = String(minutes).padStart(2, '0');
    if (secondsElem) secondsElem.innerText = String(seconds).padStart(2, '0');

  }, 1000);
}


document.addEventListener('DOMContentLoaded', () => {
  startCountdown();
});


function setupLiveSearch() {
  const searchInput = document.getElementById('searchInput');
  
  if (!searchInput) return;

  searchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
      const title = card.querySelector('h3') ? card.querySelector('h3').innerText.toLowerCase() : '';
      const notes = card.querySelector('.notes') ? card.querySelector('.notes').innerText.toLowerCase() : '';

      if (title.includes(searchTerm) || notes.includes(searchTerm)) {
        card.style.display = 'block';
        card.style.display = 'none';  
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupLiveSearch();

  const discountModal = document.getElementById('discountModal');
  const closeModalButton = document.getElementById('closeModal');
  const subscribeForm = document.getElementById('subscribeForm');
  const eventRegistrationForm = document.getElementById('event-registration-form');

  if (eventRegistrationForm) {
    eventRegistrationForm.addEventListener('submit', () => {
      setTimeout(() => eventRegistrationForm.reset(), 0);
    });
  }

  if (discountModal && !localStorage.getItem('beanBoutiqueDiscountSeen')) {
    setTimeout(() => {
      discountModal.classList.add('open');
    }, 800);
  }

  if (closeModalButton && discountModal) {
    closeModalButton.addEventListener('click', () => {
      discountModal.classList.remove('open');
      localStorage.setItem('beanBoutiqueDiscountSeen', 'true');
    });

    discountModal.addEventListener('click', (event) => {
      if (event.target === discountModal) {
        discountModal.classList.remove('open');
        localStorage.setItem('beanBoutiqueDiscountSeen', 'true');
      }
    });
  }

  if (subscribeForm && discountModal) {
    subscribeForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const emailInput = subscribeForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.checkValidity()) {
        localStorage.setItem('beanBoutiqueDiscountSeen', 'true');
        discountModal.classList.remove('open');
        alert('Thanks! Your 10% welcome code is on its way to your inbox.');
      }
    });
  }

  if (typeof L !== 'undefined' && document.getElementById('map')) {
    const beanBoutiqueCoords = [16.8661, 96.1951];
    const map = L.map('map', { scrollWheelZoom: false }).setView(beanBoutiqueCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker(beanBoutiqueCoords)
      .addTo(map)
      .bindPopup('Bean Boutique Coffee Shop')
      .openPopup();
  }
});


function filterCoffee() {
  const input = document.getElementById('coffeeSearch');
  if (!input) return;

  const filter = input.value.toLowerCase().trim();
  
  
  const items = document.querySelectorAll('.product-card, .coffee-item, article');

  items.forEach(item => {
    const text = item.textContent || item.innerText;
    if (text.toLowerCase().indexOf(filter) > -1) {
      item.style.display = ""; 
    } else {
      item.style.display = "none";
    }
  });
}
