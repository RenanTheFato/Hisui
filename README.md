<div align="center">

| <img src="public/symbol.png" width="80" alt="Hisui Icon" align="center"> | <h1 align="center">Hisui</h1> |
|----------------------------------------------------------------------------|:---------------------------------:|

---

</div>

<div>
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
<img src="https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white">
<img src="https://img.shields.io/badge/json-%23000000.svg?style=for-the-badge&logo=json&logoColor=white">
<img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens">
<img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white">
<img src="https://img.shields.io/badge/Prisma-%2314BF96.svg?style=for-the-badge&logo=Prisma&logoColor=white">
<img src="https://img.shields.io/badge/zod-%233068b7.svg?style=for-the-badge&logo=zod&logoColor=white">
<img src="https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54">
<img src="https://img.shields.io/badge/Poetry-00BABA.svg?style=for-the-badge&logo=poetry&logoColor=FFFFFF">
<img src="https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white">
<img src="https://img.shields.io/badge/Pandas-501F87.svg?style=for-the-badge&logo=pandas&logoColor=FFFFFF">
<img src="https://img.shields.io/badge/scikit_learn-FF8324.svg?style=for-the-badge&logo=scikitlearn&logoColor=FFFFFF">
</div>

---

## 💻 Nome do Projeto
**Hisui**

## 🏫 Instituição
ETEC Dr. Geraldo José Rodrigues Alckmin - Taubaté

## 👥 Integrantes da Equipe
- Renan Dias Santos de Santana
- Arthur Roberto Weege Pontes 
- Guilherme Silveira Fernandes da Silva

## 📋 Descrição do Projeto
O **Hisui** é um projeto de backend voltado para aplicações modernas que integram processamento de dados e machine learning.  
A solução busca oferecer uma estrutura robusta para **armazenamento, análise e processamento de dados**, utilizando **Node.js (Fastify + Prisma + PostgreSQL)** no backend principal e **Python (Flask + Scikit-learn + Pandas)** para camadas de análise e inteligência.  

Esse projeto se encaixa como base de uma startup tecnológica, fornecendo um ecossistema escalável e seguro para manipulação de dados, autenticação e comunicação entre serviços.

---

## 🛠️ Tecnologias Utilizadas no Backend
- **Linguagem:** Node.js (TypeScript)  
- **Framework:** Fastify  
- **Banco de Dados:** PostgreSQL  
- **ORM:** Prisma  
- **Validações:** Zod  
- **Autenticação:** JWT  
- **Integrações com IA/Data Science:** Python (Flask, Pandas, Scikit-learn, Poetry)

---

## ⚙️ Instruções de Setup

### Requisitos
- **Node.js**: versão `>=22.17.0`  
- **Poetry** (para dependências Python, caso utilize os módulos de análise)

## Gerar o Banco de Dados

```bash
npx prisma migrate dev --name init
```

## Backend NodeJs

```bash
# Instalar dependências do projeto
npm install 
```

```bash
# Iniciar o projeto
npm run dev 
```

```bash
# Executar um teste
npm run test <caminho-para-arquivo-de-testes>/<arquivo de testes> 
```

---

## Python

```bash
# Instalar Poetry
pip install poetry
```

```bash
# Executar ambiente virtual
poetry shell
```

```bash
# Instalar as dependências
poetry install
```

```bash
# Iniciar servidor Python
poetry run start-server
```
---

## 🌐 Variáveis de Ambiente

### Possuímos um arquivo de exemplo de como configurar as variáveis de ambiente necessárias para executar o projeto

- ### Variáveis Ambiente Backend NodeJs
  - <u><a href="./backend/.env.example">backend/.env.example</a></u>
  ```env
    HTTP_PORT=NUMBER_OF_PORT
    HTTP_HOST='host_string'

    DATABASE_URL="your_database_url"

    JWT_SECRET="your_strong_secret"

    EMAIL_USER="email_used_on_nodemailer"
    EMAIL_PASS="nodemailer_app_password"

    BACKEND_URL="address_of_backend_with_host_and_port"

    PYTHON_SERVER_URL="http://your_python_server_url"
  ```

  - ###  Para testes
    - <u><a href="./backend/.env.test.example">backend/.env.test.example</a></u>

    ```env
      HTTP_HOST="test_host_string"
      HTTP_PORT=NUMBER_OF_PORT_FOR_TESTING

      DATABASE_URL="your_test_database_url"
      JWT_SECRET="your_test_strong_secret"
    ```

 - ### Variáveis Ambiente Python
     - <u><a href="./machine/.env.example">machine/.env.test.example</a></u>
    ```env
      FLASK_ENV=development
      SECRET_KEY=your-secret-key-here

      HOST=0.0.0.0
      PORT=5000

      LOG_LEVEL=INFO

      MODEL_RETRAIN_PERIOD=3y
      AUTO_RETRAIN=false
    ```
---

  ## 👨‍💼Acesso a Rotas Administrativas 

  Para acessar rotas administrativas irá precisar atualizar um usuário no banco de dados para que contenha o cargo ADMIN

  ```sql
  UPDATE USERS SET "role" = 'ADMIN' WHERE "id" = 'seu_id_de_usuario';
  ```
---

 ## 📄 Documentação

  A documentação foi feita via **Swagger** e pode ser acessada ao iniciar o servidor acessando a rota **/docs** em seu navegador

  Você pode importar as rotas para o seu cliente API (no projeto foi utilizado o insomnia), acessando o arquivo:

  - <u><a href="./insomnia.json">Rotas API em arquivo .json</a></u>
---
  ## 📦 Informações Adicionais

  **Acesse o arquivo** <u><a href="./tech.md">Detalhamento Técnico</a></u>, para obter mais informações sobre como realizamos nosso projeto, quais indicadores econômicos foram utilizados de uma maneira mais técnica
