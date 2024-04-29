require('dotenv').config();
require('express-async-errors');

const cors = require('cors')
const express = require('express');
const app = express();

// WebSocket import
const initWebSocket = require('./socket');

// Cybersecurity imports
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
const characterRouter = require('./routes/characterRoutes.js');
const updateUserRouter = require('./routes/updateUserRoutes.js');
const npcRouter = require('./routes/npcRoutes.js');
const bookRouter = require('./routes/bookRoutes.js');
const floraRouter = require('./routes/floraRoutes.js');
const faunaRouter = require('./routes/faunaRoutes.js');
const mountRouter = require('./routes/mountRoutes.js');
const lostTreasureRouter = require('./routes/lostTreasureRoutes.js');
//const dayNightRouter = require('./routes/dayNightRoutes.js' );
const LostLanguageRouter = require('./routes/lostlanguageRoutes.js');
const forbiddenlibraryRouter = require('./routes/forbiddenLibraryRoutes.js');
const bankRouter = require('./routes/bankRoutes.js');
const religiouseventRouter = require('./routes/religiousEventRoutes.js');
const demoniccontractRouter = require('./routes/demonicContractRoutes.js');
const naturaldisasterRouter = require('./routes/naturalDisasterRoutes.js');
const blackmarketRouter = require('./routes/blackMarketRoutes.js');
const inventoryRouter = require('./routes/inventoryRoutes.js');
const religiousorderRouter = require('./routes/religiousOrderRoutes');
const seasonRouter = require('./routes/seasonRoutes.js');
const weatherRouter = require('./routes/weatherRoutes.js');
const templeRouter = require('./routes/templeRoutes.js');
const sentientItemRouter = require('./routes/sentientItemRoutes.js');
const resourceRouter = require('./routes/resourceRoutes.js');
const artifactRouter = require('./routes/artifactRoutes.js');
const religiouscovenantRouter = require('./routes/religiousCovenantRoutes.js');

// Cybersecurity
app.use(helmet());
app.use(cors());
app.use(mongoSanitize());
app.use(cookieParser(process.env.JWT_SECRET));

// Required for Postman 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/user', authUserRouter);
app.use('/api/v1/mob', mobRouter);
app.use('/api/v1/battle', battleRouter);
app.use('/api/v1/item', itemRouter);
app.use('/api/v1/character', characterRouter);
app.use('/api/v1/update-user', updateUserRouter);
app.use('/api/v1/npc', npcRouter);
app.use('/api/v1/flora', floraRouter);
app.use('/api/v1/fauna', faunaRouter);
app.use('/api/v1/book', bookRouter);
app.use('/api/v1/mount', mountRouter);
app.use('/api/v1/lost-treasure', lostTreasureRouter);
//app.use('/api/v1/day-night', dayNightRouter);
app.use('/api/v1/lost-language', LostLanguageRouter);
app.use('/api/v1/forbidden-library', forbiddenlibraryRouter);
app.use('/api/v1/bank', bankRouter);
app.use('/api/v1/religious-event', religiouseventRouter);
app.use('/api/v1/demonic-contract', demoniccontractRouter);
app.use('/api/v1/natural-disaster', naturaldisasterRouter);
app.use('/api/v1/black-market', blackmarketRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/religious-order', religiousorderRouter);
app.use('/api/v1/season', seasonRouter);
app.use('/api/v1/weather', weatherRouter);
app.use('/api/v1/temple', templeRouter);
app.use('/api/v1/sentient-item', sentientItemRouter);
app.use('/api/v1/resource', resourceRouter);
app.use('/api/v1/artifact', artifactRouter)
app.use('/api/v1/religious-covenant', religiouscovenantRouter)

// Error handlers
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(port, () => {
            console.log(`Server is listening on port ${port} ...`);
        });
        initWebSocket(server);
    } catch (error) {
        console.log(error);
    }
};

startServer();