const mongoose = require('mongoose');
const { Schema } = mongoose;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/testing?replicaSet=rs0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
    
    // Define your model
    const UserModel = mongoose.model('User', new Schema({ name: String }));

    let userSession = null;

    UserModel.createCollection()
        .then(() => mongoose.startSession())
        .then(session => {
            userSession = session;
            const userToCreate = UserModel.create({ name: 'john' });
            return userToCreate;
        })
        .then(() => {
            userSession.startTransaction();
            return UserModel.findOne({ name: 'john' }).session(userSession);
        })
        .then(user => {
            if (user) {
                user.name = 'smith';
                return user.save();
            } else {
                throw new Error('User not found');
            }
        })
        .then(() => UserModel.findOne({ name: 'smith' }))
        .then(result => {
            if (result) {
                console.log('User name changed to smith');
                return userSession.commitTransaction();
            } else {
                throw new Error('Transaction failed, user not found');
            }
        })
        .catch(err => {
            console.error('Transaction error:', err);
            if (userSession) {
                userSession.abortTransaction().catch(console.error);
            }
        })
        .finally(() => {
            if (userSession) {
                userSession.endSession();
            }
            db.close();
        });
});
