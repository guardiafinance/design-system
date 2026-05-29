# ADR-008 — Adopt AG-UI / CopilotKit as the Generative UI protocol on Bedrock

- **Status:** proposed
- **Date:** 2026-05-28
- **Deciders:** Fernando Seguim (review pendente da squad-theros)
- **Issue:** [#246](https://github.com/guardiatechnology/design-system/issues/246)
- **Supersedes:** none. **Complements:** [ADR-005](ADR-005-popover-api-shape-and-token-alignment.md) (token contract that any generated widget MUST inherit).

## Context

A experiência ponta-a-ponta da Guardia é AI-First por construção: per [`lex-ai-first-experience`](../../.claude/rules/design/system/lex-ai-first-experience.md), a conversa com Isac é a superfície primária e o workspace renderiza, em tempo real, artefatos (tabelas, gráficos, formulários, ações) compostos a partir do diálogo. Essa superfície depende de uma camada de **generative UI**: o agente, rodando Claude (Opus/Sonnet) hospedado em **AWS Bedrock**, escolhe primitivas de `@guardia/design-system` em tempo de resposta e as compõe em widgets que aparecem dentro do thread.

Hoje não existe uma decisão formal de como essa camada é construída. Cada surface que precisa renderizar saída agêntica está fazendo escolhas pontuais. O risco prático:

1. **Fragmentação do catálogo agêntico.** Sem um contrato comum, cada consumidor (Isac, dashboards, futuros widget exporters) registra primitivas do DS de um jeito diferente, e o agente passa a depender da forma do consumidor — não da forma do componente. Isso quebra `lex-design-system-library` na prática (cada consumidor reinventa a interface).
2. **Lock-in de provedor implícito.** Bedrock continua sendo a única superfície de modelo permitida pra Guardia; qualquer escolha de framework precisa ter caminho nativo pra Bedrock, não adapter de terceiro.
3. **Falta de padronização do modo "ad-hoc estrutural".** Existe diferença material entre o agente *selecionar* uma primitiva pré-registrada (1 widget = 1 tool call) e o agente *compor uma árvore* de primitivas (`<Card>` aninhando `<Card>`). Esse segundo modo é o que entrega a sensação real de "workspace reativo ao diálogo" da `lex-ai-first-experience` — e não existe padrão de facto pra ele fora do AG-UI/A2UI.

Em maio/2026 avaliamos 7 candidatos (compatíveis com Bedrock). O resumo está na seção "Alternativas consideradas" abaixo. Esta ADR formaliza a escolha e — crítico — **declara o escopo cross-repo da decisão**, porque generative UI não é uma escolha local de `@guardia/design-system`.

## Decision 1 — Adoptar AG-UI como protocolo e CopilotKit como implementação de referência

**Adotado:** o protocolo oficial de generative UI da Guardia sobre Bedrock é o **AG-UI** ([github.com/ag-ui-protocol/ag-ui](https://github.com/ag-ui-protocol/ag-ui)), com **CopilotKit** como a implementação cliente de referência (`@copilotkit/react-core` + `@copilotkit/react-ui`). O backend agêntico expõe um endpoint AG-UI hospedado no **AWS Bedrock AgentCore Runtime** (endpoint nativo anunciado em 2026 pelo FAST template da AWS), conversando com Claude na própria conta Bedrock.

A escolha de AG-UI repousa em três propriedades que nenhuma alternativa entrega ao mesmo tempo:

1. **É protocolo, não lib.** Permite que `@guardia/design-system` exponha um catálogo neutro (descritor por componente) que qualquer cliente que fale AG-UI consome — incluindo, no futuro, implementações que não sejam CopilotKit (Mastra também fala AG-UI; novos clientes podem surgir). Reduz o lock-in real ao protocolo aberto, não ao framework cliente.
2. **Cobre os dois modos de generative UI numa stack única.** O modo 1 (seleção: agente escolhe uma primitiva pré-registrada via `useCopilotAction`) é o caso de uso seguro e majoritário. O modo 2 (composição em árvore, **A2UI**: agente emite `{ component, props, children }` e o renderer caminha a árvore) é o caso de uso aberto, equivalente conceitual a "o agente desenha um Notion-block-tree dentro da resposta". Sem AG-UI/A2UI, o modo 2 precisa ser construído à mão.
3. **Endorsement direto da AWS no nosso runtime.** O endpoint AG-UI nativo no Bedrock AgentCore Runtime e o FAST template anunciados em 2026 significam que o ciclo de manutenção do protocolo está alinhado com o ciclo de manutenção do nosso provedor de modelo. Reduz o risco de divergência entre o que o protocolo permite e o que o runtime entrega.

### O que esta decisão **não** prescreve

- **Não escolhe o framework backend do agente.** Bedrock AgentCore Runtime hospeda agentes de várias origens (Mastra-on-AgentCore, LangGraph-on-AgentCore, ou um agente "naked" sobre o Converse API). Esta ADR só exige que o backend exponha um endpoint AG-UI conforme; a escolha do framework agêntico é uma decisão separada.
- **Não congela CopilotKit como única lib cliente.** CopilotKit é a referência hoje; se um cliente AG-UI alternativo surgir e for mais alinhado com o stack, a substituição é permitida desde que respeite o mesmo protocolo (o catálogo do DS continua funcionando).

## Decision 2 — A decisão é cross-repo: DS + Isac + demais widget exporters

**Adotado:** a adoção de AG-UI/CopilotKit é uma decisão de **arquitetura horizontal**, não de uma biblioteca local. Tem três superfícies de execução simultâneas, com responsabilidades distintas:

| Repo | Papel na arquitetura | Responsabilidade canônica |
|---|---|---|
| **`guardiatechnology/design-system`** (este repo) | **Catálogo agêntico (single source of truth)** | Expor cada primitiva consumível por agente como um **descritor AG-UI** — `{ name, propsSchema (Zod), render }` — através de um entry-point dedicado (proposta: `@guardia/design-system/agent`). Os schemas Zod codificam o allowlist de props (intent, variant, tone, size) que respeita `lex-design-system-library` e `lex-brand-colors`. Nenhuma primitiva agêntica é definida fora deste repo. |
| **`guardiatechnology/isac`** (consumidor primário) | **Surface conversacional principal** | Importa os descritores do DS, conecta ao endpoint AG-UI no Bedrock AgentCore Runtime via `@copilotkit/react-core`, e renderiza widgets como parte do thread Isac. É a primeira validação end-to-end do contrato — o que funciona aqui valida o catálogo do DS. |
| **Demais projetos que exportam widgets** (qualquer surface além de Isac que renderize saída agêntica — dashboards internos, fluxos auditados, embeds, futuras superfícies AI-First) | **Consumidores secundários** | Adotam o **mesmo padrão** que Isac: importam descritores do DS, conectam ao runtime AG-UI, registram a sessão. Não definem primitivas próprias — se uma primitiva faltar, ela vira issue no DS, não no consumer. |

O inventário definitivo de "demais projetos que exportam widgets" é **out of scope deste ADR** e será produzido durante o PoC de Isac (primeira superfície a usar de verdade revela quais outras superfícies precisam do mesmo padrão).

### Por que a decisão precisa ser declarada cross-repo aqui

Se essa ADR fosse só "o DS expõe descritores", os consumidores ficariam livres pra inventar outro protocolo cliente. Resultado previsível: dois caminhos divergentes em produção, dobro de manutenção, e violação prática de `lex-design-system-library` (porque cada consumer reinventaria a integração). Declarar o escopo aqui — neste ADR neste repo — fixa a expectativa pra todos os consumidores **antes** da divergência acontecer.

### Coordenação de versionamento (esboço, decisão pós-PoC)

A primeira versão do entry-point `@guardia/design-system/agent` será publicada sob a faixa `0.x.y` (mesma do DS). Mudanças no formato do descritor têm impacto cross-repo — Isac e demais consumidores precisam atualizar simultaneamente. A política definitiva (semver coordenado vs. independente; janela de deprecação) sai do PoC, não desta ADR.

## Decision 3 — Salvaguardas obrigatórias contra free-authoring do LLM

**Adotado:** a stack AG-UI/CopilotKit **deve** ser entregue com quatro guard-rails que rodam **antes** de qualquer widget gerado pelo agente chegar ao DOM. Sem essas salvaguardas, a adoção do protocolo violaria Lexis existentes na prática.

| Salvaguarda | Por quê | Onde mora |
|---|---|---|
| **Validação Zod estrita no dispatcher** | Bedrock **não suporta strict tool mode** — o Claude pode emitir `<Button intent="awesome">` ou `<Alert tone="orange">`. Sem validação, o widget renderiza com prop inválida e quebra `lex-design-system-library` + `lex-brand-colors`. Dispatcher deve rejeitar e degradar pra `<Alert tone="warning">` (mensagem padrão Brand) explicando que o agente emitiu props inválidas. | `@guardia/design-system/agent` (este repo) |
| **A11y runtime gate** | A11y das primitivas isoladas já é coberta pelo gate `jest-axe` light+dark de cada componente. Mas a **composição** que o agente cria é nova a cada conversa — não está no Storybook, não passa pelo gate de baseline. Em dev mode, axe-core deve rodar sobre cada widget gerado e logar violações; em prod, pelo menos validações estruturais (roles ARIA conflitantes, labels ausentes) bloqueiam o render. Implementa `lex-frontend-accessibility`. | `@guardia/design-system/agent` (utility) + Isac (integration) |
| **Brand-voice filter server-side** | `lex-brand-voice` proíbe buzzwords ("disruptive", "transformative", "fintech", etc.). O agente Claude **vai** emitir essas palavras sem filtro — sai do treino. Filtro server-side aplica regex de buzzwords em todo string-field dentro do payload do widget (Alert message, Badge label, Button children) antes do payload chegar ao cliente AG-UI. Match → bloqueio do field + log pra correção do prompt do agente. | Backend agêntico (não vive no DS) |
| **Confirmação explícita pra ações irreversíveis** | `lex-ai-first-experience` é categórica: ações irreversíveis exigem confirmação. Um widget `<Button intent="primary">Aprovar</Button>` gerado pelo agente **não pode** auto-executar a aprovação no `onClick`. O catálogo agêntico só permite registrar o **descritor visual** da ação; a execução é wrap'd numa primitiva de confirmação (`<ConfirmAction>`) que o consumer plumbiza. | `@guardia/design-system/agent` (forma do descritor) + Isac (plumbing) |

Essas salvaguardas são parte do PoC, não trabalho pós-PoC. Sem elas a stack não é Lex-compliant.

## Consequences

### Positivas

- **Single source of truth.** O catálogo agêntico vive em um lugar (`@guardia/design-system/agent`); consumidores deixam de ter incentivo pra reinventar primitivas.
- **Caminho da AWS.** Roadmap de runtime alinhado com o protocolo reduz risco de divergência runtime↔protocolo.
- **Ad-hoc estrutural coberto.** A2UI dá o vocabulário pra "agente compõe árvore de DS components" sem que cada combinação precise ser pré-registrada como tool.
- **Catálogo é asset Brand.** Forçar os widgets agênticos a passar por descritores tipados é o ponto natural pra aplicar `lex-brand-colors` / `lex-brand-typography` / `lex-brand-voice` programaticamente — algo que hoje vive em PR review.

### Negativas / a mitigar

- **Lock-in protocolar.** Substituir AG-UI por outro protocolo (assistant-ui message protocol, A2A, outro) é migração não-trivial — afeta DS + Isac + demais consumers simultaneamente. Mitigação: o lock-in é no protocolo *aberto*, não num vendor; CopilotKit pode ser substituído por outro cliente AG-UI sem mexer no DS.
- **Bedrock AgentCore + AG-UI são recentes (2026).** Há features em preview (prompt caching, Guardrails no provider AG-UI). Custo/latência precisam de validação empírica no PoC, não dá pra extrapolar de benchmarks externos.
- **Strict tool mode ausente no Bedrock.** Mitigado por **Decision 3**: Zod no dispatcher. Sem isso, a stack quebra Lex em produção.
- **Coordenação multi-repo é custo recorrente.** Cada mudança no formato do descritor exige bump coordenado DS → Isac → outros. Mitigação: a política de versionamento (saída do PoC) trata disso explicitamente; até lá, mudanças de schema são raras e anunciadas.
- **A11y/Brand runtime gates são novas superfícies de teste.** Adicionar axe-core runtime e brand-voice filter não é trivial — são responsabilidades novas tanto pro DS quanto pro backend agêntico. Mitigação: tratadas como Tech Tasks separadas, paralelas ao PoC.
- **PoC do AG-UI exige cooperação de pelo menos 2 repos (DS + Isac).** Esta ADR fica **proposed** até que a squad-theros confirme o plano cross-repo; aceitação prematura sem essa coordenação cria expectativa que o DS não cumpre sozinho.

## Alternativas consideradas

| Alternativa | Por que rejeitada |
|---|---|
| **`assistant-ui` + Vercel AI SDK 5 + `@ai-sdk/amazon-bedrock`** | Maturidade alta, lock-in baixo, CSR puro — caminho excelente pra **modo 1** (seleção). Rejeitado porque (a) não há protocolo padronizado pra modo 2 (ad-hoc estrutural / A2UI) — teríamos que construir; (b) é uma lib React, não um protocolo, então o catálogo do DS fica acoplado à API do assistant-ui; outros consumidores que não sejam React-first ficam sem caminho. **Mantido como fallback documentado** caso o PoC do AG-UI revele bloqueador estrutural. |
| **Bedrock SDK direto (`@aws-sdk/client-bedrock-runtime`) + dispatcher próprio** | Zero lock-in. Rejeitado porque seria reconstruir do zero o que AG-UI/A2UI já entrega: streaming de tool calls, render incremental, composição em árvore, sessões com state. Custo alto pra paridade, sem ganho compatível. Mantido como **baseline mental** (referência pra estimar se a abstração adicionada por AG-UI vale a complexidade). |
| **Mastra** | Backend-only — não resolve a camada UI. Combinaria com CopilotKit ou assistant-ui no front. Decisão sobre Mastra é independente desta ADR (é uma escolha de framework do agente, não de protocolo UI). Pode ser adotada *em adição* a AG-UI no backend. |
| **LangChain.js + `@langchain/aws`** | Backend-only — mesma observação que Mastra. Decisão independente. |
| **CopilotKit standalone (sem AG-UI explícito)** | CopilotKit *é* a implementação de referência de AG-UI; usar "CopilotKit sem AG-UI" só faz sentido se o backend não falar o protocolo, e nesse caso perdemos o endpoint nativo do Bedrock AgentCore. Não é uma alternativa real, é uma versão diluída da decisão escolhida. |
| **Thesys C1** | Força adoção do design system deles (Crayon). **Viola `lex-design-system-library`** diretamente — todo consumer Guardia tem que consumir `@guardia/design-system`. Eliminada por Lex, não por trade-off. |
| **Tambo** | Não tem suporte documentado a Bedrock (provider list cobre Anthropic-direto, OpenAI-compatíveis, Gemini, Mistral). Adicionalmente, lock-in alto no runtime hospedado. Quando/se Bedrock virar provider suportado, reabrir. |
| **Vercel `streamUI` (RSC, do AI SDK)** | Marcado pela própria Vercel como **experimental e não-recomendado pra produção**; RSC-only conflita com o stack CSR + Storybook-first do DS. Posts antigos ainda recomendam — descartar a recomendação. |

## Out of scope (decidido separadamente ou não decidido aqui)

- **Inventário definitivo de "demais projetos que exportam widgets"** — produzido durante o PoC de Isac. Esta ADR só declara o padrão que esses projetos seguirão quando entrarem.
- **Escolha de framework do agente backend** (Mastra-on-AgentCore, LangGraph-on-AgentCore, agente "naked" sobre Converse API) — decisão separada, não bloqueia esta ADR desde que o backend exponha endpoint AG-UI.
- **Schema completo do catálogo agêntico do DS** (quais primitivas, com quais props expostas, com qual descrição pro LLM) — saída do PoC, input pra ADR sucessor focado em API.
- **Política de versionamento cross-repo dos descritores** (semver coordenado vs. independente; janela de deprecação) — saída do PoC, decisão pós-aceitação.
- **Quotas/custo Bedrock pra geração de widgets** — depende de medição empírica no PoC.
- **Integração com cache de prompt do Bedrock + Guardrails** — features em preview no provider; tratadas em Tech Task separada após o PoC base estabilizar.

## Status transition

- **proposed** — agora (este PR), pendente review da squad-theros pra confirmar o escopo cross-repo (Decision 2). Sem essa confirmação a ADR não promove a `accepted` — o DS sozinho não consegue cumprir o que ela prescreve.
- **accepted** — quando (a) squad-theros confirmar o plano cross-repo e (b) o PoC inicial (DS expondo 3-5 descritores + Isac renderizando um widget gerado a partir de uma sessão Claude) estiver em execução.
- **superseded** — apenas se o PoC inviabilizar AG-UI (Bedrock provider regredir, AG-UI mudar de protocolo de forma incompatível, salvaguardas da Decision 3 se mostrarem inviáveis). Nesse cenário, ADR sucessor adota `assistant-ui + AI SDK 5` como fallback documentado.

## References

- [`lex-ai-first-experience`](../../.claude/rules/design/system/lex-ai-first-experience.md) — Isac é conversa, workspace renderiza em resposta
- [`lex-design-system-library`](../../.claude/rules/design/system/lex-design-system-library.md) — toda UI consome `@guardia/design-system`
- [`lex-brand-colors`](../../.claude/rules/design/brand/lex-brand-colors.md) — paleta e contrastes que os descritores precisam codificar
- [`lex-brand-voice`](../../.claude/rules/design/brand/lex-brand-voice.md) — buzzwords que o filtro server-side precisa barrar
- [`lex-frontend-accessibility`](../../.claude/rules/engineering/frontend/lex-frontend-accessibility.md) — A11y runtime gate
- [ADR-005 — Popover v0.1.0 API shape and token alignment](ADR-005-popover-api-shape-and-token-alignment.md) (contrato de tokens herdado pelos descritores)
- [AG-UI Protocol](https://github.com/ag-ui-protocol/ag-ui)
- [CopilotKit — AWS AG-UI endpoint announcement](https://www.copilotkit.ai/blog/aws-announces-dedicated-ag-ui-endpoint-in-agentcore-and-fast-template-for-building-fullstack-agents)
- [AWS Bedrock AgentCore Runtime](https://docs.aws.amazon.com/bedrock/latest/userguide/agents-runtime.html)
- [assistant-ui (fallback documentado)](https://www.assistant-ui.com/)
- [Vercel AI SDK 5 — Amazon Bedrock provider](https://ai-sdk.dev/providers/ai-sdk-providers/amazon-bedrock)
- Issue [#246](https://github.com/guardiatechnology/design-system/issues/246)
