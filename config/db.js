if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: 'mongodb+srv://deploy:uploaddeploy@blogapp-33vz3.mongodb.net/test?retryWrites=true&w=majority'}
}else{
    module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}