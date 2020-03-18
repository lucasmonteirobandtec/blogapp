// Carregando modulos
    const express = require('express');
    const handlebars = require('express-handlebars');
    const bodyParser = require('body-parser');
    const app = express();
    const path = require('path');
    const mongoose = require('mongoose');
    const session = require('express-session');
    const flash = require('connect-flash');
    const passport = require('passport')

    const db = require('./config/db');


    require('./models/Postagem');
    const Postagem = mongoose.model('postagens');

    require('./models/Categoria');
    const Categoria = mongoose.model('categorias');

    require('./config/auth')(passport)

    // Carregando Rotas
        const admin = require('./routes/admin');
        const usuarios = require('./routes/usuario');

// Configurações
    // Sessão
        app.use(session({
            secret: "s3ss10n",
            resave: true,
            saveUninitialized: true
        }));

        app.use(passport.initialize());
        app.use(passport.session());
        app.use(flash());
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg'),
            res.locals.error_msg = req.flash('error_msg'),
            res.locals.error = req.flash('error');
            res.locals.user = req.user || null;
            next();
        });

    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI).then(() => {
            console.log('Conectado com o Banco!...');
        }).catch((err) => {
            console.log('Falha ao se conectar no Banco de dados...' + err);
        });
    // Public
        app.use(express.static(path.join(__dirname, 'public')));
        
// Rotas
    // Rotas Publicas
        app.get('/', (req, res) => {
            Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
                res.render('index', {postagens: postagens});
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro interno');
                res.redirect('/404')
            })
            
        });

        app.get('/postagem/:slug', (req, res) => {
            Postagem.findOne({slug: req.params.slug}).then((postagem) => {
                if(postagem){
                    res.render('postagem/index', {postagem: postagem})
                }else{
                    req.flash('error_msg', 'Essa postagem não existe');
                    res.redirect('/')
                }
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro interno');
                res.redirect('/');
            });
        });
        
        app.get('/404', (req, res) => {
            res.send('Erro');
        });

        app.get('/categorias', (req, res) => {
            Categoria.find().then((categorias) => {
                res.render('categorias/index', {categorias, categorias})
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro interno ao listar categorias!');
                res.redirect('/')
            });
        });

        app.get('/categoria/:slug', (req, res) => {
            Categoria.findOne({slug: req.params.slug}).then((categoria) => {
                if(categoria){
                    Postagem.find({categoria: categoria._id}).then((postagens) => {
                        res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
                    }).catch((err) => {
                        req.flash('error_msg', 'Houve um erro interno ao listar os posts');
                        res.redirect('/');
                    });
                    
                }else{
                    req.flash('error_msg', 'Essa categoria não existe');
                    res.redirect('/');
                }
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro interno');
                res.redirect('/');
            });
        });

    // Outras Rotas
        app.use('/admin', admin);
        app.use('/usuarios', usuarios);
        
// Outros
    const PORT = process.env.PORT || 8081;
    app.listen(PORT, () => {
        console.log('Servidor rodando!');
    });