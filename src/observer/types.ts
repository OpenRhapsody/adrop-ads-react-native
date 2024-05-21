export interface State {
    key: string
    index: number
    routeNames: any[]
    history?: unknown[]
    routes: Route[]
    type: string
    stale: boolean
}

export interface Route {
    key: string
    name: string
    path?: string
    params?: any
}
