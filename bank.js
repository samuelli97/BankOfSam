var express = require('express');
var bankController = require('./controllers/bankController');

var app = express();

app.set('view engine', 'ejs');

app.use(express.static('./public'));

bankController(app);

app.listen(process.env.PORT || 3000, function(){
  console.log('listening');
});
