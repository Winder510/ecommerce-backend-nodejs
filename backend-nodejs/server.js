import app from './src/app.js';
import 'dotenv/config';

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});

process.on('SIGINT', () => {
    server.close(() => console.log('Server is close !!'));
});
