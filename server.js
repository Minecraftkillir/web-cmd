const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 80; // Change this to 80

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the same directory
app.use(express.static(__dirname));

// Function to log commands
function logCommand(ip, command) {
  const timestamp = new Date().toLocaleString();
  const logEntry = `${timestamp} ${ip} ${command}\n`;

  fs.appendFile('commands.log', logEntry, (err) => {
    if (err) {
      console.error('Error logging command:', err);
    }
  });
}

app.post('/execute', (req, res) => {
  const command = req.body.command;
  const ip = req.ip;

  // Log the command
  logCommand(ip, command);

  if (command.toLowerCase() === 'cls' || command.toLowerCase() === 'clear') {
    // Clear the terminal screen
    res.json({ clearScreen: true, output: '' });
  } else {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json({ clearScreen: false, output: stdout || stderr });
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
