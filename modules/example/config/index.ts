const {NODE_ENV} = process.env;
/*
Be cautious: 
  Webpack doesn't understand ternary operators (?:). 
  To make conditional imports work properly use IF statements. 
*/
export default NODE_ENV === 'development' ? require('./development').default   :
               NODE_ENV === 'test' ? require('./testing').default :
               NODE_ENV === 'production' ? require('./production').default :
               {/* environment is not defined */};
