//-----requiring all the external custom modules---
let utils = require('./utils'); 
//-----requiring all the external npm modules---
let mysql = require('mysql');
let express = require('express');
let app = express();
let upload = require('express-fileupload'); 
let timeout = require('connect-timeout'); //express v4
const nodemailer = require('nodemailer');
let bodyParser = require('body-parser');

//--------Configuring transporter used to send mail -----
let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,

    auth: {
        user: 'iitmodular@gmail.com',
        pass: "rN'QD'uduopowT'8W?R7",

    },
    tls: {
        rejectUnauthorized: false,
    },
});

let randNumMap = new Map(); 

//---fixed helper options---
let helperOptions = {
    from: "Institute for Industrial Technology<iitmodular@gmail.com>",
   

};

//--retrieveing urlEncoder----
let urlEncoder = bodyParser.urlencoded({ extended: true }); 

//--setting up mysql connection----
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


app.listen(2200, 'localhost');

console.log('listening on port 2200'); 


app.set('view engine', 'ejs'); 

//---all app.use calls----
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(timeout(300000));//sets the minimum timeout to 30seconds
app.use(upload()); 
app.use('/libs/fonts', express.static('libs/fonts'));
app.use('/css', express.static('css'));
app.use('/Javascript', express.static('Javascript')); 
app.use((req, res, next) => {
    if (!req.timedout) next();
});




app.get('/', urlEncoder, (req, resp) => {
    let sql =
        `SELECT DISTINCT certificateName as name 
            FROM CertificateRegister
         ORDER BY name ASC
        `; 
    
    connection.query(sql, (error, result) => {
         
        if (!!error) {
            console.log('error in retrieving certificates from the  database');
            console.log(error);
            output = false;
            resp.render('errorFile', {
                error: {
                    message: "An error occured while retrieving a resource",
                    help: "Please try again later",
                    number:  500, 
                }
            }); 
        } else { 
            let currentDate = new Date(); 

            
            resp.render('registration', {
                author: 'Oguejifor Chidiebere',
                courses: result,
                currentDate, 
            });
        }

    });
});



app.post("/submitJson", urlEncoder, (req, resp) => {
    let json = req.body.jsonData;
    let student; 
    try {
       
        student = JSON.parse(unescape(json)); 
    } catch (err) {
        resp.render('errorFile', {
            error: {
                number: 401,
                message: 'The form was not properly filled',
                help: 'Check data inputed', 
            }, 
           
        }); 
        return; 
    }
  
   
    let sql = `SELECT moduleName as name 
                    FROM certificateRegister 
                WHERE  certificateName = ? 
                `;
    let email = unescape(student.fixedData.emailAddress); 
    let certificate = student.selectedProgram;
    let randNumber = utils.generateRandomNumber(); 
    let randStr = utils.generateRandomString(); 

    randNumMap.set(randStr, randNumber); 
  
    console.log('-----student obj------'); 
    console.log(student); 
    connection.query(sql, certificate, (error, result) => {
        if (!!error) {
            resp.render('errorFile', {
                error: {
                    message: "Service is currently unavailable",
                    help: "Please Try again later",
                    number: 500, 
                }
            })
        } else {
            helperOptions.to = email;
            helperOptions.subject = `Confirmation Email`
            helperOptions.text = `Your Confirmation number is ${randNumber}`;
            transporter.sendMail(helperOptions, (error, info) => {
                if (!!error) {
                    resp.render('errorFile', {
                        error: {
                            message: `Error while sending mail to ${email}`,
                            help: 'Please verify that the email is valid',
                            number: 400, 
                        }
                    }); 
                } else {
                   console.log('Email was sent successfully!!!');
                   let minutes = 10; 

                   setTimeout(() => randNumMap.delete(randStr), minutes * 60 * 10000); 
                    resp.render('confirmationScreen', {
                        modules: result,
                        randStr: randStr,
                        json, email,
                    });
                }

            }); 
        }
    });

}); 





