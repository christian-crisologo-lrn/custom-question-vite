const DEFAULT_SERVER_PORTS = [3004, 3005, 3006, 3007, 3008, 3009, 3010];
let resolvedServerBaseUrl = null;

function getServerBaseUrls() {
  if (typeof window !== 'undefined') {
    const explicitPort = Number.parseInt(new URLSearchParams(window.location.search).get('serverPort') || '', 10);

    if (Number.isInteger(explicitPort) && explicitPort > 0) {
      return [`http://localhost:${explicitPort}`];
    }
  }

  return DEFAULT_SERVER_PORTS.map((port) => `http://localhost:${port}`);
}

async function findWorkingServerBaseUrl() {
  if (resolvedServerBaseUrl) {
    return resolvedServerBaseUrl;
  }

  for (const baseUrl of getServerBaseUrls()) {
    try {
      const response = await fetch(`${baseUrl}/sign-learnosity-request`, {
        method: 'OPTIONS',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.status === 404 || response.status === 405 || response.status === 200 || response.status === 204) {
        resolvedServerBaseUrl = baseUrl;
        return baseUrl;
      }
    } catch (error) {
      // ignore and try the next port
    }
  }

  resolvedServerBaseUrl = 'http://localhost:3004';
  return resolvedServerBaseUrl;
}

export async function signLearnosityRequest(assessment) {
  const serverBaseUrl = await findWorkingServerBaseUrl();
  const payload = {
    ...JSON.parse(JSON.stringify(assessment)),
    session_id: crypto.randomUUID(),
  };

  const response = await fetch(`${serverBaseUrl}/sign-learnosity-request`, {
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
