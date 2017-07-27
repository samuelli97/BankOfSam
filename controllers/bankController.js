var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://user:user@ds127063.mlab.com:27063/bankofsam');
mongoose.connection.once('open',function(){
        // console.log('Connection has been made now make fireworks...');
    }).on('error',function(error){
        console.log('Connection error:',error);
    });

var accountSchema = new mongoose.Schema({
    username: String,
    firstname: String,
    lastname: String,
    balance: Number
});

var Bank = mongoose.model('account', accountSchema);
var urlencodedParser = bodyParser.urlencoded({extended: false});

// creates a username
function toUsername(firstname, lastname) {
    return (firstname.toLowerCase() + lastname.toLowerCase()).replace(/\s+/g, "");
}

module.exports = function(app) {

    app.get("/", function(req, res){
        res.render('login', {status: ""});
    });

    app.get("/signup", function(req, res){
        res.render('signup', {message: ""});
    });

    app.post("/signup", urlencodedParser, function(req, res){

        // checks if account already exists
        var name = toUsername(req.body.firstname, req.body.lastname);

        Bank.findOne({username: name}, function(err, data){
            if (err) throw err;

            if (data !== null) {
                console.log("Account already exists");
                res.render('signup', {message: "Account already exists"});
            } else {

                var account = new Bank({
                    username: name,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    balance: 0
                });

                // saves to mongodb
                account.save(function(err, data){
                    res.redirect('profile');
                });
            }
        })
    });


    app.post("/login", urlencodedParser, function(req, res){

        var first_name = req.body.firstname;
        var last_name = req.body.lastname;

        // searches mongodb for account
        var name = toUsername(req.body.firstname, req.body.lastname);

        Bank.findOne({username: name}, function(err, data){

            if (err) throw err;
            if (data == null) {
                res.render('login', {status: "Account does not exist"});
            } else {
                res.render('profile', {account: data})
            }
        })
    });

    app.post("/update", urlencodedParser, function(req, res){

        var updatedBalance;

        if (req.body.transactiontype === 'deposit') {
            updatedBalance = parseFloat(req.body.balance) + parseFloat(req.body.amount);
        } else {
            updatedBalance = parseFloat(req.body.balance) - parseFloat(req.body.amount);
            if (updatedBalance < 0) updatedBalance = 0.0;
        }

        var name = toUsername(req.body.firstname, req.body.lastname);

        Bank.findOneAndUpdate({username: name}, {balance: updatedBalance}, {new: true}, function(err, data){
            if (err) throw err;

            res.render('profile', {account: data});
        })


    })

    app.get('*', function(req, res) {
        res.redirect('/');
    });
}
