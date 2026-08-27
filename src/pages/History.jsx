import { useState } from 'react';
import { Link } from 'react-router-dom';
import { capitalize } from '../utils/textUtils';
import ConfirmModal from '../components/ConfirmModal';
import Pagination from '../components/Pagination';
import { useHistory } from '../hooks/useHistory';

const HISTORY_PER_PAGE = 10;

function formatViewedAt(date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

function History() {
  const { history, clearHistory: clearStoredHistory } = useHistory();
  const [page, setPage] = useState(1);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const totalPages = Math.max(1, Math.ceil(history.length / HISTORY_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const historyToShow = history.slice(
    (currentPage - 1) * HISTORY_PER_PAGE,
    currentPage * HISTORY_PER_PAGE
  );

  function clearHistory() {
    clearStoredHistory();
    setPage(1);
    setShowClearConfirmation(false);
  }

  return (
    <section className="history-page" aria-labelledby="history-title">
      <header className="history-heading">
        <div>
          <div>
            <h2 id="history-title">Viewing history</h2>
            <p>Your 100 most recently viewed Pokémon appear first.</p>
          </div>
          {history.length > 0 && (
            <button type="button" onClick={() => setShowClearConfirmation(true)}>
              Clear history
            </button>
          )}
        </div>
      </header>

      {history.length === 0 ? (
        <div className="history-empty">
          <span aria-hidden="true">◷</span>
          <h3>Your history is empty</h3>
          <p>Pokémon you view will appear here automatically.</p>
          <Link to="/pokedex">Explore Pokédex</Link>
        </div>
      ) : (
        <ol className="history-list">
          {historyToShow.map((entry) => (
            <li key={entry.id}>
              <Link
                className="history-card"
                to={`/pokemon/${entry.name}`}
                state={{ returnTo: '/history' }}
              >
                <img src={entry.image} alt="" />
                <div>
                  <small>#{entry.pokemonId}</small>
                  <h3>{capitalize(entry.name)}</h3>
                  <time dateTime={entry.viewedAt}>
                    Viewed {formatViewedAt(entry.viewedAt)}
                  </time>
                </div>
                <span aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {history.length > 0 && (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onChange={setPage}
          label="Viewing history pagination"
        />
      )}

      {showClearConfirmation && (
        <ConfirmModal
          title="Clear viewing history?"
          message="All viewed Pokémon will be removed. This action cannot be undone."
          confirmLabel="Clear history"
          onCancel={() => setShowClearConfirmation(false)}
          onConfirm={clearHistory}
        />
      )}
    </section>
  );
}

export default History;
