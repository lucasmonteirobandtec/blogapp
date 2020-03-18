module.exports = {
    privilegio: (req, res, next) => {
        if(req.isAuthenticated() && req.user.privilegio == 1){
            return next();
        }

        req.flash('error_msg', 'Você precisa ser um Administrador!');
        res.redirect('/');
    }
};