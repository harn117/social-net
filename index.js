import  db from './shared/connectors/db.js'
import app from './shared/app.js'
import _ from './config/global.js'

db.then(() => {
    console.log("DB CONNECTING");
    app.listen(_.PORT,async () => {
        console.log('\x1b[42m\x1b[34m%s\x1b[0m', `*****START  ${_.SERVICE_NAME} SERVICE*****`);
    });
});
