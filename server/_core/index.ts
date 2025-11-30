import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from '../routers';
import { createContext } from './trpc';

const app = express();
const port = 3000;

app.use(
    '/api/trpc',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
    })
);

// External REST API
import { externalRouter } from '../external';
app.use('/api/external', externalRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
