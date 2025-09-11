import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod/v4";
import { VerifyEmailService } from "../../services/users/verify-email-service.js";

export class VerifyEmailController {
  async handle(req: FastifyRequest, rep: FastifyReply) {
    const tokenValidate = z.object({
      token: z.string().min(1, { message: "Token is required" })
    })

    const { token } = req.query as z.infer<typeof tokenValidate>

    try {
      tokenValidate.parse(req.query)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          code: err.code,
          message: err.message,
          path: err.path.join("/"),
        }))

        return rep.status(400).send({ message: "Validation Error Ocurred", errors })
      }
    }

    try {
      const verifyEmailService = new VerifyEmailService()
      await verifyEmailService.execute({ token })

      const successHtml = `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verificado</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .container {
                    background: white;
                    border-radius: 16px;
                    padding: 40px;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    max-width: 500px;
                    width: 90%;
                }
                .success-icon {
                    font-size: 64px;
                    margin-bottom: 20px;
                    color: #22c55e;
                }
                h1 {
                    color: #1f2937;
                    margin-bottom: 16px;
                    font-size: 28px;
                }
                p {
                    color: #6b7280;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }
                .success-message {
                    background: #dcfce7;
                    border: 1px solid #bbf7d0;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 20px 0;
                }
                .success-text {
                    color: #166534;
                    font-weight: 500;
                    margin: 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-icon">✅</div>
                <h1>Email Verificado com Sucesso!</h1>
                <div class="success-message">
                    <p class="success-text">Sua conta foi verificada e está ativa!</p>
                </div>
                <p>Obrigado por verificar seu email. Agora você pode fazer login em sua conta e começar a usar nossa plataforma.</p>
            </div>
        </body>
        </html>
      `;

      return rep.type('text/html').send(successHtml)

    } catch (error: any) {
      const errorHtml = `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Erro na Verificação</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .container {
                    background: white;
                    border-radius: 16px;
                    padding: 40px;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    max-width: 500px;
                    width: 90%;
                }
                .error-icon {
                    font-size: 64px;
                    margin-bottom: 20px;
                    color: #ef4444;
                }
                h1 {
                    color: #1f2937;
                    margin-bottom: 16px;
                    font-size: 28px;
                }
                p {
                    color: #6b7280;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }
                .error-message {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 20px 0;
                }
                .error-text {
                    color: #dc2626;
                    font-weight: 500;
                    margin: 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="error-icon">❌</div>
                <h1>Erro na Verificação</h1>
                <div class="error-message">
                    <p class="error-text">${error.message}</p>
                </div>
                <p>O link de verificação pode ter expirado ou já foi usado. Entre em contato conosco se o problema persistir.</p>
            </div>
        </body>
        </html>
      `

      const statusCode = error.message === "Invalid or expired verification token" ? 400 : 500;
      return rep.status(statusCode).type('text/html').send(errorHtml)
    }
  }
}