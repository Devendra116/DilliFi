import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-b4ccc00b/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-b4ccc00b/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    );
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      createdAt: new Date().toISOString(),
      strategies: [],
      purchases: []
    });

    return c.json({ 
      user: data.user,
      access_token: 'mock_access_token_' + data.user.id
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Sign in endpoint
app.post("/make-server-b4ccc00b/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY'),
    );
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Signin error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      user: data.user,
      access_token: data.session.access_token
    });
  } catch (error) {
    console.log('Signin error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get user strategies
app.get("/make-server-b4ccc00b/user/strategies", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // For demo purposes, return mock data
    // In production, you'd validate the token and get real user data
    const strategies = await kv.getByPrefix('strategy:');
    
    return c.json({ strategies });
  } catch (error) {
    console.log('Get strategies error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create strategy
app.post("/make-server-b4ccc00b/strategies", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const strategyData = await c.req.json();
    const strategyId = 'strategy_' + Date.now();
    
    const strategy = {
      id: strategyId,
      ...strategyData,
      createdAt: new Date().toISOString(),
      status: 'active',
      performance: '+0.0%',
      users: 0,
      totalValue: '$0'
    };

    await kv.set(`strategy:${strategyId}`, strategy);
    
    return c.json({ strategy });
  } catch (error) {
    console.log('Create strategy error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Purchase strategy
app.post("/make-server-b4ccc00b/strategies/:id/purchase", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const strategyId = c.req.param('id');
    const purchaseId = 'purchase_' + Date.now();
    
    const purchase = {
      id: purchaseId,
      strategyId,
      userId: 'user_from_token', // In production, extract from token
      purchasedAt: new Date().toISOString(),
      status: 'completed'
    };

    await kv.set(`purchase:${purchaseId}`, purchase);
    
    return c.json({ purchase });
  } catch (error) {
    console.log('Purchase strategy error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);