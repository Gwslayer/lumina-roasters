export function initForm() {
  const reservationForm = document.querySelector('.reservation-form');
  const popupOverlay = document.getElementById('reservation-popup');
  const closePopupBtn = document.getElementById('close-popup');

  // Abort safely if the current page doesn't have a form
  if (!reservationForm || !popupOverlay) return;

  reservationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = reservationForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = 'Securing Table...';
    submitBtn.disabled = true;

    const formData = new FormData(reservationForm);
    const formObject = Object.fromEntries(formData);

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(formObject)
    })
      .then(async (res) => {
        const responseData = await res.json().catch(() => null);
        console.log("Server Response:", res.status, responseData);

        if (res.status === 200) {
          popupOverlay.classList.add('active');
          popupOverlay.setAttribute('aria-hidden', 'false');
          reservationForm.reset();
        } else if (res.status === 404) {
          alert("Error 404: /api/submit not found. If testing locally, ensure you are using 'vercel dev', not Live Server.");
        } else {
          alert(`Something went wrong: ${responseData?.message || responseData?.error || 'Please check fields and resubmit.'}`);
        }
      })
      .catch((err) => {
        console.error("Pipeline error:", err);
        alert("A system network error occurred. Please test your internet link.");
      })
      .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      });
  });

  if (closePopupBtn) {
    closePopupBtn.addEventListener('click', () => {
      popupOverlay.classList.remove('active');
      popupOverlay.setAttribute('aria-hidden', 'true');
    });
  }

  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) {
      popupOverlay.classList.remove('active');
      popupOverlay.setAttribute('aria-hidden', 'true');
    }
  });
}