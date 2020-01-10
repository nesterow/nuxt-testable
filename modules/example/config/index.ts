const {NODE_ENV} = process.env;

export default NODE_ENV === 'development' ? require('./development').default   :
               NODE_ENV === 'test' ? require('./testing').default :
               NODE_ENV === 'production' ? require('./production').default :
               {/* environment is not defined */};