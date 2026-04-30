const secretBankCode = process.env.CB_SECRET_KEY;
const cbBaseApiUrl = process.env.CB_API_BASE_URL;
const bic = process.env.BIC;
let token = null;
let tokenPromise = null;

async function getToken(forceRefresh = false) {
  if (token && !forceRefresh) {
    return token;
  }

  if (tokenPromise && !forceRefresh) {
    return tokenPromise;
  }

  tokenPromise = (async () => {
    const response = await fetch(`${cbBaseApiUrl}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bic: bic,
        secret_key: secretBankCode,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token fetch failed: ${response.status}`);
    }

    const result = await response.json();
    token = result.token;

    return token;
  })();

  tokenPromise.finally(() => {
    tokenPromise = null;
  });

  return tokenPromise;
}

export async function request(path, options = {}, isRetry = false) {
  // If its a retry due to 401, the token should be force refreshed
  const token = await getToken(isRetry);

  const res = await fetch(`${cbBaseApiUrl}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!isRetry && res.status === 401) {
    return await request(path, options, true);
  }

  return res;
}
