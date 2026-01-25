import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ========================================
  🚀 Server is flying on port ${PORT}
  🔗 http://localhost:${PORT}
  ========================================
  `);
});