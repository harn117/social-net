import  mongoose from 'mongoose';

let Schema = mongoose.Schema;

let PublicationSchema = Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    likes: {type: Number, default: 0},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    deletedAt: {type: Boolean, default: false}
},{ timestamps: {  } });

export default mongoose.model('Publication', PublicationSchema);