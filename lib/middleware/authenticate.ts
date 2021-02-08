//
//
///  WE SHOULD HAVE MADE A VISUALIZER - AUTH LIB - BAD IDEA
// O________________O
// !!!!!!!!!!!!!!!!!!!!!!!!!!!?????????????????????????
//  :' (
//
//
interface options {
  session:boolean;
  passredirect:string;
  passmessage:string;
  failredirect:string;
  failmessage:string;
}  

interface dashport {   //DEFINE THIS
  strategies:object;
}
interface ctx {  //DEFINE THIS BETTER
  //this is OAKS response/request data access.
  app:any;
  cookies:object;
  request:object;
  response:object;
  state:object; 
  assert:Function;
  throw:Function;
}



export default function authenticate ( dashport:dashport, strategy:string, options:options, callback:Function) {
  
  // are we doing CUSTOM CALLBACK FUNC?

  //use this space to define any specific data that needs to be set.  is a session already active, 

  return async function authenticate(ctx:ctx, next:Function) {

    //ATTEMPT
    async function authAttempt( attempts:number ) {

      //CONFIRM AND PULL STRATEGY, CHANGE THIS TO ALLOW MULTIPLE STRATS
      if (!strategy) return failure();
      if (dashport.strategies[strategy] !== true) return new Error('Not a valid Strategy.')  //THIS IS HERE TO CONFIRM THE OBJECT IS A RECOGNIZED STRAT
      const curStrategy:any = new Object(dashport.strategies[strategy]);

      // CREATE SUCCESS FUNCTION -> WHAT DOES STRAT DO WHEN AUTH PASSES/HAS ACCESS TO CTX
      curStrategy.succcess = (user:object, info:object = {}) => {
        if (callback) return callback(null, user, info);



      } //INFO not implemented for MVP?
      
      //CREATE FAILED AUTH FUNCTION -> HAT DOES STRAT DO WHEN AUTH FAILS/HAS ACCESS TO CTX
      // problem=why auth failed, status code of failure?
      curStrategy.failure = (problem:object, status?:object) => {
        //push failure issues to failure array
        authAttempt(attempts+1);    
      };

      //SKIP METHOD IF YOU JUST WANT TO MOVE ON??? WHY IDK._strategies
      curStrategy.skip =  () => {
        await next();
      }

      //ERROR HANDLING
      curStrategy.error =  (error:object) => {
        if (callback) return callback(error);
        await next(error);
      }
    }
    //FAILURE
    async function failure() {};  //WHAT TYPES OF FAILURES ARE WE EXPECTING? DO WE WANT TO ADDRESS??/
  }
