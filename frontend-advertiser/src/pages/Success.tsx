import { Link, useSearchParams } from 'react-router-dom';

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="status-page panel success-panel">
      <h2>Payment Successful!</h2>
      <p>Your Ad has been submitted and is now active.</p>
      {sessionId && <p className="session-id">Order ID: {sessionId}</p>}
      <Link to="/" className="btn">Create Another Ad</Link>
    </div>
  );
}
