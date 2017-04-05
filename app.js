var shortid = require('shortid');

var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.Promise = global.Promise; //replace depricated mongoose promises

app.set('port', (process.env.PORT || 5000));
mongoose.connect('mongodb://user:password@ds149700.mlab.com:49700/shorturl');

var urlSchema = new mongoose.Schema({
    longUrl: String,
    shortUrl: String,
    shortId: String
});

var Url = mongoose.model('Url',urlSchema);

app.get('/url/:id',function(req,res,next){
    Url.findOne({shortId:req.params.id}
    ,function(err,data){
        if (err) throw err;
        if (!data){
            console.log(req.protocol + '://' + req.get('Host') + '/url/' + req.params.id);
            res.send('URL not in database');
        }
        else {
            console.log(data.longUrl);
            res.redirect('http://' + data.longUrl);
        }
        next();  
    });
});

app.get('/:url',function(req,res,next){
    
    // check if url already exists in database
    Url.count({longUrl:req.params.url},function(err,count){
        if (err) throw err;
        if (count === 0){
            
            var newId = shortid.generate();
            
            Url({
                longUrl:req.params.url,
                shortUrl:req.protocol + '://' + req.get('Host') + '/url/' + newId,
                shortId: newId
            }).save(function(error){
                if (error){throw error;}
                console.log(req.get('Host'));
                next();
            });
        }
    });
    
    
});



app.get('/:url',function(req,res){
    Url.findOne({longUrl:req.params.url},function(error,data){
        if (error) throw error;
        res.send(data);
    });
});

app.get('/',function(req,res){
    res.send('Append your url to the end of API endpoint without http://');
});

app.listen(8080, function() {
  console.log('Node app is running on port', app.get('port'));
});


