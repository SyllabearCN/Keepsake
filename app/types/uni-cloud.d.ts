declare module '@dcloudio/uni-cloud' {
  interface UniCloudResult<T = unknown> {
    data?: T
    result?: T
  }

  interface UniCloudCollection {
    where(query: Record<string, unknown>): UniCloudCollection
    orderBy(field: string, order: 'asc' | 'desc'): UniCloudCollection
    limit(value: number): UniCloudCollection
    get(): Promise<UniCloudResult<unknown[]>>
  }

  interface UniCloudDatabase {
    collection(name: string): UniCloudCollection
  }

  interface UniCloudClient {
    database(): UniCloudDatabase
  }

  interface UniCloudSdk {
    init(config: {
      provider: string
      spaceId: string
      clientSecret: string
      endpoint?: string
    }): UniCloudClient
  }

  const uniCloud: UniCloudSdk
  export default uniCloud
}
