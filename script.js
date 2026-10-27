/* ==========================================================================
   NANBAN CATERING - COMPLETE INTERACTIVE JAVASCRIPT
   Handles Mobile Navigation, Live Budget Calculator, & WhatsApp Bookings
   ========================================================================== */

// Global State for Calculator
let currentEventType = 'Wedding';

// Base Package Rates (in INR per plate)
const basePrices = {
  tiffin: 110,
  lunch: 130,
  dinner: 130,
  fullday: 360
};

/**
 * Initialize all event listeners and default states on DOM load
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Set dynamic current year in the footer
  const yearElem = document.getElementById('currentYear');
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }

  // 2. Setup Mobile Navigation Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile drawer automatically when a link is clicked
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // 3. Sticky Header Shadow Enhancement on Scroll
  const mainHeader = document.getElementById('mainHeader');
  if (mainHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        mainHeader.classList.add('shadow-md');
      } else {
        mainHeader.classList.remove('shadow-md');
      }
    });
  }

  // 4. Set minimum selectable date in Booking Form to Today
  const eventDateInput = document.getElementById('eventDate');
  if (eventDateInput) {
    const today = new Date().toISOString().split('T')[0];
    eventDateInput.setAttribute('min', today);
  }

  // 5. Run initial calculation on page load
  setEventType('Wedding');
  calculateCost();
});

/**
 * Updates the active occasion / event type in the Budget Calculator
 * @param {string} type - The selected occasion ('Wedding', 'Birthday', etc.)
 */
function setEventType(type) {
  currentEventType = type;

  // Update visual button states
  document.querySelectorAll('.event-type-btn').forEach(btn => {
    if (btn.dataset.type === type) {
      btn.classList.add('border-brand-orange', 'bg-orange-950/60', 'text-amber-300', 'active-btn');
      btn.classList.remove('border-stone-600', 'bg-stone-700/50');
    } else {
      btn.classList.remove('border-brand-orange', 'bg-orange-950/60', 'text-amber-300', 'active-btn');
      btn.classList.add('border-stone-600', 'bg-stone-700/50');
    }
  });

  // Update summary text
  const summaryEvent = document.getElementById('summaryEvent');
  if (summaryEvent) {
    summaryEvent.textContent = type;
  }

  calculateCost();
}

/**
 * Synchronizes the Guest Count slider and number input box
 * @param {number|string} val - Number of guests
 */
function syncGuests(val) {
  let count = parseInt(val, 10);
  if (isNaN(count) || count < 20) {
    count = 20;
  } else if (count > 3000) {
    count = 3000;
  }

  const guestRange = document.getElementById('guestRange');
  const guestCountInput = document.getElementById('guestCountInput');

  if (guestRange) guestRange.value = Math.min(count, 1500); // Slider max is 1500
  if (guestCountInput) guestCountInput.value = count;

  calculateCost();
}

/**
 * Calculates per-plate and grand total catering costs based on user selections
 */
function calculateCost() {
  // 1. Get Selected Meal Arrangement
  const selectedMealElem = document.querySelector('input[name="mealChoice"]:checked');
  const mealKey = selectedMealElem ? selectedMealElem.value : 'lunch';
  const basePerPlate = basePrices[mealKey] || 130;

  // 2. Get Expected Guest Count
  const guestInput = document.getElementById('guestCountInput');
  const guests = guestInput ? (parseInt(guestInput.value, 10) || 150) : 150;

  // 3. Calculate Optional Add-on Stalls
  let addonsPerPlate = 0;
  const addonFruitSalad = document.getElementById('addonFilterCoffee');
  const addonPopcorn = document.getElementById('addonLiveSweet');
  const addonIcecream = document.getElementById('addonIcecream');

  if (addonFruitSalad && addonFruitSalad.checked) {
    addonsPerPlate += parseInt(addonFruitSalad.value, 10) || 20;
  }
  if (addonPopcorn && addonPopcorn.checked) {
    addonsPerPlate += parseInt(addonPopcorn.value, 10) || 30;
  }
  if (addonIcecream && addonIcecream.checked) {
    addonsPerPlate += parseInt(addonIcecream.value, 10) || 25;
  }

  // 4. Compute Totals
  const totalPerPlate = basePerPlate + addonsPerPlate;
  const totalBudget = totalPerPlate * guests;

  // 5. Update Estimate Summary DOM Elements
  const summaryGuests = document.getElementById('summaryGuests');
  const summaryRate = document.getElementById('summaryRate');
  const summaryAddons = document.getElementById('summaryAddons');
  const summaryTotalPerPlate = document.getElementById('summaryTotalPerPlate');
  const summaryTotalCost = document.getElementById('summaryTotalCost');

  if (summaryGuests) summaryGuests.textContent = `${guests} Guests`;
  if (summaryRate) summaryRate.textContent = `₹${basePerPlate}`;
  if (summaryAddons) summaryAddons.textContent = `₹${addonsPerPlate}`;
  if (summaryTotalPerPlate) summaryTotalPerPlate.textContent = `₹${totalPerPlate} / plate`;
  if (summaryTotalCost) summaryTotalCost.textContent = `₹${totalBudget.toLocaleString('en-IN')}`;
}

