// {"email":"admin@wordz.com", "password":"password"}
// {"email":"643152695835881@loopback.facebook.com", "password":"Test123"}
module.exports = function (app) {

  app.remotes().phases.addBefore('invoke', 'options-from-request').use(function (ctx, next) {
    console.log('addBefore');
    ctx.args.options.accessToken = ctx.req.user.accessToken;
    ctx.args.options.currentUser = ctx.req.user;
    next();
  });
};
