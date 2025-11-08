import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

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

interface NewsEmailData {
  email: string,
  username: string,
  newsTitle: string,
  newsDescription: string,
  newsAuthor: string,
  newsPublisher: string,
  newsPublishedDate: Date,
  newsArticleUrl: string,
  newsImageUrl: string,
  newsTickers: string[],
}

export async function sendNewsEmail(data: NewsEmailData) {
  const htmlTemplate = getNewsEmailTemplate(data)

  const mailOptions = {
    from: `"Hisui" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: `📰 Notícia em Destaque: ${data.newsTitle.substring(0, 50)}${data.newsTitle.length > 50 ? '...' : ''}`,
    html: htmlTemplate,
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`News email sent to ${data.email}`)
  } catch (error) {
    console.error('Error sending news email:', error)
    throw new Error('Failed to send news email')
  }
}

function getNewsEmailTemplate(data: NewsEmailData): string {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(data.newsPublishedDate)

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notícia em Destaque</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background-color: hsla(0, 0%, 96%, 1.00);
      width: 100%;
      color: hsla(0, 0%, 20%, 1.00);
      line-height: 1.6;
    }

    .email-wrapper {
      width: 100%;
      background-color: hsla(0, 0%, 96%, 1.00);
      padding: 0;
      margin: 0;
    }

    .container {
      width: 100%;
      max-width: 680px;
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
      background: linear-gradient(135deg, hsla(145, 63%, 42%, 1.00) 0%, hsla(145, 63%, 32%, 1.00) 100%);
      padding: 32px 40px;
      border-bottom: 3px solid hsla(145, 63%, 25%, 1.00);
    }

    .logo {
      color: hsla(0, 0%, 100%, 1.00);
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 3px;
      margin: 0;
    }

    .header-subtitle {
      color: hsla(145, 30%, 85%, 1.00);
      font-size: 13px;
      margin: 8px 0 0 0;
      letter-spacing: 1px;
      font-weight: 500;
    }

    .card-body {
      padding: 40px;
    }

    .greeting {
      color: hsla(0, 0%, 20%, 1.00);
      font-size: 16px;
      margin: 0 0 24px 0;
      font-weight: 400;
    }

    .news-badge {
      display: inline-block;
      background: linear-gradient(90deg, hsla(145, 63%, 42%, 1.00) 0%, hsla(145, 63%, 35%, 1.00) 100%);
      color: hsla(0, 0%, 100%, 1.00);
      padding: 10px 24px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      margin: 0 0 32px 0;
      text-transform: uppercase;
    }

    .news-image-container {
      width: 100%;
      height: 240px;
      overflow: hidden;
      margin: 0 0 32px 0;
      border: 1px solid hsla(0, 0%, 88%, 1.00);
    }

    .news-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .news-publisher-label {
      color: hsla(0, 0%, 50%, 1.00);
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 16px 0;
    }

    .news-title {
      color: hsla(0, 0%, 15%, 1.00);
      font-size: 26px;
      font-weight: 700;
      line-height: 1.3;
      margin: 0 0 24px 0;
      letter-spacing: -0.3px;
    }

    .news-meta-container {
      display: table;
      width: 100%;
      margin: 0 0 28px 0;
      border-top: 2px solid hsla(145, 63%, 42%, 1.00);
      border-bottom: 1px solid hsla(0, 0%, 88%, 1.00);
    }

    .news-meta {
      display: table-row;
    }

    .meta-cell {
      display: table-cell;
      padding: 16px 0;
      vertical-align: middle;
      width: 50%;
    }

    .meta-label {
      color: hsla(0, 0%, 50%, 1.00);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin: 0 0 6px 0;
    }

    .meta-value {
      color: hsla(0, 0%, 20%, 1.00);
      font-size: 14px;
      font-weight: 600;
      display: block;
    }

    .news-description {
      color: hsla(0, 0%, 30%, 1.00);
      font-size: 15px;
      line-height: 1.7;
      margin: 0 0 32px 0;
      text-align: justify;
      padding: 24px;
      background-color: hsla(0, 0%, 98%, 1.00);
      border-left: 3px solid hsla(145, 63%, 42%, 1.00);
    }

    .tickers-section {
      margin: 32px 0;
      padding: 24px;
      background-color: hsla(145, 30%, 97%, 1.00);
      border: 1px solid hsla(145, 30%, 85%, 1.00);
    }

    .tickers-title {
      color: hsla(145, 63%, 35%, 1.00);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 16px 0;
    }

    .tickers-grid {
      display: table;
      width: 100%;
      border-collapse: collapse;
    }

    .ticker-row {
      display: table-row;
    }

    .ticker-cell {
      display: table-cell;
      padding: 6px 8px;
      width: 25%;
    }

    .ticker-tag {
      display: inline-block;
      background: linear-gradient(90deg, hsla(145, 63%, 42%, 1.00) 0%, hsla(145, 63%, 35%, 1.00) 100%);
      color: hsla(0, 0%, 100%, 1.00);
      padding: 6px 14px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-align: center;
    }

    .cta-section {
      margin: 36px 0;
      text-align: center;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(90deg, hsla(145, 63%, 42%, 1.00) 0%, hsla(145, 63%, 35%, 1.00) 100%);
      color: hsla(0, 0%, 100%, 1.00) !important;
      padding: 16px 48px;
      text-decoration: none !important;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      border: 2px solid hsla(145, 63%, 25%, 1.00);
    }

    .cta-button:visited {
      color: hsla(0, 0%, 100%, 1.00) !important;
    }

    .cta-button:hover {
      color: hsla(0, 0%, 100%, 1.00) !important;
    }

    .cta-button:active {
      color: hsla(0, 0%, 100%, 1.00) !important;
    }

    .divider {
      height: 1px;
      background-color: hsla(0, 0%, 88%, 1.00);
      margin: 36px 0;
    }

    .notice-box {
      background-color: hsla(45, 100%, 97%, 1.00);
      border-left: 3px solid hsla(45, 100%, 50%, 1.00);
      padding: 20px 24px;
      margin: 28px 0;
    }

    .notice-box p {
      color: hsla(45, 60%, 25%, 1.00);
      font-size: 13px;
      line-height: 1.6;
      margin: 0;
    }

    .card-footer {
      background-color: hsla(0, 0%, 15%, 1.00);
      padding: 32px 40px;
      text-align: center;
      border-top: 3px solid hsla(145, 63%, 42%, 1.00);
    }

    .footer-text {
      color: hsla(0, 0%, 70%, 1.00);
      font-size: 12px;
      margin: 0 0 16px 0;
      line-height: 1.6;
    }

    .footer-copyright {
      color: hsla(0, 0%, 55%, 1.00);
      font-size: 11px;
      margin: 0;
    }

    .unsubscribe-link {
      color: hsla(145, 63%, 55%, 1.00);
      text-decoration: underline;
      font-weight: 600;
    }

    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px 10px;
      }
      
      .card-header,
      .card-body,
      .card-footer {
        padding: 24px 20px;
      }

      .news-image-container {
        height: 180px;
      }

      .news-title {
        font-size: 22px;
      }

      .meta-cell {
        display: block;
        width: 100%;
        padding: 12px 0;
        border-bottom: 1px solid hsla(0, 0%, 88%, 1.00);
      }

      .meta-cell:last-child {
        border-bottom: none;
      }

      .ticker-cell {
        display: block;
        width: 100%;
        padding: 6px 0;
      }

      .cta-button {
        display: block;
        width: 100%;
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
          <p class="header-subtitle">Gestão Financeira & Inteligência de Mercado</p>
        </div>

        <div class="card-body">
          <p class="greeting">Prezado(a) ${data.username},</p>
          
          <div class="news-badge">📰 Notícia Selecionada</div>

          <p class="news-publisher-label">FONTE: ${data.newsPublisher}</p>

          <div class="news-image-container">
            <img src="${data.newsImageUrl}" alt="Imagem da notícia" class="news-image" onerror="this.src='https://via.placeholder.com/680x240/22c55e/ffffff?text=Hisui+Financial+News'">
          </div>

          <h2 class="news-title">${data.newsTitle}</h2>

          <div class="news-meta-container">
            <div class="news-meta">
              <div class="meta-cell">
                <span class="meta-label">Autor</span>
                <span class="meta-value">${data.newsAuthor}</span>
              </div>
              <div class="meta-cell">
                <span class="meta-label">Data de Publicação</span>
                <span class="meta-value">${formattedDate}</span>
              </div>
            </div>
          </div>

          <div class="news-description">
            ${data.newsDescription}
          </div>

          ${data.newsTickers.length > 0 ? `
          <div class="tickers-section">
            <p class="tickers-title">Ativos Relacionados</p>
            <div class="tickers-grid">
              ${(() => {
        const tickers = data.newsTickers.slice(0, 8);
        let rows = '';
        for (let i = 0; i < tickers.length; i += 4) {
          rows += '<div class="ticker-row">';
          for (let j = i; j < Math.min(i + 4, tickers.length); j++) {
            rows += `<div class="ticker-cell"><span class="ticker-tag">${tickers[j]}</span></div>`;
          }
          rows += '</div>';
        }
        return rows;
      })()}
            </div>
          </div>
          ` : ''}

          <div class="cta-section">
            <a href="${data.newsArticleUrl}" class="cta-button" target="_blank" rel="noopener noreferrer">
              Ler Notícia Completa
            </a>
          </div>

          <div class="divider"></div>

          <div class="notice-box">
            <p>
              <strong>Importante:</strong> Esta notícia foi selecionada automaticamente com base em critérios de relevância para o mercado financeiro. 
              Mantenha-se sempre atualizado com as informações que impactam seus investimentos.
            </p>
          </div>
        </div>

        <div class="card-footer">
          <p class="footer-text">
            Você está recebendo este email porque habilitou notificações de notícias em sua conta Hisui.<br>
            Para gerenciar suas preferências de notificação, <a href="#" class="unsubscribe-link">acesse as configurações</a>.
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