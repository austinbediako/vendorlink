import { Link } from 'react-router-dom';
import { NotFoundIllustration } from '../components/VisualAssets';

export function NotFound() {
  return (
    <div className="not-found-page">
      <NotFoundIllustration className="not-found-art" />
      <p className="market-kicker">Error 404</p>
      <h1>This page went off the map.</h1>
      <p>
        The link may be out of date or the page may have moved. Head back to familiar ground.
      </p>
      <div className="not-found-actions">
        <Link to="/" className="btn btn-primary">Back to home</Link>
        <Link to="/artisans" className="btn btn-ghost">Browse artisans</Link>
      </div>
    </div>
  );
}
