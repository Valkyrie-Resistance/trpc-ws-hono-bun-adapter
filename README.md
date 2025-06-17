# @valkyrie-resistance/trpc-ws-hono-bun-adapter

An adapter to use tRPC WebSockets on Hono with Bun runtime.

## Installation

```bash
bun add @valkyrie-resistance/trpc-ws-hono-bun-adapter
```

## Quick Start

### 1. Define your tRPC router

```typescript
import { initTRPC } from '@trpc/server'
import { observable } from '@trpc/server/observable'

const t = initTRPC.create()

const appRouter = t.router({
  // Regular query
  hello: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { message: `Hello, ${input.name}!` }
    }),

  // Subscription example
  onMessage: t.procedure.subscription(() => {
    return observable<{ message: string; timestamp: number }>((emit) => {
      const interval = setInterval(() => {
        emit.next({
          message: 'Hello from subscription!',
          timestamp: Date.now(),
        })
      }, 1000)

      return () => clearInterval(interval)
    })
  }),
})

export type AppRouter = typeof appRouter
```

### 2. Create the WebSocket handler

```typescript
import { Hono } from 'hono'
import { createBunHonoWSHandler } from '@valkyrie-resistance/trpc-ws-hono-bun-adapter'
import { appRouter } from './router'

const app = new Hono()

// Create the WebSocket handler
const { wsRouter, websocket } = createBunHonoWSHandler({
  router: appRouter,
  createContext: ({ req }) => {
    // Create your context here
    return {
      user: req.headers.get('authorization') ? { id: '1' } : null,
    }
  },
  onError: ({ error, path, type, ctx }) => {
    console.error(`❌ tRPC Error on ${path}:`, error)
  },
})

// Mount the WebSocket router
app.route('/trpc-ws', wsRouter)

export default {
  port: 3000,
  fetch: app.fetch,
  websocket, // Bun WebSocket handler
}
```

### 3. Client-side usage

```typescript
import { createTRPCProxyClient, createWSClient, wsLink } from '@trpc/client'
import type { AppRouter } from './server/router'

// Create WebSocket client
const wsClient = createWSClient({
  url: 'ws://localhost:3000/trpc-ws',
})

// Create tRPC client
const trpc = createTRPCProxyClient<AppRouter>({
  links: [wsLink({ client: wsClient })],
})

// Use queries and mutations
const result = await trpc.hello.query({ name: 'World' })
console.log(result.message) // "Hello, World!"

// Subscribe to real-time updates
trpc.onMessage.subscribe(undefined, {
  onData: (data) => {
    console.log('Received:', data)
  },
  onError: (error) => {
    console.error('Subscription error:', error)
  },
})
```

## Advanced Usage

### Custom Context with Connection Params

```typescript
import { createBunHonoWSHandler } from '@valkyrie-resistance/trpc-ws-hono-bun-adapter'

const { wsRouter, handler } = createBunHonoWSHandler({
  router: appRouter,
  createContext: ({ req, info }) => {
    // Access connection parameters
    const token = info.connectionParams?.token as string
    
    return {
      user: token ? validateToken(token) : null,
      req,
    }
  },
})
```

Client-side with connection params:

```typescript
const wsClient = createWSClient({
  url: 'ws://localhost:3000/trpc-ws',
  connectionParams: () => ({
    token: localStorage.getItem('auth-token'),
  }),
})
```

### Error Handling and Logging

```typescript
const { wsRouter, handler } = createBunHonoWSHandler({
  router: appRouter,
  createContext: ({ req }) => ({ req }),
  onError: ({ error, path, type, ctx, input }) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ tRPC Error:', {
        path,
        type,
        error: error.message,
        code: error.code,
        input,
      })
    }
    
    // Log to your error tracking service
    // logger.error('tRPC WebSocket Error', { error, path, type })
  },
})
```



## API Reference

### `createBunHonoWSHandler(options)`

Creates a WebSocket handler for tRPC that integrates with Hono and Bun.

#### Options

- **`router`** (required): Your tRPC router instance
- **`createContext`** (optional): Function to create the tRPC context
- **`onError`** (optional): Error handler function

#### Returns

- **`wsRouter`**: Hono router instance to mount in your app
- **`handler`**: Bun WebSocket handler to export in your server

### Context Creation Function

```typescript
type CreateContextFn = (opts: {
  req: Request
  res: ServerWebSocket
  info: {
    url: URL
    connectionParams: Record<string, unknown> | null
    signal: AbortSignal
  }
}) => Promise<YourContext> | YourContext
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT © [Valkyrie Resistance](https://github.com/Valkyrie-Resistance)

## Support

- 📖 [Documentation](https://github.com/Valkyrie-Resistance/trpc-ws-hono-bun-adapter)
- 🐛 [Issues](https://github.com/Valkyrie-Resistance/trpc-ws-hono-bun-adapter/issues)
- 💬 [Discussions](https://github.com/Valkyrie-Resistance/trpc-ws-hono-bun-adapter/discussions)

---
