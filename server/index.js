require("dotenv").config();
require("isomorphic-fetch");
const Koa = require("Koa");
const next = require("next");
const { default: createShopifyAuth } = require("@shopify/koa-shopify-auth");
const { verifyRequest } = require("@shopify/koa-shopify-auth");
const session = require("koa-session");

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET_KEY } = process.env;

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = new Koa();
  server.use(session({ secure: true, sameSite: 'none' }, server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: [
        "read_products",
        "write_products",
        "read_script_tags",
        "write_script_tags",
      ],
      afterAuth(ctx) {
        const { shop, acessToken } = ctx.session;

        ctx.redirect("/");
      },
    })
  );

  server.use(verifyRequest());
  server.use(async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
    return;
  });

  server.listen(port, () =>
    console.log(`Server is running on http://localhost:${port}`)
  );
});
