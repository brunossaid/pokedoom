import { useState } from 'react';

const INITIAL_FORM = { name: '', email: '', message: '' };

function Contact() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
    setSent(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (form.name.trim().length < 2) {
      nextErrors.name = 'Please enter at least 2 characters.';
    }
    if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (form.message.trim().length < 10) {
      nextErrors.message = 'Please enter at least 10 characters.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setForm(INITIAL_FORM);
    setSent(true);
  }

  return (
    <section className="contact-page" aria-labelledby="contact-title">
      <header className="contact-heading">
        <small>TRAINER SUPPORT</small>
        <h2 id="contact-title">Send us a message</h2>
        <p>Have a suggestion or found a problem in the Pokédex? Let us know.</p>
      </header>

      <div className="contact-layout">
        <div className="contact-form-panel">
          {sent && (
            <div className="contact-success" role="status">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>Message ready!</strong>
                <p>
                  This demo has no backend, so no information was transmitted.
                </p>
              </div>
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="contact-name">Name *</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={updateField}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
              placeholder="Ash Ketchum"
              required
            />
            {errors.name && (
              <p className="field-error" id="contact-name-error">
                {errors.name}
              </p>
            )}

            <label htmlFor="contact-email">Email *</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={updateField}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? 'contact-email-error' : undefined
              }
              placeholder="trainer@example.com"
              required
            />
            {errors.email && (
              <p className="field-error" id="contact-email-error">
                {errors.email}
              </p>
            )}

            <div className="contact-message-label">
              <label htmlFor="contact-message">Message *</label>
              <small>{form.message.length}/500</small>
            </div>
            <textarea
              id="contact-message"
              name="message"
              value={form.message}
              onChange={updateField}
              maxLength="500"
              rows="7"
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message
                  ? 'contact-message-error'
                  : 'contact-message-help'
              }
              placeholder="Write your message here..."
              required
            />
            <small className="field-help" id="contact-message-help">
              Minimum 10 characters.
            </small>
            {errors.message && (
              <p className="field-error" id="contact-message-error">
                {errors.message}
              </p>
            )}

            <button type="submit" className="contact-submit">
              Send message
            </button>
          </form>
        </div>

        <aside className="contact-location" aria-labelledby="location-title">
          <div className="developer-details">
            <small>DEVELOPMENT TEAM</small>
            <h3>PokeDoom Studio</h3>
            <address>
              <div>
                <strong>Agustín Cabeda</strong>
                <a href="mailto:cabeda52@gmail.com">cabeda52@gmail.com</a>
              </div>
              <div>
                <strong>Bruno Said</strong>
                <a href="mailto:ibrunosaid@gmail.com">ibrunosaid@gmail.com</a>
              </div>
            </address>
          </div>

          <div className="contact-location-copy">
            <span aria-hidden="true">⌖</span>
            <div>
              <small>OUR LOCATION</small>
              <h3 id="location-title">Cathedral of La Plata</h3>
            </div>
          </div>
          <div className="contact-map">
            <iframe
              title="Map showing the Cathedral of La Plata, Argentina"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-57.9736%2C-34.9365%2C-57.9336%2C-34.9065&amp;layer=mapnik&amp;marker=-34.9215%2C-57.9536"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <a
            href="https://www.openstreetmap.org/?mlat=-34.9215&amp;mlon=-57.9536#map=16/-34.9215/-57.9536"
            target="_blank"
            rel="noreferrer"
          >
            Open larger map ↗
          </a>
        </aside>
      </div>
    </section>
  );
}

export default Contact;
