import 'dotenv/config';
import app from './app.js';
import db from './config/database.js';

const PORT = process.env.PORT || 5001;

db().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});