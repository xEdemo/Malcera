require('dotenv').config();
require('express-async-errors');

const cors = require('cors')
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// Custom middleware import
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');

// Connection to database import
const connectDB = require('./config/connect.js');

// Route imports
const authUserRouter = require('./routes/userRoutes.js');
const mobRouter = require('./routes/mobRoutes.js');
const battleRouter = require('./routes/battleRoutes.js');
const itemRouter = require('./routes/itemRoutes.js');
const npcRouter = require('./routes/npcRoutes.js');
const bookRouter = require('./routes/bookRoutes.js');

app.use(helmet());
app.use(cors());
app.use(mongoSanitize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser(process.env.JWT_SECRET));

app.use('/api/v1/user', authUserRouter);
app.use('/api/v1/mob', mobRouter);
app.use('/api/v1/battle', battleRouter);
app.use('/api/v1/item', itemRouter);
app.use('/api/v1/npc', npcRouter);
app.use('/api/v1/book', bookRouter);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`Server is listening on port ${port} ...`);
        });
    } catch (error) {
        console.log(error);
    }
};

startServer();
