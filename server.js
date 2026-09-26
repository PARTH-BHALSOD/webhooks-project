require("dotenv").config();

const app = require("./app");
const db = require("./config/database");


db().then(() => {
    app.listen(5001, () => {
        console.log(`Server running on http://localhost:${process.env.PORT}`);
    });
});