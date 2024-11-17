const express = require('express');
const cors = require('cors'); // Import CORS middleware
const { 
  generateRegistrationOptions, 
  verifyRegistrationResponse, 
  generateAuthenticationOptions, 
  verifyAuthenticationResponse 
} = require('@simplewebauthn/server');

const app = express();
app.use(cors()); // Enable CORS for all origins
app.use(express.json());

// In-memory database for demo purposes
const users = new Map(); // Map<username, userData>

// Route to generate registration options
app.post('/generate-registration-options', (req, res) => {
  const { username } = req.body;
  const user = { username, id: 'unique-user-id' }; // Store user data in your database

  const options = generateRegistrationOptions({
    rpName: "My WebAuthn App",
    rpID: "card-saver-blue.vercel.app",
    userID: user.id,
    userName: username,
    attestationType: 'direct',
  });

  users.set(username, { ...user, currentChallenge: options.challenge });
  res.json(options);
});

// Route to verify registration response
app.post('/verify-registration', (req, res) => {
  const { username, response } = req.body;
  const user = users.get(username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    const verification = verifyRegistrationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: "https://card-saver-blue.vercel.app",
      expectedRPID: "card-saver-blue.vercel.app",
    });

    if (verification.verified) {
      user.authenticator = verification.registrationInfo;
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes for generating authentication options and verifying the response
app.post('/generate-authentication-options', (req, res) => {
  const { username } = req.body;
  const user = users.get(username);

  if (!user || !user.authenticator) {
    return res.status(404).json({ error: 'User not registered' });
  }

  const options = generateAuthenticationOptions({
    rpID: "card-saver-blue.vercel.app",
    allowCredentials: [
      {
        id: user.authenticator.credentialID,
        type: 'public-key',
      },
    ],
    challenge: "random-challenge",
  });

  user.currentChallenge = options.challenge;
  res.json(options);
});

app.post('/verify-authentication', (req, res) => {
  const { username, response } = req.body;
  const user = users.get(username);

  if (!user || !user.authenticator) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    const verification = verifyAuthenticationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: "https://card-saver-blue.vercel.app",
      expectedRPID: "card-saver-blue.vercel.app",
      authenticator: user.authenticator,
    });

    if (verification.verified) {
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registration function
async function startRegistration() {
  const response = await fetch('https://card-saver-blue.vercel.app/generate-registration-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: "exampleUser" })
  });
  const options = await response.json();

  const attResp = await SimpleWebAuthn.startRegistration(options);

  const verificationResponse = await fetch('https://card-saver-blue.vercel.app/verify-registration', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: "exampleUser", response: attResp })
  });

  const verificationJSON = await verificationResponse.json();
  if (verificationJSON.verified) {
    document.getElementById("fing_ani").play(); // Trigger animation on success
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

  const authResp = await SimpleWebAuthn.startAuthentication(options);

  const verificationResponse = await fetch('https://card-saver-blue.vercel.app/verify-authentication', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: "exampleUser", response: authResp })
  });

  const verificationJSON = await verificationResponse.json();
  if (verificationJSON.verified) {
    document.getElementById("fing_ani").play(); // Trigger animation on success
    alert('Login successful!');
  } else {
    alert('Login failed.');
  }
}

app.listen(3000, () => console.log('Server is running on port 3000'));
