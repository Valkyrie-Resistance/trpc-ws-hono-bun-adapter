import type { AnyRouter, CreateContextCallback, inferRouterContext } from '@trpc/server'
import type { NodeHTTPCreateContextFnOptions } from '@trpc/server/adapters/node-http'
import type { BaseHandlerOptions, TRPCRequestInfo } from '@trpc/server/http'
import type { MaybePromise } from '@trpc/server/unstable-core-do-not-import'
import type { ServerWebSocket } from 'bun'

export type CreateBunHonoWSSContextFnOptions<TRouter extends AnyRouter> =
  NodeHTTPCreateContextFnOptions<Request, ServerWebSocket<BunHonoWSClientCtx<TRouter>>>

export type BunHonoWSAdapterOptions<TRouter extends AnyRouter> = BaseHandlerOptions<
  TRouter,
  Request
> &
  CreateContextCallback<
    inferRouterContext<TRouter>,
    (opts: CreateBunHonoWSSContextFnOptions<TRouter>) => MaybePromise<inferRouterContext<TRouter>>
  >

export type BunHonoWSClientCtx<TRouter extends AnyRouter> = {
  req: Request
  abortController: AbortController
  abortControllers: Map<string | number, AbortController>
  ctx:
    | Promise<inferRouterContext<TRouter>>
    | ((params: TRPCRequestInfo['connectionParams']) => Promise<inferRouterContext<TRouter>>)
}
