let mysql = require('mysql');
let express = require('express'); 
let app = express(); 
let connection = mysql.createConnection({
	host: 'localhost',
	user: 'studentWebLoginAccount',
	password: 'LEY"YYzn^c"YAG_vMnTdJ"',
	database: 'modularappdatabase',
});

connection.connect(function (error) {
	//callback function 
	if (!!error) {
		console.log('Error in connecting to Db');
		console.log(error.message);
	} else {
		console.log('Connected!!!')
	}
});

let test = {
	data: 2,
	name:'Chidiebere',
};
connection.query('INSERT INTO test SET ? ', test, (error, result) => {
	if (!!error){
		console.log('Failed');
		console.log(error); 
	}
	else console.log('Success'); 
}); 