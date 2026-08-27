import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <p className="not-found-code">404</p>
      <h2 id="not-found-title">Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Back to home</Link>
    </section>
  );
}

export default NotFound;
