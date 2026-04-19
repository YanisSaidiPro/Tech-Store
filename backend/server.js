const { connectDb } = require('./db');
const app = require('./app');

const PORT = process.env.PORT || 3000;

connectDb()
  .then(() => {
    console.log('MongoDB connecté');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Impossible de se connecter à MongoDB:', err.message);
    process.exit(1);
  });
