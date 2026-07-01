import { Link } from 'react-router-dom';

export default function Cancel() {
  return (
    <div className="status-page panel cancel-panel">
      <h2>Payment Canceled</h2>
      <p>Your transaction was canceled. Your ad has not been published.</p>
      <Link to="/" className="btn">Return to form</Link>
    </div>
  );
}