app.post('/registerStudent', urlEncoder, (req, resp) => {
    console.log('-body:->\n' + req.body);
     console.log(req.body); 
    for (let key in req.files) {
        console.log(key); 
    }
    console.log('---------'); 
    console.log(req.files.image); 
    let json = unescape(unescape(req.body.data));
    let student = JSON.parse(json);
    console.log(student);

    let education = student.education;
    let experience = student.experience;

    let randomStr = unescape(unescape(req.body.hashedNumber));
    let inputedNumber = unescape(req.body.inputedNumber);
    
    let aspID; 

    console.log('Rand str: ' + randomStr); 
    console.log('NUm from map:  ' + randNumMap.get(randomStr)); 
    console.log('Random str number: ' + randomStr); 
    console.log('Inputed number number: ' + randomStr); 
    if (inputedNumber != randNumMap.get(randomStr)) {
      
        resp.render('errorFile', {
            error: {
                message: 'The number you inputed was not valid',
                number: 401,
                help: 'Please try again some other time',
            }, 
           
        });
        return; 
    }
   

    //-------transaction begins-------------
    connection.beginTransaction((error) => {
        if (!!error) {
            resp.render('errorFile', {
                error: {
                    message: 'Server cannot process your request at this point',
                    number: 500,
                    help: 'Please try again some other time',
                }, 
               
            }); 
            return; 
        }
        
        
        //------Inserting personal data informations--------
        student.fixedData.dateOfBirth = new Date(student.fixedData.dateOfBirth);
        
        student.fixedData.image = req.files.image.data; //check this 
       delete student.fixedData.phoneNumbers;  
        console.log('------Inserting Student------'); 
        connection.query(
            'INSERT INTO `aspiringstudent` SET ?', student.fixedData, (error, result) => {
                if (!!error) {
                    console.log('Error in inserting personal data!');
                    console.log(error);
                    console.log(error.sql); 
                    connection.rollback((error) => {
                        if (!!error) {
                            console.log('Error in rolling back data student!');
                            resp.render('errorFile',
                                {
                                    error: {
                                        message: 'There was an error in sending your request',
                                        help: 'Please try again',
                                        number: 500,
                                    },
                                });
                            return; 
                        }
                        
                    });
                    resp.render('errorFile', {
                        error: {
                            message: 'There was an error in sending your request',
                            help: 'Please try again',
                            number: 500,
                        },
                    });
                    return; 
                } else {
                    console.log('Successfully inserted personal data!!!');
                    aspID = result.insertId;
                    console.log(aspID);
                    let phoneQuery = 'INSERT INTO aspiringstudentphone SET ? '; 
                    for (let phone of student.phoneNumbers) {
                        phone.aspID = aspID;
                        connection.query(phoneQuery, phone, (error, result) => {
                            if (!!error) {
                                console.log('Error in inserting phone number');
                                console.log(error);
                            } else {
                                console.log('Successfully inserted phone numbers'); 
                            }
                        }); 
                    }
                    if (student.sponsor) {
                        let sponsorQuery = 'INSERT INTO Aspiringsponsor SET ? '; 
                        student.sponsor.aspID = aspID; 
                        connection.query(sponsorQuery, student.sponsor, (error, result) => {
                            if (!!error) {
                                console.log('Error in while inserting sponsor');
                                resp.render('errorFile', {
                                    error: {
                                        message: 'An error occured while processing input.',
                                        help: 'Please try again',
                                        number: 500,
                                    }, 
                                    

                                });
                               
                            } else {
                                console.log('Sponsor inserted successfully!!!'); 
                            }
                        }); 
                    }
                    let counter = 0; 
                    
                    let meansQuery = `INSERT INTO AspiringMeans SET ?`;
                 
                    console.log('----Attempting to insert means---');
                    for (let mean of student.means) {
                        mean.aspID = aspID; 
                        connection.query(meansQuery, mean, (error, result) => {
                            if (!!error) {
                                console.log('Error in inserting means info');
                                connection.rollback((error) => {
                                    if (error) {
                                        console.log('Error in rollback means data');
                                        throw error;
                                    }

                                });
                                throw error;
                            } else if (result.affectedRows <= 0) {
                                connection.rollback((error) => {
                                    console.log('Error in inserting means to database');
                                });
                                throw new Error('Failed to insert');
                            } else {
                                console.log('Successfully inserted a means');
                                counter++; 
                                console.log(counter); 
                                if (counter >= student.means.length) {


                                    for (let module of student.modules) {
                                        let moduleObj = { aspID, module, };

                                        connection.query('INSERT INTO aspModule SET ? ', moduleObj, (error, result) => {
                                            if (!!error) {
                                                console.log('Error in inserting modules');
                                                throw error; 
                                            } else {
                                                console.log('success');
                                            }
                                        });
                                    }

                                    console.log('Attempting to insert education'); 
                                    let educationQuery = 'INSERT INTO aspiringstudenteducation SET ?';
                                    //     `INSERT INTO aspiringstudenteducation(
                                    // AspiringStudentID, BeginDate, EndDate, CourseRead, Institution,QualificationName) 
                                    // VALUES ?`;

                                    counter = 0;
                                    //------Inserting educational info to database------ 
                                    for (let eduData of student.education) {
                                        eduData.aspID = aspID; 
                                        connection.query(educationQuery, eduData, (error, result) => {
                                            if (!!error) {
                                                console.log('Error while inserting education data');
                                                connection.rollback((error) => {
                                                    console.log('Error in rolling back query while inserting education');
                                                    throw error;
                                                });
                                                console.log(error)
                                                throw error;

                                            } else if (result.affectedRows) {
                                                console.log('Sucessfully inserted an educational background');
                                                counter++;
                                                if (counter >= student.education.length) {

                                                    if (student.experience.length == 0) {
                                                        connection.commit((error) => {
                                                            if (!!error) {
                                                                console.log('Error in commiting changes');
                                                                throw error;
                                                            } else {
                                                                console.log('Successfully committed changes'); 
                                                                sendConfirmation(); 
                                                                return; 
                                                            }
                                                        });
                                                    } else {
                                                        //------Inserting experience information------
                                                        let expQuery = 'INSERT INTO aspiringexperience SET ? ';

                                                        `AspiringStudID, BeginDate, EndDate, JobTitle, Employer) VALUES ? `;

                                                        student.experience.forEach((job) => {
                                                            job.beginDate = new Date(job.beginDate);
                                                            job.endDate = new Date(job.endDate);

                                                        });

                                                        counter = 0;
                                                        let experienceBackground = student.experience;
                                                        for (let job of experienceBackground) {
                                                            job.aspID = aspID;
                                                            let responsibilities = job.responsibilities;
                                                            delete job.responsibilities;
                                                            console.log('-responsibilities =' + responsibilities); 
                                                            connection.query(expQuery, job, (error, result) => {
                                                                if (!!error) {
                                                                    connection.rollback((error) => {
                                                                        if (!!error) {
                                                                            console.log('Error occured while rolling back data');
                                                                        } else {
                                                                            console.log('Rollback successful'); 
                                                                        }
                                                                      

                                                                    });
                                                                    throw error;
                                                                }
                                                                counter++; 
                                                                let respCounter = 0;
                                                                let respQuery = 'INSERT INTO aspiringjobresponsibility SET  ?'

                                                                let aspExpID = result.insertId; //change this accordingly
                                                                console.log('ExpID = ' + aspExpID); 
                                                                for (let duty of responsibilities) {
                                                                    let resObj = { duty, aspExpID };

                                                                    connection.query(respQuery, resObj, (error, result) => {
                                                                        if (!!error) {
                                                                            console.log('Error in inserting responsiblity');
                                                                            connection.rollback((error) => {
                                                                                console.log('Error in rolling back ')
                                                                            });
                                                                            throw error;
                                                                        } else {
                                                                            console.log('Successfully inserted one experience obj');
                                                                            respCounter++;
                                                                           
                                                                            if (respCounter >= responsibilities.length && counter >= student.experience.length) {
                                                                                connection.commit((error) => {
                                                                                    if (!!error) {
                                                                                        console.log('Error in commiting changes');
                                                                                        throw error;
                                                                                    } else {
                                                                                        console.log('All data have been successfully commited into the database');
                                                                                        sendConfirmation(); 
                                                                                    }

                                                                                });
                                                                            }
                                                                        }
                                                                    });
                                                                }


                                                            });

                                                        }
                                                    }

                                                }
                                            }
                                        });

                                    }
                                }
                               
                            }
                        });
                    }

                   

                   
                }
            });


        
        
      
    });
    function sendConfirmation() {
        connection.query('SELECT contactPhone FROM resources', (error, result) => {
            if (randNumMap.has(randomStr))randNumMap.delete(randomStr); 
            if (!!error) {
                resp.render('insertion-successful', {
                    contact: 'Error while retrieving number' ,
                    name: `${student.fixedData.firstName} ${student.fixedData.lastName}`,
                    title: `${student.fixedData.title}`,
                });
            } else {
                resp.render('insertion-successful', {
                    contact: result[0].contactPhone,
                    name: `${student.fixedData.firstName} ${student.fixedData.lastName}`,
                    title: `${student.fixedData.title}`,
                });
            }
           

        }); 
        
    }
});




//app.listen('1338'); 