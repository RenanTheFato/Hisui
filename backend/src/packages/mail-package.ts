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
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificação de Email</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
    }

    .container {
      width: 100%;
      padding: 40px 0;
      display: flex;
      justify-content: center;
    }

    .card {
      width: 600px;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .card-header {
      background: linear-gradient(135deg, #0fbc48ff 0%, #025623ff 100%);
      padding: 40px 30px;
      text-align: center;
    }

    .card-header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 600;
    }

    .card-header p {
      color: #ffffff;
      margin-top: 10px;
      font-size: 16px;
      opacity: 0.9;
    }

    .card-body {
      padding: 40px 30px;
      text-align: center;
    }

    .card-body h2 {
      color: #333333;
      margin-bottom: 20px;
      font-size: 24px;
      font-weight: 500;
    }

    .card-body p {
      color: #666666;
      margin-bottom: 30px;
      font-size: 16px;
      line-height: 1.6;
    }

    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #7eea66ff 0%, #4ba24cff 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      transition: transform 0.2s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    .link-info {
      color: #999999;
      margin: 30px 0 20px 0;
      font-size: 14px;
      line-height: 1.5;
    }

    .link-box {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      margin: 20px 0;
      word-break: break-all;
    }

    .link-box a {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
    }

    .warning {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 15px;
      margin: 30px 0;
    }

    .warning p {
      color: #856404;
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }

    .card-footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }

    .card-footer p {
      color: #6c757d;
      margin: 0 0 15px 0;
      font-size: 14px;
    }

    .card-footer small {
      color: #6c757d;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="card-header">
        <h1>🎉 Bem-vindo!</h1>
        <p>Verifique sua conta para começar</p>
      </div>

      <div class="card-body">
        <h2>Olá, ${username}!</h2>
        <p>
          Obrigado por se cadastrar em nossa plataforma! Para concluir seu cadastro e começar a usar todos os recursos, você precisa verificar seu endereço de email.
        </p>

        <a href="${verificationUrl}" class="btn">✅ Verificar Email</a>

        <p class="link-info">
          Se o botão não funcionar, copie e cole este link no seu navegador:
        </p>

        <div class="link-box">
          <a href="${verificationUrl}">${verificationUrl}</a>
        </div>

        <div class="warning">
          <p>⏰ Este link expira em 24 horas</p>
        </div>
      </div>

      <div class="card-footer">
        <p>Se você não se cadastrou em nossa plataforma, pode ignorar este email.</p>
        <small>© 2024 Sua Aplicação. Todos os direitos reservados.</small>
      </div>
    </div>
  </div>
</body>
</html>
`
}