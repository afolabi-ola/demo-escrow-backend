if (process.env.NODE_ENV !== "production") {
  const envFile = `.env.${process.env.NODE_ENV || "development"}`;
  require("dotenv").config({ path: envFile });
}
const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");
const { initSocket } = require("./sockets/socket"); // Import the socket initialization function

// Load environment variables based on the current NODE_ENV (default: development)
const server = http.createServer(app); // Create an HTTP server using Express

initSocket(server); // Initialize socket.io with the server

// const userSocketMap = new Map(); // userId -> socket.id

// MailDev setup for testing emails
if (process.env.NODE_ENV !== "production") {
  const MailDev = require("maildev");

  const maildev = new MailDev({
    smtp: 1025, // Local SMTP server
    web: 1080, // Web UI for viewing emails
  });

  maildev.listen(() => {
    console.log("MailDev is running on http://localhost:1080");
  });
}
const PORT = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI;

console.log('MongoDB diagnostics:', {
  exists: Boolean(uri),
  startsCorrectly: uri?.startsWith('mongodb+srv://'),
  containsEscrow: uri?.includes('/escrow'),
  containsWhitespace: /\s/.test(uri || ''),
  length: uri?.length,
  databasePart: uri?.split('@')[1]?.split('?')[0],
});

try {
  const parsed = new URL(uri);

  console.log('MongoDB URI parsing:', {
    protocol: parsed.protocol,
    hostname: parsed.hostname,
    pathname: parsed.pathname,
    search: parsed.search,
    usernameLength: decodeURIComponent(parsed.username).length,
    passwordLength: decodeURIComponent(parsed.password).length,
  });
} catch (error) {
  console.error('URI parsing failed:', error.message);
}

console.log('Production diagnostics:', {
  nodeEnv: process.env.NODE_ENV,
  uriLength: uri?.length,
  startsCorrectly: uri?.startsWith('mongodb+srv://'),
  hasEscrow: uri?.includes('/escrow'),
  hasNewline: /[\r\n]/.test(uri || ''),
  hasWhitespace: /\s/.test(uri || ''),
});

mongoose
  .connect(uri)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
// Database connection
/*
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
*/
// Start server
server.listen(PORT, () => {
  console.log(`Server is running on ports ${PORT}`);
});
