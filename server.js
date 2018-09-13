var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = require('./config');
var User = require('./app/models/user');
var Post = require('./app/models/post');
var cors = require('cors');

var port = process.env.PORT || 3000;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(cors());

app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

app.post('/register', function(req, res) {
    var nemanja = new User({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
        phone: '',
        skypeName: '',
        fullName: '',
        company: '',
        favoriteCountries: [],
        admin: false
    });

    User.findOne({
        name: nemanja.name
    }, function(err, user) {
        if (err) throw err;

        if (user) {
            console.log('Username taken!');
            res.json({ success: false, message: 'Registration failed. Username taken!' });
        } else if (!user) {
            nemanja.save(function(err) {
                if (err) throw err;
        
                console.log('User registered successfully');
                res.json({ success: true, message: 'Registration successful.' });
            })
        }
    })

    
})

app.get('/home', function(req, res) {
    res.json({
        message: 'This is home page.'
    });
});

//API ROUTES

var apiRoutes = express.Router();

apiRoutes.post('/authenticate', function(req, res) {
    User.findOne({
        name: req.body.name
    }, function(err, user) {
        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {
            if (user.password !== req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {
                const payload = {
                    admin: user.admin
                };

                var token = jwt.sign(payload, app.get('superSecret'), {
                    expiresIn: "3h"
                });

                res.json({
                    success: true,
                    user: user,
                    message: 'Welcome, ' + user.name + '!Enjoy your token!',
                    token: token
                });
            }
        }
    });
});

apiRoutes.get('/posts', function(req, res) {
    Post.find({}, function(err, posts) {
        res.json(posts);
    }).populate('createdBy');
});

apiRoutes.get('/profile/:idUser', function(req, res) {
    var idUser = req.params.idUser;
    if (idUser) {
        User.find({ name: idUser }, function(err, posts) {
            if (err) throw err;

            if (posts) {
                res.json({
                    success: true,
                    message: 'User!',
                    posts: posts,
                    idUser: idUser
                })
            } else {
                res.json({
                    success: false,
                    message: 'error.'
                })
            }
        })
    }
});

apiRoutes.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.decoded = decoded;
                next();
            }
        })
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
}); 

apiRoutes.get('/', function(req, res) {
    res.json({ message: 'Welcome to the coolest API on Earth!' });
});

apiRoutes.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        res.json(users);
    });
});

apiRoutes.get('/user/:id', function(req, res) {
    var id = req.params.id
    User.findById(id, function(err, user) {
        res.json({
            user: user
        });
    });
});

apiRoutes.delete('/user/:id', function(req, res) {
    var id = req.params.id;
    User.findByIdAndRemove(id, function(err, user) {
        if (err) throw err;

        res.json({
            success: true,
            message: 'User deleted!'
        })
    })
});

apiRoutes.put('/user/:id', function(req, res) {
    var id = req.params.id;
    User.findByIdAndUpdate(id, req.body, function(err, user) {
        if (err) throw err;

        if (user._id == id) {
            res.json({
                success: true,
                message: 'Successfully updated post!'
            })
        } else {
            res.json({
                success: false,
                message: 'No permission to update this post!'
            })
        }
    })
})

apiRoutes.post('/post', function(req, res) {
    var newPost = new Post({
        loadingCountry: req.body.loadingCountry,
        loadingCity: req.body.loadingCity,
        unloadingCountry: req.body.unloadingCountry,
        unloadingCity: req.body.unloadingCity,
        loadingDate: req.body.loadingDate,
        weight: req.body.weight,
        price: req.body.price,
        phone: req.body.phone,
        createdBy: req.body.createdBy
    });

    Post.findOne({
        loadingCountry: req.body.loadingCountry,
        loadingCity: req.body.loadingCity,
        unloadingCountry: req.body.unloadingCountry,
        unloadingCity: req.body.unloadingCity,
        createdBy: req.body.createdBy
    }, function(err, post) {
        if (err) throw err;

        if (post) {
            res.json({ success: false, message: 'Posting failed. Duplicate post by same user.' });
        } else if (!post) {
            newPost.save(function(err) {
                if (err) throw err;
        
                console.log('Posting successfully');
                res.json({ success: true, message: 'Posting successful.' });
            })
        }
    })
});



apiRoutes.get('/post/:id', function(req, res) {
    var id = req.params.id
    Post.findById(id, function(err, post) {
        res.json({
            post: post
        });
    });
});

apiRoutes.get('/user/:idUser/posts', function(req, res) {
    var idUser = req.params.idUser;
    if (idUser) {
        Post.find({ createdBy: { _id: idUser} }, function(err, posts) {
            if (err) throw err;

            if (posts) {
                res.json({
                    success: true,
                    message: 'Posts by user!',
                    posts: posts
                })
            } else {
                res.json({
                    success: false,
                    message: 'error.'
                })
            }
        })
    }
});

apiRoutes.put('/user/:idUser/post/:id', function(req, res) {
    var id = req.params.id;
    var idUser = req.params.idUser;
    Post.findByIdAndUpdate(id, req.body, function(err, post) {
        if (err) throw err;
        if (post.createdBy._id == idUser) {
            res.json({
                success: true,
                message: 'Successfully updated post!'
            })
        } else {
            res.json({
                success: false,
                message: 'No permission to update this post!'
            })
        }
    })
});

apiRoutes.delete('/user/:idUser/post/:id', function(req, res) {
    var id = req.params.id;
    var idUser = req.params.idUser;
    Post.findByIdAndRemove(id, req.body, function(err, post) {
        if (err) throw err;
        if (post.createdBy._id == idUser) {
            res.json({
                success: true,
                message: 'Successfully deleted post!'
            })
        } else {
            res.json({
                success: false,
                message: 'No permission to delete this post!'
            })
        }
    })
});

app.use('/api', apiRoutes);

app.listen(port);
console.log('Magic happens at http://localhost:' + port);