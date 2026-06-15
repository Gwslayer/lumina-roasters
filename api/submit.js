import https from 'https';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Blocked non-POST request');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Add a check for the environment variable itself
  if (!process.env.WEB3FORMS_ACCESS_KEY) {
    console.error('SERVER ERROR: WEB3FORMS_ACCESS_KEY is not set in environment variables.');
    return res.status(500).json({ error: 'Server configuration error: Missing API key.' });
  }

  // Wrap the entire native HTTP request in a Promise so Vercel doesn't close the connection early
  return new Promise((resolve) => {
    // Ensure the body is treated as a JavaScript object
    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // If parsing fails, it's probably not JSON. Log it and continue with an empty object.
        console.warn('Could not parse request body as JSON. Body was:', body);
        body = {};
      }
    }
    console.log('Received form body:', body);

    // 1. Build the payload securely
    const payload = JSON.stringify({
      ...body,
      access_key: process.env.WEB3FORMS_ACCESS_KEY
    });
    console.log('Sending payload to Web3Forms:', payload);


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
        console.log('Response from Web3Forms Status:', response.statusCode);
        console.log('Response from Web3Forms Body:', data);

        try {
          const jsonResponse = JSON.parse(data);
          // Forward the status and body from Web3Forms to the client
          resolve(res.status(response.statusCode).json(jsonResponse));
        } catch (e) {
          console.error('Failed to parse JSON response from Web3Forms:', e);
          // Send a specific error if Web3Forms returned non-JSON
          resolve(res.status(502).json({ error: 'Bad Gateway: Invalid response from upstream server.' }));
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