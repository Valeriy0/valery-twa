const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2');
const token = "6919843845:AAG_4xvW9LMOUUsuzcDXbkAvjdyWbAD0na8"
const express= require('express');
var cors = require('cors')

const app = express();

app.use(cors())
const bot = new TelegramBot("6919843845:AAG_4xvW9LMOUUsuzcDXbkAvjdyWbAD0na8", {
    polling: true 
});

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: "mydb"
});
 
connection.connect();
var sql = "CREATE TABLE if not exists usersDB (id VARCHAR(255) PRIMARY KEY UNIQUE, refer VARCHAR(255))";
connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
});

var sql = "CREATE TABLE if not exists UID (wallet VARCHAR(255) PRIMARY KEY UNIQUE, id VARCHAR(255), accept VARCHAR(255))";
connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
});

bot.onText(/\/start/, async msg => {
    try {
        if(msg.text.length > 6) {
            const refID = "0:" + msg.text.slice(7);
            await bot.sendMessage(msg.chat.id, `Вы зашли по ссылке пользователя с адресом ${refID}`);
            connection.query(
                `SELECT refer FROM usersDB WHERE id = '${msg.from.id.toString()}'`,
                function(err, results, fields) {
                    console.log(results)
                    try {
                        if (results == null || results.length == 0) {
                            const sql = `INSERT INTO usersDB (id, refer) VALUES ('${msg.from.id.toString()}', '${refID}')`;
                            console.log(msg.from.id.toString());
                            connection.query(sql, function (err, result) {
                                if (err) throw err;
                                console.log("ADD");
                            }); 
                        }
                    } catch {}
                }
            );               
        }
    }
    catch(error) {
        console.log(error);
    }

})

app.post('/', (req,res)=>{
    res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*"
    });

    let ID = '';
            
    req.on('data', function(chunk) {
        ID += chunk.toString();
    });

    try {
        req.on('end', function() { 
            console.log(12312312, ID[0])
            if (ID[0] == '@') { // add wallet
                ID = ID.slice(1);
                let V = ID.split(',');
                try {
                    const sql = `INSERT INTO UID (wallet, id, accept) VALUES ('${V[0]}', '${V[1]}', 'false')`;
                    connection.query(sql, function (err, result) {
                        console.log("ADD");
                    }); 
                } catch {}
                res.end("accept")
                console.log("accept");
            } else if (ID[0] == '!') { // accept buy
                ID = ID.slice(1);
                connection.query(
                `SELECT refer FROM usersDB WHERE id = '${ID}'`,
                function(err, results, fields) {
                    try {
                        if (results != null && results.length != 0) {
                            connection.query(
                            `SELECT * FROM UID WHERE wallet = '${results[0].refer}'`,
                            function(err2, results2, fields2) {
                                try {
                                    console.log(results2[0].accept);
                                    if (results2[0].accept == "false") {
                                        bot.sendMessage(results2[0].id, `У вас новый партнер!`);
                                        res.end("-1");
                                        var sql = `UPDATE UID SET accept = 'true' WHERE wallet = '${results[0].refer}'`;
                                        connection.query(sql, function (err, result) {
                                            if (err) throw err;
                                            console.log("Update");
                                        });
                                    }
                                } catch {}
                            }
                            );
                        } else {
                            res.end("-1");
                        }
                        
                    } catch {}
                }
                );
            } else {
                console.log(ID, 1);
                connection.query(
                    `SELECT refer FROM usersDB WHERE id = '${ID}'`,
                    function(err, results, fields) {
                        console.log(results)
                        try {
                            if (results != null && results.length != 0) {
                                console.log(results[0].refer); 
                                res.end(results[0].refer);
                            } else {
                                res.end("-1");
                            }
                            
                        } catch {}
                    }
                );
            }
        });

    } catch {}
    
})

app.listen(3000, ()=>{console.log("ok")})