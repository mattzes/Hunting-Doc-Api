// Cors options
// view all options at https://expressjs.com/en/resources/middleware/cors.html#configuration-options
const corsOptions = {
  origin: process.env.DOMAIN,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
};

module.exports.corsOptions = corsOptions;
