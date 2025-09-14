<center>

# Hisui – Sistema de Apoio ao Investidor

## Documentação Técnica e Fundamentação Econômico-Financeira

</center>

## 1. Visão Geral do Sistema

O **Hisui** é uma startup focada em direcionar a melhor decisão para investidores, que integra **modelos preditivos**, **indicadores técnicos**, **variáveis macroeconômicas** e **interpretação de cenários de mercado**.

O objetivo do Hisui é **auxiliar pessoas a investirem melhor**, fornecendo:

- **Análise financeira diversificada** (ativos, índices, commodities e câmbio)  
- **Previsões financeiras** como parte de um ecossistema mais amplo de insights  
- **Contextualização econômica** (inflação, juros, risco-país, liquidez global)  
- **Gestão de risco** baseada em métricas financeiras e estatísticas  
- **Explicabilidade dos resultados**, aproximando a complexidade da análise técnica do investidor comum  

---

## 2. Fundamentação Financeira e Econômica

### 2.1 Propósito

O sistema não substitui a análise fundamental ou a tomada de decisão humana, mas:

- Reduz a **assimetria de informação** entre grandes instituições e investidores individuais  
- Oferece **visão probabilística e contextual** sobre ativos e mercados  
- Amplia o horizonte de análise, considerando desde fatores técnicos até condições macroeconômicas globais  

### 2.2 Escopo

Na **Hisui**, trabalhamos com uma **ampla gama do mundo econômico e financeiro**, integrando dados de mercado, indicadores macroeconômicos e notícias do mundo real que impactam decisões de investimento.  

Nossa plataforma abrange:

- **Ações brasileiras e internacionais**  
- **Commodities** (petróleo, minério, soja, ouro)  
- **Índices de mercado** (IBOV, S&P500, MSCI)  
- **Moedas** (USD/BRL, EUR/USD)  
- **Criptoativos** (Bitcoin, Ethereum)  
- **Notícias e eventos globais** que influenciam mercados e setores  
- **Indicadores macroeconômicos** e fiscais de diferentes países  
- **Tendências e análises setoriais**, incluindo impacto político, regulatório e geopolítico  

> O objetivo é fornecer ao investidor uma **visão abrangente** do ambiente econômico, integrando ativos, dados reais e contexto global para decisões mais informadas.

---

## 3. Indicadores Técnicos e Fundamentação

A camada de análise técnica inclui os principais osciladores e indicadores de tendência: 

#### 3.1 RSI (Relative Strength Index)

**Técnico:**  
O RSI é um oscilador de momentum que mede a velocidade e magnitude das variações de preço. Calcula-se a razão entre médias de ganhos e perdas em um período (geralmente 14 dias) e transforma essa razão em uma escala de 0 a 100. Valores acima de 70 indicam sobrecompra; abaixo de 30 indicam sobrevenda.

**Explicação:**  
O RSI mostra se um ativo está “comprado demais” ou “vendido demais”. Se está alto, pode estar prestes a cair; se está baixo, pode subir.

---

#### 3.2 MACD (Moving Average Convergence Divergence)

**Técnico**  
O MACD mede a diferença entre duas médias móveis exponenciais (12 e 26 períodos). Inclui uma linha de sinal (EMA de 9 períodos do MACD) e um histograma (diferença entre MACD e sinal). É usado para detectar mudanças de momentum e tendências.

**Explicação**  
O MACD ajuda a identificar se a tendência está mudando. Se a linha cruza para cima, o preço pode subir; se cruza para baixo, pode cair.

---

#### 3.3 SMA (Simple Moving Average)

**Técnico**  
A SMA é a média aritmética dos preços de fechamento em um período definido. Ajuda a suavizar os movimentos de preço e identificar tendências de longo prazo.

**Explicação**  
A SMA mostra a “média” do preço ao longo do tempo, ajudando a ver se o ativo está subindo ou descendo de forma consistente.

---

