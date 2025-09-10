import 'fastify';

declare module 'fastify' {
  export interface FastifyRequest{
    user: Partial<{
      id: string,
      email: string,
      password: string,
      name: string,
      createdAt: Date,
      updatedAt: Date,
    }>
  }
}