/**
 * Pre-selects a meal package from the Specialties cards and scrolls to the calculator
 * @param {string} mealType - 'tiffin', 'lunch', or 'dinner'
 */
function selectPackageForCalc(mealType) {
  const radio = document.querySelector(`input[name="mealChoice"][value="${mealType}"]`);
  if (radio) {
    radio.checked = true;
  }
  calculateCost();

  const calcSection = document.getElementById('calculator');
  if (calcSection) {
    calcSection.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Formats the current calculator estimate and opens a WhatsApp chat with the proprietor
 */
function enquireCurrentPackage() {
  const guestInput = document.getElementById('guestCountInput');
  const guests = guestInput ? guestInput.value : '150';

  const selectedMealElem = document.querySelector('input[name="mealChoice"]:checked');
  const selectedMeal = selectedMealElem ? selectedMealElem.value.toUpperCase() : 'LUNCH';

  const totalCostElem = document.getElementById('summaryTotalCost');
  const totalCost = totalCostElem ? totalCostElem.textContent : '₹24,000';

  // Gather active add-ons
  const activeAddons = [];
  if (document.getElementById('addonFilterCoffee')?.checked) activeAddons.push('Fruit Salad');
  if (document.getElementById('addonLiveSweet')?.checked) activeAddons.push('Live Popcorn Counter');
  if (document.getElementById('addonIcecream')?.checked) activeAddons.push('Dessert & Ice Cream');
  if (document.getElementById('addonBananaLeaf')?.checked) activeAddons.push('Banana Leaf & Water Bottle');

  const addonsText = activeAddons.length > 0 ? activeAddons.join(', ') : 'None';

  const message = `Vanakkam Nanban Catering! I am looking for a catering quote in Rasipuram/Nearby:%0A%0A` +
                  `• *Occasion:* ${currentEventType}%0A` +
                  `• *Meal Plan:* ${selectedMeal}%0A` +
                  `• *Expected Guests:* ${guests} Pax%0A` +
                  `• *Add-ons:* ${addonsText}%0A` +
                  `• *Estimated Budget:* ${totalCost}%0A%0A` +
                  `Please share the full menu items and date availability.`;

  window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
}

/**
 * Handles the online booking form submission without page reload
 * @param {Event} e - Form submit event
 */
function handleFormSubmit(e) {
  e.preventDefault();

  const successDiv = document.getElementById('formSuccessMessage');
  const form = document.getElementById('cateringForm');

  if (successDiv) {
    successDiv.classList.remove('hidden');

    // Automatically hide the confirmation alert after 8 seconds
    setTimeout(() => {
      successDiv.classList.add('hidden');
    }, 8000);
  }

  if (form) {
    form.reset();
  }
}

/**
 * Reads customer inputs from the Contact Form and sends a structured booking request via WhatsApp
 */
function sendViaWhatsApp() {
  const name = document.getElementById('custName')?.value.trim() || 'Customer';
  const phone = document.getElementById('custPhone')?.value.trim() || 'Not specified';
  const date = document.getElementById('eventDate')?.value || 'To be decided';
  const guests = document.getElementById('eventGuestCount')?.value || '100';
  const meal = document.getElementById('mealPref')?.value || 'Grand Lunch Virundhu';
  const location = document.getElementById('eventLocation')?.value.trim() || 'Rasipuram';
  const notes = document.getElementById('specialNotes')?.value.trim() || '';

  const message = `Vanakkam Nanban Catering! New Catering Enquiry:%0A%0A` +
                  `👤 *Name:* ${name}%0A` +
                  `📞 *Phone:* ${phone}%0A` +
                  `📅 *Event Date:* ${date}%0A` +
                  `👥 *Guests:* ${guests} pax%0A` +
                  `🍽️ *Meal Required:* ${meal}%0A` +
                  `📍 *Location:* ${location}%0A` +
                  (notes ? `📝 *Special Notes:* ${notes}%0A` : '') +
                  `%0APlease let me know your availability and sample menu.`;

  window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
}