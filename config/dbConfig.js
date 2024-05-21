const mongoose = require('mongoose');

async function connectDb(){
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const connection= mongoose.connection;
        
        connection.on('connected', ()=>{
            console.log('Connected to databse');
        })

        connection.on('error', (error)=>{
            console.log(error);
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDb;