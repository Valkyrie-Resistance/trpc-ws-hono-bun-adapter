import type { AnyRouter, CreateContextCallback, inferRouterContext } from '@trpc/server'
import type { NodeHTTPCreateContextFnOptions } from '@trpc/server/adapters/node-http'
import type { BaseHandlerOptions } from '@trpc/server/http'
import type { MaybePromise, TRPCRequestInfo } from '@trpc/server/unstable-core-do-not-import'
import type { ServerWebSocket } from 'bun'

export type CreateBunHonoWSSContextFnOptions<TRouter extends AnyRouter> =
  NodeHTTPCreateContextFnOptions<
    ServerWebSocket<BunHonoWSClientCtx<TRouter>>,
    ServerWebSocket<BunHonoWSClientCtx<TRouter>>
  >

export type CreateBunHonoWSSContextFn<TRouter extends AnyRouter> = (
  opts: CreateBunHonoWSSContextFnOptions<TRouter>,
) => MaybePromise<inferRouterContext<TRouter>>

export type BunHonoWSAdapterOptions<TRouter extends AnyRouter> = BaseHandlerOptions<
  TRouter,
  ServerWebSocket<BunHonoWSClientCtx<TRouter>>
> &
  CreateContextCallback<
    inferRouterContext<TRouter>,
    (opts: CreateBunHonoWSSContextFnOptions<TRouter>) => MaybePromise<inferRouterContext<TRouter>>
  >

export type BunHonoWSClientCtx<TRouter extends AnyRouter> = {
  abortController: AbortController
  abortControllers: Map<string | number, AbortController>
  url: URL
  ctx:
    | Promise<inferRouterContext<TRouter>>
    | ((params: TRPCRequestInfo['connectionParams']) => Promise<inferRouterContext<TRouter>>)
}
