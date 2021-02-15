import { Router } from './deps.ts';
import Dashport from '../lib/dashport.ts'

const router: any = new Router();

// const dashport = new Dashport('oak');

// router.get('/test', 
//   dashport.authenticate('google'),
//   (ctx: any, next: any) => {
//     ctx.response.body = 'Hello Waye';
//   }
// )


export default router;