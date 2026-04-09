# 🛡️ SCPO - Sistema de Cadastro e Prontidão Operacional

> Modernização e Automação da Gestão de Recursos Humanos no 20º Batalhão de Polícia Militar da Bahia (20º BPM/PMBA).

---

## 📖 1. Introdução

Esta é a documentação central do projeto **SCPO - Sistema de Cadastro e Prontidão Operacional**. 

O objetivo principal é substituir o controle manual feito por planilhas, garantindo integridade, segurança e rápida recuperação de informações sobre o efetivo (dados pessoais, lotação, Grau Hierárquico, prontidão operacional, entre outros). 

Este documento serve como referência para a equipe de desenvolvimento, gestores do setor de TI do batalhão (Telemática) e demais oficiais interessados, garantindo uma compreensão unificada do escopo, funcionalidades e restrições do sistema.

---

## 🎯 2. Especificação Geral do Sistema

Este sistema visa solucionar os desafios operacionais relacionados ao cadastro e à gestão do efetivo no 20º BPM/PMBA. Atualmente, a dependência da produção manual de planilhas gera diversos gargalos:

* **Esforço e Tempo:** Alta demanda para a atualização contínua dos dados.
* **Lentidão na Alocação:** Dificuldade em identificar com rapidez a exata alocação e disponibilidade operacional dos policiais em cada companhia e posto de serviço.
* **Segurança e Centralização:** Necessidade premente de manter um registro centralizado e seguro das informações pessoais, de contato e das qualificações da tropa.

Diante desse cenário, o objetivo primário do sistema é **digitalizar e automatizar a gestão de recursos humanos do batalhão**. A plataforma permite o cadastro, a visualização, a atualização e o gerenciamento de todo o efetivo, além de armazenar o histórico completo de movimentações, transferências e promoções, garantindo a integridade e a confiabilidade da informação corporativa.

O sistema é baseado em arquitetura web, podendo ser acessado por meio de navegadores modernos em qualquer computador ou dispositivo com acesso à rede do batalhão.

---

## 🛠️ 3. Tecnologias Utilizadas

A arquitetura do sistema foi planejada para garantir escalabilidade, segurança e facilidade na integração e manutenção contínua do código. Foram selecionadas as seguintes tecnologias:

* **Framework Base (Next.js):** Amplamente consolidado no mercado, atua como o motor principal da aplicação. Permite o desenvolvimento unificado das interfaces de usuário (Frontend) e das regras de negócio (Backend) no mesmo ambiente, otimizando o fluxo de dados e a performance da aplicação web.
* **Linguagem (TypeScript):** Adotado em toda a base de código. Sua forte tipagem estática previne erros em tempo de compilação, aumentando drasticamente a previsibilidade, a qualidade e a segurança do código fonte.
* **Estilização e Interface (Tailwind CSS e shadcn/ui):** O Tailwind CSS atua como o framework utilitário base, garantindo uma construção ágil e responsiva. Em conjunto, foi adotado o shadcn/ui, uma arquitetura de componentes de interface altamente acessíveis, modernos e customizáveis.
* **Banco de Dados (PostgreSQL):** Sistema de Gerenciamento de Banco de Dados (SGBD) relacional, selecionado por sua alta robustez e confiabilidade. Encaixa-se perfeitamente na modelagem lógica do sistema, garantindo a sustentabilidade a longo prazo no armazenamento das relações complexas (escalas, históricos, companhias).
* **ORM (Prisma):** Utilizado como Mapeador Objeto-Relacional. O Prisma facilita a modelagem do banco de dados e a comunicação segura entre o Next.js e o PostgreSQL, tornando as consultas aos dados mais eficientes e protegidas contra vulnerabilidades.

---
