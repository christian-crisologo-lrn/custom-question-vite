const SERVER_BASE_URL = 'http://localhost:3004';

export async function signLearnosityRequest(assessment) {
  const payload = {
    ...JSON.parse(JSON.stringify(assessment)),
    session_id: crypto.randomUUID(),
  };

  const response = await fetch(`${SERVER_BASE_URL}/sign-learnosity-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to sign Learnosity request: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
