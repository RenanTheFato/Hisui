import { createTransport } from 'nodemailer';
import { randomBytes } from 'node:crypto';
import dotenv from "dotenv";

dotenv.config()

const EMAIL = process.env.EMAIL_USER
const PASSWORD = process.env.EMAIL_PASS
const BACKEND_ADDRESS = process.env.BACKEND_URL

const transporter = createTransport({
	service: 'gmail',
	auth: {
		user: EMAIL,
		pass: PASSWORD,
	},
})

export async function sendVerificationEmail(email: string, username: string, token: string) {
	const verificationUrl = `http://${BACKEND_ADDRESS}/verify-email?token=${token}`

	const htmlTemplate = getVerificationEmailTemplate(username, verificationUrl)

	const mailOptions = {
		from: `"Hisui" <${process.env.EMAIL_USER}>`,
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
      background-color: hsla(0, 0%, 96%, 1.00);
      width: 100%;
      height: 100%;
    }

    .email-wrapper {
      width: 100%;
      background-color: hsla(0, 0%, 96%, 1.00);
      padding: 0;
      margin: 0;
    }

    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .card {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: hsla(0, 0%, 100%, 1.00);
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .card-header {
      background: linear-gradient(135deg, hsla(140, 85%, 40%, 1.00) 0%, rgba(2, 86, 35, 1) 100%);
      padding: 40px 30px;
      text-align: center;
    }

    .card-header h1 {
      color: hsla(0, 0%, 100%, 1.00);
      font-size: 28px;
      font-weight: 600;
      margin: 0;
    }

    .card-header p {
      color: hsla(0, 0%, 100%, 1.00);
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }

    .card-body {
      padding: 40px 30px;
      text-align: center;
    }

    .card-body h2 {
      color: hsla(0, 0%, 20%, 1.00);
      margin: 0 0 20px 0;
      font-size: 24px;
      font-weight: 500;
    }

    .card-body p {
      color: hsla(0, 0%, 40%, 1.00);
      margin: 0 0 30px 0;
      font-size: 16px;
      line-height: 1.6;
    }

    .btn-container {
      text-align: center;
      margin: 20px 0;
    }

    .btn {
      display: inline-block;
      background: linear-gradient(135deg, hsla(109, 76%, 66%, 1.00) 0%, hsla(121, 37%, 47%, 1.00) 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s ease;
      box-shadow: 0 4px 15px hsla(229, 76%, 66%, 0.40);
      border: none;
      cursor: pointer;
    }

    .btn:hover {
      transform: translateY(-2px);
      color: #ffffff;
      text-decoration: none;
    }

    .link-info {
      color: hsla(0, 0%, 60%, 1.00);
      margin: 30px 0 20px 0;
      font-size: 14px;
      line-height: 1.5;
    }

    .link-box {
      background-color: hsla(210, 17%, 98%, 1.00);
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid hsla(126, 76%, 66%, 1.00);
      margin: 20px 0;
      word-break: break-all;
      text-align: left;
    }

    .link-box a {
      color: hsla(0, 0%, 0%, 1.00);
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

    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px 10px;
      }
      
      .card {
        border-radius: 8px;
      }
      
      .card-header,
      .card-body,
      .card-footer {
        padding: 30px 20px;
      }
      
      .card-header h1 {
        font-size: 24px;
      }
      
      .card-body h2 {
        font-size: 20px;
      }
      
      .btn {
        padding: 14px 28px;
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
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

          <div class="btn-container">
            <a href="${verificationUrl}" class="btn"> Verificar Email</a>
          </div>

          <p class="link-info">
            Se o botão não funcionar, copie e cole este link no seu navegador:
          </p>

          <div class="link-box">
            <a href="${verificationUrl}">${verificationUrl}</a>
          </div>

          <div class="warning">
            <p> Este link expira em 24 horas</p>
          </div>
        </div>

        <div class="card-footer">
          <p>Se você não se cadastrou em nossa plataforma, pode ignorar este email.</p>
          <small>© ${new Date().getFullYear()} Sua Aplicação. Todos os direitos reservados.</small>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`
}