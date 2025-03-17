const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files (like index.html, styles.css, etc.) from the 'client/public' folder
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));

// Route to serve the homepage (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'public', 'index.html'));  // Correct relative path
});

// API endpoint
app.get('/api/data', (req, res) => {
  res.json({ message: 'This is sample data' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
