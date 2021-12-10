const express = require('express');
const dotenv = require('dotenv');
//const logger = require('./middleware/logger');
const mongoSanitizer = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const connectDb = require('./config/db');
const colors = require('colors');
const fileupload = require('express-fileupload');
const errorHandler = require('./middleware/error');
const uuid = require('uuid');
const http = require('http');



// Load env vars
dotenv.config({ path: './config/config.env' });


// connect to database
connectDb();

const app = express();
const chatServer = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(chatServer);
//Data sanitization against NoSQL query injection
app.use(mongoSanitizer());

//Data sanitization against xss(cross site scripting)
app.use(xss()); // this middleware is used to prevent any malicious stuff through html code

// Set security headers
app.use(helmet());

//Request Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 mins
    max: 500 //100 requests per 10 mins
});




//Route files
const patients = require('./routes/patients');
const doctors = require('./routes/doctors');
const problems = require('./routes/problem');
const appointments = require('./routes/appointments');
const test = require('./routes/testroutes');
const conversation = require('./routes/conversations')
const lab = require('./routes/labs')



//Body Parser
app.use(express.json());


// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//File uploading
app.use(fileupload());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/patients', patients);
app.use('/api/v1/doctors', doctors);
app.use('/api/v1/problems', problems);
app.use('/api/v1/appointments', appointments);
app.use('/api/test', test);
app.use('/api/v1/conversations', conversation)
app.use('/api/v1/labs', lab)


app.use(errorHandler)

const PORT = process.env.PORT || 5000;


const server = chatServer.listen(PORT,
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue));

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red.bold);
    //close server and exit process
    server.close(() => process.exit(1));
});

app.use('*', (req, res) => {
    res.status(404, {
        message: 'NOT FOUND'
    })
});
