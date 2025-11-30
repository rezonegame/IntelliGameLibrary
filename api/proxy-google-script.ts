// This file is NOT part of the Angular app.
// It's a Node.js serverless function that Vercel will deploy.

// This function acts as a proxy to the Google Apps Script webhook to avoid client-side CORS issues.
// CORS policy is managed globally by the `vercel.json` file.
export default async function handler(request, response) {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwghD1EpYuGmAHFty2gDHKGXJ0H4AEQ85KKB2EqO69SJEdh980yqqbVToZK4nItRwRV/exec';

  try {
    const { action } = request.query;
    if (!action) {
      return response.status(400).json({ error: 'Action parameter is required' });
    }

    const targetUrl = `${SCRIPT_URL}?action=${action}`;
    
    const fetchOptions: RequestInit = {
      method: request.method,
      redirect: 'follow', // Important for Google Apps Script POST requests
      headers: {
        'Content-Type': 'application/json',
      },
      // Vercel automatically parses the body for POST/PUT/etc.
      // We only forward it if it exists.
      body: request.body ? JSON.stringify(request.body) : undefined,
    };

    const scriptResponse = await fetch(targetUrl, fetchOptions);
    
    if (!scriptResponse.ok) {
        const errorText = await scriptResponse.text();
        console.error(`Google Script responded with status: ${scriptResponse.status}`, errorText);
        throw new Error(`Google Script responded with status: ${scriptResponse.status}`);
    }

    // Google Apps Script can return non-JSON on error (e.g., HTML).
    // We must check the content type before attempting to parse.
    const contentType = scriptResponse.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const data = await scriptResponse.json();
        return response.status(200).json(data);
    } else {
        const textData = await scriptResponse.text();
        console.error('Received non-JSON response from Google Script:', textData);
        throw new Error('Received a non-JSON response from the Google Script backend.');
    }

  } catch (error) {
    console.error('Google Script Proxy Error:', error);
    return response.status(500).json({ error: 'The proxy server encountered an error while contacting the Google Script.' });
  }
}
