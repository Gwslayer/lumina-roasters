import https from 'https';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Wrap the entire native HTTP request in a Promise so Vercel doesn't close the connection early
  return new Promise((resolve) => {
    // 1. Build the payload securely
    const payload = JSON.stringify({
      access_key: process.env.WEB3FORMS_ACCESS_KEY,
      ...req.body
    });

    // 2. Configure the low-level network routing
    const options = {
      hostname: 'api.web3forms.com',
      path: '/submit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    // 3. Open the transmission stream
    const request = https.request(options, (response) => {
      let data = '';

      // Catch the data as it streams back in pieces
      response.on('data', (chunk) => {
        data += chunk;
      });

      // When the stream finishes, send it to the frontend
      response.on('end', () => {
        try {
          const jsonResponse = JSON.parse(data);
          resolve(res.status(response.statusCode).json(jsonResponse));
        } catch (e) {
          resolve(res.status(500).json({ error: 'Failed to parse response' }));
        }
      });
    });

    // 4. If the physical network fails, catch the error cleanly
    request.on('error', (error) => {
      console.error("Native Node HTTPS Error:", error);
      // We send back valid JSON here, which prevents that "Unexpected token I" error!
      resolve(res.status(500).json({ error: 'Network failure', details: error.message }));
    });

    // 5. Fire the payload and close the outgoing stream
    request.write(payload);
    request.end();
  });
}