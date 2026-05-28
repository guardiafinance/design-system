/**
 * Mapa de exemplos TSX executáveis para cada componente do DS.
 * Cada chave é o nome do componente (= nome da pasta). Valor = código TSX
 * que será passado como prop `code` pro <LiveCode>.
 *
 * Todo o código deve terminar em `render(<X />)` ou em uma expressão JSX final.
 * Componentes usados precisam estar expostos em window (carregados pelos scripts
 * do próprio playground).
 */

window.__LIVE_EXAMPLES = {

  Accordion: `
function FAQ() {
  const items = [
    { id: "1", title: "Como a Guardia reconcilia meus extratos?",
      content: "Conectamos ao banco via Open Finance e cruzamos com os lançamentos do ERP usando modelos de confiança. Matches acima de 95% são auto-aprovados.",
      defaultOpen: true },
    { id: "2", title: "Posso revisar antes de aprovar?",
      content: "Sim. Cada match vem com um indicador de confiança e você pode ajustar o limiar a qualquer momento." },
    { id: "3", title: "Quais bancos são suportados?",
      content: "Itaú, Bradesco, Santander, BB, Caixa, Inter, Nubank e todas as fintechs do Open Finance." },
  ];
  return (
    <div style={{ width: 520 }}>
      <Accordion items={items} type="single" />
    </div>
  );
}
render(<FAQ />);
`,

  AgentCard: `
function Dashboard() {
  return (
    <div style={{ width: 380 }}>
      <AgentCard
        name="Conciliação Bancária"
        role="Processa extratos e cruza com o ERP"
        icon="git-merge"
        status="active"
        metrics={[
          { label: "Aprovados hoje", value: "237" },
          { label: "Precisão", value: "98.4%" },
        ]}
        lastRun="há 8 min"
      />
    </div>
  );
}
render(<Dashboard />);
`,

  Badge: `
function StatusList() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge tone="success">Aprovado</Badge>
      <Badge tone="warning">Em revisão</Badge>
      <Badge tone="danger">Rejeitado</Badge>
      <Badge tone="info">Novo</Badge>
      <Badge tone="neutral" dot>Rascunho</Badge>
    </div>
  );
}
render(<StatusList />);
`,

  Breadcrumbs: `
function Header() {
  const items = [
    { label: "Clientes", href: "#" },
    { label: "Silva & Cia", href: "#" },
    { label: "Abril 2026" },
  ];
  return <Breadcrumbs items={items} />;
}
render(<Header />);
`,

  ButtonGroup: `
function Toolbar() {
  const [view, setView] = React.useState("list");
  const mk = (k) => ({
    variant: view === k ? "solid" : "ghost",
    onClick: () => setView(k),
  });
  return (
    <ButtonGroup>
      <Button {...mk("list")}>Lista</Button>
      <Button {...mk("grid")}>Grade</Button>
      <Button {...mk("kanban")}>Kanban</Button>
    </ButtonGroup>
  );
}
render(<Toolbar />);
`,

  Calendar: `
function AgendaFiscal() {
  const [date, setDate] = React.useState(new Date(2025, 10, 1));
  const [sel, setSel]   = React.useState(null);
  const events = [
    { id: "1", date: "2025-11-07", time: "23:59", title: "DCTFWeb",   tone: "red",    icon: "alert" },
    { id: "2", date: "2025-11-14", time: "23:59", title: "SPED Contrib.", tone: "orange", icon: "file-text" },
    { id: "3", date: "2025-11-10", time: "09:00", title: "Revisão Porto Brasil", tone: "violet", icon: "users" },
    { id: "4", date: "2025-11-20", time: "23:59", title: "DARF IRRF",  tone: "red",    icon: "alert" },
    { id: "5", date: "2025-11-21", allDay: true,   title: "Offsite SP",   tone: "violet" },
    { id: "6", date: "2025-11-25", time: "15:00", title: "Fechamento Pietra Moda", tone: "green" },
  ];
  return (
    <div style={{ height: 560 }}>
      <Calendar
        view="month"
        date={date}
        onDateChange={setDate}
        events={events}
        selectedDate={sel}
        onDayClick={setSel}
        legend={[
          { label: "Prazo crítico",    tone: "red" },
          { label: "Obrigação fiscal", tone: "orange" },
          { label: "Reunião cliente",  tone: "violet" },
          { label: "Marco",             tone: "green" },
        ]}
      />
    </div>
  );
}
render(<AgendaFiscal />);
`,

  Card: `
function Resumo() {
  return (
    <Card variant="elevated" padding="lg" style={{ width: 360 }}>
      <div style={{ fontSize: 11, color: 'var(--gray-500)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Faturamento de abril
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--violet-500)', marginTop: 8 }}>
        R$ 142.380
      </div>
      <div style={{ fontSize: 13, color: 'var(--signal-green)', marginTop: 4 }}>
        +12,4% em relação a março
      </div>
    </Card>
  );
}
render(<Resumo />);
`,

  Chart: `
function Metrica() {
  const data = [
    { label: "Jan", value: 84 },
    { label: "Fev", value: 92 },
    { label: "Mar", value: 118 },
    { label: "Abr", value: 142 },
  ];
  return (
    <div style={{ width: 420 }}>
      <Chart type="bar" data={data} height={200} title="Lançamentos / mês" />
    </div>
  );
}
render(<Metrica />);
`,

  ChatMessage: `
function Conversa() {
  return (
    <div style={{ width: 460, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ChatMessage role="user" name="Você" timestamp="14:02">
        Quais lançamentos estão pendentes de revisão?
      </ChatMessage>
      <ChatMessage role="assistant" name="Conciliação" avatarIcon="bot" timestamp="14:02">
        Encontrei 3 lançamentos com confiança abaixo de 85%. Quer revisar agora?
      </ChatMessage>
    </div>
  );
}
render(<Conversa />);
`,

  Chip: `
function Filtros() {
  const [tags, setTags] = React.useState(["Aprovado", "Abril", "Silva & Cia"]);
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {tags.map((t) => (
        <Chip key={t} onRemove={() => setTags(tags.filter(x => x !== t))}>{t}</Chip>
      ))}
      {tags.length === 0 && (
        <button onClick={() => setTags(["Aprovado", "Abril", "Silva & Cia"])}
                style={{ fontSize: 12, color: 'var(--orange-500)', background: 'none', border: 0, cursor: 'pointer' }}>
          Restaurar
        </button>
      )}
    </div>
  );
}
render(<Filtros />);
`,

  Combobox: `
function SeletorCliente() {
  const [value, setValue] = React.useState("");
  const options = [
    { value: "1", label: "Silva & Cia",        meta: "CNPJ 12.345.678/0001-90" },
    { value: "2", label: "Nova Era Contábil",  meta: "CNPJ 98.765.432/0001-11" },
    { value: "3", label: "Prime Consultoria",  meta: "CNPJ 54.321.987/0001-55" },
    { value: "4", label: "Horizonte ME",       meta: "CNPJ 11.222.333/0001-44" },
  ];
  return (
    <div style={{ width: 320 }}>
      <Combobox
        placeholder="Selecione um cliente..."
        value={value}
        options={options}
        onChange={setValue}
        leftIcon="search"
        clearable
      />
    </div>
  );
}
render(<SeletorCliente />);
`,

  Command: `
function Paleta() {
  const [open, setOpen] = React.useState(true);
  const items = [
    { group: "Ações rápidas", entries: [
      { id: "a1", label: "Novo cliente",       icon: "plus",   shortcut: "⌘N" },
      { id: "a2", label: "Importar extrato",   icon: "upload" },
      { id: "a3", label: "Rodar conciliação",  icon: "play" },
    ]},
    { group: "Navegar", entries: [
      { id: "n1", label: "Ir para Clientes",    icon: "users" },
      { id: "n2", label: "Ir para Relatórios",  icon: "bar-chart" },
    ]},
  ];
  return (
    <>
      {!open && <Button onClick={() => setOpen(true)}>Abrir paleta (⌘K)</Button>}
      <Command open={open} onClose={() => setOpen(false)} items={items} />
    </>
  );
}
render(<Paleta />);
`,

  ConfidenceIndicator: `
function ResultadoMatch() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
      <ConfidenceIndicator value={98} label="Match automático"   variant="bar" showValue />
      <ConfidenceIndicator value={82} label="Revisão sugerida"   variant="bar" showValue />
      <ConfidenceIndicator value={54} label="Ambíguo"            variant="bar" showValue />
    </div>
  );
}
render(<ResultadoMatch />);
`,

  DataTable: `
function TabelaLancamentos() {
  const columns = [
    { id: "data",       header: "Data",        accessor: "data",       width: 80 },
    { id: "descricao",  header: "Descrição",   accessor: "descricao" },
    { id: "valor",      header: "Valor",       accessor: "valor",      align: "right" },
    { id: "status",     header: "Status",      accessor: "status",     render: (v) => v },
  ];
  const rows = [
    { id: 1, data: "14/04", descricao: "Boleto — Fornecedor X", valor: "R$ 1.280,00",  status: <Badge tone="success">Aprovado</Badge> },
    { id: 2, data: "15/04", descricao: "PIX — Silva & Cia",     valor: "R$ 3.400,00",  status: <Badge tone="warning">Em revisão</Badge> },
    { id: 3, data: "16/04", descricao: "TED — Salários",        valor: "R$ 28.900,00", status: <Badge tone="success">Aprovado</Badge> },
  ];
  return (
    <div style={{ width: 600 }}>
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
render(<TabelaLancamentos />);
`,

  DatePicker: `
function SeletorPeriodo() {
  const [date, setDate] = React.useState(new Date(2026, 3, 15));
  return (
    <div style={{ width: 280 }}>
      <DatePicker value={date} onChange={setDate} />
    </div>
  );
}
render(<SeletorPeriodo />);
`,

  Dialog: `
function ConfirmarExclusao() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>Excluir cliente</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Excluir Silva & Cia?"
        description="Todos os lançamentos e extratos vinculados serão removidos. Essa ação não pode ser desfeita."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={() => setOpen(false)}>Excluir</Button>
          </>
        }
      />
    </>
  );
}
render(<ConfirmarExclusao />);
`,

  Drawer: `
function PainelDetalhes() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Ver detalhes do lançamento</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Lançamento #48291"
        description="PIX recebido · 15/04/2026"
        side="right"
      >
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div><strong>De:</strong> Silva & Cia</div>
          <div><strong>Valor:</strong> R$ 3.400,00</div>
          <div><strong>Match:</strong> NF 2841 — 98% de confiança</div>
        </div>
      </Drawer>
    </>
  );
}
render(<PainelDetalhes />);
`,

  EmptyState: `
function ListaVazia() {
  return (
    <div style={{ width: 480 }}>
      <EmptyState
        icon="inbox"
        title="Nenhum lançamento ainda"
        description="Conecte seu banco para começarmos a importar automaticamente."
        action={<Button variant="accent">Conectar banco</Button>}
      />
    </div>
  );
}
render(<ListaVazia />);
`,

  FileUpload: `
function ImportarExtrato() {
  const [files, setFiles] = React.useState([]);
  return (
    <div style={{ width: 420 }}>
      <FileUpload
        accept=".csv,.ofx,.pdf"
        multiple
        hint="CSV, OFX ou PDF até 10MB"
        onFiles={(list) => setFiles([...files, ...list])}
      />
      {files.length > 0 && (
        <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 8 }}>
          {files.length} arquivo(s) selecionado(s)
        </p>
      )}
    </div>
  );
}
render(<ImportarExtrato />);
`,

  IconButton: `
function BarraAcoes() {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <IconButton icon="edit"    aria-label="Editar" />
      <IconButton icon="copy"    aria-label="Duplicar" />
      <IconButton icon="archive" aria-label="Arquivar" />
      <IconButton icon="trash"   variant="danger" aria-label="Excluir" />
    </div>
  );
}
render(<BarraAcoes />);
`,

  FormLayout: `
function FormularioCliente() {
  const [cnpj, setCnpj] = React.useState("");
  const [regime, setRegime] = React.useState("presumido");
  const [notas, setNotas] = React.useState("");

  return (
    <FormLayout variant="stacked" density="comfy">
      <FormLayout.Header
        title="Novo cliente"
        description="Dados para abrir a operação contábil."
      />
      <FormLayout.Section title="Identificação">
        <FormLayout.Row>
          <FormLayout.Field label="CNPJ" required span={5}
            hint="Validaremos na Receita ao salvar.">
            <Input placeholder="00.000.000/0000-00"
                   leftIcon="building"
                   value={cnpj}
                   onChange={(e) => setCnpj(e.target.value)} />
          </FormLayout.Field>
          <FormLayout.Field label="Razão social" required span={7}>
            <Input placeholder="Nome empresarial" />
          </FormLayout.Field>
        </FormLayout.Row>
        <FormLayout.Field label="Regime tributário" required>
          <Select value={regime} onChange={(e) => setRegime(e.target.value)}
            options={[
              { value: "simples",   label: "Simples Nacional" },
              { value: "presumido", label: "Lucro Presumido" },
              { value: "real",      label: "Lucro Real" },
            ]} />
        </FormLayout.Field>
        <FormLayout.Field label="Notas internas" optional
          labelAside={notas.length + " / 280"}
          hint="Visível só para a equipe da Guardia.">
          <Textarea rows={3} maxLength={280}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Contexto do relacionamento..." />
        </FormLayout.Field>
      </FormLayout.Section>
      <FormLayout.Actions align="between">
        <Button variant="ghost">Cancelar</Button>
        <Button variant="primary" rightIcon="arrow-right">Criar cliente</Button>
      </FormLayout.Actions>
    </FormLayout>
  );
}
render(<FormularioCliente />);
`,

  Kanban: `
function Tarefas() {
  const [cards, setCards] = React.useState([
    { id: "1", columnId: "todo",   title: "Conciliar Itaú — abril", displayId: "TSK-2420", priority: "med",  assignee: { name: "Bianca" }, dueDate: "02 mai", dueStatus: "ok" },
    { id: "2", columnId: "todo",   title: "Resposta à Receita",       displayId: "TSK-2421", priority: "high", assignee: { name: "Luana" },  dueDate: "28 abr", dueStatus: "danger" },
    { id: "3", columnId: "doing",  title: "Plano de contas — Verona", displayId: "TSK-2410", priority: "med",  assignee: { name: "Thiago" }, progress: 0.68 },
    { id: "4", columnId: "review", title: "DRE abril — Mercearia",    displayId: "TSK-2401", priority: "low",  assignee: { name: "Bianca" }, confidence: 0.98 },
    { id: "5", columnId: "done",   title: "SPED Contribuições mar",   displayId: "TSK-2390", assignee: { name: "Carolina" }, progress: 1 },
  ]);
  const cols = [
    { id: "todo",   title: "A fazer",      color: "var(--blue-500)" },
    { id: "doing",  title: "Em andamento", color: "var(--signal-yellow)" },
    { id: "review", title: "Revisão",      color: "var(--violet-500)" },
    { id: "done",   title: "Concluído",    color: "var(--signal-green)" },
  ];
  const handleMove = (id, toCol, _lane, idx) => {
    setCards(prev => {
      const m = prev.find(c => c.id === id); if (!m) return prev;
      const rest = prev.filter(c => c.id !== id);
      const out = []; let placed = false; let b = 0;
      for (const c of rest) {
        if (c.columnId === toCol && b === idx && !placed) { out.push({ ...m, columnId: toCol }); placed = true; }
        out.push(c); if (c.columnId === toCol) b++;
      }
      if (!placed) out.push({ ...m, columnId: toCol });
      return out;
    });
  };
  return <Kanban columns={cols} cards={cards} onCardMove={handleMove} />;
}
render(<Tarefas />);
`,

  Label: `
function CampoFormulario() {
  return (
    <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label htmlFor="cnpj" required>CNPJ da empresa</Label>
        <Input id="cnpj" placeholder="00.000.000/0000-00" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Label htmlFor="obs" optional>Observações</Label>
        <Input id="obs" placeholder="Notas internas..." />
      </div>
    </div>
  );
}
render(<CampoFormulario />);
`,

  Menu: `
function MenuContexto() {
  const items = [
    { label: "Ver detalhes", icon: "eye" },
    { label: "Editar",       icon: "edit", shortcut: "⌘E" },
    { label: "Duplicar",     icon: "copy" },
    { type: "separator" },
    { label: "Excluir",      icon: "trash", destructive: true },
  ];
  return (
    <Menu trigger={<Button variant="ghost" rightIcon="chevron-down">Ações</Button>} items={items} />
  );
}
render(<MenuContexto />);
`,

  MetricCard: `
function KPIs() {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <MetricCard
        label="Aprovados hoje"
        value="237"
        delta="+12%"
        deltaType="up"
      />
      <MetricCard
        label="Precisão"
        value="98,4"
        suffix="%"
        delta="+0,3 pp"
        deltaType="up"
      />
    </div>
  );
}
render(<KPIs />);
`,

  Pagination: `
function NavPag() {
  const [page, setPage] = React.useState(3);
  return (
    <Pagination
      page={page}
      pageCount={24}
      onChange={setPage}
    />
  );
}
render(<NavPag />);
`,

  Popover: `
function InfoCliente() {
  return (
    <Popover
      trigger={<Button variant="ghost">Sobre este cliente</Button>}
      side="bottom"
      align="start"
      width={260}
    >
      <div style={{ padding: 14 }}>
        <strong>Silva & Cia</strong>
        <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '6px 0 0' }}>
          CNPJ 12.345.678/0001-90<br/>Ativo desde fev/2024
        </p>
      </div>
    </Popover>
  );
}
render(<InfoCliente />);
`,

  Progress: `
function ProgressoImportacao() {
  const [v, setV] = React.useState(68);
  return (
    <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Progress value={v} label="Importando extratos" showValue />
      <div style={{ display: 'flex', gap: 6 }}>
        <Button size="sm" onClick={() => setV(Math.max(0, v - 10))}>-10</Button>
        <Button size="sm" onClick={() => setV(Math.min(100, v + 10))}>+10</Button>
      </div>
    </div>
  );
}
render(<ProgressoImportacao />);
`,

  Radio: `
function PlanoComercial() {
  const [plano, setPlano] = React.useState("essencial");
  return (
    <RadioGroup name="plano" value={plano} onChange={setPlano}>
      <Radio value="basico"    label="Básico"    description="Até 1 empresa, 500 lançamentos/mês" />
      <Radio value="essencial" label="Essencial" description="Até 5 empresas, 5k lançamentos/mês" />
      <Radio value="pro"       label="Pro"       description="Empresas ilimitadas, suporte prioritário" />
    </RadioGroup>
  );
}
render(<PlanoComercial />);
`,

  Reconciliation: `
function Match() {
  return (
    <div style={{ width: 600 }}>
      <Reconciliation
        status="match"
        confidence="high"
        left={{
          title: "PIX SILVA CIA LTDA",
          subtitle: "Extrato bancário · 15/04",
          amount: "R$ 3.400,00",
        }}
        right={{
          title: "Silva & Cia — NF 2841",
          subtitle: "ERP · 15/04",
          amount: "R$ 3.400,00",
        }}
      />
    </div>
  );
}
render(<Match />);
`,

  Select: `
function SeletorConta() {
  const [conta, setConta] = React.useState("itau");
  return (
    <div style={{ width: 280 }}>
      <Select value={conta} onChange={(e) => setConta(e.target.value)}>
        <option value="itau">Itaú · Corrente 12345-6</option>
        <option value="bb">Banco do Brasil · Poupança 98765-4</option>
        <option value="nu">Nubank · Corrente 00123-8</option>
      </Select>
    </div>
  );
}
render(<SeletorConta />);
`,

  Separator: `
function Secoes() {
  return (
    <div style={{ width: 360 }}>
      <p style={{ margin: 0 }}>Configurações da empresa</p>
      <Separator />
      <p style={{ margin: '12px 0 0' }}>Integrações bancárias</p>
      <Separator label="OU" />
      <p style={{ margin: '12px 0 0' }}>Importar manualmente</p>
    </div>
  );
}
render(<Secoes />);
`,

  SidebarNav: `
function Nav() {
  const [active, setActive] = React.useState("conciliar");
  const mk = (k) => ({ active: active === k, onClick: () => setActive(k) });
  return (
    <div style={{ display: 'inline-block', border: '1px solid var(--border)', borderRadius: "var(--radius-xl)", overflow: 'hidden', background: '#fff' }}>
      <SidebarNav>
        <SidebarNav.Item icon="home"              {...mk("visao")}>Visão geral</SidebarNav.Item>
        <SidebarNav.Item icon="arrow-left-right"  {...mk("conciliar")}>Conciliar</SidebarNav.Item>
        <SidebarNav.Item icon="users"             {...mk("clientes")} badge="12">Clientes</SidebarNav.Item>
        <SidebarNav.Item icon="bar-chart"         {...mk("relatorios")}>Relatórios</SidebarNav.Item>
      </SidebarNav>
    </div>
  );
}
render(<Nav />);
`,

  Skeleton: `
function Carregando() {
  return (
    <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="rect" height={120} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Skeleton variant="circle" width={32} height={32} />
        <Skeleton variant="text" width="50%" />
      </div>
    </div>
  );
}
render(<Carregando />);
`,

  Slider: `
function LimiarConfianca() {
  const [v, setV] = React.useState(85);
  return (
    <div style={{ width: 360 }}>
      <label style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6, display: 'block' }}>
        Limiar de auto-aprovação
      </label>
      <Slider
        value={v}
        min={50}
        max={99}
        suffix="%"
        showValue
        onChange={(e) => setV(+e.target.value)}
      />
    </div>
  );
}
render(<LimiarConfianca />);
`,

  Spinner: `
function Carga() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Processando extrato…</span>
    </div>
  );
}
render(<Carga />);
`,

  Stepper: `
function Onboarding() {
  const [step, setStep] = React.useState(1);
  const steps = [
    { id: "1", title: "Criar conta",      description: "CNPJ validado" },
    { id: "2", title: "Conectar banco",   description: "Open Finance" },
    { id: "3", title: "Importar extrato", description: "OFX ou automático" },
    { id: "4", title: "Configurar regras" },
    { id: "5", title: "Revisar" },
  ];
  return (
    <div style={{ width: 640 }}>
      <Stepper steps={steps} activeIndex={step} onStepClick={setStep} />
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 22, borderTop: "1px solid var(--gray-100)", paddingTop: 16 }}>
        <Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))}>Voltar</Button>
        <Button variant="primary" size="sm" disabled={step >= steps.length - 1} onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>Avançar</Button>
      </div>
    </div>
  );
}
render(<Onboarding />);
`,

  Tabs: `
function DetalhesCliente() {
  const [tab, setTab] = React.useState("lancamentos");
  const items = [
    { value: "lancamentos", label: "Lançamentos", badge: "248" },
    { value: "extratos",    label: "Extratos" },
    { value: "config",      label: "Configurações", icon: "settings" },
  ];
  return (
    <div style={{ width: 520 }}>
      <Tabs value={tab} onChange={setTab} items={items} variant="underline" />
      <div style={{ padding: '14px 2px', fontSize: 13, color: 'var(--gray-500)' }}>
        {tab === "lancamentos" && "248 lançamentos em abril"}
        {tab === "extratos"    && "3 contas conectadas"}
        {tab === "config"      && "Limiar atual: 85%"}
      </div>
    </div>
  );
}
render(<DetalhesCliente />);
`,

  Textarea: `
function NotaRevisao() {
  const [nota, setNota] = React.useState("");
  return (
    <div style={{ width: 360 }}>
      <Textarea
        placeholder="Motivo da rejeição..."
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        rows={4}
        maxLength={280}
        showCount
      />
    </div>
  );
}
render(<NotaRevisao />);
`,

  Timeline: `
function HistoricoLancamento() {
  const items = [
    { id: "1", title: "Lançamento criado",             timestamp: "14/04 · 09:12", icon: "plus",     tone: "neutral" },
    { id: "2", title: "Match sugerido pelo agente",    timestamp: "14/04 · 09:13", icon: "sparkles", tone: "violet",
      description: "Silva & Cia — NF 2841 · confiança 98%" },
    { id: "3", title: "Aprovado automaticamente",      timestamp: "14/04 · 09:13", icon: "check",    tone: "green" },
    { id: "4", title: "Exportado para ERP",            timestamp: "14/04 · 09:15", icon: "upload",   tone: "neutral" },
  ];
  return (
    <div style={{ width: 440 }}>
      <Timeline items={items} />
    </div>
  );
}
render(<HistoricoLancamento />);
`,

  Toast: `
function Demo() {
  const toast = useToast();
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button onClick={() => toast.show({ type: "success", title: "248 lançamentos aprovados" })}>Sucesso</Button>
      <Button onClick={() => toast.show({ type: "danger",  title: "Falha ao conectar ao Itaú" })}>Erro</Button>
      <Button onClick={() => toast.show({ type: "info",    title: "Nova versão disponível",
                                          description: "Atualize para ver as novidades." })}>Info</Button>
    </div>
  );
}
function App() {
  return (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  );
}
render(<App />);
`,

  Tree: `
function PlanoDeContas() {
  const [selected, setSelected] = React.useState(["1.1.02"]);
  const nodes = [
    { id: "1", label: "1 · Ativo", icon: "wallet", defaultExpanded: true, children: [
      { id: "1.1", label: "1.1 · Circulante", icon: "folder", defaultExpanded: true, children: [
        { id: "1.1.01", label: "1.1.01 · Caixa",   icon: "file-text", meta: "R$ 12.430,00" },
        { id: "1.1.02", label: "1.1.02 · Bancos",  icon: "file-text", meta: "R$ 184.721,55" },
        { id: "1.1.03", label: "1.1.03 · Clientes",icon: "file-text", meta: "R$ 41.892,10" },
      ]},
      { id: "1.2", label: "1.2 · Não Circulante", icon: "folder", children: [
        { id: "1.2.01", label: "1.2.01 · Imobilizado", icon: "file-text", meta: "R$ 320.000,00" },
      ]},
    ]},
    { id: "3", label: "3 · Receita", icon: "trending-up", children: [
      { id: "3.1", label: "3.1 · Operacional", icon: "file-text", meta: "R$ 890.500,00" },
    ]},
  ];
  return (
    <div style={{ width: 420, background: "var(--surface)", border: "1px solid var(--gray-200)", borderRadius: 10, padding: "12px 10px" }}>
      <Tree nodes={nodes} mode="single" selected={selected} onSelectedChange={setSelected} />
    </div>
  );
}
render(<PlanoDeContas />);
`,

  Tooltip: `
function CabecalhoComDica() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <strong>Confiança</strong>
      <Tooltip content="Probabilidade de o match estar correto, calculada pelo modelo.">
        <span style={{
          width: 18, height: 18, borderRadius: "var(--radius-pill)",
          background: 'var(--violet-100)', color: 'var(--violet-500)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, cursor: 'help',
        }}>?</span>
      </Tooltip>
    </div>
  );
}
render(<CabecalhoComDica />);
`,

  TopBar: `
function Topo() {
  return (
    <div style={{ width: 720, border: '1px solid var(--border)', borderRadius: "var(--radius-xl)", overflow: 'hidden' }}>
      <TopBar
        left={<strong style={{ color: 'var(--violet-500)' }}>Guardia</strong>}
        center={
          <Input
            placeholder="Buscar cliente, lançamento, agente..."
            leftIcon="search"
            size="sm"
            style={{ minWidth: 320 }}
          />
        }
        right={
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <IconButton icon="bell"        aria-label="Notificações" />
            <IconButton icon="help-circle" aria-label="Ajuda" />
            <Avatar name="Ana Lima" color="violeta" size="sm" />
          </div>
        }
      />
    </div>
  );
}
render(<Topo />);
`,

  Alert: `
function AvisoRevisao() {
  const [shown, setShown] = React.useState(true);
  if (!shown) return <Button onClick={() => setShown(true)}>Reexibir alerta</Button>;
  return (
    <div style={{ width: 520 }}>
      <Alert
        type="warning"
        title="Revisão humana necessária"
        closable
        onClose={() => setShown(false)}
      >
        3 lançamentos estão abaixo do limiar de confiança configurado (85%).
      </Alert>
    </div>
  );
}
render(<AvisoRevisao />);
`,

  Logo: `
function AppIcons() {
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
      <Logo size={48} />
      <Logo variant="rounded-purple" size={48} />
      <Logo variant="rounded-orange" size={48} />
      <Logo variant="mono-black" size={48} />
    </div>
  );
}
render(<AppIcons />);
`,

  Logotipo: `
function Header() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", background: "#fff", border: "1px solid var(--border)", borderRadius: 8 }}>
      <Logotipo height={28} />
      <span style={{ fontSize: 13, color: "var(--gray-500)" }}>· Painel financeiro</span>
    </div>
  );
}
render(<Header />);
`,

};
