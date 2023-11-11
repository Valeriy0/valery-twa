const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const mysql = require('mysql2');
const token = "6919843845:AAG_4xvW9LMOUUsuzcDXbkAvjdyWbAD0na8"

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
var sql = "CREATE TABLE if not exists users (id VARCHAR(255) PRIMARY KEY UNIQUE, refer VARCHAR(255))";
connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
});

// connection.connect(function(err) {
//     if (err) throw err;
//     connection.query("SELECT  FROM users WHERE id = '1191496245'", function (err, result) {
//       if (err) throw err;
//       console.log(result);
//     });
//   });


bot.onText(/\/start/, async msg => {
    try {
        if(msg.text.length > 6) {
            const refID = "0:" + msg.text.slice(7);
            await bot.sendMessage(msg.chat.id, `Вы зашли по ссылке пользователя с адресом ${refID}`);
            const sql = `INSERT INTO users (id, refer) VALUES ('${msg.from.id.toString()}', '${refID}')`;
            console.log(msg.from.id.toString());
            connection.query(sql, function (err, result) {
                if (err) throw err;
                console.log("ADD");
            });                
        }
    }
    catch(error) {
        console.log(error);
    }

})

http.createServer( (req,res)=>{
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
            console.log(ID, 1);
            connection.query(
                `SELECT refer FROM users WHERE id = '${ID}'`,
                function(err, results, fields) {
                    console.log(results)
                    try {
                        if (results != null) {
                            console.log(results[0].refer); 
                            res.end(results[0].refer);
                        } else {
                            res.end("-1");
                        }
                    } catch {}
                }
            );
            
        })
    } catch {}
    
}).listen(3000,()=>{console.log("ok")})