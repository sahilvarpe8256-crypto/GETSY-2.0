const app = require('../backend/app');
const connectDB = require('../backend/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Serverless database initialization warning:', error.message);
  }
  return app(req, res);
};
