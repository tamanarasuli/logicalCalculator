/**
 * HW5. Node.js program for a logical calculator.
 */
let arr = []; 
// Set up some global constants for the program
const express = require('express');
const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
    port = 80;
}

// Create database to hold results
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(
    "./answers.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Connected to db");
        }
    }
);
// Create tables if it doesn't already exist
db.run(
    'CREATE TABLE IF NOT EXISTS Answers(op, num1, num2, answer)',
    [],
    (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Table created");
        }
    }
);


/**
 * Read, render and respond with the results
 *
 * Arguments:
 *   res - the Response object to send the response back
 
 */
 
function readRenderAndRespond(res) {
    let sql = `SELECT  num1,num2, op, answer FROM answers`

  
db.all(sql, [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(rows);
    console.log(`${row.op} ${row.num1} ${row.num2} ${row.answer}` );
    // rows[index.op]
    arr.push(`${row.op}${row.num1}${row.num2} Answer=${row.answer}`); 
    
    //  res.render('index', rows); 
  });
  
  let args = {
        "title" : "Logical Calculator",
         "row" : arr, 
    };
    res.render('index', args);
    //  res.render('index', (err, rows)); 
  
    });

}
   


/**
 * Calculate NOT and return the answer as a string
 */
function calcNOT(num) {
    let answer = "";
    for (let c of num) {
        if (c == '0') {
            answer += "1";
        } else if (c == "1") {
            answer += "0"
        } else {
            return "Invalid number in input";
        }
    }
    return answer
}

/**
 * Calculate either AND or OR and return the answer as a string
 */
function calcDouble(op, num1, num2) {
    if (num1.length != num2.length) {
        return "Invalid lengths";
    }
    let answer = "";
    for (let i = 0; i < num1.length; i++) {
        let c1 = num1[i];
        let c2 = num2[i];
        if (op == "OR") {
            if (c1 == "1" || c2 == "1") {
                answer += "1";
            } else {
                answer += "0";
            }
        } else if (op == "AND") {
            if (c1 == "1" && c2 == "1") {
                answer += "1";
            } else {
                answer += "0";
            }
        }
    }
    return answer;
}

/**
 * Calculate the logical answer and send it back to the user
 */
function calculate(req, res) {
    console.log(req.params);
    let answer = "";
    if (req.params.op == "NOT") {
        answer = calcNOT(req.params.num1);
    } else if (req.params.op == "OR") {
        answer = calcDouble(req.params.op, req.params.num1, req.params.num2);
    } else if (req.params.op == "AND") {
        answer = calcDouble(req.params.op, req.params.num1, req.params.num2);
    } else {
        answer = "Invalid operation";
    }
    insertCalculationAndRespond(req.params.op, req.params.num1, req.params.num2,
                                answer, res);
}

/**
 * Insert the calculation into the database, then respond to the user
 */
function insertCalculationAndRespond(op, num1, num2, answer, res) {
    //use the insert command from sql
    // let holder = [op, num1, num2, answer]; 
    // let placeholders = holder.map(() => '(?)').join(',');
    let sql = 'INSERT INTO Answers(op, num1, num2, answer) VALUES(\'' + op +'\',\'' +  num1 + '\',\'' + num2 + '\',\'' +  answer + '\')';

// output the INSERT statement
        console.log(sql);

    db.run(sql, function(err) {
    if (err) {
        return console.error(err.message);
        }
    // readRenderAndRespond(); 
        
    });
    readRenderAndRespond(res); 
    // Insert answer into database, then call readRenderAndRespond
    // when the insertion is successful
}


// Set up the handlers for Node.js
app.use(express.static("static"));      // static files live in "static" folder
app.set('views', './views')             // set up views and pug
app.set('view engine', 'pug')
app.get('/', (req, res) => {
    readRenderAndRespond(res);
});
app.get('/calculate/op/:op/num1/:num1/num2/:num2', calculate);

// Start Express listening at the given port
app.listen(port, () => {
    console.log("App running at port=" + port);
});
