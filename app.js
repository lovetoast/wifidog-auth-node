var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var uuidV4 = require('uuid/v4');

var app = express();


app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

//ping -> pong
app.get('/ping',function(req, res){
    res.end('Pong');
});

app.get('/portal',function(req, res){
    res.redirect('https://www.baidu.com');
});

app.get('/login',function(req, res){
    var gw_address = req.query.gw_address;
    var gw_port = req.query.gw_port;
    var gw_id = req.query.gw_id;
    var mac = req.query.mac;
    var url = req.query.url;

    if(gw_address && gw_port){
        var token = uuidV4();
        if(!fs.existsSync('/tmp/wifidog-node/')){
            fs.mkdirSync('/tmp/wifidog-node/');
        }
        var path = '/tmp/wifidog-node/' + token;
        var now_time = new Date().valueOf();
        fs.writeFileSync(path, now_time,{ flag:'w'} );
        res.redirect('http://' + gw_address + ':' + gw_port + '/wifidog/auth?token=' + token);
    } else {
        res.status(404).end();
    }
});


app.get('/auth',function(req, res){
    var stage = req.query.stage;
    var ip = req.query.ip;
    var mac = req.query.mac;
    var token = req.query.token;
    var incoming = req.query.incoming;
    var outgoing = req.query.outgoing;
    var gw_id = req.query.gw_id;
    if(token){
        var path = '/tmp/wifidog-node/' + token;
        var is_exist = fs.existsSync(path);
        if(is_exist){ //已存在
            fs.readFile(path, function (err, data) {
                if (err){
                    console.error(err);
                    res.end('Auth: 0');
                    return;
                }
                var now_time = new Date().valueOf();
                var last_time = data && parseFloat(data);
                if(!data || now_time-last_time > 86400000){
                    fs.unlinkSync(path);
                    res.end('Auth: 0'); //已过期
                    return;
                }else{
                    res.end('Auth: 1');
                }
            });
        } else {
            res.end('Auth: 0');
        }

    } else {
        res.end('Auth: 0');
    }

});

app.listen(3000);
console.log('app start at 3000');