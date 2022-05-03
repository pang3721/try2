const express = require('express'),
    app = express(),
    cors = require('cors'), //HTML form submittion
    bodyParser = require('body-parser'),
    path = require("path"),//.path
    session = require('express-session'),//session
    mongoose = require('mongoose'),
    multer = require("multer");//for uploading image

mongoose.connect('mongodb+srv://CSCI3100:Ab123456@cluster0.wkhhe.mongodb.net/User?retryWrites=true&w=majority');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.engine('html', require('ejs').renderFile);
app.use(session({
  secret: 'recommand 128 bytes random string',
  cookie: { maxAge: 300 * 1000 }
}));

//multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
 
var upload = multer({ storage: storage })

//user defined modules
const createAcc = require("./createAccount.js");//creating account and login
const createProd = require("./createproduct.js");//create product
const home = require("./homepage.js");//load homepage where it display all the product
const profile = require("./myprofile.js");//display my profile
const changepassword = require("./changepassword.js");//change password
const admin = require("./admin.js");//admin fct
const schema = require("./Schemas");
const Prod = require("./handleproduct.js");
const history = require("./purchasehistory.js");

const res = require('express/lib/response');

//start
const db = mongoose.connection;
// Upon connection failure
db.on('error', console.error.bind(console,
'Connection error:'));
// Upon opening the database successfully
db.once('open', function () {
    console.log("Connection is open...");

    app.all('/', (req, res) => {
        if(!req.session.user){
            res.redirect('/login');
        }
        else{
            home.loadHome(req,res);
        }
    });
    app.get('/register', (req, res) => {
        if(!req.session.user){
            res.sendFile(__dirname + '/createAccount.html');
        }
        else{
            res.redirect('/home');
        }
    });
    app.post('/register', upload.single('propic'), function(req, res) {
        if(!req.session.user){
            createAcc.registerAccount(req, res);
        }
        else{
            res.redirect('/home');
        }
    });
    app.get('/verify',function(req,res){
        if(!req.session.user){
            createAcc.userVerify(req, res);
        }
        else{
            res.redirect('/home');
        }
    });
    app.get('/login',function(req,res){
        if(!req.session.user){
            res.render(path.join(__dirname+'/login.ejs'),{message:""});//requires path
        }
        else{
            res.redirect('/home');
        }
    });
    app.post('/login',function(req,res){
        createAcc.userLogin(req,res);
    });
    app.get('/home',function(req,res){
        if(!req.session.user){
            res.redirect('/login');
        }
        else{
            home.loadHome(req,res);
        }
    });
    app.post('/home',function(req,res){
        if(!req.session.user){
            res.redirect('/login');
        }
        else{
            Prod.handleProd(req,res);
        }
    });
    app.get('/createProduct',function(req,res){
        if(!req.session.user){
            res.redirect('/login');
        }
        else
            res.sendFile(path.join(__dirname+'/createproduct.html'));
      });
    app.post('/createProduct',upload.single('productpic'), function(req,res){
        if(!req.session.user){
            res.redirect('/login');
        }
        else{
            createProd.createProduct(req,res);
        }
    });
    app.get('/myprofile',function(req,res){
        if(!req.session.user){
            res.redirect('/login');
        }
        else
            profile.myProfile(req,res);
    });
    app.get('/changepassword',function(req,res){
        if(!req.session.user){
            res.redirect('/login');
        }
        else
            res.render(path.join(__dirname+'/changepassword.ejs'),{message:""});
    });
    app.post('/changepassword',function(req,res){
        if(!req.session.user){
            res.redirect('/login');
        }
        else
            changepassword.changepassword(req,res);
    });
    app.get('/admin',function(req,res){
        if(!req.session.user){
            res.redirect('/login');
        }
        else
        schema.User.findOne( {email: req.session.user}) .exec(function(err, user){    
            if (err) 
                res.send(err); 
            else if(user.isAdmin == true){
                admin.displayUsers(req,res,"");
            }
            else{
                res.send("You do not have admin rights!");
            }
        });
    });
    app.post('/admin',function(req,res){
        if(!req.session.user){
            res.redirect('/login');
        }
        else
        schema.User.findOne( {email: req.session.user}) .exec(function(err, user){    
            if (err) 
                res.send(err); 
            else if(user.isAdmin == true){
                admin.resetPW(req,res);
            }
            else{
                res.send("You do not have admin rights!");
            }
        });
    });
    app.get('/purchasehistory',function(req,res){
        if(!req.session.user){
            res.redirect('/login');
        }
        else
            history.displayhistory(req,res);
    });
    app.get('/logout',function(req,res){
        req.session.destroy();
        res.redirect('/login');
    });
    //app.all('/*',function(req,res){
    //    res.redirect('/home');
    //});
})

const server = app.listen(3000);
