import { createTransport } from 'nodemailer';
import { randomBytes } from 'node:crypto';
import dotenv from "dotenv";

dotenv.config()

const EMAIL = process.env.EMAIL_USER
const PASSWORD = process.env.EMAIL_PASS

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
})


export async function sendVerificationEmail(email: string, username: string, token: string) {
  const verificationUrl = `localhost:3333/verify-email?token=${token}`

  const htmlTemplate = getVerificationEmailTemplate(username, verificationUrl)

  const mailOptions = {
    from: `"Sua Aplicação" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verifique sua conta',
    html: htmlTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send verification email')
  }
}

export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex')
}

export function getTokenExpiration(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000)
}

function getVerificationEmailTemplate(username: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificação de Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 40px 0; text-align: center;">
                    <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-collapse: collapse;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                                    🎉 Bem-vindo!
                                </h1>
                                <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                    Verifique sua conta para começar
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <div style="text-align: center;">
                                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 500;">
                                        Olá, ${username}!
                                    </h2>
                                    
                                    <p style="color: #666666; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                                        Obrigado por se cadastrar em nossa plataforma! Para concluir seu cadastro e começar a usar todos os recursos, você precisa verificar seu endereço de email.
                                    </p>
                                    
                                    <!-- CTA Button -->
                                    <a href="${verificationUrl}" 
                                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 50px; font-weight: 600; font-size: 16px; margin: 20px 0; transition: transform 0.2s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                        ✅ Verificar Email
                                    </a>
                                    
                                    <p style="color: #999999; margin: 30px 0 20px 0; font-size: 14px; line-height: 1.5;">
                                        Se o botão não funcionar, copie e cole este link no seu navegador:
                                    </p>
                                    
                                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                                        <a href="${verificationUrl}" style="color: #667eea; text-decoration: none; word-break: break-all; font-size: 14px;">
                                            ${verificationUrl}
                                        </a>
                                    </div>
                                    
                                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 30px 0;">
                                        <p style="color: #856404; margin: 0; font-size: 14px; font-weight: 500;">
                                            ⏰ Este link expira em 24 horas
                                        </p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
                                <p style="color: #6c757d; margin: 0 0 15px 0; font-size: 14px;">
                                    Se você não se cadastrou em nossa plataforma, pode ignorar este email.
                                </p>
                                
                                <div style="margin-top: 20px;">
                                    <p style="color: #6c757d; margin: 0; font-size: 12px;">
                                        © 2024 Sua Aplicação. Todos os direitos reservados.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `
}