import PublicationModel from '../../../shared/models/publication.js'

let controller = {
    /**
     * Esta función obtiene los registros de publicaciones en lista o por id, en la lista tambien se aplican filtros y paginacion .
     * @param {object} req -  objeto que contiene información sobre la petición HTTP
     * @param {object} res - objeto que representa la respuesta HTTP que envía.
     * @returns {object} la información de las publicaciones.
     */
    get: async (req, res) => {
        try{
            if(!req.params.id){
                let publication = await PublicationModel.find({deletedAt: { $ne: true }});
                if(!publication) return  res.status(404).send({error: "PUBLICATIONs_NOT_FOUND", message: "PUBLICATION NOT FOUND", code: "200.1"});
                return res.status(200).send({data: publication});
            }else{
                let query = req.query;
                let limit;
                let order = 1;
                let page = 0;
                if (query.limit){
                    limit = parseInt(query.limit);
                    delete query.limit;
                    delete query.offset;
                }
                if(query.order){
                    order = query.order;
                    delete query.order;
                }
                if(query.page){
                    page = query.page;
                    delete query.page;
                }
                if(query.filter){
                    let queryStr = atob(query.filter);
                    query = Function("return " + queryStr)();
                }
                let publication = await PublicationModel.find({_id: req.params.id, deletedAt: { $ne: true }, query});
                if(!publication) return  res.status(404).send({error: "PUBLICATION_NOT_FOUND", message: "PUBLICATION NOT FOUND", code: "200.2"});
                return res.status(200).send({data: publication});
            }
        }catch(e){
            console.log(e);
            return res.status(500).send({ error :  "GENERAL ERROR", message : e.message, code : "200.3" });
        }
    },
    /**
     * Esta función guarda o edita la información de las publicaciones.
     * @param {object} req -  objeto que contiene información sobre la petición HTTP
     * @param {object} res - objeto que representa la respuesta HTTP que envía.
     * @returns {object} la información de la publicacion creada/modificada.
     */
    store: async (req, res) => {
        try {
            if(req.body.id) {
                let publication = await PublicationModel.findByIdAndUpdate(req.body.id, req.body, { useFindAndModify: false, new: true})
                if (!publication) return res.status(404).send({error: "PUBLICATION_NOT_FOUND", message: "PUBLICATION NOT FOUND", code: "201.1"});
                return res.status(200).send({data: publication});
            }
            let publication = await PublicationModel.create(req.body);
            if(!publication) return  res.status(404).send({error: "PUBLICATION_NOT_FOUND", message: "PUBLICATION NOT FOUND", code: "201.2"});
            return res.status(200).send({data: publication});
        } catch (e) {
            console.log("ERR 102.500", e);
            return res.status(500).send({error: e, message: "ERROR GENERAL", code: "102.3"});
        }
    },
    /**
     * Esta función hace un soft delete del registro por su id.
     * @param {object} req -  objeto que contiene información sobre la petición HTTP
     * @param {object} res - objeto que representa la respuesta HTTP que envía.
     * @returns {object} la información del registro modificado o la información del error.
    */
    soft : async (req, res) => {
        try {
            if(!req.params.id) return res.status(403).send({ error : "ID_INVALID", message: "ID INVALID", code: "201.1" });
            let publication = (await  PublicationModel.findByIdAndUpdate( req.params.id, {deletedAt: true}, { useFindAndModify: false, new: true }))
            if(!publication) return  res.status(404).send({error: "PUBLICATION_NOT_DELETE", message: "PUBLICATION NOT DELETE", code: "203.2"});
            return res.status(200).send({data: 'PUBLICATION_HAS_BEEN_REMOVED'});
        }catch(e){
            console.log(e);
            return res.status(500).send({ error :  "GENERAL ERROR", message : e.message, code : "203.3" });
        }
    },
    /**
     * Esta función elimina el registro por su id.
     * @param {object} req -  objeto que contiene información sobre la petición HTTP
     * @param {object} res - objeto que representa la respuesta HTTP que envía.
     * @returns {object} el envio del mensaje si ha sido removido o si hubo error.
    */
    delete : async (req, res) => {
        try {
            let deleteItem = await PublicationModel.deleteOne({_id: req.params.id});
            if(!deleteItem) return res.status(400).send({error:"PUBLICATION_HAS_NOT_BEEN_DELETED", message: "PUBLICATION HAS NOT BEEN DELETED", code: "204.1"});
            return res.status(200).send({data: 'PUBLICATION_HAS_BEEN_REMOVED'});
        } catch (error) {
            console.log(e);
            return res.status(500).send({ error :  "ERROR GENERAL", message : e.message, code : "204.2" });
        }
    },
    /**
     * Esta función actualiza la información de likes que tiene una publicacion.
     * @param {object} req -  objeto que contiene información sobre la petición HTTP
     * @param {object} res - objeto que representa la respuesta HTTP que envía.
     * @returns {object} la información de la accion realizada o de error.
    */
    like : async (req, res) => {
        try {
            if(req.params.id) return res.status(403).send({ error : "ID_INVALID", message: "ID INVALID", code: "201.1" });
                let count = 0;
                let publication = await PublicationModel.findOne({_id: req.params.id, deletedAt: { $ne: true }});
                if(!publication) return  res.status(404).send({error: "PUBLICATION_NOT_FOUND", message: "PUBLICATION NOT FOUND", code: "205.2"});
                if(req.body.action == 'like') {
                    count = publication.likes + 1;
                }else{
                    if(publication.likes > 0) count = publication.likes - 1;
                }
                let updateItem = (await PublicationModel.findByIdAndUpdate( publication._id, {likes: count}, { useFindAndModify: false, new: true }))
                if(!updateItem) return  res.status(404).send({error: "PUBLICATION_NOT_UPDATE", message: "PUBLICATION NOT UPDATE", code: "205.3"});
                return res.status(200).send({data: 'PUBLICATION_LIKE'});
        }catch(e){
            console.log(e);
            return res.status(500).send({ error :  "GENERAL ERROR", message : e.message, code : "205.4" });
        }
    },
}
export default  controller;