// @ts-ignore
import serverApp from '../dist/server.cjs';

const app = (serverApp && serverApp.default) ? serverApp.default : serverApp;

export default app;
