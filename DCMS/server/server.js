const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

//home page
app.get('/', (req, res) => {
  res.send('Hello world!');
});

//route for api endpoint
app.get('/api/data', (req, res) => {
  res.json({ message: 'This is sample data' });
});

app.listen(port, () => {
  console.log('Server is running at HTTP://localhost:${port}');
});


