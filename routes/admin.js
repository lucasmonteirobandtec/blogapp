// Carregando modulos
    const express = require('express');
    const router = express.Router();
    const mongoose = require('mongoose');
    const {privilegio} = require('../helpers/privilegio');


// Models Admin
    require('../models/Categoria');
    const Categoria = mongoose.model('categorias');
    require('../models/Postagem');
    const Postagem = mongoose.model('postagens');

// Painel Admin
    router.get('/', privilegio, (req, res) => {
        res.render('admin/index');
    });
    

// CATEGORIAS ADMIN
    router.get('/categorias', privilegio, (req, res) => {
        Categoria.find().sort({date: 'desc'}).then((categorias) => {
            res.render('admin/categorias', {categorias: categorias});
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar categorias...');
            res.redirect('/admin');
            console.log(err);
        });
    });
    router.get('/categorias/add', privilegio, (req, res) => {
        res.render('admin/addcategorias');
    });

    router.post('/categorias/nova', privilegio, (req, res) => {
        
        var erros = [];

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: 'Nome inválido!'});
            console.log(req.body.nome);
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: 'Slug inválido!'})
        }
        if(req.body.nome.length < 2){
            erros.push({texto: 'Nome muito pequeno!'})
        }
        if(erros.length > 0){
            res.render('admin/addcategorias', {erros: erros});
        }else{
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }
            new Categoria(novaCategoria).save().then(() => {
                req.flash('success_msg', 'Categoria cadastrada com sucesso!');
                res.redirect('/admin/categorias');
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao cadastrar a Categoria...');
                console.log('Erro ao cadastrar Categoria...');
            });
        }; 
    });

    router.get('/categorias/edit/:id', privilegio, (req, res) => {
        Categoria.findOne({_id: req.params.id}).then((categoria) => {
            res.render('admin/editcategoria', {categoria: categoria});
        }).catch((err) => {
            req.flash('error_msg', 'Essa categoria não exite...');
            res.redirect('/admin/categorias');
        })
    });

    router.post('/categorias/edit', privilegio, (req, res) => {

        var erros = [];

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: 'Nome inválido!'});
            console.log(req.body.nome);
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: 'Slug inválido!'})
        }
        if(req.body.nome.length < 2){
            erros.push({texto: 'Nome muito pequeno!'})
        }
        if(erros.length > 0){
            res.render('admin/editcategoria', {erros: erros});
        }else{
            Categoria.findOne({_id: req.body.id}).then((categoria) => {
                categoria.nome = req.body.nome
                categoria.slug = req.body.slug
                categoria.save().then(() => {
                    req.flash('success_msg', 'Categoria editada com sucesso!');
                    res.redirect('/admin/categorias');
                }).catch((err) => {
                    req.flash('error_msg', 'Erro ao salvar edição de Categoria...');
                    res.redirect('/admin/categorias');
                });
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao editar a categoria...');
                res.redirect('/admin/categorias');
            });
        };
    });


    router.post('/categorias/delete', privilegio, (req, res) => {
        Categoria.deleteOne({_id: req.body.id}).then(() => {
            req.flash('success_msg', 'Categoria deletada com sucesso!');
            res.redirect('/admin/categorias');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao deletar categoria...');
            res.redirect('/admin/categorias');
        });
    });

// POSTAGENS ADMIN
    router.get('/postagens', privilegio, (req, res) => {

        Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
            res.render('admin/postagens', {postagens: postagens});
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as postagens');
            res.redirect('/admin');
        })
    });

    router.get('/postagens/add',  privilegio, (req, res) => {
        Categoria.find().then((categorias) => {
            res.render('admin/addpostagens', {categorias: categorias});
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar o formulário');
            res.redirect('/admin');
        });
    });

    router.post('/postagens/nova', privilegio, (req, res) => {

        var erros = [];

            if(req.body.categoria == "0"){
                erros.push({texto: 'Nenhuma categoria registrada, registre uma antes!'});
            }
            if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
                erros.push({texto: 'Título inválido!'});
                console.log(req.body.nome);
            }
            if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
                erros.push({texto: 'Slug inválido!'})
            }
            if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
                erros.push({texto: 'Descrição inválida!'})
            }
            if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
                erros.push({texto: 'Conteudo inválida!'})
            }
            if(req.body.titulo.length < 2){
                erros.push({texto: 'Título muito pequeno!'})
            }

        if(erros.length > 0){
            res.render('admin/addpostagens', {erros: erros});
        }else{
            const novaPostagem = {
                titulo: req.body.titulo,
                slug: req.body.slug,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria
            }
            new Postagem(novaPostagem).save().then(() =>{
                req.flash('success_msg', 'Postagem criada com sucesso!');
                res.redirect('/admin/postagens');
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro no salvamento da postagem');
                res.redirect('/admin/postagens');
            });
        }
    });

    router.get('/postagens/edit/:id', privilegio, (req, res) => {
        Postagem.findOne({_id: req.params.id}).then((postagem) => {
            Categoria.find().then((categorias) => {
                res.render('admin/editpostagem', {categorias: categorias, postagem: postagem});
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao listar categorias...');
                res.redirect('/admin/postagens');
            });
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição...');
            res.redirect('/admin/postagens');
        });
    });

    router.post('/postagem/edit', privilegio, (req, res) => {
        var erros = [];

            if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
                erros.push({texto: 'Título inválido!'});
                console.log(req.body.nome);
            }
            if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
                erros.push({texto: 'Slug inválido!'})
            }
            if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
                erros.push({texto: 'Descrição inválida!'})
            }
            if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
                erros.push({texto: 'Conteudo inválida!'})
            }
            if(req.body.titulo.length < 2){
                erros.push({texto: 'Título muito pequeno!'})
            }

        if(erros.length > 0){
            res.render('admin/editpostagem', privilegio, {erros: erros});
        }else{

            Postagem.findOne({_id: req.body.id}).then((postagem) => {

                postagem.titulo = req.body.titulo
                postagem.slug = req.body.slug
                postagem.descricao = req.body.descricao
                postagem.conteudo = req.body.conteudo
                postagem.categoria = req.body.categoria

                postagem.save().then(() => {
                    req.flash('success_msg', 'Postagem editada com sucesso!');
                    res.redirect('/admin/postagens');
                }).catch((err) => {
                    req.flash('error_msg', 'Erro interno');
                    res.redirect('/admin/postagens');
                });
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao salvar a edição')
            });
        }
    });

    router.post('/postagens/delete', privilegio, (req, res) => {
        Postagem.deleteOne({_id: req.body.id}).then(() => {
            req.flash('success_msg', 'Postagem deletada com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao deletar postagem...');
            res.redirect('/admin/postagens');
        });
    });

module.exports = router;