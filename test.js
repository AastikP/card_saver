// Registration function
async function startRegistration() {
  const response = await fetch('https://card-saver-blue.vercel.app/generate-registration-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: "exampleUser" })
  });
  const options = await response.json();

  // Use these options with SimpleWebAuthn's `startRegistration` function
  const attResp = await SimpleWebAuthn.startRegistration(options);

  // Send response to server to verify
  const verificationResponse = await fetch('https://card-saver-blue.vercel.app/verify-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: "exampleUser", response: attResp })
  });

  const verificationJSON = await verificationResponse.json();
  if (verificationJSON.verified) {
    alert('Registration successful!');
  } else {
    alert('Registration failed.');
  }
}

// Authentication function
async function startAuthentication() {
  const response = await fetch('https://card-saver-blue.vercel.app/generate-authentication-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: "exampleUser" })
  });
  const options = await response.json();

  // Use SimpleWebAuthn's `startAuthentication` function
  const authResp = await SimpleWebAuthn.startAuthentication(options);

  // Send the response to the server to verify
  const verificationResponse = await fetch('https://card-saver-blue.vercel.app/verify-authentication', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: "exampleUser", response: authResp })
  });

  const verificationJSON = await verificationResponse.json();
  if (verificationJSON.verified) {
    alert('Login successful!');
  } else {
    alert('Login failed.');
  }
}
