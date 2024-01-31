import  mongoose from 'mongoose';

let Schema = mongoose.Schema;

let UserSchema = Schema({
    fullName: {type: String, required: true},
    age: {type: Number, required: true},
    email : {type: String, required: true, match: /.+\@.+\..+/, unique: true},
    password: {type: String, required: true},
    deletedAt: {type: Boolean, default: false},
},{ timestamps: {  } });

export default mongoose.model('User', UserSchema);