import { validatorCompiler, serializerCompiler, ZodTypeProvider, jsonSchemaTransform } from "fastify-type-provider-zod";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastifySwagger } from "@fastify/swagger";
import { fastify } from "fastify";
import { routes } from "./routes.js";
import dotenv from "dotenv";
import cors from "@fastify/cors";

dotenv.config()

const server = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()
const HOST = process.env.HTTP_HOST
const PORT = process.env.HTTP_PORT


async function start() {
  await server.register(cors)
  
  server.setValidatorCompiler(validatorCompiler)
  server.setSerializerCompiler(serializerCompiler)
  
  await server.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.1',
      info: {
        title: 'Hisui',
        version: '0.0.1',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  })
  await server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    theme: {
      title: 'Hisui Api Docs',
    },
  })
  
  await server.register(routes)
  
  await server.listen({
    host: HOST || "0.0.0.0",
    port: Number(PORT) || 3333
  }).then(() => {
    console.log(`HTTP server running on port: ${PORT}`)
  }).catch((error) => {
    console.log(`Error on start the HTTP server: ${error}`)
  })
}

start()