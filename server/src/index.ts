import app from './main';
import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT);

if (isNaN(port) || !port) {
  throw new Error('PORT environment variable is not set');
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
