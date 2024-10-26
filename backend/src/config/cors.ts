import colors from 'colors';
import { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
    origin: (origin, callback) => {
        const whiteList = [process.env.FRONTEND_URL, 'http://localhost:3000']; // Agrega más URLs si es necesario

        if (!origin || whiteList.includes(origin)) {
            callback(null, true);
        } else {
            console.error(colors.bgRed.white('Error de CORS: Acceso denegado para el origen ' + origin));
            callback(new Error('Error de CORS: Acceso denegado'), false);
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
};
