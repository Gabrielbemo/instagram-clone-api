var express = require('express');
var bodyParser = require('body-parser');
var multiparty = require('connect-multiparty');
var mongodb = require('mongodb');
var objectId = require('mongodb').ObjectID;
var fs = require('fs');

var app = express();

//body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multiparty());

var port = 8080;

app.listen(port);

var db = new mongodb.Db(
    'instagram',
    new mongodb.Server('localhost', 27017, {}),
    {}
);

console.log('server on');

app.get('/', function (req, res) {
    res.send({ msg: 'ola' })
});

//POST (create)
app.post('/api', function (req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");

    var date = new Date();
    var time_stamp = date.getTime();

    var url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename;

    var path_origem = req.files.arquivo.path;
    var path_destino = './uploads/' + url_imagem;

    fs.rename(path_origem, path_destino, function (err) {
        if (err) {
            res.status(500).json({ error: err });
            return;
        }

        var dados = {
            url_imagem: url_imagem,
            titulo: req.body.titulo
        }

        
        db.open(function (err, mongoclient) {
            mongoclient.collection('postagens', function (err, collection) {
                collection.insert(dados, function (err, records) {
                    if (err) {
                        res.json({ 'status': 'erro' });
                    } else {
                        res.json({ 'status': 'sucesso na inclusão' });
                    }
                    mongoclient.close();
                });
            });
        });
        

    })
});

//GET (ready)
app.get('/api', function (req, res) {
    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.find().toArray(function (err, results) {
                if (err) {
                    res.json(err);
                } else {
                    res.json(results);
                }
                mongoclient.close();
            });
        });
    });
});

//GET by ID (ready)
app.get('/api/:id', function (req, res) {
    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.find(objectId(req.params.id)).toArray(function (err, results) {
                if (err) {
                    res.json(err);
                } else {
                    res.json(results);
                }
                mongoclient.close();
            });
        });
    });
});

//PUT by ID (update)
app.put('/api/:id', function (req, res) {
    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.update(
                { _id: objectId(req.params.id) },
                { $set: { titulo: req.body.titulo } },
                {},
                function (err, records) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }
                    mongoclient.close();
                }
            );
        });
    });
});

//DELETE by ID (update)
app.delete('/api/:id', function (req, res) {
    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.remove(
                { _id: objectId(req.params.id) },
                function (err, records) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }
                    mongoclient.close();
                }
            );
        });
    });
});