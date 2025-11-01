import { createTransport } from 'nodemailer';
import { Action, AssetType } from "@prisma/client";
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

interface OrderEmailData {
	email: string;
	username: string;
	ticker: string;
	type: AssetType;
	action: Action;
	order_price: number;
	order_currency: string;
	amount: number;
	order_execution_date: Date;
	fees?: number | null;
	tax_amount?: number | null;
	orderId: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
	const htmlTemplate = getOrderConfirmationTemplate(data)

	const actionText = data.action === 'BUY' ? 'Compra' : 'Venda'

	const mailOptions = {
		from: `"Hisui" <${process.env.EMAIL_USER}>`,
		to: data.email,
		subject: `Confirmação de ${actionText} - ${data.ticker}`,
		html: htmlTemplate,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`Order confirmation email sent to ${data.email}`)
	} catch (error) {
		console.error('Error sending order confirmation email:', error)
		throw new Error('Failed to send order confirmation email')
	}
}

function getOrderConfirmationTemplate(data: OrderEmailData): string {
	const actionText = data.action === 'BUY' ? 'Compra' : 'Venda'
	const assetTypeText = data.type === 'STOCK' ? 'Ação' : 'Criptomoeda'
	
	const totalAmount = data.order_price
	const feesAmount = data.fees || 0
	const taxAmount = data.tax_amount || 0
	const finalTotal = data.action === 'BUY' 
		? totalAmount + feesAmount + taxAmount
		: totalAmount - feesAmount - taxAmount

	const formattedDate = new Intl.DateTimeFormat('pt-BR', {
		dateStyle: 'long',
		timeStyle: 'short'
	}).format(data.order_execution_date)

	return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Ordem</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Helvetica Neue', Arial, sans-serif;
      background-color: hsla(0, 0%, 96%, 1.00);
      width: 100%;
      height: 100%;
      color: hsla(0, 0%, 20%, 1.00);
    }

    .email-wrapper {
      width: 100%;
      background-color: hsla(0, 0%, 96%, 1.00);
      padding: 0;
      margin: 0;
    }

    .container {
      width: 100%;
      max-width: 650px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .card {
      width: 100%;
      background-color: hsla(0, 0%, 100%, 1.00);
      border: 1px solid hsla(0, 0%, 88%, 1.00);
      overflow: hidden;
    }

    .card-header {
      background-color: hsla(0, 0%, 10%, 1.00);
      padding: 30px;
      border-bottom: 3px solid hsla(0, 0%, 0%, 1.00);
    }

    .logo {
      color: hsla(0, 0%, 100%, 1.00);
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 1px;
      margin: 0;
    }

    .header-subtitle {
      color: hsla(0, 0%, 80%, 1.00);
      font-size: 13px;
      margin: 8px 0 0 0;
      letter-spacing: 0.5px;
    }

    .card-body {
      padding: 40px 30px;
    }

    .greeting {
      color: hsla(0, 0%, 10%, 1.00);
      font-size: 16px;
      margin: 0 0 20px 0;
      font-weight: 400;
    }

    .status-badge {
      display: inline-block;
      background-color: hsla(0, 0%, 0%, 1.00);
      color: hsla(0, 0%, 100%, 1.00);
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
      margin: 0 0 30px 0;
      text-transform: uppercase;
    }

    .section-title {
      color: hsla(0, 0%, 10%, 1.00);
      font-size: 14px;
      font-weight: 700;
      margin: 0 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid hsla(0, 0%, 0%, 1.00);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-table {
      width: 100%;
      margin: 0 0 30px 0;
      border-collapse: collapse;
    }

    .info-table tr {
      border-bottom: 1px solid hsla(0, 0%, 88%, 1.00);
    }

    .info-table tr:last-child {
      border-bottom: none;
    }

    .info-table td {
      padding: 12px 0;
      font-size: 14px;
    }

    .info-label {
      color: hsla(0, 0%, 40%, 1.00);
      font-weight: 500;
      width: 45%;
    }

    .info-value {
      color: hsla(0, 0%, 10%, 1.00);
      font-weight: 600;
      text-align: right;
    }

    .total-section {
      background-color: hsla(0, 0%, 98%, 1.00);
      border: 2px solid hsla(0, 0%, 10%, 1.00);
      padding: 20px;
      margin: 30px 0;
    }

    .total-table {
      width: 100%;
      border-collapse: collapse;
    }

    .total-table tr {
      border-bottom: none;
    }

    .total-table tr.final-row {
      border-top: 2px solid hsla(0, 0%, 10%, 1.00);
    }

    .total-table td {
      padding: 10px 0;
      font-size: 14px;
    }

    .total-table tr.final-row td {
      padding-top: 15px;
      margin-top: 15px;
      font-size: 18px;
      font-weight: 700;
    }

    .total-label {
      color: hsla(0, 0%, 40%, 1.00);
      width: 50%;
    }

    .total-value {
      color: hsla(0, 0%, 10%, 1.00);
      font-weight: 600;
      text-align: right;
      width: 50%;
    }

    .order-id-box {
      background-color: hsla(0, 0%, 96%, 1.00);
      border-left: 4px solid hsla(0, 0%, 10%, 1.00);
      padding: 15px;
      margin: 25px 0;
    }

    .order-id-label {
      color: hsla(0, 0%, 40%, 1.00);
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 5px 0;
    }

    .order-id-value {
      color: hsla(0, 0%, 10%, 1.00);
      font-size: 14px;
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }

    .notice-box {
      background-color: hsla(0, 0%, 100%, 1.00);
      border: 1px solid hsla(0, 0%, 82%, 1.00);
      padding: 20px;
      margin: 25px 0;
    }

    .notice-box p {
      color: hsla(0, 0%, 40%, 1.00);
      font-size: 13px;
      line-height: 1.6;
      margin: 0;
    }

    .card-footer {
      background-color: hsla(0, 0%, 10%, 1.00);
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid hsla(0, 0%, 0%, 1.00);
    }

    .footer-text {
      color: hsla(0, 0%, 80%, 1.00);
      font-size: 12px;
      margin: 0 0 10px 0;
      line-height: 1.5;
    }

    .footer-copyright {
      color: hsla(0, 0%, 60%, 1.00);
      font-size: 11px;
      margin: 15px 0 0 0;
    }

    .divider {
      height: 1px;
      background-color: hsla(0, 0%, 88%, 1.00);
      margin: 30px 0;
    }

    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px 10px;
      }
      
      .card-header,
      .card-body,
      .card-footer {
        padding: 25px 20px;
      }
      
      .info-label {
        width: 50%;
      }

      .total-row.final {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h1 class="logo">HISUI</h1>
          <p class="header-subtitle">Gestão Financeira</p>
        </div>

        <div class="card-body">
          <p class="greeting">Prezado(a) ${data.username},</p>
          
          <div class="status-badge">ORDEM EXECUTADA</div>

          <p style="color: hsla(0, 0%, 40%, 1.00); font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
            Confirmamos a execução da sua ordem de ${actionText.toLowerCase()} conforme os detalhes abaixo:
          </p>

          <h2 class="section-title">Detalhes da Operação</h2>
          <table class="info-table">
            <tr>
              <td class="info-label">Tipo de Operação</td>
              <td class="info-value">${actionText}</td>
            </tr>
            <tr>
              <td class="info-label">Tipo de Ativo</td>
              <td class="info-value">${assetTypeText}</td>
            </tr>
            <tr>
              <td class="info-label">Ticker</td>
              <td class="info-value">${data.ticker}</td>
            </tr>
            <tr>
              <td class="info-label">Quantidade</td>
              <td class="info-value">${data.amount.toLocaleString('pt-BR')}</td>
            </tr>
            <tr>
              <td class="info-label">Data de Execução</td>
              <td class="info-value">${formattedDate}</td>
            </tr>
          </table>

          <h2 class="section-title">Resumo Financeiro</h2>
          <div class="total-section">
            <table class="total-table">
              <tr>
                <td class="total-label">Valor da Operação</td>
                <td class="total-value">${data.order_currency} ${totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              ${feesAmount > 0 ? `
              <tr>
                <td class="total-label">Taxas</td>
                <td class="total-value">${data.order_currency} ${feesAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              ` : ''}
              ${taxAmount > 0 ? `
              <tr>
                <td class="total-label">Impostos</td>
                <td class="total-value">${data.order_currency} ${taxAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              ` : ''}
              <tr class="final-row">
                <td class="total-label">VALOR TOTAL</td>
                <td class="total-value">${data.order_currency} ${finalTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </table>
          </div>

          <div class="order-id-box">
            <p class="order-id-label">ID da Ordem</p>
            <p class="order-id-value">${data.orderId}</p>
          </div>

          <div class="divider"></div>

          <div class="notice-box">
            <p>
              <strong>Importante:</strong> Este é um email automático de confirmação. Guarde este comprovante para seus registros. 
              Em caso de dúvidas ou inconsistências, entre em contato com nosso suporte.
            </p>
          </div>
        </div>

        <div class="card-footer">
          <p class="footer-text">
            Este é um email automático, por favor não responda.<br>
            Para mais informações, acesse sua conta ou entre em contato com nosso suporte.
          </p>
          <p class="footer-copyright">
            © ${new Date().getFullYear()} Hisui. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`
}