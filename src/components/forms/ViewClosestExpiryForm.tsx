import { useState } from 'react';


export default function ViewClosestExpiryForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Call the correct API endpoint for closest expiry
      const response = await fetch('/api/view-expiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      // Handle any errors from the webhook call
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Processing...' : 'View Closest Expiry'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {result && (
        <div>
          {/* Display the result of the webhook call */}
          <h4>Closest Expiry Product:</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
