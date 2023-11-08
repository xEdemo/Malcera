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
const bookRouter = require('./routes/bookRoutes.js');
const authUserRouter = require('./routes/userRoutes.js');
const mobRouter = require('./routes/mobRoutes.js');
const battleRouter = require('./routes/battleRoutes.js');
const itemRouter = require('./routes/itemRoutes.js');
const npcRouter = require('./routes/npcRoutes.js')
//const floraRouter = require('./routes/floraRoutes'); 
//const faunaRouter = require('./routes/faunaRoutes'); 
//const weatherRouter = require('./routes/weatherRoutes');
const mountRouter = require('./routes/mountRoutes');
//const lostTreasureRouter = require('./routes/lostTreasureRoutes');
//const seasonRouter = require('./routes/seasonRoutes');
//const dayNightRouter = require('./routes/daynightRoutes' );
//const LostLanguageRouter = require('./routes/lostlanguageRoutes');
//const sentientItemRouter = require('./routes/sentientitemRoutes');
//const forbiddenlibraryRouter = require('./routes/forbiddenlibraryRoutes');
//const bankRouter = require('./routes/bankRoutes');
//const religiousorderRouter = require('./routes/religiousorderRoutes');
//const templeRouter = require('./routes/templeRoutes');
//const religiouseventRouter = require('./routes/religiouseventRoutes');
//const demoniccontractRouter = require('./routes/demoniccontractRoutes.js');
//const naturaldisasterRouter = require('./routes/naturaldisasterRoutes');
//const blackmarketRouter = require('./routes/blackmarketRoutes');



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
//app.use('/api/v1/flora', floraRouter);
//app.use('/api/v1/fauna', faunaRouter);
//app.use('/api/v1/weather', weatherRouter);
app.use('/api/v1/book', bookRouter);
app.use('/api/v1/mount', mountRouter);
//app.use('/api/v1/lostTreasures', lostTreasureRouter);
//app.use('/api/v1/season', seasonRouter);
//app.use('/api/v1/dayNight', dayNightRouter);
//app.use('/api/v1/lostLanguage', LostLanguageRouter);
//app.use('/api/sentient-items', sentientItemRouter);
//app.use('/api/v1/forbidden-libraries', forbiddenlibraryRouter);
//app.use('/api/v1/bank', bankRouter);
//app.use('/api/v1/religiousorder', religiousorderRouter);
//app.use('/api/v1/temple', templeRouter);
//app.use('/api/v1/religious-events', religiouseventRouter);
//app.use('/api/v1/demonicContract', demoniccontractRouter);
//app.use('/api/v1/natural-disasters', naturaldisasterRouter);
//app.use('/api/v1/black-markets', blackmarketRouter);





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
