import UserModel from '../../../shared/models/user.js'
import make_token from '../../../shared/helpers/make_token.js'
//import SeedHelper from '../../shared/helpers/seed-helper.js';

import _ from '../../../config/global.js'
//import email from '../../shared/helpers/email.js';
import bcrypt from 'bcrypt';
import jwt from 'jwt-simple';

let salt = 11;
let controller = {
    /**
     * Esta función obtiene los usuarios creados.
     * @param {object} req -  objeto que contiene información sobre la petición HTTP
     * @param {object} res - objeto que representa la respuesta HTTP que envía.
     * @returns {object} la información de(l) (los) usuario(s).
     */
    get: async (req, res) => {
        try {
            if (req.params.id) {
                let user = await UserModel.findById(req.params.id);
                if(!user) return res.status(400).send({error:"USER_NOT_FOUND", code: 100.1});
                return res.status(200).send({data: user});
            } else {
                let users = await UserModel.find({deletedAt: { $ne: true }});
                if(!users) return res.status(400).send({error:"USERS_NOT_FOUND", code: 100.2});
                return res.status(200).send({data: users});
            }
        } catch (e) {
            return res.status(500).send({error: e, message: "ERROR GENERAL", code: 102.3});
        }
    },
    /**
     * Esta función guarda o edita la información del usuario.
     * @param {object} req -  objeto que contiene información sobre la petición HTTP
     * @param {object} res - objeto que representa la respuesta HTTP que envía.
     * @returns {object} la información del usuario creado/modificada.
     */
    store: async (req, res) => {
        try {
            let data = req.body;
            if (!req.body.passwordEdit) {
                data = {
                    fullName: req.body.fullName,
                    age: req.body.age,
                    email: req.body.email,
                }
            }
            if (req.body.password) data.password = await bcrypt.hash(req.body.password, salt);
            if (!req.params.id) {
                let userStored = await UserModel.create(data);
                if(!userStored) return res.status(400).send({error:"USER_NOT_CREATED", code: 101.1});
                userStored = userStored.toObject();
                delete userStored.password;
                return res.status(200).send({data: userStored});
            } else {
                let userStored = await UserModel.findByIdAndUpdate(req.params.id, data, {
                    useFindAndModify: false,
                    new: true
                });
                if(!userStored) return res.status(400).send({error:"USER_NOT_UPDATE", code: 101.2});
                userStored = userStored.toObject();
                delete userStored.password;
                return res.status(200).send({data: userStored});
            }
        } catch (e) {
            return res.status(500).send({error: e, message: "ERROR USER NO CREATE", code: 101.3});
        }
    },
    /**
     * Esta función elimina a un usuario por su id.
     * @param {object} req -  objeto que contiene información sobre la petición HTTP
     * @param {object} res - objeto que representa la respuesta HTTP que envía.
     * @returns {object} el envio del mensaje si ha sido removido o si hubo error.
    */
    soft : async (req, res) => {
        try {
            let deleteItem = await UserModel.findByIdAndUpdate(req.params.id, {deletedAt: true}, { useFindAndModify: false, new: true});
            if(!deleteItem) return res.status(400).send({error:"USER_HAS_NOT_BEEN_DELETED", code: 102.1});
            return res.status(200).send({data: 'USER_HAS_BEEN_REMOVED'});
        } catch (error) {
            console.log(e);
            return res.status(500).send({ error :  "DELETE ERROR CATCH USER", message : e.message, code : 102.2 });
        }
    },
    /**
     * Esta función valida la información  (email y contraseña) para permitir el ingreso a la plataforma.
     * @param {object} req -  objeto que contiene información sobre la petición HTTP
     * @param {object} res - objeto que representa la respuesta HTTP que envía.
     * @returns {object} token para el acceso del usuario.
     */
    login: async (req, res) => {
        if (!req.body.password) return res.status(400).send({message: 'NO_PASSWORD', code: 103.1});
        if (!req.body.email) return res.status(400).send({message: 'NO_EMAIL', code: 103.2});
        let user = await UserModel.findOne({email: req.body.email});
        if (!user) return res.status(401).send({message: 'NO_AUTHORIZATION', code: 103.3});
        bcrypt.compare(req.body.password, user.password, async function (err, result) {
            if (result === true) {
                let token = make_token.createToken(user._id, 3);
                return res.status(200).send({token: token});
            } else {
                return res.status(401).send({message: 'NO_AUTHORIZATION', code: 103.4});
            }
        });
    },
    /**
     * Esta función valida que el token que trae el request sea valido, según el usuario.
     * @param {object} req -  objeto que contiene información sobre la petición HTTP. Debe traer la información del token
     * @param {object} res - objeto que representa la respuesta HTTP que envía.
     * @returns {object} la información del usuario verificado.
     */
    validateToken: async (req, res) => {
        try {
            let token = req.headers.authorization.split(" ")[1];
            let authData = jwt.decode(token, _.TOKEN_SECRET);
            if (!authData.sub) return res.status(401).send({message: 'NO_AUTHORIZATION', code: 104.1});
            let user = await UserModel.findById(authData.sub.user);
            if (!user) res.status(401).send({message: 'NO_FOUND_USER', code: 104.2});
            return res.status(200).send('TOKEN_VALID');
        } catch (e) {
            console.log('ERR 103.5', e);
            return res.status(500).send({error: e, message: "ERROR_CATCH_TOKEN", code: 104.2});
        }
    },
    /**
    * Esta función permite cambiar la constraseña de un usuario
    * @param {object} req -  objeto que contiene información sobre la petición HTTP.
    * @param {object} res - objeto que representa la respuesta HTTP que envía.
    * @returns {object} mensaje de confirmación o error del cambío la contraseña
   */
    changePassword: async (res, req) => {
        let password = '';
        let token = req.headers.authorization.split(" ")[1];
        let authData = jwt.decode(token, _.TOKEN_SECRET);
        if (!authData.sub) return res.status(401).send({message: 'NO_AUTHORIZATION', code: 105.1});
        if (!authData.code) return res.status(401).send({message: 'NO_AUTHORIZATION_TOKEN_INVALID', code: 105.2});
        let user = await UserModel.findById(authData.sub);
        if (req.body.password) password = await bcrypt.hash(req.body.password, salt);
        let update = (await UserModel.findByIdAndUpdate(user._id, {password: password}, {
            useFindAndModify: false,
            new: true
        }))
        if (!update) return res.status(404).send({error: "NO NEWS UPDATE", code: 105.3});
        return res.status(200).send({data: 'PASSWORD CHANGE SUCCESSFULLY'});
    },
    /**
    * Esta función semilla que crea el primer usuario.
    * @param {object} req -  objeto que contiene información sobre la petición HTTP.
    * @param {object} res - objeto que representa la respuesta HTTP que envía.
    * @returns {object} mensaje de confirmación o error del proceso.
   */
    seed: async (req, res) => {
        try {
            const config = await UserModel.find();
            if (config.length == 0) {
                let password = await bcrypt.hash('123456789-', salt);
                const data = {
                    "fullName":  "Test plataforma",
                    "age": 200,
                    "email": "test@test.com",
                    "password": password
                }
                const newConfig = await UserModel.create(saveConfig);
                if (!newConfig) res.status(403).send({error: "NOT CREATE SEED", code: 106.1});
                return res.status(200).send({data: 'SUCCESSFUL'});
            }
            return res.status(200).send({message: 'SEED UP'});
        } catch (e) {
            console.log(e);
            return res.status(500).send({error: "GENERAL ERROR", message: e.message, code: 106.2});
        }
    },
}
export default  controller;
