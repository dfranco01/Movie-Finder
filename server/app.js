//importing and loading API key
const express = require('express');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();
const apiKey = process.env.API_KEY;

//creating express server
const app = express();
app.use(morgan('dev'));



const cache ={}; //caches are stored in an object or array
//async declares a asynchronous func, returning a Promise
//await can only be declared inside an async func, halts execution until Promise resolves
//Pending, Fulfilled, Rejected
app.get('/', async (req, res) => {
    const query =req.query; /*req object has different properties, a common one is 'query',
    containing query params from URL, in this case move title and APIKEY. Other common ones
    are URL, Body, Headers, params, method, route*/
    /*here we create URL search params and convert it from Object to string*/
    //key represents move we're looking for
    const key = new URLSearchParams(query).toString();
 
    /*Here we create a time field to compare with. We use this to determine if data is 
    expired or not. If THIS point of time is previous to oneDay field, data is still
    valid and can quickly be retrieved using cache, if not, a fresh retrieval is needed.
    We're also checking if there is data present in cache */
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if(cache[key] && (Date.now() - cache[key].timestamp < oneDay)) {
        //sending JSON response to client, converting js object to JSON 
        return res.json(cache[key].data);
    }
    /*try-catch not needed but strongly recommended, think of Java DataBase Connectivity,
    (JDBC), SQLExceptions are common and require a try-catch for SQLException, same 
    concept here, when retreiving from database, we need to account for issues so that
    application doesn't crash completely */
    try{
        //Here we are conducting a fresh retrieval of new data and creating new object
        const response = await axios.get(`http://www.omdbapi.com/?${key}&apikey=${apiKey}`);
       
        cache[key] = {
            data: response.data,
            timestamp: Date.now()
        };
    res.json(response.data);
 
    }catch (error) {
        console.error('Error fetching data from OMDB API:', error);
        res.status(500).json({ error: 'Failed to fetch data from OMDB API' });
    }
});
//this line allows this app instance to be utilized in other files
module.exports = app;