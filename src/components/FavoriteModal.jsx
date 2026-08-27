import { useRef, useState } from 'react';
import { capitalize } from '../utils/textUtils';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

function FavoriteModal({ pokemon, appearance, image, existingFavorite, onClose, onSave }) {
  const [priority, setPriority] = useState(existingFavorite?.priority || 1);
  const [tag, setTag] = useState(existingFavorite?.tag || '');
  const [note, setNote] = useState(existingFavorite?.note || '');
  const [errors, setErrors] = useState({});
  const tagInputRef = useRef(null);
  const modalRef = useRef(null);
  useModalAccessibility(modalRef, tagInputRef, onClose);

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    const numericPriority = Number(priority);

    if (!Number.isInteger(numericPriority) || numericPriority <= 0) {
      nextErrors.priority = 'Priority must be a whole number greater than 0.';
    }
    if (!tag.trim()) nextErrors.tag = 'Please enter a custom tag.';
    if (note.length > 200) nextErrors.note = 'The note cannot exceed 200 characters.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({ priority: numericPriority, tag: tag.trim(), note: note.trim() });
  }

  const appearanceLabel = appearance
    .replace(/^form:/, '')
    .replace(/:shiny$/, '-shiny')
    .split('-')
    .map(capitalize)
    .join(' ');

  return (
    <div className="favorite-modal-backdrop" onMouseDown={onClose}>
      <section
        className="favorite-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="favorite-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="favorite-modal-close"
          onClick={onClose}
          aria-label="Close favorites form"
        >
          ×
        </button>

        <div className="favorite-modal-heading">
          <img src={image} alt="" />
          <div>
            <small>{appearanceLabel} appearance</small>
            <h2 id="favorite-modal-title">
              {existingFavorite ? 'Edit' : 'Add'} {capitalize(pokemon.name)}
            </h2>
          </div>
          {appearance.includes('shiny') && <span className="favorite-shiny-tag">✦ SHINY</span>}
        </div>

        <form className="favorite-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="favorite-priority">Priority *</label>
          <input
            id="favorite-priority"
            type="number"
            min="1"
            step="1"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            aria-describedby={`priority-help${errors.priority ? ' priority-error' : ''}`}
            aria-invalid={Boolean(errors.priority)}
            required
          />
          <small className="field-help" id="priority-help">
            1 = highest priority. Higher numbers appear later in your favorites.
          </small>
          {errors.priority && <p className="field-error" id="priority-error">{errors.priority}</p>}

          <label htmlFor="favorite-tag">Custom tag *</label>
          <input
            ref={tagInputRef}
            id="favorite-tag"
            type="text"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            placeholder="Example: My competitive team"
            aria-describedby={errors.tag ? 'tag-error' : undefined}
            aria-invalid={Boolean(errors.tag)}
            required
          />
          {errors.tag && <p className="field-error" id="tag-error">{errors.tag}</p>}

          <div className="favorite-note-label">
            <label htmlFor="favorite-note">Personal note</label>
            <small>{note.length}/200</small>
          </div>
          <textarea
            id="favorite-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength="200"
            rows="4"
            placeholder="Why is this Pokémon one of your favorites?"
            aria-describedby={errors.note ? 'note-error' : undefined}
            aria-invalid={Boolean(errors.note)}
          />
          {errors.note && <p className="field-error" id="note-error">{errors.note}</p>}

          <div className="favorite-form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save favorite</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default FavoriteModal;
