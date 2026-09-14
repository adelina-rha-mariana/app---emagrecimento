// Conteúdo das estratégias alimentares oferecidas em "Nutrição sob medida".
// Texto educativo e não-prescritivo: nenhuma estratégia é apresentada como
// obrigatória ou superior às outras, e todas reforçam a necessidade de
// acompanhamento profissional — especialmente as mais restritivas
// (Cetogênica e Carnívora).

export type Modalidade = {
  id: string;
  nome: string;
  descricao: string;
};

export type Estrategia = {
  id: string;
  nome: string;
  tagline: string;
  corId: "good" | "info" | "accent" | "accent2";
  // Situações que pedem cautela/acompanhamento antes de seguir com a estratégia.
  // Isso não avalia a saúde de quem responde — é um alerta pra procurar orientação profissional.
  triagem: string[];
  modalidades: Modalidade[];
  conteudoEducativo: {
    oQueE: string;
    comoFunciona: string;
    beneficios: string[];
    atencao: string[];
    dicasPraticas: string[];
  };
  avisoExtra?: string;
};

export const ESTRATEGIAS: Estrategia[] = [
  {
    id: "equilibrada",
    nome: "Equilibrada",
    tagline: "Todos os grupos alimentares, em porções ajustadas",
    corId: "good",
    triagem: [],
    modalidades: [
      { id: "padrao", nome: "Padrão", descricao: "Proteínas, carboidratos e gorduras nas proporções recomendadas pelo Guia Alimentar." },
      { id: "mediterranea", nome: "Mediterrânea", descricao: "Ênfase em azeite, peixes, grãos integrais, leguminosas e vegetais." },
    ],
    conteudoEducativo: {
      oQueE: "Uma forma de comer que inclui todos os grupos alimentares — carboidratos, proteínas, gorduras, frutas e vegetais — em porções ajustadas ao seu gasto energético, sem cortar nenhum grupo por completo.",
      comoFunciona: "O foco é o déficit calórico moderado e a qualidade dos alimentos (mais in natura, menos ultraprocessado), não a exclusão de macronutrientes.",
      beneficios: [
        "Mais fácil de manter a longo prazo, por ser menos restritiva",
        "Menor risco de deficiências nutricionais",
        "Compatível com a maioria das rotinas sociais e familiares",
      ],
      atencao: [
        "Resultados de perda de peso costumam ser mais graduais que em dietas restritivas",
        "Exige atenção ao tamanho das porções, já que nada é proibido",
      ],
      dicasPraticas: [
        "Metade do prato com vegetais, um quarto com proteína, um quarto com carboidrato",
        "Prefira água a bebidas açucaradas",
        "Planeje as refeições da semana com antecedência",
      ],
    },
  },
  {
    id: "low-carb",
    nome: "Low-carb",
    tagline: "Redução de carboidratos, sem eliminá-los",
    corId: "info",
    triagem: [
      "Diabetes tipo 1 ou uso de insulina",
      "Uso de medicação para diabetes ou pressão alta",
      "Histórico de cálculo renal",
      "Gestante ou amamentando",
    ],
    modalidades: [
      { id: "moderado", nome: "Moderado", descricao: "Cerca de 100–150g de carboidrato por dia — reduz sem eliminar grupos de alimentos." },
      { id: "restrito", nome: "Restrito", descricao: "Abaixo de 50g de carboidrato por dia — mais próximo da cetogênica, exige mais planejamento." },
    ],
    conteudoEducativo: {
      oQueE: "Uma estratégia que reduz a quantidade de carboidratos (pães, massas, açúcares, alguns tubérculos) e aumenta proporcionalmente proteínas e gorduras boas.",
      comoFunciona: "Com menos carboidrato circulando, o corpo tende a liberar menos insulina e a usar mais gordura como fonte de energia entre as refeições.",
      beneficios: [
        "Pode ajudar a controlar picos de fome e vontade de doce em algumas pessoas",
        "Estudos mostram melhora de triglicerídeos e glicemia em curto/médio prazo para parte das pessoas",
      ],
      atencao: [
        "Reduzir carboidrato demais pode causar dor de cabeça, cansaço e irritabilidade nos primeiros dias",
        "Quem usa insulina ou remédio para diabetes precisa de ajuste médico ANTES de começar — o risco de hipoglicemia é real",
      ],
      dicasPraticas: [
        "Troque arroz branco e pão refinado por versões integrais em quantidade menor, antes de cortar de vez",
        "Priorize vegetais fibrosos como fonte de carboidrato",
        "Beba bastante água — a redução de carboidrato muda a retenção de líquido do corpo",
      ],
    },
  },
  {
    id: "cetogenica",
    nome: "Cetogênica",
    tagline: "Muito baixo carboidrato, alta gordura",
    corId: "accent",
    triagem: [
      "Diabetes tipo 1 ou uso de insulina",
      "Problemas nos rins ou no fígado",
      "Histórico de pancreatite",
      "Uso de medicação para pressão alta ou diurético",
      "Gestante ou amamentando",
      "Histórico de transtorno alimentar",
    ],
    modalidades: [
      { id: "padrao", nome: "Padrão (SKD)", descricao: "Menos de 50g de carboidrato por dia, todos os dias — a versão mais comum." },
      { id: "ciclica", nome: "Cíclica (CKD)", descricao: "Períodos de cetose intercalados com dias de mais carboidrato — mais usada por quem treina pesado." },
    ],
    conteudoEducativo: {
      oQueE: "Uma dieta muito baixa em carboidrato (geralmente abaixo de 50g/dia) e alta em gordura, que leva o corpo a produzir corpos cetônicos como fonte de energia principal, no lugar da glicose.",
      comoFunciona: "Sem carboidrato suficiente, o fígado converte gordura em cetonas para abastecer o cérebro e os músculos — esse processo metabólico se chama cetose.",
      beneficios: [
        "Pode reduzir apetite de forma expressiva em algumas pessoas",
        "Usada em alguns casos específicos, sempre sob acompanhamento médico direto (ex: epilepsia de difícil controle)",
      ],
      atencao: [
        "É a mais restritiva das quatro estratégias — alto risco de deficiência de fibras, vitaminas e minerais sem planejamento",
        "'Gripe da keto' (enjoo, dor de cabeça, fadiga) é comum na primeira semana",
        "Pode alterar exames de colesterol e função renal — acompanhamento com exames periódicos é recomendado",
        "Não é recomendada sem orientação para quem tem histórico de problemas renais, hepáticos, pancreáticos ou transtorno alimentar",
      ],
      dicasPraticas: [
        "Priorize gorduras boas (azeite, abacate, oleaginosas) em vez de só embutidos e frituras",
        "Reponha eletrólitos (sódio, potássio, magnésio) nos primeiros dias",
        "Peça acompanhamento de um nutricionista para montar o cardápio e evitar deficiências",
      ],
    },
    avisoExtra: "Por ser uma dieta restritiva e com efeito metabólico forte, a cetogênica é a que mais se beneficia de acompanhamento nutricional direto — não só leitura de conteúdo educativo.",
  },
  {
    id: "carnivora",
    nome: "Carnívora",
    tagline: "Só alimentos de origem animal",
    corId: "accent2",
    triagem: [
      "Problema nos rins (qualquer grau)",
      "Gota ou ácido úrico alto",
      "Colesterol alto ou histórico de problema cardíaco",
      "Diabetes ou uso de insulina",
      "Problema no fígado",
      "Gestante ou amamentando",
      "Histórico de transtorno alimentar",
      "Menor de 18 anos",
    ],
    modalidades: [
      { id: "estrita", nome: "Carnívora estrita", descricao: "Apenas carne, peixe, ovos e um pouco de sal — sem nenhum vegetal, fruta ou laticínio." },
      { id: "flexivel", nome: "Carnívora + vegetais de baixa toxicidade", descricao: "Base animal, com pequenas quantidades de vegetais de fácil digestão (ex: abobrinha, folhas cozidas) e laticínios com pouca lactose." },
    ],
    conteudoEducativo: {
      oQueE: "Uma dieta de eliminação que retira todo alimento de origem vegetal, mantendo apenas carne, peixe, ovos e — em algumas versões — laticínios com pouca lactose.",
      comoFunciona: "Sem nenhum carboidrato vegetal, o corpo passa a depender quase exclusivamente de proteína e gordura animal como fonte de energia, em cetose praticamente permanente.",
      beneficios: [
        "Relatos pessoais de melhora digestiva em quadros de sensibilidade alimentar (não confirmado por evidência forte ainda)",
        "Simplicidade de decisão alimentar — poucas categorias de alimento para escolher",
      ],
      atencao: [
        "É a estratégia com MENOS evidência científica de longo prazo entre as quatro — a maior parte do respaldo hoje vem de relatos pessoais, não de estudos robustos",
        "Risco real de deficiência de fibras, vitamina C e alguns antioxidantes presentes só em vegetais",
        "Pode elevar LDL (colesterol) e ácido úrico em parte das pessoas — exames antes e durante são importantes",
        "Não é recomendada, sob nenhuma hipótese, sem acompanhamento médico e de nutricionista para quem tem histórico renal, hepático, cardiovascular ou de gota",
        "Não recomendada para gestantes, lactantes, menores de idade ou pessoas com histórico de transtorno alimentar",
      ],
      dicasPraticas: [
        "Comece pela versão flexível antes de considerar a estrita, se for sua primeira vez",
        "Varie os cortes e tipos de carne/peixe para reduzir o risco de deficiências",
        "Marque exames de sangue (perfil lipídico, ácido úrico, função renal) antes de começar e a cada 2-3 meses",
        "Não continue além de algumas semanas sem reavaliação de um profissional de saúde",
      ],
    },
    avisoExtra:
      "A Carnívora é a estratégia mais restritiva do app e a que exige mais cautela. Ela é apresentada aqui apenas como conteúdo educativo — este app não recomenda nem prescreve a Carnívora, e ela não deve ser iniciada ou mantida sem acompanhamento médico e nutricional direto.",
  },
];

export function getEstrategiaById(id: string): Estrategia | undefined {
  return ESTRATEGIAS.find((e) => e.id === id);
}
