import  mongoose  from 'mongoose';
import _ from '../../config/global.js'


let _dbConnect ;

if(_.PRODUCTION == true ){
    _dbConnect = mongoose.connect(`mongodb+srv://${ _.USER_MONGO }:${ _.PASSWORD_MONGO }@${ _.SERVER_MONGO }/${ _.DATABASE_NAME_MONGO }?authSource=admin`, { useUnifiedTopology: true ,useNewUrlParser: true,  ssl: true, sslValidate: false });
}else{
    _dbConnect =  mongoose.connect(`mongodb://localhost:27017/${ _.DATABASE_NAME_MONGO }?authSource=admin`, { useUnifiedTopology: true ,useNewUrlParser: true });
}

export default _dbConnect;
