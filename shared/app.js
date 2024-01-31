import express from 'express';
import _ from '../config/global.js';
import cors from 'cors';
import router_resources from '../src/routes/resources.js'
import router_public from '../src/routes/public.js';

let app = express();
app.use(cors());


app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) //

console.info(_.PREFIX + "/", "prefix_public");

app.use(_.PREFIX + "/", router_public);
app.use(_.PREFIX + "/resources", router_resources);


export default  app;