#### 3.4 EMA (Exponential Moving Average)

**Técnico**  
A EMA dá mais peso aos preços recentes, tornando a média mais sensível a mudanças recentes de preço. É útil para detectar tendências mais rápidas do que a SMA.

**Explicação**  
A EMA é como uma SMA “turbinada” para capturar mudanças rápidas no preço. Ajuda a perceber movimentos mais recentes com mais intensidade.

---

#### 3.5 ATR (Average True Range)

**Técnico**  
O ATR mede volatilidade do ativo. Calcula a média móvel da amplitude verdadeira, que considera a diferença entre alta e baixa do dia e gaps em relação ao fechamento anterior. Não indica direção, apenas intensidade do movimento.

**Explicação**  
O ATR mostra se o ativo está se mexendo muito ou pouco. Quanto maior, mais risco e movimento; quanto menor, mais estabilidade.

---

#### 3.6 ROC (Rate of Change)

**Técnico**  
O ROC mede a variação percentual do preço em relação a um período anterior. É um oscilador de momentum puro que quantifica a velocidade da mudança de preço.

**Explicação**  
O ROC mostra se o preço está acelerando ou desacelerando. Se sobe rápido, há força compradora; se cai rápido, força vendedora.

---

Cada indicador é explicado matematicamente e também traduzido em **linguagem prática**, para que o investidor compreenda o seu significado.

---

## 4. Indicadores Macroeconômicos

O diferencial do Hisui é integrar **variáveis econômicas e financeiras globais**, permitindo análise em diversos cenários:

- **Taxa Selic e Fed Funds Rate**: custo de capital e impacto em fluxos de liquidez  
- **IPCA, CPI e PCE**: medidas de inflação local e global  
- **Índice de Atividade Econômica (IBC-Br, PMI Global)**: ritmo da economia real  
- **Taxa de Câmbio USD/BRL**: impacto direto em exportadoras e importadoras  
- **Risco-país (CDS)**: percepção de risco soberano e fluxo de capitais estrangeiros  
- **Índice VIX**: termômetro de aversão a risco global  
- **Balança Comercial e Preço de Commodities**: especialmente relevante para setores como petróleo, mineração e agricultura  

---

## 5. Arquitetura do Sistema

### 5.1 Estrutura Analítica

O Hisui combina três camadas:

1. **Análise Técnica Quantitativa**: indicadores aplicados ao histórico de preços  
2. **Modelos de Machine Learning Preditivos**: previsão de curto prazo em determinados ativos/setores  
3. **Análise Macroeconômica Contextual**: integração de dados financeiros globais para interpretação de cenários  

### 5.2 Metodologia de Validação

- **Walk-Forward Cross-Validation** para robustez temporal  
- **Testes de Estacionariedade e Cointegração** em séries econômicas  
- **Backtesting de Estratégias** simulando cenários históricos reais  
- **Simulações de Stress Test** (ex.: choques no câmbio, crises de liquidez, guerra de preços de commodities)  

---

## 6. Interpretação e Suporte ao Investidor

O sistema traduz resultados complexos em **recomendações práticas** para diferentes perfis:

- **Investidores iniciantes:** alertas simplificados de risco e confiança  
- **Investidores intermediários:** relatórios técnicos com probabilidade direcional e métricas de risco  
- **Profissionais:** acesso detalhado aos indicadores, previsões e integrações macroeconômicas  

---

## 7. Objetivo da Hisui

A **Hisui** foca **na acessibilidade ao acesso a análises financeiras de forma a atingir o público geral**, reforçando a ideia de uma relação de boa saúde financeira agregando capital e conhecimento.

O sistema não é apenas uma ferramenta de previsão, mas um **ecossistema inteligente** para apoiar decisões de investimento em diversos cenários econômicos, conciliando:

- **Rigor estatístico**  
- **Transparência explicativa**  
- **Gestão de risco responsável**  
- **Educação financeira acessível**