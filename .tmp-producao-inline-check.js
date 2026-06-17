
    const dataSource = window.PRODUCAO_CIENTIFICA || [];
    const dataSourceTecnica = window.PRODUCAO_TECNICA || [];
    const dataSourceOrientacoes = window.ORIENTACOES_PPGEF || [];
    const dataSourceCaptacaoPayload = window.CAPTACAO_RECURSOS_PPGEF || { updated_at: "", rows: [] };
    const dataSourceCaptacao = dataSourceCaptacaoPayload.rows || [];
    const dataSourceCorpoDocente = window.CORPO_DOCENTE_PPGEF || { default_year: "", by_year: {}, issue_counts: {}, docentes: [] };
    const captacaoReferenceYear = Number(dataSourceCaptacaoPayload.reference_year || 2026);
    const captacaoRecentWindowStart = Number(dataSourceCaptacaoPayload.recent_window_start || 2022);
    const normalizeDisciplinasName = (value) => String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase();
    const disciplinasCanonicalNameMap = new Map([
      ["LEONARDO LUZ", "Leonardo Gomes de Oliveira Luz"],
    ]);
    const canonicalizeDisciplinasName = (value) => {
      const trimmed = String(value || "").trim();
      const normalized = normalizeDisciplinasName(trimmed);
      return disciplinasCanonicalNameMap.get(normalized) || trimmed;
    };
    const disciplinasInternalDocentes = new Set([
      "André dos Santos Costa",
      "Bruno Teixeira Barbosa",
      "Clarice Maria de Lucena Martins",
      "Daniel da Rocha Queiroz",
      "Daniela Karina da Silva Ferreira",
      "Eduardo Zapaterra Campos",
      "Guilherme Assunção Ferreira",
      "Leonardo Gomes de Oliveira Luz",
      "Lucas Eduardo Rodrigues dos Santos",
      "Melissa Leandro Celestino",
      "Ozeas de Lima Lins Filho",
      "Paulo Felipe Ribeiro Bandeira",
      "Paulo Roberto Cavalcanti Carvalho",
      "Pedro Pinheiro Paes Neto",
      "Rafael dos Santos Henrique",
      "Saulo Fernandes Melo de Oliveira",
      "Tony Meireles dos Santos",
      "Vilde Gomes de Menezes",
    ].map(normalizeDisciplinasName));
    const dataSourceDisciplinas = (window.DISCIPLINAS_PPGEF || []).map((item) => ({
      ...item,
      ano: String(item.ano || "").trim(),
      ano_periodo: String(item.ano_periodo || "").trim(),
      nome_responsavel: canonicalizeDisciplinasName(item.nome_responsavel),
      categoria_responsavel: String(item.categoria_responsavel || "").trim(),
      indicador_responsavel_principal: String(item.indicador_responsavel_principal || "").trim(),
      formacao_docente: String(item.formacao_docente || "").trim(),
      tipo: String(item.tipo || "").trim(),
      nucleo_didatico: String(item.nucleo_didatico || "").trim(),
      carga_horaria_docente: Number(item.carga_horaria_docente) || 0,
      carga_horaria_total: Number(item.carga_horaria_total) || 0,
      vinculo_painel: disciplinasInternalDocentes.has(normalizeDisciplinasName(item.nome_responsavel)) ? "Interno" : "Externo",
    }));
    const dataSourceDocumentos = window.DOCUMENTOS_PPGEF || [];
    // Static guide content stays local to this page to avoid creating new datasets for institutional copy.
    const guideOverviewItems = [
      {
        criterio: "Corpo Docente",
        exigencia: "Minimo de 12 docentes permanentes",
        explicacao: "A proposta precisa mostrar massa critica suficiente para sustentar ensino, orientacao, pesquisa e governanca.",
        detalhe: "No dashboard, isso deve ser lido em conjunto com estabilidade do quadro, distribuicao entre linhas e aderencia tematica de cada docente.",
      },
      {
        criterio: "Exclusividade",
        exigencia: "Minimo de 30% exclusivos ao PPG",
        explicacao: "Parte do quadro permanente deve ter dedicacao central ao programa, reduzindo dispersao entre multiplos PPGs.",
        detalhe: "O guia assume o corte operacional ja monitorado internamente: mapear quem atua apenas neste PPG e quem acumula participacoes externas.",
      },
      {
        criterio: "Producao Intelectual",
        exigencia: "75% dos docentes com >= 330 pontos",
        explicacao: "Esse corte resume a expectativa de produtividade consistente do nucleo docente.",
        detalhe: "O Norteador APCN localiza 320 pontos como referencia textual para doutorado academico; o painel atual trabalha com 330 como margem prudencial do PPGEF.",
      },
      {
        criterio: "Producao Qualificada",
        exigencia: "75% dos docentes com >= 2 produtos JCR/SJR ou Categoria A",
        explicacao: "Nao basta volume: a proposta precisa evidenciar qualidade editorial e aderencia dos produtos.",
        detalhe: "No uso institucional, o dashboard trata JCR/SJR, estratos qualificados e proxies editoriais como evidencias complementares para a leitura do criterio.",
      },
      {
        criterio: "Formacao de Recursos Humanos",
        exigencia: "100% com orientacao concluida; >= 9 com mestrado; >= 3 com doutorado",
        explicacao: "A experiencia previa de orientacao e central para a confianca na oferta de doutorado.",
        detalhe: "Para leitura interna, vale conferir orientacoes concluidas, nivel de experiencia e coerencia entre o nivel almejado e a trilha ja percorrida pelo docente.",
      },
      {
        criterio: "Captacao de Recursos",
        exigencia: "Ultimos 5 anos",
        explicacao: "A carteira de editais, bolsas e financiamentos sinaliza maturidade cientifica e capacidade de sustentacao.",
        detalhe: "O foco nao e apenas o valor captado: entram agencia, tipo de auxilio, vigencia, processo e relacao com os projetos da proposta.",
      },
      {
        criterio: "Linhas de Pesquisa",
        exigencia: "Minimo de duas linhas por area de concentracao",
        explicacao: "A proposta deve ser coerente, hierarquizada e capaz de organizar projetos, disciplinas e orientacoes.",
        detalhe: "O ponto critico nao e so o numero de linhas, mas a nao sobreposicao conceitual e a distribuicao equilibrada do corpo docente entre elas.",
      },
    ];
    const guideLearningItems = [
      {
        titulo: "Corpo Docente",
        resumo: "Composicao, dedicacao, exclusividade, experiencia de orientacao e distribuicao nas linhas de pesquisa.",
        detalhes: [
          "A CAPES observa se o quadro permanente e numericamente suficiente, estavel e coerente com a proposta.",
          "Tambem pesa a aderencia entre a expertise docente, as linhas, os projetos e as disciplinas do curso.",
          "A leitura institucional precisa evitar herancas de cadastro: docente produtivo, mas tematicamente desalinhado, enfraquece a proposta.",
        ],
        tags: ["Composicao", "Dedicacao", "Exclusividade", "Linhas"],
      },
      {
        titulo: "Producao Intelectual",
        resumo: "Pontuacao APCN, producao qualificada e aderencia tematica daquilo que o docente publica.",
        detalhes: [
          "A Area 21 nao le apenas quantidade: ela cruza pontuacao, qualificacao dos produtos e vinculacao com o escopo do PPG.",
          "Produtos fora da tematica da linha podem existir no curriculo, mas nao devem ser a base central da sustentacao da proposta.",
          "O docente precisa saber quais produtos sustentam sua leitura APCN e quais ainda dependem de classificacao, revisao ou confirmacao.",
        ],
        tags: ["Pontuacao", "Qualificacao", "Aderencia"],
      },
      {
        titulo: "Formacao de Recursos Humanos",
        resumo: "Orientacoes concluidas e experiencia na formacao de mestres e doutores.",
        detalhes: [
          "Para doutorado, experiencia acumulada de orientacao faz diferenca na confianca da proposta.",
          "A leitura operacional deve separar orientacao concluida, em andamento e o nivel em que ela ocorreu.",
          "Registros incompletos ou sem lastro documental tendem a gerar fragilidade justamente no item em que a maturidade docente precisa ser mais nitida.",
        ],
        tags: ["Orientacoes", "Mestrado", "Doutorado"],
      },
      {
        titulo: "Captacao de Recursos",
        resumo: "Financiamentos, bolsas, diversidade de agencias e sinais de maturidade cientifica.",
        detalhes: [
          "A CAPES valoriza a capacidade de captar recursos, independentemente do valor final, observando tipo de edital, processo e agencia.",
          "Bolsas de produtividade e carteiras vigentes ajudam, mas nao substituem o conjunto da capacidade de financiamento.",
          "Internamente, vale revisar duplicidades, vigencias e vinculacao com projetos ativos para evitar inflar ou subnotificar a base.",
        ],
        tags: ["Editais", "Bolsas", "Agencias", "Vigencia"],
      },
      {
        titulo: "Organizacao Academica",
        resumo: "Linhas de pesquisa, projetos, disciplinas e perfil do egresso precisam formar uma estrutura coerente.",
        detalhes: [
          "A proposta deve ter hierarquia entre area de concentracao, linhas, projetos e estrutura curricular.",
          "Linhas sobrepostas, projetos sem abrigo real para discentes ou disciplinas sem aderencia direta geram ruido na avaliacao.",
          "O ponto forte e mostrar um desenho curricular que deriva da identidade cientifica do programa, nao um mosaico de ofertas isoladas.",
        ],
        tags: ["Linhas", "Projetos", "Disciplinas", "Egresso"],
      },
      {
        titulo: "Sustentacao Institucional",
        resumo: "Planejamento, infraestrutura, autoavaliacao e apoio institucional sao parte da credibilidade da proposta.",
        detalhes: [
          "A proposta precisa demonstrar viabilidade, apoio da IES e mecanismos claros de autoavaliacao.",
          "Infraestrutura compartilhada pode ser usada, mas sua disponibilidade efetiva para o PPG deve ficar clara.",
          "No uso interno, esta camada ajuda a alinhar o que o docente informa com aquilo que o programa consegue provar documentalmente.",
        ],
        tags: ["Planejamento", "Infraestrutura", "Autoavaliacao"],
      },
    ];
    const guideChecklistGroups = [
      {
        titulo: "Producao Intelectual",
        resumo: "Conferencias basicas para evitar subregistro e perda de aderencia na leitura APCN.",
        itens: [
          "Minha producao esta atualizada.",
          "Conheco minha pontuacao APCN.",
          "Possuo produtos JCR/SJR identificados.",
          "Minha producao esta aderente a linha de pesquisa.",
        ],
      },
      {
        titulo: "Formacao de Recursos Humanos",
        resumo: "O foco aqui e fechar lacunas de orientacao que costumam aparecer tarde demais.",
        itens: [
          "Minhas orientacoes concluidas estao registradas.",
          "Minhas orientacoes de mestrado estao registradas.",
          "Minhas orientacoes de doutorado estao registradas.",
        ],
      },
      {
        titulo: "Captacao de Recursos",
        resumo: "A carteira informada precisa estar completa, coerente e dentro da janela considerada.",
        itens: [
          "Informei todos os editais dos ultimos cinco anos.",
          "Informei bolsas e financiamentos.",
          "Informei vigencias e processos.",
        ],
      },
      {
        titulo: "Atuacao Academica",
        resumo: "A aderencia do docente ao desenho do curso precisa ser demonstravel, nao apenas presumida.",
        itens: [
          "Estou vinculado a linha de pesquisa adequada.",
          "Possuo projetos associados a linha.",
          "Ministro disciplinas vinculadas a minha area de atuacao.",
        ],
      },
    ];
    const guideFaqItems = [
      {
        pergunta: "O Qualis e utilizado na APCN?",
        resposta: "Nao como unico sinal de qualidade. A leitura da Area 21 combina pontuacao APCN, produtos qualificados e aderencia tematica. Por isso o dashboard usa estratos, JCR/SJR e categoria editorial como evidencias complementares.",
      },
      {
        pergunta: "Como e calculada a pontuacao APCN?",
        resposta: "Ela depende dos produtos declarados e das regras da Area 21 para o nivel pretendido. Nesta interface, o objetivo nao e recalcular a regra completa, mas indicar quais produtos sustentam a leitura institucional de cada docente.",
      },
      {
        pergunta: "Qual periodo e considerado para producao?",
        resposta: "O painel sintetiza o recorte usado na preparacao da proposta. Quando houver duvida, vale confrontar o produto com a janela do quadrenio e com a regra especifica do Documento Norteador APCN.",
      },
      {
        pergunta: "Qual periodo e considerado para captacao de recursos?",
        resposta: "Para este guia, considera-se a leitura institucional dos ultimos cinco anos, com enfase em editais, financiamentos e bolsas declaradas pelos docentes.",
      },
      {
        pergunta: "Preciso possuir bolsa de produtividade?",
        resposta: "Nao e requisito isolado para todos, mas bolsas e financiamentos ajudam a demonstrar maturidade cientifica e capacidade de sustentacao da proposta.",
      },
      {
        pergunta: "Preciso ter orientacao de doutorado?",
        resposta: "Nem todos os permanentes precisam ter essa experiencia, mas a proposta de doutorado precisa mostrar massa critica no nivel almejado e um nucleo docente com historico consistente.",
      },
      {
        pergunta: "O que significa docente exclusivo?",
        resposta: "No uso operacional do guia, e o permanente que atua como permanente somente neste PPG. Esse dado afeta diretamente o criterio de dedicacao exclusiva observado pela Area 21.",
      },
      {
        pergunta: "Quantos docentes precisam ter orientacao de doutorado concluida?",
        resposta: "O monitoramento institucional adota o minimo de tres docentes com orientacao de doutorado concluida como marcador critico para a proposta.",
      },
    ];
    const guideEvidenceRows = [
      {
        criterio: "Docentes permanentes",
        exigencia: "Minimo de 12 permanentes",
        evidencia: "A proposta devera conter, no minimo, 12 docentes permanentes.",
        interpretacao: "O PPGEF precisa manter dimensao minima e estabilidade do nucleo permanente.",
        detalhe: "Na leitura operacional, 12 e piso. Quadro estavel, aderente e distribuido entre linhas e mais importante do que atingir o numero por arranjo temporario.",
        fonte: "Documento Norteador APCN, p. 7",
      },
      {
        criterio: "Exclusividade",
        exigencia: "Minimo de 30% exclusivos ao PPG",
        evidencia: "No minimo, 30% do corpo docente permanente seja exclusivo ao PPG proposto.",
        interpretacao: "A dedicacao exclusiva reduz dispersao e reforca o compromisso estrutural do quadro.",
        detalhe: "Esta e uma das areas em que o dashboard ja carrega herancas criticas: docentes com multiplas participacoes podem continuar produtivos, mas deixam de contar para o criterio quando extrapolam o limite.",
        fonte: "Documento Norteador APCN, p. 8",
      },
      {
        criterio: "Producao intelectual",
        exigencia: "75% com >= 330 pontos",
        evidencia: "75% dos docentes permanentes devem somar pelo menos 320 pontos.",
        interpretacao: "O texto CAPES local indica 320; o PPGEF monitora 330 como margem conservadora.",
        detalhe: "A aba orientadora mantem 330 porque esse corte ja aparece na infraestrutura analitica atual. Isso evita afrouxar a leitura interna, mas deixa claro que o lastro textual encontrado no documento local aponta 320.",
        fonte: "Documento Norteador APCN, p. 10",
      },
      {
        criterio: "Producao qualificada",
        exigencia: "75% com >= 2 produtos qualificados",
        evidencia: "75% dos docentes permanentes devem ter pelo menos 2 produtos qualificados.",
        interpretacao: "O PPGEF deve mapear quais produtos realmente sustentam essa exigencia por docente.",
        detalhe: "No dashboard, JCR/SJR e Categoria A funcionam como leitura operacional de qualidade. Isso ajuda a triagem interna, mas a prova final depende da aderencia do produto as regras documentais e editoriais.",
        fonte: "Documento Norteador APCN, p. 10",
      },
      {
        criterio: "Orientacoes concluidas",
        exigencia: "Experiencia previa em orientacao",
        evidencia: "75% dos docentes permanentes devem ter experiencia na orientacao de mestrandos.",
        interpretacao: "O programa precisa mostrar experiencia difusa no quadro, nao concentrada em poucos nomes.",
        detalhe: "Por isso o checklist separa orientacoes concluidas, mestrado e doutorado. O risco recorrente e ter experiencia real, mas registros incompletos ou mal classificados na base consolidada.",
        fonte: "Documento Norteador APCN, p. 9",
      },
      {
        criterio: "Captacao de recursos",
        exigencia: "Declarar editais, bolsas e financiamentos",
        evidencia: "A captação de recursos financeiros... e as Bolsas de Produtividade, devem ser declaradas.",
        interpretacao: "Nao basta dizer que houve captacao; e preciso qualificar agencia, tipo de apoio e processo.",
        detalhe: "A recomendacao institucional e revisar os ultimos cinco anos para eliminar omissoes, duplicidades e vigencias desatualizadas antes da consolidacao final da proposta.",
        fonte: "Documento Norteador APCN, p. 9",
      },
      {
        criterio: "Linhas de pesquisa",
        exigencia: "Pelo menos duas linhas por area de concentracao",
        evidencia: "Apresentou pelo menos 2 linhas de pesquisa/atuacao por area de concentracao?",
        interpretacao: "A estrutura precisa ser plural, coerente e sem sobreposicao conceitual entre linhas.",
        detalhe: "O numero minimo por si so nao resolve. O que sustenta a proposta e a hierarquia clara entre area, linhas, projetos e disciplinas, com docentes distribuidos de modo defensavel.",
        fonte: "Documento Norteador APCN, p. 17",
      },
      {
        criterio: "Projetos",
        exigencia: "1 a 3 projetos por docente permanente",
        evidencia: "E obrigatorio que todo docente permanente seja responsavel por pelo menos um projeto.",
        interpretacao: "Cada permanente precisa entrar na proposta com projeto real, coerente e capaz de abrigar discentes.",
        detalhe: "Projetos genéricos ou desalinhados costumam ser heranca de tentativas anteriores. O guia transforma isso em conferência objetiva para o docente.",
        fonte: "Documento Norteador APCN, p. 5",
      },
      {
        criterio: "Disciplinas",
        exigencia: "Estrutura curricular coerente e docentes aderentes",
        evidencia: "A proposta devera apresentar coerencia interna entre... Linhas de Pesquisa/Atuacao, as Disciplinas e os Projetos.",
        interpretacao: "Disciplina entra como prova de coerencia curricular e de aderencia do docente ao curso proposto.",
        detalhe: "Para o PPGEF, o ponto principal e mostrar que o docente ministra disciplina vinculada a sua area e ao desenho curricular do doutorado, nao apenas possui oferta isolada na base.",
        fonte: "Documento Norteador APCN, p. 5",
      },
    ];
    const docenteChipList = document.getElementById("docentes-chip-list");
    const tiposSelect = document.getElementById("tipos");
    const anosSelect = document.getElementById("anos");
    const docenteLiderancaChipList = document.getElementById("docentes-lideranca-chip-list");
    const tiposLiderancaSelect = document.getElementById("tipos-lideranca");
    const anosLiderancaSelect = document.getElementById("anos-lideranca");
    const tabsNav = document.getElementById("tabs-nav");
    const tabelaBody = document.getElementById("tabela-body");
    const resumoDocentesBody = document.getElementById("resumo-docentes-body");
    const estadoVazio = document.getElementById("estado-vazio");
    const chartDocentes = document.getElementById("chart-docentes");
    const docenteChartCaption = document.getElementById("docente-chart-caption");
    const chartAnos = document.getElementById("chart-anos");
    const typeStack = document.getElementById("type-stack");
    const typeChips = document.getElementById("type-chips");
    const insightChips = document.getElementById("insight-chips");
    const apcnScoringModal = document.getElementById("apcn-scoring-modal");
    const openApcnScoringModalButton = document.getElementById("open-apcn-scoring-modal");
    const closeApcnScoringModalButton = document.getElementById("close-apcn-scoring-modal");
    const liderancaParceriaModal = document.getElementById("lideranca-parceria-modal");
    const openLiderancaParceriaModalButton = document.getElementById("open-lideranca-parceria-modal");
    const closeLiderancaParceriaModalButton = document.getElementById("close-lideranca-parceria-modal");
    const liderancaParceriaModalTitle = document.getElementById("lideranca-parceria-modal-title");
    const liderancaParceriaModalSubtitle = document.getElementById("lideranca-parceria-modal-subtitle");
    const liderancaParceriaModalSummary = document.getElementById("lideranca-parceria-modal-summary");
    const liderancaParceriaModalBody = document.getElementById("lideranca-parceria-modal-body");
    const liderancaParceriaModalShowAllButton = document.getElementById("lideranca-parceria-modal-show-all");
    const docenteTecnicaChipList = document.getElementById("docentes-tecnica-chip-list");
    const tiposTecnicaSelect = document.getElementById("tipos-tecnica");
    const anosTecnicaSelect = document.getElementById("anos-tecnica");
    const statusTecnicaSelect = document.getElementById("status-tecnica");
    const tabelaTecnicaBody = document.getElementById("tabela-tecnica-body");
    const resumoTecnicaDocentesBody = document.getElementById("resumo-tecnica-docentes-body");
    const estadoVazioTecnica = document.getElementById("estado-vazio-tecnica");
    const chartTecnicaDocentes = document.getElementById("chart-tecnica-docentes");
    const tecnicaDocenteChartCaption = document.getElementById("tecnica-docente-chart-caption");
    const typeStackTecnica = document.getElementById("type-stack-tecnica");
    const typeChipsTecnica = document.getElementById("type-chips-tecnica");
    const insightChipsTecnica = document.getElementById("insight-chips-tecnica");
    const tecnicaSemProducaoList = document.getElementById("tecnica-sem-producao-list");
    const tecnicaFilterToggles = [...document.querySelectorAll('.filter-toggle[data-technical-group]')];
    const tecnicaDocenteSortButtons = [...document.querySelectorAll("[data-tecnica-docente-sort]")];
    const tecnicaTableSortButtons = [...document.querySelectorAll("[data-tecnica-table-sort]")];
    const scientificFilterToggles = [...document.querySelectorAll('.filter-toggle[data-group]')];
    const chartLiderancaDocentes = document.getElementById("chart-lideranca-docentes");
    const chartLiderancaCorrigido = document.getElementById("chart-lideranca-corrigido");
    const chartLiderancaDispersao = document.getElementById("chart-lideranca-dispersao");
    const chartLiderancaAnos = document.getElementById("chart-lideranca-anos");
    const chartLiderancaQualidadeJcr = document.getElementById("chart-lideranca-qualidade-jcr");
    const chartLiderancaQualidadeApcn = document.getElementById("chart-lideranca-qualidade-apcn");
    const chartLiderancaParceriaDocentes = document.getElementById("chart-lideranca-parceria-docentes");
    const chartLiderancaParceriaAnos = document.getElementById("chart-lideranca-parceria-anos");
    const chartLiderancaParceriaRede = document.getElementById("chart-lideranca-parceria-rede");
    const liderancaInsightChips = document.getElementById("lideranca-insight-chips");
    const liderancaMetodologiaChips = document.getElementById("lideranca-metodologia-chips");
    const liderancaQualidadeInsights = document.getElementById("lideranca-qualidade-insights");
    const liderancaQualidadeMetodologia = document.getElementById("lideranca-qualidade-metodologia");
    const liderancaQualidadeJcrModeButtons = [...document.querySelectorAll("[data-lideranca-qualidade-jcr-mode]")];
    const liderancaParceriaInsights = document.getElementById("lideranca-parceria-insights");
    const liderancaParceriaMetodologia = document.getElementById("lideranca-parceria-metodologia");
    const liderancaDocentesBody = document.getElementById("lideranca-docentes-body");
    const liderancaAnosBody = document.getElementById("lideranca-anos-body");
    const liderancaQualidadeBody = document.getElementById("lideranca-qualidade-body");
    const liderancaDetalheBody = document.getElementById("lideranca-detalhe-body");
    const liderancaDetailSortButtons = [...document.querySelectorAll("[data-lideranca-detail-sort]")];
    const liderancaParceriaSortButtons = [...document.querySelectorAll("[data-lideranca-parceria-sort]")];
    const liderancaEstadoVazio = document.getElementById("lideranca-estado-vazio");
    const orientacoesStrictoBody = document.getElementById("orientacoes-stricto-body");
    const orientacoesGraduacaoBody = document.getElementById("orientacoes-graduacao-body");
    const orientacoesPosdocBody = document.getElementById("orientacoes-posdoc-body");
    const chartOrientacoesDocentes = document.getElementById("chart-orientacoes-docentes");
    const docenteDisciplinasChipList = document.getElementById("docentes-disciplinas-chip-list");
    const vinculosDisciplinasSelect = document.getElementById("vinculos-disciplinas");
    const anosDisciplinasSelect = document.getElementById("anos-disciplinas");
    const periodosDisciplinasSelect = document.getElementById("periodos-disciplinas");
    const chartDisciplinasDocentes = document.getElementById("chart-disciplinas-docentes");
    const disciplinasDocenteChartCaption = document.getElementById("disciplinas-docente-chart-caption");
    const chartDisciplinasPeriodos = document.getElementById("chart-disciplinas-periodos");
    const disciplinasInsightChips = document.getElementById("disciplinas-insight-chips");
    const disciplinasNucleosStack = document.getElementById("disciplinas-nucleos-stack");
    const disciplinasNucleosChips = document.getElementById("disciplinas-nucleos-chips");
    const disciplinasResumoDocentesBody = document.getElementById("disciplinas-resumo-docentes-body");
    const disciplinasHeatmapHead = document.getElementById("disciplinas-heatmap-head");
    const disciplinasHeatmapBody = document.getElementById("disciplinas-heatmap-body");
    const disciplinasDetalheBody = document.getElementById("disciplinas-detalhe-body");
    const disciplinasDetalheNota = document.getElementById("disciplinas-detalhe-nota");
    const docenteCaptacaoList = document.getElementById("docentes-captacao");
    const tiposCaptacaoSelect = document.getElementById("tipos-captacao");
    const vigenciasCaptacaoSelect = document.getElementById("vigencias-captacao");
    const agenciasCaptacaoSelect = document.getElementById("agencias-captacao");
    const statusCaptacaoSelect = document.getElementById("status-captacao");
    const chartCaptacaoDocentes = document.getElementById("chart-captacao-docentes");
    const captacaoDocenteChartCaption = document.getElementById("captacao-docente-chart-caption");
    const captacaoExecutiveSummary = document.getElementById("captacao-executive-summary");
    const captacaoAgenciasStack = document.getElementById("captacao-agencias-stack");
    const captacaoAgenciasChips = document.getElementById("captacao-agencias-chips");
    const captacaoLinhasStack = document.getElementById("captacao-linhas-stack");
    const captacaoLinhasChips = document.getElementById("captacao-linhas-chips");
    const chartCaptacaoVigencia = document.getElementById("chart-captacao-vigencia");
    const captacaoVigenciaNota = document.getElementById("captacao-vigencia-nota");
    const captacaoTiposStack = document.getElementById("captacao-tipos-stack");
    const captacaoInsightChips = document.getElementById("captacao-insight-chips");
    const captacaoResumoDocentesBody = document.getElementById("captacao-resumo-docentes-body");
    const captacaoTabelaBody = document.getElementById("captacao-tabela-body");
    const captacaoEstadoVazio = document.getElementById("captacao-estado-vazio");
    const chartCriteriosProd = document.getElementById("chart-criterios-prod");
    const chartCriteriosOrient = document.getElementById("chart-criterios-orient");
    const tabApcn = document.getElementById("tab-apcn");
    const docenciaCritSummaryCards = document.getElementById("docencia-crit-summary-cards");
    const docenciaCritInsights = document.getElementById("docencia-crit-insights");
    const chartCaptacaoCritDocentes = document.getElementById("chart-captacao-crit-docentes");
    const captacaoCritSummaryCards = document.getElementById("captacao-crit-summary-cards");
    const captacaoCritInsights = document.getElementById("captacao-crit-insights");
    const corpoDocenteCritSummaryCards = document.getElementById("corpo-docente-crit-summary-cards");
    const corpoDocenteCritInsights = document.getElementById("corpo-docente-crit-insights");
    const criteriosSortPerformanceButton = document.getElementById("criterios-sort-performance");
    const criteriosSortAlphaButton = document.getElementById("criterios-sort-alpha");
    const docenteSortButtons = [...document.querySelectorAll("[data-docente-sort]")];
    const docenteTableSortButtons = [...document.querySelectorAll("[data-docente-table-sort]")];
    const disciplinasDocenteSortButtons = [...document.querySelectorAll("[data-disciplinas-docente-sort]")];
    const disciplinasFilterToggles = [...document.querySelectorAll('.filter-toggle[data-disciplina-group]')];
    const captacaoFilterToggles = [...document.querySelectorAll('.filter-toggle[data-captacao-group]')];
    const captacaoDocenteSortButtons = [...document.querySelectorAll("[data-captacao-docente-sort]")];
    const documentsInternos = document.getElementById("documents-internos");
    const documentsCapes = document.getElementById("documents-capes");
    const guideOverviewGrid = document.getElementById("guide-overview-grid");
    const guideLearningGrid = document.getElementById("guide-learning-grid");
    const guideChecklistGrid = document.getElementById("guide-checklist-grid");
    const guideFaqList = document.getElementById("guide-faq-list");
    const guideEvidenceBody = document.getElementById("guide-evidence-body");
    let selectedDocentes = new Set();
    let selectedTipos = new Set();
    let selectedAnos = new Set();
    let selectedDocentesTecnica = new Set();
    let selectedTiposTecnica = new Set();
    let selectedAnosTecnica = new Set();
    let selectedStatusTecnica = new Set();
    let selectedDocentesDisciplinas = new Set();
    let selectedVinculosDisciplinas = new Set();
    let selectedAnosDisciplinas = new Set();
    let selectedPeriodosDisciplinas = new Set();
    let selectedDocentesCaptacao = new Set();
    let selectedTiposCaptacao = new Set();
    let selectedVigenciasCaptacao = new Set();
    let selectedAgenciasCaptacao = new Set();
    let selectedStatusCaptacao = new Set();
    let docenteSortMode = "alfabetico";
    let tecnicaDocenteSortMode = "alfabetico";
    let disciplinasDocenteSortMode = "carga";
    let captacaoDocenteSortMode = "valor";
    let docenteTableSortMode = "alfabetico";
    let tecnicaTableSortMode = "alfabetico";
    let criteriaDocentesSort = "alpha";
    let liderancaQualidadeJcrMode = "total";
    let liderancaDetailSort = { key: "docente", direction: "asc" };
    let liderancaParceriaSortMode = "alfabetico";
    let liderancaParceriaAuditState = { integratedWorks: [], pairMap: new Map() };
    let scientificFilterValues = {
      docentes: [],
      tipos: [],
      anos: [],
    };
    let technicalFilterValues = {
      docentes: [],
      tipos: [],
      anos: [],
      status: [],
    };
    let disciplinasFilterValues = {
      docentes: [],
      vinculos: [],
      anos: [],
      periodos: [],
    };
    let captacaoFilterValues = {
      docentes: [],
      tipos: [],
      vigencias: [],
      agencias: [],
      status: [],
    };

    const typeLabels = {
      artigo: "Artigos",
      livro: "Livros",
      capitulo: "Capítulos",
    };

    const technicalTypeLabels = {
      produtos_tecnologicos: "Produtos tecnológicos",
      trabalhos_tecnicos: "Trabalhos técnicos",
      processos_ou_tecnicas: "Processos ou técnicas",
      programas_de_computador_sem_registro: "Programas de computador sem registro",
      assessoria_e_consultoria: "Assessoria e consultoria",
      entrevistas: "Entrevistas",
      redes_sociais: "Redes sociais",
      demais_tipos: "Demais tipos",
      sem_producao: "Sem produção",
    };
    const personStopwords = new Set(["DA", "DE", "DO", "DOS", "DAS", "DEL", "DELA", "DI", "DU", "E"]);
    const surnameSuffixes = new Set(["FILHO", "JUNIOR", "NETO", "SOBRINHO"]);

    function unique(values) {
      return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    }

    function formatOrientationValue(value) {
      return Number(value) === 0 ? "-" : String(value ?? "-");
    }

    function getDoutoradoSeries(item) {
      const andamentoPrincipal = Number(item.doutorado_andamento_principal) || 0;
      const concluidasPrincipal = Number(item.doutorado_concluidas_principal) || 0;
      const andamentoCo = item.doutorado_andamento_co != null
        ? Number(item.doutorado_andamento_co) || 0
        : Math.max((Number(item.doutorado_andamento) || 0) - andamentoPrincipal, 0);
      const concluidasCo = item.doutorado_concluidas_co != null
        ? Number(item.doutorado_concluidas_co) || 0
        : Math.max((Number(item.doutorado_concluidas) || 0) - concluidasPrincipal, 0);
      return {
        andamentoCo,
        andamentoPrincipal,
        concluidasCo,
        concluidasPrincipal,
        total: andamentoCo + andamentoPrincipal + concluidasCo + concluidasPrincipal,
      };
    }

    function getSelectedValues(select) {
      return [...select.selectedOptions].map((option) => option.value);
    }

    function populateFilters(data) {
      const docentes = unique(data.map((item) => item.docente));
      const anos = unique(data.map((item) => item.ano)).sort((a, b) => Number(a) - Number(b));
      const tipos = [
        ["artigo", "Artigo"],
        ["livro", "Livro"],
        ["capitulo", "Capítulo"],
      ];
      scientificFilterValues = {
        docentes,
        tipos: tipos.map(([value]) => value),
        anos,
      };
      const docentesHtml = docentes.map((docente) => `
        <label class="filter-option">
          <input type="checkbox" value="${docente}">
          <span>${docente}</span>
        </label>
      `).join("");
      const tiposHtml = tipos.map(([value, label]) => `
        <label class="filter-option">
          <input type="checkbox" value="${value}">
          <span>${label}</span>
        </label>
      `).join("");
      const anosHtml = anos.map((ano) => `
        <label class="filter-option">
          <input type="checkbox" value="${ano}">
          <span>${ano}</span>
        </label>
      `).join("");
      [docenteChipList, docenteLiderancaChipList].forEach((container) => {
        if (container) container.innerHTML = docentesHtml;
      });
      [tiposSelect, tiposLiderancaSelect].forEach((container) => {
        if (container) container.innerHTML = tiposHtml;
      });
      [anosSelect, anosLiderancaSelect].forEach((container) => {
        if (container) container.innerHTML = anosHtml;
      });
    }

    function normalizeTechnicalType(value) {
      return (value || "nao_informado")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "nao_informado";
    }

    function formatTechnicalType(value) {
      const normalized = normalizeTechnicalType(value);
      if (technicalTypeLabels[normalized]) return technicalTypeLabels[normalized];
      return (value || "Não informado")
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
    }

    function hasTechnicalProduction(item) {
      if (item.possui_producao != null) return Number(item.possui_producao) === 1;
      return normalizeTechnicalType(item.tipo_produto) !== "sem_producao";
    }

    function getTechnicalAmount(item) {
      return hasTechnicalProduction(item) ? 1 : 0;
    }

    function getTechnicalStatusKey(item) {
      return hasTechnicalProduction(item) ? "com_producao" : "sem_producao";
    }

    function getTechnicalStatusLabel(item) {
      return getTechnicalStatusKey(item) === "com_producao" ? "Com produção" : "Sem produção";
    }

    function getTechnicalYearLabel(item) {
      return item.ano ? String(item.ano) : "Sem ano";
    }

    function getTechnicalSubtype(item) {
      return item.subtipo || "Não informado";
    }

    function getTechnicalDetail(item) {
      return item.observacoes || item.titulo || "";
    }

    function normalizeText(value) {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    }

    function populateTechnicalFilters(data) {
      const docentes = unique(data.map((item) => item.docente));
      const tipos = unique(
        data
          .filter((item) => hasTechnicalProduction(item))
          .map((item) => formatTechnicalType(item.tipo_produto))
      );
      const anos = unique(data.map((item) => getTechnicalYearLabel(item))).sort((a, b) => {
        if (a === "Sem ano") return 1;
        if (b === "Sem ano") return -1;
        return Number(a) - Number(b);
      });
      const status = [
        ["com_producao", "Com produção"],
        ["sem_producao", "Sem produção"],
      ];
      technicalFilterValues = {
        docentes,
        tipos,
        anos,
        status: status.map(([value]) => value),
      };
      docenteTecnicaChipList.innerHTML = docentes.map((docente) => `
        <label class="filter-option">
          <input type="checkbox" value="${docente}">
          <span>${docente}</span>
        </label>
      `).join("");
      tiposTecnicaSelect.innerHTML = tipos.map((tipo) => `
        <label class="filter-option">
          <input type="checkbox" value="${tipo}">
          <span>${tipo}</span>
        </label>
      `).join("");
      anosTecnicaSelect.innerHTML = anos.map((ano) => `
        <label class="filter-option">
          <input type="checkbox" value="${ano}">
          <span>${ano}</span>
        </label>
      `).join("");
      statusTecnicaSelect.innerHTML = status.map(([value, label]) => `
        <label class="filter-option">
          <input type="checkbox" value="${value}">
          <span>${label}</span>
        </label>
      `).join("");
    }

    function getDisciplinasBaseData() {
      return dataSourceDisciplinas.filter((item) =>
        item.nome_responsavel &&
        item.carga_horaria_docente > 0
      );
    }

    function formatHours(value) {
      return `${Math.round(Number(value) || 0)}h`;
    }

    function getCanonicalDisciplinasDocenteOptions(data) {
      const byKey = new Map();
      data.forEach((item) => {
        const canonicalName = canonicalizeDisciplinasName(item.nome_responsavel);
        const key = normalizeDisciplinasName(canonicalName);
        if (!key || byKey.has(key)) return;
        byKey.set(key, canonicalName);
      });
      return [...byKey.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
    }

    function populateDisciplinasFilters(data) {
      const docentes = getCanonicalDisciplinasDocenteOptions(data);
      const vinculos = unique(data.map((item) => item.vinculo_painel));
      const anos = unique(data.map((item) => item.ano)).sort((a, b) => Number(a) - Number(b));
      const periodos = unique(data.map((item) => item.ano_periodo)).sort((a, b) => a.localeCompare(b, "pt-BR"));
      disciplinasFilterValues = { docentes, vinculos, anos, periodos };
      docenteDisciplinasChipList.innerHTML = docentes.map((docente) => `
        <label class="filter-option">
          <input type="checkbox" value="${docente}">
          <span>${docente}</span>
        </label>
      `).join("");
      vinculosDisciplinasSelect.innerHTML = vinculos.map((vinculo) => `
        <label class="filter-option">
          <input type="checkbox" value="${vinculo}">
          <span>${vinculo}</span>
        </label>
      `).join("");
      anosDisciplinasSelect.innerHTML = anos.map((ano) => `
        <label class="filter-option">
          <input type="checkbox" value="${ano}">
          <span>${ano}</span>
        </label>
      `).join("");
      periodosDisciplinasSelect.innerHTML = periodos.map((periodo) => `
        <label class="filter-option">
          <input type="checkbox" value="${periodo}">
          <span>${periodo.replace("_", ".")}</span>
        </label>
      `).join("");
    }

    function refreshDisciplinasDocenteOptions() {
      const vinculos = [...selectedVinculosDisciplinas];
      const anos = [...selectedAnosDisciplinas];
      const periodos = [...selectedPeriodosDisciplinas];
      const docenteOptions = getCanonicalDisciplinasDocenteOptions(
        getDisciplinasBaseData()
          .filter((item) => {
            const vinculoOk = !vinculos.length || vinculos.includes(item.vinculo_painel);
            const anoOk = !anos.length || anos.includes(item.ano);
            const periodoOk = !periodos.length || periodos.includes(item.ano_periodo);
            return vinculoOk && anoOk && periodoOk;
          })
      );

      disciplinasFilterValues.docentes = docenteOptions;
      [...selectedDocentesDisciplinas].forEach((docente) => {
        if (!docenteOptions.includes(docente)) {
          selectedDocentesDisciplinas.delete(docente);
        }
      });

      docenteDisciplinasChipList.innerHTML = docenteOptions.map((docente) => `
        <label class="filter-option">
          <input type="checkbox" value="${docente}">
          <span>${docente}</span>
        </label>
      `).join("");
      bindScientificCheckboxContainer(docenteDisciplinasChipList, selectedDocentesDisciplinas, applyDisciplinasFilters);
    }

    function syncDisciplinasFilterViews() {
      [
        [docenteDisciplinasChipList, selectedDocentesDisciplinas],
        [vinculosDisciplinasSelect, selectedVinculosDisciplinas],
        [anosDisciplinasSelect, selectedAnosDisciplinas],
        [periodosDisciplinasSelect, selectedPeriodosDisciplinas],
      ].forEach(([container, selectedSet]) => {
        if (!container) return;
        [...container.querySelectorAll('input[type="checkbox"]')].forEach((input) => {
          input.checked = selectedSet.has(input.value);
        });
      });
    }

    function bindDisciplinasFilters() {
      bindScientificCheckboxContainer(docenteDisciplinasChipList, selectedDocentesDisciplinas, applyDisciplinasFilters);
      bindScientificCheckboxContainer(vinculosDisciplinasSelect, selectedVinculosDisciplinas, applyDisciplinasFilters);
      bindScientificCheckboxContainer(anosDisciplinasSelect, selectedAnosDisciplinas, applyDisciplinasFilters);
      bindScientificCheckboxContainer(periodosDisciplinasSelect, selectedPeriodosDisciplinas, applyDisciplinasFilters);
    }

    function initializeDisciplinasFilters() {
      selectedDocentesDisciplinas.clear();
      selectedVinculosDisciplinas.clear();
      selectedAnosDisciplinas.clear();
      selectedPeriodosDisciplinas.clear();
      disciplinasFilterValues.docentes.forEach((value) => selectedDocentesDisciplinas.add(value));
      disciplinasFilterValues.vinculos.forEach((value) => selectedVinculosDisciplinas.add(value));
      disciplinasFilterValues.anos.forEach((value) => selectedAnosDisciplinas.add(value));
      disciplinasFilterValues.periodos.forEach((value) => selectedPeriodosDisciplinas.add(value));
      syncDisciplinasFilterViews();
    }

    function bindDisciplinasFilterToggles() {
      const groupConfig = {
        docentes: { selectedSet: selectedDocentesDisciplinas, getValues: () => disciplinasFilterValues.docentes },
        vinculos: { selectedSet: selectedVinculosDisciplinas, getValues: () => disciplinasFilterValues.vinculos },
        anos: { selectedSet: selectedAnosDisciplinas, getValues: () => disciplinasFilterValues.anos },
        periodos: { selectedSet: selectedPeriodosDisciplinas, getValues: () => disciplinasFilterValues.periodos },
      };

      disciplinasFilterToggles.forEach((button) => {
        button.addEventListener("click", () => {
          const config = groupConfig[button.dataset.disciplinaGroup];
          if (!config) return;
          config.selectedSet.clear();
          const values = button.dataset.action === "all" ? config.getValues() : [];
          values.forEach((value) => config.selectedSet.add(value));
          syncDisciplinasFilterViews();
          applyDisciplinasFilters();
        });
      });
    }

    function getFilteredDisciplinasData() {
      const docentes = [...selectedDocentesDisciplinas];
      const vinculos = [...selectedVinculosDisciplinas];
      const anos = [...selectedAnosDisciplinas];
      const periodos = [...selectedPeriodosDisciplinas];
      return getDisciplinasBaseData().filter((item) => {
        const docenteOk = !docentes.length || docentes.includes(item.nome_responsavel);
        const vinculoOk = !vinculos.length || vinculos.includes(item.vinculo_painel);
        const anoOk = !anos.length || anos.includes(item.ano);
        const periodoOk = !periodos.length || periodos.includes(item.ano_periodo);
        return docenteOk && vinculoOk && anoOk && periodoOk;
      });
    }

    function aggregateDisciplinasByDocente(data) {
      const grouped = new Map();
      data.forEach((item) => {
        const key = item.nome_responsavel || "Não informado";
        if (!grouped.has(key)) {
          grouped.set(key, {
            docente: key,
            vinculo: item.vinculo_painel || "Externo",
            carga: 0,
            cargaPrincipal: 0,
            cargaFormacao: 0,
            ofertas: new Set(),
            periodos: new Set(),
            categorias: new Set(),
          });
        }
        const bucket = grouped.get(key);
        bucket.carga += item.carga_horaria_docente;
        if (item.indicador_responsavel_principal === "Sim") bucket.cargaPrincipal += item.carga_horaria_docente;
        if (item.formacao_docente === "Sim") bucket.cargaFormacao += item.carga_horaria_docente;
        bucket.ofertas.add(`${item.ano_periodo}||${item.nome_disciplina_completo}`);
        bucket.periodos.add(item.ano_periodo);
        if (item.categoria_responsavel) bucket.categorias.add(item.categoria_responsavel);
      });
      return [...grouped.values()]
        .map((item) => ({
          docente: item.docente,
          vinculo: item.vinculo,
          categoriaBase: [...item.categorias].sort((a, b) => a.localeCompare(b, "pt-BR")).join(", ") || "Não informada",
          carga: item.carga,
          cargaPrincipal: item.cargaPrincipal,
          ofertas: item.ofertas.size,
          periodos: item.periodos.size,
          shareFormacao: item.carga ? item.cargaFormacao / item.carga : 0,
        }))
        .sort((a, b) => b.carga - a.carga || a.docente.localeCompare(b.docente, "pt-BR"));
    }

    function aggregateDisciplinasByPeriodo(data) {
      const grouped = new Map();
      data.forEach((item) => {
        const key = item.ano_periodo || "Sem período";
        if (!grouped.has(key)) {
          grouped.set(key, { periodo: key, ano: item.ano, carga: 0, ofertas: new Set() });
        }
        const bucket = grouped.get(key);
        bucket.carga += item.carga_horaria_docente;
        bucket.ofertas.add(item.nome_disciplina_completo);
      });
      return [...grouped.values()]
        .map((item) => ({ ...item, ofertas: item.ofertas.size }))
        .sort((a, b) => a.periodo.localeCompare(b.periodo, "pt-BR"));
    }

    function aggregateDisciplinasByNucleo(data) {
      const grouped = new Map();
      data.forEach((item) => {
        const key = item.nucleo_didatico || "Não informado";
        if (!grouped.has(key)) grouped.set(key, { nucleo: key, carga: 0, ofertas: new Set() });
        const bucket = grouped.get(key);
        bucket.carga += item.carga_horaria_docente;
        bucket.ofertas.add(item.nome_disciplina_completo);
      });
      return [...grouped.values()]
        .map((item) => ({ ...item, ofertas: item.ofertas.size }))
        .sort((a, b) => b.carga - a.carga || a.nucleo.localeCompare(b.nucleo, "pt-BR"));
    }

    function renderDisciplinasMetrics(data, docenteSummary, periodSummary, nucleoSummary) {
      const totalCarga = data.reduce((acc, item) => acc + item.carga_horaria_docente, 0);
      const totalOfertas = new Set(data.map((item) => `${item.ano_periodo}||${item.nome_disciplina_completo}`)).size;
      const cargaFormacao = data.reduce((acc, item) => acc + (item.formacao_docente === "Sim" ? item.carga_horaria_docente : 0), 0);
      const cargaObrigatoria = data.reduce((acc, item) => acc + (item.tipo === "Obrigatória" ? item.carga_horaria_docente : 0), 0);
      const internosAtivos = docenteSummary.filter((item) => item.vinculo === "Interno").length;
      const externosAtivos = docenteSummary.filter((item) => item.vinculo === "Externo").length;
      const externosFormacao = new Set(
        data
          .filter((item) => item.vinculo_painel === "Externo" && item.formacao_docente === "Sim")
          .map((item) => item.nome_responsavel)
      ).size;
      const topDocente = docenteSummary[0];
      const topPeriodo = [...periodSummary].sort((a, b) => b.carga - a.carga)[0];
      const topNucleo = nucleoSummary[0];

      document.getElementById("disciplinas-carga-total").textContent = formatHours(totalCarga);
      document.getElementById("disciplinas-docentes-ativos").textContent = String(docenteSummary.length);
      document.getElementById("disciplinas-ofertas-total").textContent = String(totalOfertas);
      document.getElementById("disciplinas-externos-colaboradores").textContent = String(externosAtivos);

      disciplinasInsightChips.innerHTML = [
        topDocente ? `<span class="chip">Maior carga: <strong>${topDocente.docente}</strong> (${formatHours(topDocente.carga)})</span>` : "",
        topPeriodo ? `<span class="chip">Pico temporal: <strong>${topPeriodo.periodo.replace("_", ".")}</strong> (${formatHours(topPeriodo.carga)})</span>` : "",
        `<span class="chip">Internos ativos: <strong>${internosAtivos}</strong> · Externos ativos: <strong>${externosAtivos}</strong></span>`,
        `<span class="chip">Externos em componentes de formação docente: <strong>${externosFormacao}</strong></span>`,
        `<span class="chip">Formação docente concentra <strong>${formatPercent(totalCarga ? cargaFormacao / totalCarga : 0)}</strong> da CH filtrada</span>`,
        `<span class="chip">Obrigatórias concentram <strong>${formatPercent(totalCarga ? cargaObrigatoria / totalCarga : 0)}</strong> da CH docente filtrada</span>`,
        topNucleo ? `<span class="chip">Núcleo dominante: <strong>${topNucleo.nucleo}</strong> (${formatHours(topNucleo.carga)})</span>` : "",
      ].filter(Boolean).join("");
    }

    function renderDisciplinasDocenteChart(data) {
      const items = [...data].sort((a, b) => {
        if (disciplinasDocenteSortMode === "alfabetico") {
          return a.docente.localeCompare(b.docente, "pt-BR") || b.carga - a.carga;
        }
        return b.carga - a.carga || b.cargaPrincipal - a.cargaPrincipal || a.docente.localeCompare(b.docente, "pt-BR");
      });
      if (!data.length) {
        chartDisciplinasDocentes.innerHTML = `<p class="chart-note">Sem dados para o gráfico.</p>`;
        return;
      }
      disciplinasDocenteChartCaption.textContent = disciplinasDocenteSortMode === "alfabetico"
        ? "Ranking ordenado alfabeticamente no recorte filtrado."
        : "Ranking ordenado pela carga horária docente no recorte filtrado.";
      const labelWidth = 250;
      const rowHeight = 34;
      const chartWidth = 760;
      const usableWidth = chartWidth - labelWidth - 80;
      const maxCarga = Math.max(...items.map((item) => item.carga), 1);
      const height = Math.max(240, items.length * rowHeight + 30);
      chartDisciplinasDocentes.innerHTML = `
        <svg viewBox="0 0 ${chartWidth} ${height}" role="img" aria-label="Carga horária por docente">
          ${items.map((item, index) => {
            const y = 18 + index * rowHeight;
            const width = (item.carga / maxCarga) * usableWidth;
            const principalWidth = (item.cargaPrincipal / maxCarga) * usableWidth;
            const secondaryFill = item.vinculo === "Interno" ? "#8c1538" : "#4d7c68";
            return `
              <text x="0" y="${y + 15}" fill="#262930" font-size="12">${item.docente} · ${item.vinculo}</text>
              <rect x="${labelWidth}" y="${y}" width="${width}" height="18" rx="9" fill="#d7c3ad"></rect>
              <rect x="${labelWidth}" y="${y}" width="${principalWidth}" height="18" rx="9" fill="#d4a017"></rect>
              <rect x="${labelWidth + principalWidth}" y="${y}" width="${Math.max(0, width - principalWidth)}" height="18" rx="9" fill="${secondaryFill}"></rect>
              <text x="${labelWidth + width + 10}" y="${y + 14}" fill="#262930" font-size="12">${formatHours(item.carga)}</text>
            `;
          }).join("")}
        </svg>
      `;
    }

    function renderDisciplinasPeriodoChart(data) {
      if (!data.length) {
        chartDisciplinasPeriodos.innerHTML = `<p class="chart-note">Sem dados para o gráfico.</p>`;
        return;
      }
      const height = 280;
      const paddingX = 44;
      const baseY = 232;
      const maxCarga = Math.max(...data.map((item) => item.carga), 1);
      const barWidth = 56;
      const gap = 22;
      const rightPadding = 40;
      const width = Math.max(760, paddingX + data.length * barWidth + Math.max(0, data.length - 1) * gap + rightPadding);
      chartDisciplinasPeriodos.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Carga horária por período">
          <line x1="${paddingX}" y1="${baseY}" x2="${width - 24}" y2="${baseY}" stroke="#b9ad9d" stroke-width="1"></line>
          ${data.map((item, index) => {
            const x = paddingX + index * (barWidth + gap);
            const barHeight = (item.carga / maxCarga) * 150;
            const y = baseY - barHeight;
            return `
              <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="16" fill="#8c1538"></rect>
              <text x="${x + barWidth / 2}" y="${baseY + 18}" text-anchor="middle" fill="#262930" font-size="12">${item.periodo.replace("_", ".")}</text>
              <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" fill="#262930" font-size="12">${Math.round(item.carga)}</text>
            `;
          }).join("")}
        </svg>
      `;
    }

    function renderDisciplinasNucleoPanel(data) {
      const totalCarga = data.reduce((acc, item) => acc + item.carga, 0);
      if (!data.length || !totalCarga) {
        disciplinasNucleosStack.innerHTML = `<p class="chart-note">Sem dados para composição.</p>`;
        disciplinasNucleosChips.innerHTML = "";
        return;
      }
      disciplinasNucleosStack.innerHTML = data.map((item) => `
        <div class="type-row">
          <strong>${item.nucleo}</strong>
          <div class="track"><div class="bar" style="width:${(item.carga / totalCarga) * 100}%"></div></div>
          <span>${formatHours(item.carga)}</span>
        </div>
      `).join("");
      disciplinasNucleosChips.innerHTML = data.slice(0, 3).map((item) => `
        <span class="chip">${item.ofertas} oferta(s) em <strong>${item.nucleo}</strong></span>
      `).join("");
    }

    function renderDisciplinasResumoDocentes(data) {
      disciplinasResumoDocentesBody.innerHTML = data.map((item) => `
        <tr>
          <td>${item.docente}</td>
          <td>${item.vinculo}</td>
          <td>${item.categoriaBase}</td>
          <td>${formatHours(item.carga)}</td>
          <td>${formatHours(item.cargaPrincipal)}</td>
          <td>${item.ofertas}</td>
          <td>${item.periodos}</td>
          <td>${formatPercent(item.shareFormacao)}</td>
        </tr>
      `).join("");
    }

    function renderDisciplinasHeatmap(docenteSummary, periodSummary, data) {
      const periods = periodSummary.map((item) => item.periodo);
      const maxCarga = Math.max(...data.map((item) => item.carga_horaria_docente), 1);
      const matrix = new Map();
      data.forEach((item) => {
        const key = `${item.nome_responsavel}||${item.ano_periodo}`;
        matrix.set(key, (matrix.get(key) || 0) + item.carga_horaria_docente);
      });
      disciplinasHeatmapHead.innerHTML = [
        "<th>Docente</th>",
        ...periods.map((periodo) => `<th>${periodo.replace("_", ".")}</th>`),
        "<th>Total</th>",
      ].join("");
      disciplinasHeatmapBody.innerHTML = docenteSummary.map((docente) => `
        <tr>
          <td><strong>${docente.docente}</strong><br><span style="font-size:11px;color:#6d727c;">${docente.vinculo}</span></td>
          ${periods.map((periodo) => {
            const carga = matrix.get(`${docente.docente}||${periodo}`) || 0;
            const alpha = carga ? 0.12 + (carga / maxCarga) * 0.42 : 0;
            const style = carga ? `background: rgba(140, 21, 56, ${alpha.toFixed(2)}); color: ${carga > maxCarga * 0.45 ? "white" : "#262930"};` : "";
            return `<td style="${style}">${carga ? Math.round(carga) : "-"}</td>`;
          }).join("")}
          <td class="numeric-strong">${Math.round(docente.carga)}</td>
        </tr>
      `).join("");
    }

    function renderDisciplinasDetalhe(data) {
      disciplinasDetalheBody.innerHTML = data
        .slice()
        .sort((a, b) => b.ano_periodo.localeCompare(a.ano_periodo, "pt-BR") || a.nome_responsavel.localeCompare(b.nome_responsavel, "pt-BR"))
        .map((item) => `
          <tr>
            <td>${item.nome_responsavel}</td>
            <td>${item.vinculo_painel}</td>
            <td>${item.categoria_responsavel || "Não informada"}</td>
            <td>${item.ano_periodo.replace("_", ".")}</td>
            <td>${item.nome_disciplina}</td>
            <td>${item.nucleo_didatico}</td>
            <td>${item.tipo}</td>
            <td>${item.formacao_docente}</td>
            <td>${item.indicador_responsavel_principal}</td>
            <td>${formatHours(item.carga_horaria_docente)}</td>
          </tr>
        `).join("");
      disciplinasDetalheNota.textContent = `${data.length} participação(ões) de ministrantes exibidas no recorte atual. O painel agora distingue internos e externos com base na lista de referência informada para o PPGEF.`;
    }

    function applyDisciplinasFilters() {
      refreshDisciplinasDocenteOptions();
      syncDisciplinasFilterViews();
      const filtered = getFilteredDisciplinasData();
      const docenteSummary = aggregateDisciplinasByDocente(filtered);
      const periodSummary = aggregateDisciplinasByPeriodo(filtered);
      const nucleoSummary = aggregateDisciplinasByNucleo(filtered);
      renderDisciplinasMetrics(filtered, docenteSummary, periodSummary, nucleoSummary);
      renderDisciplinasDocenteChart(docenteSummary);
      renderDisciplinasPeriodoChart(periodSummary);
      renderDisciplinasNucleoPanel(nucleoSummary);
      renderDisciplinasResumoDocentes(docenteSummary);
      renderDisciplinasHeatmap(docenteSummary, periodSummary, filtered);
      renderDisciplinasDetalhe(filtered);
    }

    function getCaptacaoAgencyFilterValue(item) {
      return item.agencia_grupo || item.agencia_normalizada || item.agencia || "Não informada";
    }

    function getCaptacaoTypeFilterValues(item) {
      return item.tipo_lista || item.tipos || [];
    }

    function populateCaptacaoFilters(data) {
      const relevantData = getCaptacaoRelevantRows(data);
      const docentes = unique([
        ...captacaoPermanentDocenteMeta.map((item) => item.docente),
        ...relevantData.map((item) => item.docente),
      ]).sort((a, b) => a.localeCompare(b, "pt-BR"));
      const tipos = unique(relevantData.flatMap((item) => getCaptacaoTypeFilterValues(item)))
        .sort((a, b) => a.localeCompare(b, "pt-BR"));
      const vigencias = unique(relevantData.flatMap((item) => item.vigencia_anos || []))
        .sort((a, b) => Number(a) - Number(b));
      const agencias = unique(relevantData.map((item) => getCaptacaoAgencyFilterValue(item)))
        .sort((a, b) => a.localeCompare(b, "pt-BR"));
      const status = unique(relevantData.map((item) => item.status))
        .sort((a, b) => a.localeCompare(b, "pt-BR"));
      captacaoFilterValues = { docentes, tipos, vigencias, agencias, status };
      docenteCaptacaoList.innerHTML = docentes.map((docente) => `
        <label class="filter-option">
          <input type="checkbox" value="${docente}">
          <span>${docente}</span>
        </label>
      `).join("");
      tiposCaptacaoSelect.innerHTML = tipos.map((tipo) => `
        <label class="filter-option">
          <input type="checkbox" value="${tipo}">
          <span>${tipo}</span>
        </label>
      `).join("");
      vigenciasCaptacaoSelect.innerHTML = vigencias.map((ano) => `
        <label class="filter-option">
          <input type="checkbox" value="${ano}">
          <span>${ano}</span>
        </label>
      `).join("");
      agenciasCaptacaoSelect.innerHTML = agencias.map((agencia) => `
        <label class="filter-option">
          <input type="checkbox" value="${agencia}">
          <span>${agencia}</span>
        </label>
      `).join("");
      statusCaptacaoSelect.innerHTML = status.map((item) => `
        <label class="filter-option">
          <input type="checkbox" value="${item}">
          <span>${item}</span>
        </label>
      `).join("");
    }

    function syncCaptacaoFilterViews() {
      [
        [docenteCaptacaoList, selectedDocentesCaptacao],
        [tiposCaptacaoSelect, selectedTiposCaptacao],
        [vigenciasCaptacaoSelect, selectedVigenciasCaptacao],
        [agenciasCaptacaoSelect, selectedAgenciasCaptacao],
        [statusCaptacaoSelect, selectedStatusCaptacao],
      ].forEach(([container, selectedSet]) => {
        if (!container) return;
        [...container.querySelectorAll('input[type="checkbox"]')].forEach((input) => {
          input.checked = selectedSet.has(input.value);
        });
      });
    }

    function initializeCaptacaoFilters() {
      selectedDocentesCaptacao.clear();
      selectedTiposCaptacao.clear();
      selectedVigenciasCaptacao.clear();
      selectedAgenciasCaptacao.clear();
      selectedStatusCaptacao.clear();
      captacaoFilterValues.docentes.forEach((value) => selectedDocentesCaptacao.add(value));
      captacaoFilterValues.tipos.forEach((value) => selectedTiposCaptacao.add(value));
      captacaoFilterValues.vigencias.forEach((value) => selectedVigenciasCaptacao.add(value));
      captacaoFilterValues.agencias.forEach((value) => selectedAgenciasCaptacao.add(value));
      captacaoFilterValues.status.forEach((value) => selectedStatusCaptacao.add(value));
      syncCaptacaoFilterViews();
    }

    function bindCaptacaoFilters() {
      bindScientificCheckboxContainer(docenteCaptacaoList, selectedDocentesCaptacao, applyCaptacaoFilters);
      bindScientificCheckboxContainer(tiposCaptacaoSelect, selectedTiposCaptacao, applyCaptacaoFilters);
      bindScientificCheckboxContainer(vigenciasCaptacaoSelect, selectedVigenciasCaptacao, applyCaptacaoFilters);
      bindScientificCheckboxContainer(agenciasCaptacaoSelect, selectedAgenciasCaptacao, applyCaptacaoFilters);
      bindScientificCheckboxContainer(statusCaptacaoSelect, selectedStatusCaptacao, applyCaptacaoFilters);
    }

    function bindCaptacaoFilterToggles() {
      const groupConfig = {
        docentes: { selectedSet: selectedDocentesCaptacao, getValues: () => captacaoFilterValues.docentes },
        tipos: { selectedSet: selectedTiposCaptacao, getValues: () => captacaoFilterValues.tipos },
        vigencias: { selectedSet: selectedVigenciasCaptacao, getValues: () => captacaoFilterValues.vigencias },
        agencias: { selectedSet: selectedAgenciasCaptacao, getValues: () => captacaoFilterValues.agencias },
        status: { selectedSet: selectedStatusCaptacao, getValues: () => captacaoFilterValues.status },
      };

      captacaoFilterToggles.forEach((button) => {
        button.addEventListener("click", () => {
          const config = groupConfig[button.dataset.captacaoGroup];
          if (!config) return;
          config.selectedSet.clear();
          const values = button.dataset.action === "all" ? config.getValues() : [];
          values.forEach((value) => config.selectedSet.add(value));
          syncCaptacaoFilterViews();
          applyCaptacaoFilters();
        });
      });
    }

    function getFilteredCaptacaoData() {
      const docentes = [...selectedDocentesCaptacao];
      const tipos = [...selectedTiposCaptacao];
      const vigencias = [...selectedVigenciasCaptacao];
      const agencias = [...selectedAgenciasCaptacao];
      const status = [...selectedStatusCaptacao];
      return dataSourceCaptacao.filter((item) => {
        const docenteOk = !docentes.length || docentes.includes(item.docente);
        const tipoOk = !tipos.length || tipos.some((tipo) => getCaptacaoTypeFilterValues(item).includes(tipo));
        const vigenciaOk = !vigencias.length || vigencias.some((ano) => (item.vigencia_anos || []).includes(ano));
        const agenciaOk = !agencias.length || agencias.includes(getCaptacaoAgencyFilterValue(item));
        const statusOk = !status.length || status.includes(item.status);
        return docenteOk && tipoOk && vigenciaOk && agenciaOk && statusOk;
      });
    }

    const captacaoPermanentDocenteMeta = (dataSourceCorpoDocente.docentes || [])
      .filter((docente) => docente.anos?.[String(captacaoReferenceYear)] === "Per")
      .map((docente) => ({
        docente: docente.docente,
        key: normalizeDisciplinasName(docente.docente),
        linhas: [
          ...(docente.ams ? ["AMS"] : []),
          ...(docente.dfe ? ["DFE"] : []),
        ],
      }));
    const captacaoPermanentDocenteMap = new Map(captacaoPermanentDocenteMeta.map((item) => [item.key, item]));

    function getCaptacaoRelevantRows(data) {
      return data.filter((item) => item.recorte_apcn_2022_2026 !== false);
    }

    function aggregateCaptacaoTypePresence(data) {
      const grouped = new Map();
      data.forEach((item) => {
        getCaptacaoTypeFilterValues(item).forEach((tipo) => {
          if (!grouped.has(tipo)) {
            grouped.set(tipo, { tipo, registros: 0 });
          }
          grouped.get(tipo).registros += 1;
        });
      });
      return [...grouped.values()].sort((a, b) => b.registros - a.registros || a.tipo.localeCompare(b.tipo, "pt-BR"));
    }

    function buildCaptacaoSummary(data) {
      const relevantRows = getCaptacaoRelevantRows(data);
      const selectedDocenteKeys = new Set([...selectedDocentesCaptacao].map((item) => normalizeDisciplinasName(item)));
      const baseDocentes = (selectedDocenteKeys.size
        ? captacaoPermanentDocenteMeta.filter((item) => selectedDocenteKeys.has(item.key))
        : captacaoPermanentDocenteMeta
      ).map((item) => ({
        docente: item.docente,
        key: item.key,
        linhas: item.linhas.length ? item.linhas : ["Não informada"],
      }));

      const docenteBuckets = new Map(baseDocentes.map((item) => [item.key, {
        docente: item.docente,
        key: item.key,
        registros: 0,
        valorTotal: 0,
        vigente: false,
        pqdt: false,
        internacional: false,
        linhas: new Set(item.linhas),
        agencias: new Set(),
        alertas: 0,
      }]));

      relevantRows.forEach((item) => {
        const key = normalizeDisciplinasName(item.docente);
        if (!docenteBuckets.has(key)) {
          docenteBuckets.set(key, {
            docente: item.docente,
            key,
            registros: 0,
            valorTotal: 0,
            vigente: false,
            pqdt: false,
            internacional: false,
            linhas: new Set(item.linha_pesquisa_lista || (item.linha_pesquisa ? [item.linha_pesquisa] : ["Não informada"])),
            agencias: new Set(),
            alertas: 0,
          });
        }
        const bucket = docenteBuckets.get(key);
        bucket.registros += 1;
        bucket.valorTotal += Number(item.valor_total) || 0;
        bucket.vigente = bucket.vigente || Boolean(item.vigente_em_2026);
        bucket.pqdt = bucket.pqdt || Boolean(item.bolsa_produtividade || item.bolsa_desenvolvimento_tecnologico);
        bucket.internacional = bucket.internacional || Boolean(item.captacao_internacional);
        (item.linha_pesquisa_lista || (item.linha_pesquisa ? [item.linha_pesquisa] : [])).forEach((linha) => bucket.linhas.add(linha));
        if (item.agencia_normalizada || item.agencia) bucket.agencias.add(item.agencia_normalizada || item.agencia);
        bucket.alertas += item.duplicidade_suspeita ? 1 : 0;
      });

      const docenteSummary = [...docenteBuckets.values()].map((item) => {
        const statusApcn = item.registros === 0
          ? "Frágil"
          : (item.vigente || item.pqdt || item.internacional ? "Forte" : "Intermediário");
        return {
          ...item,
          linhas: [...item.linhas].filter(Boolean).sort((a, b) => a.localeCompare(b, "pt-BR")),
          agencias: [...item.agencias].sort((a, b) => a.localeCompare(b, "pt-BR")),
          statusApcn,
        };
      }).sort((a, b) => {
        if (captacaoDocenteSortMode === "alfabetico") {
          return a.docente.localeCompare(b.docente, "pt-BR") || b.valorTotal - a.valorTotal;
        }
        const statusWeight = { Forte: 3, Intermediário: 2, "Frágil": 1 };
        return b.valorTotal - a.valorTotal
          || (statusWeight[b.statusApcn] || 0) - (statusWeight[a.statusApcn] || 0)
          || b.registros - a.registros
          || a.docente.localeCompare(b.docente, "pt-BR");
      });

      const totalValor = relevantRows.reduce((acc, item) => acc + (Number(item.valor_total) || 0), 0);
      const totalCapital = relevantRows.reduce((acc, item) => acc + (Number(item.valor_capital) || 0), 0);
      const totalCusteio = relevantRows.reduce((acc, item) => acc + (Number(item.valor_custeio) || 0), 0);
      const totalBolsasValor = relevantRows.reduce((acc, item) => acc + (Number(item.valor_bolsas_destinado) || Number(item.valor_bolsas_aprovado) || 0), 0);
      const totalAlertas = relevantRows.filter((item) => item.duplicidade_suspeita).length;
      const docentesComCaptacao = docenteSummary.filter((item) => item.registros > 0);
      const docentesSemCaptacao = docenteSummary.filter((item) => item.registros === 0);
      const docentesVigentes = docenteSummary.filter((item) => item.vigente);
      const docentesPqdt = docenteSummary.filter((item) => item.pqdt);
      const docentesInternacionais = docenteSummary.filter((item) => item.internacional);
      const percentualDocentes = baseDocentes.length ? Math.round((docentesComCaptacao.length / baseDocentes.length) * 100) : 0;

      const agencyMap = new Map();
      relevantRows.forEach((item) => {
        const group = item.agencia_grupo || item.agencia_normalizada || item.agencia || "Não informada";
        if (!agencyMap.has(group)) {
          agencyMap.set(group, { agencia: group, registros: 0, valorTotal: 0, docentes: new Set() });
        }
        const bucket = agencyMap.get(group);
        bucket.registros += 1;
        bucket.valorTotal += Number(item.valor_total) || 0;
        bucket.docentes.add(item.docente);
      });
      const agencySummary = [...agencyMap.values()].map((item) => ({
        ...item,
        docentes: item.docentes.size,
        percentualValor: totalValor ? Math.round((item.valorTotal / totalValor) * 100) : 0,
      })).sort((a, b) => b.valorTotal - a.valorTotal || a.agencia.localeCompare(b.agencia, "pt-BR"));

      const lineMap = new Map();
      relevantRows.forEach((item) => {
        const linhas = item.linha_pesquisa_lista || (item.linha_pesquisa ? [item.linha_pesquisa] : ["Não informada"]);
        linhas.forEach((linha) => {
          if (!lineMap.has(linha)) {
            lineMap.set(linha, {
              linha,
              docentes: new Set(),
              registros: 0,
              valorTotal: 0,
              agencias: new Set(),
              vigente: false,
              internacional: false,
            });
          }
          const bucket = lineMap.get(linha);
          bucket.docentes.add(item.docente);
          bucket.registros += 1;
          bucket.valorTotal += Number(item.valor_total) || 0;
          if (item.agencia_normalizada || item.agencia) bucket.agencias.add(item.agencia_normalizada || item.agencia);
          bucket.vigente = bucket.vigente || Boolean(item.vigente_em_2026);
          bucket.internacional = bucket.internacional || Boolean(item.captacao_internacional);
        });
      });
      const lineSummary = [...lineMap.values()].map((item) => ({
        ...item,
        docentes: item.docentes.size,
        agencias: item.agencias.size,
        percentualValor: totalValor ? Math.round((item.valorTotal / totalValor) * 100) : 0,
      })).sort((a, b) => b.valorTotal - a.valorTotal || a.linha.localeCompare(b.linha, "pt-BR"));

      const yearMin = Math.min(captacaoRecentWindowStart, ...relevantRows.map((item) => Number(item.ano_inicio)).filter(Boolean), captacaoReferenceYear);
      const yearMax = Math.max(captacaoReferenceYear, ...relevantRows.map((item) => Number(item.ano_fim)).filter(Boolean));
      const vigenciaSummary = [];
      for (let ano = yearMin; ano <= yearMax; ano += 1) {
        const ativos = relevantRows.filter((item) => Number(item.ano_inicio) <= ano && Number(item.ano_fim) >= ano);
        vigenciaSummary.push({
          ano,
          valorTotal: ativos.reduce((acc, item) => acc + (Number(item.valor_total) || 0), 0),
          registros: ativos.length,
          docentes: new Set(ativos.map((item) => item.docente)).size,
          destaque: ano === captacaoReferenceYear,
        });
      }

      const topLine = lineSummary[0];
      const lowLine = lineSummary[lineSummary.length - 1];
      const executiveSummary = [
        `A base registra ${docentesComCaptacao.length} docente(s) com captação nos últimos 5 anos, correspondendo a ${percentualDocentes}% do corpo permanente analisado.`,
        `Há ${docentesVigentes.length} docente(s) com captação vigente em ${captacaoReferenceYear} e ${docentesPqdt.length} com marcador estratégico PQ/DT ou equivalente.`,
        `A carteira envolve ${agencySummary.length} grupos de agências/fonte e ${docentesInternacionais.length} docente(s) com captação internacional identificada.`,
        `Foram identificados ${totalAlertas} alerta(s) de possível duplicidade que exigem revisão antes do uso final da base.`,
        topLine
          ? `A distribuição por linha de pesquisa concentra ${topLine.percentualValor}% do valor em ${topLine.linha}${lowLine && lowLine.linha !== topLine.linha ? `, com atenção adicional para ${lowLine.linha}` : ""}.`
          : "A base ainda não permite leitura consistente por linha de pesquisa além do vínculo institucional do docente.",
      ];

      return {
        rows: relevantRows,
        totalValor,
        totalCapital,
        totalCusteio,
        totalBolsasValor,
        totalAlertas,
        totalRegistros: relevantRows.length,
        totalBaseDocentes: baseDocentes.length,
        totalAgencias: agencySummary.length,
        docentesComCaptacao,
        docentesSemCaptacao,
        docentesVigentes,
        docentesPqdt,
        docentesInternacionais,
        percentualDocentes,
        docenteSummary,
        agencySummary,
        lineSummary,
        vigenciaSummary,
        typePresence: aggregateCaptacaoTypePresence(relevantRows),
        executiveSummary,
      };
    }

    function renderCaptacaoMetrics(summary) {
      document.getElementById("captacao-valor-total").textContent = formatCurrency(summary.totalValor);
      document.getElementById("captacao-registros-total").textContent = String(summary.totalRegistros);
      document.getElementById("captacao-docentes-total").textContent = String(summary.docentesComCaptacao.length);
      document.getElementById("captacao-docentes-total-resumo").textContent = `${summary.docentesComCaptacao.length} docente(s) permanentes com pelo menos uma captação.`;
      document.getElementById("captacao-percentual-docentes").textContent = `${summary.percentualDocentes}%`;
      document.getElementById("captacao-percentual-docentes-resumo").textContent = `${summary.docentesComCaptacao.length} de ${summary.totalBaseDocentes} docentes permanentes no recorte.`;
      document.getElementById("captacao-docentes-sem").textContent = String(summary.docentesSemCaptacao.length);
      document.getElementById("captacao-docentes-sem-resumo").textContent = `${summary.docentesSemCaptacao.length} docente(s) permanentes sem captação visível nos filtros.`;
      document.getElementById("captacao-docentes-vigentes").textContent = String(summary.docentesVigentes.length);
      document.getElementById("captacao-docentes-vigentes-resumo").textContent = `${summary.docentesVigentes.length} docente(s) com carteira vigente em ${captacaoReferenceYear}.`;
      document.getElementById("captacao-docentes-pqdt").textContent = String(summary.docentesPqdt.length);
      document.getElementById("captacao-docentes-pqdt-resumo").textContent = `${summary.docentesPqdt.length} docente(s) com PQ, DT ou equivalente.`;
      document.getElementById("captacao-agencias-total").textContent = String(summary.totalAgencias);
      document.getElementById("captacao-agencias-total-resumo").textContent = `${summary.totalAgencias} grupos de fontes estratégicas no recorte.`;
      document.getElementById("captacao-alertas-total").textContent = String(summary.totalAlertas);
      document.getElementById("captacao-alertas-total-resumo").textContent = summary.totalAlertas
        ? `${summary.totalAlertas} alerta(s) de possível duplicidade na carteira.`
        : "Nenhuma suspeita de duplicidade no recorte atual.";
    }

    function renderCaptacaoExecutiveSummary(summary) {
      captacaoExecutiveSummary.innerHTML = summary.executiveSummary.map((item) => `<p>${escapeHtml(item)}</p>`).join("");
    }

    function renderCaptacaoDocenteChart(data) {
      const items = data;
      if (!items.length) {
        chartCaptacaoDocentes.innerHTML = `<p class="chart-note">Sem dados para o gráfico.</p>`;
        return;
      }
      captacaoDocenteChartCaption.textContent = captacaoDocenteSortMode === "alfabetico"
        ? "Ordem alfabética com leitura do valor, status APCN e concentração por docente."
        : "Ordem por intensidade APCN e volume financeiro, priorizando docentes com maior tração estratégica.";
      const labelWidth = 250;
      const rowHeight = 36;
      const chartWidth = 860;
      const usableWidth = chartWidth - labelWidth - 230;
      const maxValor = Math.max(...items.map((item) => item.valorTotal), 1);
      const height = Math.max(240, items.length * rowHeight + 36);
      chartCaptacaoDocentes.innerHTML = `
        <svg viewBox="0 0 ${chartWidth} ${height}" role="img" aria-label="Distribuição da captação por docente">
          ${items.map((item, index) => {
            const y = 18 + index * rowHeight;
            const width = item.valorTotal ? (item.valorTotal / maxValor) * usableWidth : 10;
            const fill = item.statusApcn === "Forte" ? "#8c1538" : item.statusApcn === "Intermediário" ? "#c58e29" : "#b9ad9d";
            const flags = [
              item.vigente ? "vigente" : "",
              item.pqdt ? "PQ/DT" : "",
              item.internacional ? "intl." : "",
            ].filter(Boolean).join(" · ");
            return `
              <text x="0" y="${y + 15}" fill="#262930" font-size="12">${escapeHtml(item.docente)}</text>
              <rect x="${labelWidth}" y="${y}" width="${width}" height="18" rx="9" fill="${fill}"></rect>
              <text x="${labelWidth + width + 8}" y="${y + 14}" fill="#262930" font-size="12">${escapeHtml(formatCompactCurrency(item.valorTotal))}</text>
              <text x="${chartWidth - 170}" y="${y + 14}" fill="#6d727c" font-size="11">${item.registros} reg. ${flags ? "· " + escapeHtml(flags) : ""}</text>
            `;
          }).join("")}
        </svg>
      `;
    }

    function renderCaptacaoAgenciasPanel(data) {
      const totalValor = data.reduce((acc, item) => acc + item.valorTotal, 0);
      if (!data.length || !totalValor) {
        captacaoAgenciasStack.innerHTML = `<p class="chart-note">Sem dados para composição.</p>`;
        captacaoAgenciasChips.innerHTML = "";
        return;
      }
      captacaoAgenciasStack.innerHTML = data.map((item) => `
        <div class="type-row">
          <strong>${escapeHtml(item.agencia)}</strong>
          <div class="track"><div class="bar" style="width:${(item.valorTotal / totalValor) * 100}%"></div></div>
          <span>${formatCompactCurrency(item.valorTotal)} · ${item.docentes} docente(s) · ${item.registros} reg.</span>
        </div>
      `).join("");
      captacaoAgenciasChips.classList.add("captacao-chip-limit");
      captacaoAgenciasChips.innerHTML = data.slice(0, 4).map((item) => `
        <span class="chip">${escapeHtml(item.agencia)}: <strong>${item.percentualValor}%</strong> do valor total</span>
      `).join("");
    }

    function renderCaptacaoLinhasPanel(data) {
      const totalValor = data.reduce((acc, item) => acc + item.valorTotal, 0);
      if (!data.length || !totalValor) {
        captacaoLinhasStack.innerHTML = `<p class="chart-note">Sem leitura institucional de linha disponível.</p>`;
        captacaoLinhasChips.innerHTML = `<span class="chip">A linha deriva do vínculo institucional do docente, não do formulário original do projeto.</span>`;
        return;
      }
      captacaoLinhasStack.innerHTML = data.map((item) => `
        <div class="type-row">
          <strong>${escapeHtml(item.linha)}</strong>
          <div class="track"><div class="bar" style="width:${(item.valorTotal / totalValor) * 100}%"></div></div>
          <span>${formatCompactCurrency(item.valorTotal)} · ${item.docentes} docente(s)</span>
        </div>
      `).join("");
      captacaoLinhasChips.classList.add("captacao-chip-limit");
      captacaoLinhasChips.innerHTML = data.slice(0, 3).map((item) => `
        <span class="chip">${escapeHtml(item.linha)}: ${item.registros} reg. · ${item.agencias} agência(s) · ${item.vigente ? "com vigência" : "sem vigência"}${item.internacional ? " · intl." : ""}</span>
      `).join("");
    }

    function renderCaptacaoVigenciaChart(data) {
      if (!data.length) {
        chartCaptacaoVigencia.innerHTML = `<p class="chart-note">Sem dados de vigência para o recorte atual.</p>`;
        captacaoVigenciaNota.textContent = "";
        return;
      }
      const height = 300;
      const paddingX = 52;
      const baseY = 236;
      const barWidth = 54;
      const gap = 22;
      const width = Math.max(760, paddingX + data.length * (barWidth + gap) + 30);
      const maxValor = Math.max(...data.map((item) => item.valorTotal), 1);
      chartCaptacaoVigencia.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Carteira ativa por ano de vigência">
          <line x1="${paddingX}" y1="${baseY}" x2="${width - 20}" y2="${baseY}" stroke="#b9ad9d" stroke-width="1"></line>
          ${data.map((item, index) => {
            const x = paddingX + index * (barWidth + gap);
            const barHeight = item.valorTotal ? (item.valorTotal / maxValor) * 150 : 2;
            const y = baseY - barHeight;
            const fill = item.destaque ? "#8c1538" : "#c7a87d";
            return `
              <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="14" fill="${fill}" opacity="${item.destaque ? 1 : 0.88}"></rect>
              <text x="${x + barWidth / 2}" y="${baseY + 20}" text-anchor="middle" fill="#262930" font-size="12">${item.ano}</text>
              <text x="${x + barWidth / 2}" y="${y - 10}" text-anchor="middle" fill="#262930" font-size="11">${item.registros} reg.</text>
              <text x="${x + barWidth / 2}" y="${baseY + 36}" text-anchor="middle" fill="#6d727c" font-size="10">${item.docentes} doc.</text>
            `;
          }).join("")}
        </svg>
      `;
      const refYear = data.find((item) => item.ano === captacaoReferenceYear);
      captacaoVigenciaNota.textContent = refYear
        ? `${captacaoReferenceYear}: ${formatCurrency(refYear.valorTotal)} ativos em ${refYear.registros} projeto(s), envolvendo ${refYear.docentes} docente(s).`
        : "";
    }

    function renderCaptacaoTiposPanel(typePresence, summary) {
      const totalOcorrencias = typePresence.reduce((acc, item) => acc + item.registros, 0);
      const pool = [
        { label: "Capital", value: summary.totalCapital },
        { label: "Custeio", value: summary.totalCusteio },
        { label: "Bolsas", value: summary.totalBolsasValor },
      ].filter((item) => item.value > 0);
      if (!pool.length && !typePresence.length) {
        captacaoTiposStack.innerHTML = `<p class="chart-note">Sem composição disponível.</p>`;
        captacaoInsightChips.innerHTML = "";
        return;
      }
      const denominator = Math.max(...pool.map((item) => item.value), 1);
      const financeRows = pool.map((item) => `
        <div class="type-row">
          <strong>${item.label}</strong>
          <div class="track"><div class="bar" style="width:${(item.value / denominator) * 100}%"></div></div>
          <span>${formatCompactCurrency(item.value)}</span>
        </div>
      `);
      const typeRows = typePresence.slice(0, 4).map((item) => `
        <div class="type-row">
          <strong>${escapeHtml(item.tipo)}</strong>
          <div class="track"><div class="bar" style="width:${totalOcorrencias ? (item.registros / totalOcorrencias) * 100 : 0}%"></div></div>
          <span>${item.registros} ocorrência(s)</span>
        </div>
      `);
      captacaoTiposStack.innerHTML = [...financeRows, ...typeRows].join("");
      captacaoInsightChips.innerHTML = [
        `<span class="chip">Base APCN: <strong>${captacaoRecentWindowStart}-${captacaoReferenceYear}</strong></span>`,
        dataSourceCaptacaoPayload.updated_at ? `<span class="chip">Base atualizada em <strong>${dataSourceCaptacaoPayload.updated_at}</strong></span>` : "",
      ].filter(Boolean).join("");
    }

    function renderCaptacaoResumoDocentes(data) {
      captacaoResumoDocentesBody.innerHTML = data.map((item) => `
        <tr>
          <td>${escapeHtml(item.docente)}</td>
          <td>${item.registros}</td>
          <td>${formatCurrency(item.valorTotal)}</td>
          <td><span class="status-pill ${item.vigente ? "ok" : "muted"}">${item.vigente ? "Sim" : "Não"}</span></td>
          <td><span class="status-pill ${item.pqdt ? "ok" : "muted"}">${item.pqdt ? "Sim" : "Não"}</span></td>
          <td><span class="status-pill ${item.internacional ? "ok" : "muted"}">${item.internacional ? "Sim" : "Não"}</span></td>
          <td>${escapeHtml(item.linhas.join(", ") || "Não informada")}</td>
          <td>${escapeHtml(item.agencias.join(", ") || "-")}</td>
          <td><span class="status-pill ${item.statusApcn === "Forte" ? "ok" : item.statusApcn === "Intermediário" ? "warn" : "alert"}">${item.statusApcn}</span></td>
        </tr>
      `).join("");
    }

    function renderCaptacaoTable(data) {
      captacaoTabelaBody.innerHTML = data
        .slice()
        .sort((a, b) => (Number(b.valor_total) || 0) - (Number(a.valor_total) || 0) || a.docente.localeCompare(b.docente, "pt-BR"))
        .map((item) => `
          <tr class="${item.duplicidade_suspeita ? "table-row-alert" : ""}">
            <td>${escapeHtml(item.docente)}</td>
            <td>${escapeHtml(item.agencia_normalizada || item.agencia || "-")}</td>
            <td>${escapeHtml(item.agencia_grupo || "-")}</td>
            <td>${escapeHtml(item.status || "-")}</td>
            <td>${escapeHtml(item.status_vigencia || "-")}</td>
            <td>${escapeHtml((item.vigencia_anos || []).join(", ") || "-")}</td>
            <td>${escapeHtml(item.titulo || "-")}</td>
            <td>${escapeHtml((item.tipo_lista || item.tipos || []).join(", ") || "-")}</td>
            <td>${escapeHtml(item.edital_processo || [item.edital_nome, item.edital_numero].filter(Boolean).join(" · ") || "-")}</td>
            <td>${formatCurrency(item.valor_total)}</td>
            <td>${formatCurrency(item.valor_capital)}</td>
            <td>${formatCurrency(item.valor_custeio)}</td>
            <td>${formatCurrency(item.valor_bolsas_destinado || item.valor_bolsas_aprovado)}</td>
            <td>${item.bolsa_produtividade || item.bolsa_desenvolvimento_tecnologico ? `${item.bolsa_produtividade ? "PQ" : ""}${item.bolsa_produtividade && item.bolsa_desenvolvimento_tecnologico ? " / " : ""}${item.bolsa_desenvolvimento_tecnologico ? "DT" : ""}` : "-"}</td>
            <td>${item.captacao_internacional ? "Sim" : "Não"}</td>
            <td>${escapeHtml(item.linha_pesquisa || "-")}</td>
            <td>
              <span class="captacao-key captacao-key-short" title="${escapeHtml(item.chave_deduplicacao || "-")}">
                ${escapeHtml(truncateMiddle(item.chave_deduplicacao || "-", 26, 14))}
              </span>
            </td>
            <td>${escapeHtml(item.motivo_alerta || "-")}</td>
            <td><span class="status-pill ${item.duplicidade_suspeita ? "alert" : "muted"}">${escapeHtml(item.status_revisao || "Sem alerta")}</span></td>
            <td>${escapeHtml(item.observacao_auditoria || "-")}</td>
            <td>${escapeHtml(item.evidencia_documento || "-")}</td>
            <td>${item.link_edital_processo ? `<a href="${escapeHtml(item.link_edital_processo)}" target="_blank" rel="noopener noreferrer">Abrir</a>` : "-"}</td>
            <td>M: ${item.alunos_mestrado || 0} · D: ${item.alunos_doutorado || 0}</td>
          </tr>
        `).join("");
      captacaoEstadoVazio.style.display = data.length ? "none" : "block";
    }

    function applyCaptacaoFilters() {
      syncCaptacaoFilterViews();
      const filtered = getFilteredCaptacaoData();
      const summary = buildCaptacaoSummary(filtered);
      renderCaptacaoMetrics(summary);
      renderCaptacaoExecutiveSummary(summary);
      renderCaptacaoDocenteChart(summary.docenteSummary);
      renderCaptacaoLinhasPanel(summary.lineSummary);
      renderCaptacaoAgenciasPanel(summary.agencySummary);
      renderCaptacaoVigenciaChart(summary.vigenciaSummary);
      renderCaptacaoTiposPanel(summary.typePresence, summary);
      renderCaptacaoResumoDocentes(summary.docenteSummary);
      renderCaptacaoTable(summary.rows);
    }

    function syncScientificFilterViews() {
      [
        [docenteChipList, selectedDocentes],
        [docenteLiderancaChipList, selectedDocentes],
        [tiposSelect, selectedTipos],
        [tiposLiderancaSelect, selectedTipos],
        [anosSelect, selectedAnos],
        [anosLiderancaSelect, selectedAnos],
      ].forEach(([container, selectedSet]) => {
        if (!container) return;
        [...container.querySelectorAll('input[type="checkbox"]')].forEach((input) => {
          input.checked = selectedSet.has(input.value);
        });
      });
    }

    function applyScientificPanels() {
      syncScientificFilterViews();
      applyFilters();
      applyLeadershipFilters();
    }

    function bindScientificCheckboxContainer(container, selectedSet, applyFn = applyScientificPanels) {
      if (!container) return;
      [...container.querySelectorAll('input[type="checkbox"]')].forEach((input) => {
        input.addEventListener("change", () => {
          if (input.checked) {
            selectedSet.add(input.value);
          } else {
            selectedSet.delete(input.value);
          }
          applyFn();
        });
      });
    }

    function bindDocenteChips() {
      bindScientificCheckboxContainer(docenteChipList, selectedDocentes);
      bindScientificCheckboxContainer(docenteLiderancaChipList, selectedDocentes);
    }

    function bindTypeFilters() {
      bindScientificCheckboxContainer(tiposSelect, selectedTipos);
      bindScientificCheckboxContainer(tiposLiderancaSelect, selectedTipos);
    }

    function bindYearFilters() {
      bindScientificCheckboxContainer(anosSelect, selectedAnos);
      bindScientificCheckboxContainer(anosLiderancaSelect, selectedAnos);
    }

    function initializeScientificFilters() {
      selectedDocentes.clear();
      selectedTipos.clear();
      selectedAnos.clear();
      scientificFilterValues.docentes.forEach((value) => selectedDocentes.add(value));
      scientificFilterValues.tipos.forEach((value) => selectedTipos.add(value));
      scientificFilterValues.anos.forEach((value) => selectedAnos.add(value));
      syncScientificFilterViews();
    }

    function setFilterSelection(container, selectedSet, values, applyFn) {
      selectedSet.clear();
      values.forEach((value) => selectedSet.add(value));
      if (container) {
        [...container.querySelectorAll('input[type="checkbox"]')].forEach((input) => {
          input.checked = selectedSet.has(input.value);
        });
      }
      applyFn();
    }

    function bindScientificFilterToggles() {
      const groupConfig = {
        docentes: { selectedSet: selectedDocentes, getValues: () => scientificFilterValues.docentes },
        tipos: { selectedSet: selectedTipos, getValues: () => scientificFilterValues.tipos },
        anos: { selectedSet: selectedAnos, getValues: () => scientificFilterValues.anos },
      };

      scientificFilterToggles.forEach((button) => {
        button.addEventListener("click", () => {
          const config = groupConfig[button.dataset.group];
          if (!config) return;
          const values = button.dataset.action === "all" ? config.getValues() : [];
          config.selectedSet.clear();
          values.forEach((value) => config.selectedSet.add(value));
          applyScientificPanels();
        });
      });
    }

    function syncTechnicalFilterViews() {
      [
        [docenteTecnicaChipList, selectedDocentesTecnica],
        [tiposTecnicaSelect, selectedTiposTecnica],
        [anosTecnicaSelect, selectedAnosTecnica],
        [statusTecnicaSelect, selectedStatusTecnica],
      ].forEach(([container, selectedSet]) => {
        if (!container) return;
        [...container.querySelectorAll('input[type="checkbox"]')].forEach((input) => {
          input.checked = selectedSet.has(input.value);
        });
      });
    }

    function initializeTechnicalFilters() {
      selectedDocentesTecnica.clear();
      selectedTiposTecnica.clear();
      selectedAnosTecnica.clear();
      selectedStatusTecnica.clear();
      technicalFilterValues.docentes.forEach((value) => selectedDocentesTecnica.add(value));
      technicalFilterValues.tipos.forEach((value) => selectedTiposTecnica.add(value));
      technicalFilterValues.anos.forEach((value) => selectedAnosTecnica.add(value));
      technicalFilterValues.status.forEach((value) => selectedStatusTecnica.add(value));
      syncTechnicalFilterViews();
    }

    function bindTechnicalFilters() {
      bindScientificCheckboxContainer(docenteTecnicaChipList, selectedDocentesTecnica, applyTechnicalFilters);
      bindScientificCheckboxContainer(tiposTecnicaSelect, selectedTiposTecnica, applyTechnicalFilters);
      bindScientificCheckboxContainer(anosTecnicaSelect, selectedAnosTecnica, applyTechnicalFilters);
      bindScientificCheckboxContainer(statusTecnicaSelect, selectedStatusTecnica, applyTechnicalFilters);
    }

    function bindTechnicalFilterToggles() {
      const groupConfig = {
        docentes: { selectedSet: selectedDocentesTecnica, getValues: () => technicalFilterValues.docentes },
        tipos: { selectedSet: selectedTiposTecnica, getValues: () => technicalFilterValues.tipos },
        anos: { selectedSet: selectedAnosTecnica, getValues: () => technicalFilterValues.anos },
        status: { selectedSet: selectedStatusTecnica, getValues: () => technicalFilterValues.status },
      };

      tecnicaFilterToggles.forEach((button) => {
        button.addEventListener("click", () => {
          const config = groupConfig[button.dataset.technicalGroup];
          if (!config) return;
          const values = button.dataset.action === "all" ? config.getValues() : [];
          config.selectedSet.clear();
          values.forEach((value) => config.selectedSet.add(value));
          syncTechnicalFilterViews();
          applyTechnicalFilters();
        });
      });
    }

    function bindTabs() {
      tabsNav.addEventListener("click", (event) => {
        const button = event.target.closest(".tab-button");
        if (!button) return;
        const target = button.dataset.tab;
        [...document.querySelectorAll(".tab-button")].forEach((item) => item.classList.toggle("active", item === button));
        [...document.querySelectorAll(".tab-panel")].forEach((panel) => panel.classList.toggle("active", panel.id === target));
      });
    }

    function setApcnScoringModalState(isOpen) {
      if (!apcnScoringModal) return;
      apcnScoringModal.classList.toggle("open", isOpen);
      apcnScoringModal.setAttribute("aria-hidden", isOpen ? "false" : "true");
      document.body.style.overflow = isOpen ? "hidden" : "";
    }

    function bindApcnScoringModal() {
      if (!apcnScoringModal || !openApcnScoringModalButton || !closeApcnScoringModalButton) return;
      openApcnScoringModalButton.addEventListener("click", () => setApcnScoringModalState(true));
      closeApcnScoringModalButton.addEventListener("click", () => setApcnScoringModalState(false));
      apcnScoringModal.addEventListener("click", (event) => {
        if (event.target === apcnScoringModal) {
          setApcnScoringModalState(false);
        }
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && apcnScoringModal.classList.contains("open")) {
          setApcnScoringModalState(false);
        }
      });
    }

    function setLiderancaParceriaModalState(isOpen) {
      if (!liderancaParceriaModal) return;
      liderancaParceriaModal.classList.toggle("open", isOpen);
      liderancaParceriaModal.setAttribute("aria-hidden", isOpen ? "false" : "true");
      document.body.style.overflow = isOpen ? "hidden" : "";
    }

    function renderLiderancaParceriaAuditCards(items) {
      if (!liderancaParceriaModalBody) return;
      if (!items.length) {
        liderancaParceriaModalBody.innerHTML = `<p class="chart-note">Nenhuma obra integrada encontrada para esta leitura.</p>`;
        return;
      }
      liderancaParceriaModalBody.innerHTML = items.map((item) => `
        <article class="audit-product-card">
          <h3>${escapeHtml(item.titulo || "Sem título")}</h3>
          <div class="audit-product-meta">
            <span>${escapeHtml(item.ano || "Sem ano")}</span>
            <span>${escapeHtml(typeLabels[item.tipo_producao] || item.tipo_producao || "Sem tipo")}</span>
            <span>${escapeHtml(`${item.docentes.length} docente(s) PPGEF`)}</span>
            <span>${escapeHtml(`${item.totalRegistros} registro(s)`)}</span>
          </div>
          <p><strong>Docentes parceiros:</strong> ${escapeHtml(item.docentes.join("; "))}</p>
          <p><strong>Referência completa:</strong> ${escapeHtml(item.referencia)}</p>
        </article>
      `).join("");
    }

    function openLiderancaParceriaModal(mode = "all", payload = {}) {
      if (!liderancaParceriaModal) return;
      if (mode === "pair") {
        const source = payload.source || "";
        const target = payload.target || "";
        const key = [source, target].sort((a, b) => a.localeCompare(b, "pt-BR")).join("|||");
        const items = liderancaParceriaAuditState.pairMap.get(key) || [];
        liderancaParceriaModalTitle.textContent = "Obras do Vínculo Interno";
        liderancaParceriaModalSubtitle.textContent = `${source} × ${target}`;
        liderancaParceriaModalSummary.innerHTML = `${items.length} obra(s) compartilhada(s) entre <strong>${escapeHtml(source)}</strong> e <strong>${escapeHtml(target)}</strong>.`;
        renderLiderancaParceriaAuditCards(items);
      } else {
        const items = liderancaParceriaAuditState.integratedWorks || [];
        liderancaParceriaModalTitle.textContent = "Obras Integradas";
        liderancaParceriaModalSubtitle.textContent = "Detalhamento das obras que sustentam a cooperação interna entre docentes do PPGEF.";
        liderancaParceriaModalSummary.innerHTML = `${items.length} obra(s) integrada(s) identificada(s) na base científica sincronizada.`;
        renderLiderancaParceriaAuditCards(items);
      }
      setLiderancaParceriaModalState(true);
    }

    function bindLiderancaParceriaModal() {
      if (!liderancaParceriaModal || !closeLiderancaParceriaModalButton || !openLiderancaParceriaModalButton) return;
      openLiderancaParceriaModalButton.addEventListener("click", () => openLiderancaParceriaModal("all"));
      closeLiderancaParceriaModalButton.addEventListener("click", () => setLiderancaParceriaModalState(false));
      liderancaParceriaModal.addEventListener("click", (event) => {
        if (event.target === liderancaParceriaModal) {
          setLiderancaParceriaModalState(false);
        }
      });
      liderancaParceriaModalShowAllButton?.addEventListener("click", () => openLiderancaParceriaModal("all"));
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && liderancaParceriaModal.classList.contains("open")) {
          setLiderancaParceriaModalState(false);
        }
      });
      chartLiderancaParceriaRede?.addEventListener("click", (event) => {
        const edge = event.target.closest(".network-edge-link");
        if (!edge) return;
        openLiderancaParceriaModal("pair", {
          source: edge.getAttribute("data-source") || "",
          target: edge.getAttribute("data-target") || "",
        });
      });
    }

    function bindGroupedCollapsibleSections(root, prefix) {
      if (!root) return;
      const groupCards = [...root.querySelectorAll(".group-card")];
      groupCards.forEach((card, index) => {
        const header = card.querySelector(".section-head");
        if (!header || card.querySelector(".group-card-toggle")) return;
        const title = header.querySelector("h2");
        const description = header.querySelector("p");
        const contentCards = [];
        let sibling = card.nextElementSibling;
        while (sibling && !sibling.classList.contains("group-card")) {
          contentCards.push(sibling);
          sibling = sibling.nextElementSibling;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "group-card-toggle";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", `${prefix}-group-${index}`);

        const copy = document.createElement("div");
        copy.className = "group-card-toggle-copy";
        if (title) copy.appendChild(title);
        if (description) copy.appendChild(description);

        const arrow = document.createElement("span");
        arrow.className = "group-card-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "▸";

        button.appendChild(copy);
        button.appendChild(arrow);
        header.replaceChildren(button);

        contentCards.forEach((item) => {
          item.dataset.apcnGroup = `${prefix}-group-${index}`;
          item.classList.add("apcn-collapsible-hidden");
        });

        button.addEventListener("click", () => {
          const isOpen = button.getAttribute("aria-expanded") === "true";
          button.setAttribute("aria-expanded", isOpen ? "false" : "true");
          contentCards.forEach((item) => item.classList.toggle("apcn-collapsible-hidden", isOpen));
        });
      });
    }

    function bindApcnCollapsibleSections() {
      bindGroupedCollapsibleSections(tabApcn, "apcn");
      bindGroupedCollapsibleSections(document.getElementById("tab-lideranca"), "lideranca");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    function truncateMiddle(value, start = 28, end = 16) {
      const text = String(value || "");
      if (text.length <= start + end + 3) {
        return text;
      }
      return `${text.slice(0, start)}...${text.slice(-end)}`;
    }

    function toDocumentUrl(path) {
      if (!path) {
        return "";
      }

      const normalized = String(path).trim();
      if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith("../") || normalized.startsWith("./") || normalized.startsWith("/")) {
        return normalized;
      }

      return "";
    }

    function renderGuideOverview() {
      if (!guideOverviewGrid) return;
      guideOverviewGrid.innerHTML = guideOverviewItems.map((item) => `
        <article class="card guide-overview-card">
          <p class="eyebrow">${escapeHtml(item.criterio)}</p>
          <strong>${escapeHtml(item.exigencia)}</strong>
          <p>${escapeHtml(item.explicacao)}</p>
          <details class="guide-details">
            <summary><span class="guide-more-button">Saiba mais</span></summary>
            <p>${escapeHtml(item.detalhe)}</p>
          </details>
        </article>
      `).join("");
    }

    function renderGuideLearning() {
      if (!guideLearningGrid) return;
      guideLearningGrid.innerHTML = guideLearningItems.map((item) => `
        <details class="card guide-learning-card">
          <summary>
            <div>
              <h3>${escapeHtml(item.titulo)}</h3>
              <p>${escapeHtml(item.resumo)}</p>
            </div>
          </summary>
          <div class="guide-accordion-body">
            <ul class="guide-points">
              ${item.detalhes.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}
            </ul>
            <div class="guide-inline-tags">
              ${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
            </div>
          </div>
        </details>
      `).join("");
    }

    function renderGuideChecklists() {
      if (!guideChecklistGrid) return;
      guideChecklistGrid.innerHTML = guideChecklistGroups.map((group) => `
        <article class="card guide-checklist-card">
          <h3>${escapeHtml(group.titulo)}</h3>
          <p>${escapeHtml(group.resumo)}</p>
          <ul class="guide-checklist">
            ${group.itens.map((item) => `
              <li>
                <span class="guide-checklist-box" aria-hidden="true"></span>
                <span>${escapeHtml(item)}</span>
              </li>
            `).join("")}
          </ul>
        </article>
      `).join("");
    }

    function renderGuideFaq() {
      if (!guideFaqList) return;
      guideFaqList.innerHTML = guideFaqItems.map((item) => `
        <details>
          <summary>${escapeHtml(item.pergunta)}</summary>
          <div class="guide-accordion-body">
            <p>${escapeHtml(item.resposta)}</p>
          </div>
        </details>
      `).join("");
    }

    function bindGuideEvidenceRows() {
      if (!guideEvidenceBody) return;
      guideEvidenceBody.querySelectorAll("[data-guide-evidence-toggle]").forEach((button) => {
        button.addEventListener("click", () => {
          const targetId = button.dataset.guideEvidenceToggle;
          const detailRow = targetId ? document.getElementById(targetId) : null;
          if (!detailRow) return;
          const isOpen = detailRow.classList.toggle("open");
          button.textContent = isOpen ? "Recolher" : "Saiba mais";
          button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
      });
    }

    function renderGuideEvidence() {
      if (!guideEvidenceBody) return;
      guideEvidenceBody.innerHTML = guideEvidenceRows.map((item, index) => {
        const detailId = `guide-evidence-detail-${index}`;
        return `
          <tr>
            <td>${escapeHtml(item.criterio)}</td>
            <td>${escapeHtml(item.exigencia)}</td>
            <td>
              <span class="guide-evidence-text">${escapeHtml(item.evidencia)}</span>
              <span class="guide-evidence-source">${escapeHtml(item.fonte)}</span>
            </td>
            <td>${escapeHtml(item.interpretacao)}</td>
            <td>
              <button
                type="button"
                class="guide-more-button"
                data-guide-evidence-toggle="${detailId}"
                aria-controls="${detailId}"
                aria-expanded="false"
              >Saiba mais</button>
            </td>
          </tr>
          <tr id="${detailId}" class="guide-evidence-expand-row">
            <td colspan="5" class="guide-evidence-detail">
              <p><strong>Leitura operacional:</strong> ${escapeHtml(item.detalhe)}</p>
            </td>
          </tr>
        `;
      }).join("");
      bindGuideEvidenceRows();
    }

    function renderGuideDocentePanel() {
      renderGuideOverview();
      renderGuideLearning();
      renderGuideChecklists();
      renderGuideFaq();
      renderGuideEvidence();
    }

    function renderDocumentList(items, target) {
      target.innerHTML = items.map((item) => {
        const primaryUrl = toDocumentUrl(item.caminho);
        const hasFile = Boolean(primaryUrl);
        const statusClass = hasFile ? "ok" : "pending";
        const statusLabel = hasFile ? "Disponível" : "Pendente";
        const primaryAction = hasFile
          ? `<a class="document-link primary" href="${encodeURI(primaryUrl)}" target="_blank" rel="noopener noreferrer">Abrir documento</a>`
          : "";
        const secondaryActions = Array.isArray(item.linksSecundarios)
          ? item.linksSecundarios.map((link) => `
              <a class="document-link secondary" href="${encodeURI(toDocumentUrl(link.caminho))}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.rotulo || "Versão adicional")}</a>
            `).join("")
          : "";
        const emptyState = hasFile
          ? ""
          : `<div class="document-empty">Documento em PDF pendente de encaminhamento.</div>`;

        return `
          <article class="document-item ${statusClass}">
            <div class="document-meta">${escapeHtml(item.categoria)}</div>
            <div class="document-topline">
              <h3>${escapeHtml(item.titulo)}</h3>
              <span class="document-status ${statusClass}">${statusLabel}</span>
            </div>
            <p>${escapeHtml(item.descricao)}</p>
            <div class="document-actions">
              ${primaryAction}
              ${secondaryActions}
            </div>
            ${emptyState}
          </article>
        `;
      }).join("");
    }

    function renderDocumentsPanel() {
      const internos = dataSourceDocumentos.filter((item) => item.categoria === "Internos");
      const capes = dataSourceDocumentos.filter((item) => item.categoria === "CAPES");
      const available = dataSourceDocumentos.filter((item) => toDocumentUrl(item.caminho)).length;
      const pending = dataSourceDocumentos.length - available;

      document.getElementById("documents-total").textContent = String(dataSourceDocumentos.length);
      document.getElementById("documents-total-resumo").textContent = `${internos.length} internos e ${capes.length} CAPES.`;
      document.getElementById("documents-ready").textContent = String(available);
      document.getElementById("documents-ready-resumo").textContent = `${available} PDFs com link de download ativo.`;
      document.getElementById("documents-pending").textContent = String(pending);
      document.getElementById("documents-pending-resumo").textContent = `${pending} itens ainda aguardam arquivo final.`;

      renderDocumentList(internos, documentsInternos);
      renderDocumentList(capes, documentsCapes);
    }

    function bindDocenteSortToggles() {
      docenteSortButtons.forEach((button) => {
        button.addEventListener("click", () => {
          docenteSortMode = button.dataset.docenteSort || "alfabetico";
          docenteSortButtons.forEach((item) => item.classList.toggle("active", item === button));
          applyFilters();
        });
      });
    }

    function bindDocenteTableSortToggles() {
      docenteTableSortButtons.forEach((button) => {
        button.addEventListener("click", () => {
          docenteTableSortMode = button.dataset.docenteTableSort || "alfabetico";
          docenteTableSortButtons.forEach((item) => item.classList.toggle("active", item === button));
          applyFilters();
        });
      });
    }

    function bindTechnicalDocenteSortToggles() {
      tecnicaDocenteSortButtons.forEach((button) => {
        button.addEventListener("click", () => {
          tecnicaDocenteSortMode = button.dataset.tecnicaDocenteSort || "alfabetico";
          tecnicaDocenteSortButtons.forEach((item) => item.classList.toggle("active", item === button));
          applyTechnicalFilters();
        });
      });
    }

    function bindTechnicalTableSortToggles() {
      tecnicaTableSortButtons.forEach((button) => {
        button.addEventListener("click", () => {
          tecnicaTableSortMode = button.dataset.tecnicaTableSort || "alfabetico";
          tecnicaTableSortButtons.forEach((item) => item.classList.toggle("active", item === button));
          applyTechnicalFilters();
        });
      });
    }

    function bindDisciplinasDocenteSortToggles() {
      disciplinasDocenteSortButtons.forEach((button) => {
        button.addEventListener("click", () => {
          disciplinasDocenteSortMode = button.dataset.disciplinasDocenteSort || "carga";
          disciplinasDocenteSortButtons.forEach((item) => item.classList.toggle("active", item === button));
          applyDisciplinasFilters();
        });
      });
    }

    function bindCaptacaoDocenteSortToggles() {
      captacaoDocenteSortButtons.forEach((button) => {
        button.addEventListener("click", () => {
          captacaoDocenteSortMode = button.dataset.captacaoDocenteSort || "valor";
          captacaoDocenteSortButtons.forEach((item) => item.classList.toggle("active", item === button));
          applyCaptacaoFilters();
        });
      });
    }

    function normalizePersonText(value) {
      return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Za-z0-9]+/g, " ")
        .toUpperCase()
        .trim();
    }

    function getNameTokens(value) {
      return normalizePersonText(value)
        .split(/\s+/)
        .filter(Boolean)
        .filter((token) => !personStopwords.has(token));
    }

    function buildDocenteNameProfile(docente) {
      const tokens = getNameTokens(docente);
      const surnameTokens = surnameSuffixes.has(tokens[tokens.length - 1]) && tokens.length > 1
        ? tokens.slice(-2)
        : tokens.slice(-1);
      const primarySurname = surnameTokens[0] || "";
      const givenTokens = tokens.slice(0, Math.max(tokens.length - surnameTokens.length, 0));
      return {
        full: tokens.join(" "),
        surname: surnameTokens.join(" "),
        primarySurname,
        shortSurname: tokens[tokens.length - 1] || "",
        givenTokens,
        initials: givenTokens.map((token) => token[0]).join(""),
      };
    }

    function authorMatchesDocente(authorName, docente) {
      const rawAuthorName = String(authorName || "");
      const authorNormalized = normalizePersonText(rawAuthorName);
      if (!authorNormalized) return false;
      const docenteProfile = buildDocenteNameProfile(docente);
      if (!docenteProfile.full) return false;
      if (authorNormalized.includes(docenteProfile.full)) return true;

      const [surnamePartRaw, ...remainingPartsRaw] = rawAuthorName.split(",");
      const surnamePart = normalizePersonText(surnamePartRaw || "");
      const remainingText = normalizePersonText(remainingPartsRaw.join(" "));
      const surnameMatches = surnamePart
        ? (
          surnamePart === docenteProfile.surname ||
          surnamePart === docenteProfile.primarySurname ||
          surnamePart === docenteProfile.shortSurname ||
          surnamePart.startsWith(`${docenteProfile.primarySurname} `) ||
          surnamePart.endsWith(` ${docenteProfile.shortSurname}`) ||
          docenteProfile.surname.endsWith(` ${surnamePart}`) ||
          docenteProfile.surname.startsWith(`${surnamePart} `)
        )
        : authorNormalized.includes(docenteProfile.shortSurname);
      if (!surnameMatches) return false;

      if (!remainingText) return true;
      const authorInitials = remainingText
        .split(/[^A-Z0-9]+/)
        .filter(Boolean)
        .map((token) => token[0])
        .join("");
      return (
        !docenteProfile.initials ||
        !authorInitials ||
        docenteProfile.initials.startsWith(authorInitials) ||
        authorInitials.startsWith(docenteProfile.initials) ||
        docenteProfile.givenTokens.some((token) => remainingText.includes(token))
      );
    }

    function inferScientificAuthors(item) {
      const explicitAuthors = String(item.autores || "").trim();
      if (explicitAuthors.includes(";")) {
        return explicitAuthors.split(";").map((author) => author.trim()).filter(Boolean);
      }
      const titleCandidate = String(item.titulo || "").trim();
      if (titleCandidate.includes(";") && !/[a-z]/.test(titleCandidate.replace(/[A-ZÀ-Ý]/g, ""))) {
        return titleCandidate.split(";").map((author) => author.trim()).filter(Boolean);
      }
      return [];
    }

    function normalizeSeedText(value) {
      return normalizeText(value)
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
    }

    function isLowSignalProductText(value) {
      const normalized = normalizeSeedText(value);
      if (!normalized) return true;
      const tokens = normalized.split(/\s+/).filter(Boolean);
      return normalized.length < 12 || tokens.length < 3;
    }

    function extractReferenceProductTitle(value) {
      const raw = String(value || "").replace(/https?:\/\/\S+/gi, " ");
      const candidates = raw
        .split(/\.\s+/)
        .map((part) => normalizeSeedText(part).replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .filter((part) => !/^(v|vol|volume|p|pp|n|no)\b/i.test(part))
        .filter((part) => !/\b\d{4}\b/.test(part) || part.split(/\s+/).length >= 6)
        .sort((a, b) => b.length - a.length);
      return candidates.find((part) => !isLowSignalProductText(part)) || "";
    }

    function getLeadershipProductKey(item) {
      const titleKey = normalizeSeedText(item.titulo).replace(/\s+/g, " ").trim();
      const referenceTitleKey = extractReferenceProductTitle(item.produto_referencia);
      const referenceKey = normalizeSeedText(item.produto_referencia).replace(/\s+/g, " ").trim();
      const venueKey = normalizeSeedText(item.revista_ou_veiculo).replace(/\s+/g, " ").trim();
      const yearKey = normalizeSeedText(item.ano);
      const typeKey = normalizeSeedText(item.tipo_producao);
      const doiKey = normalizeSeedText(item.doi);
      const primaryDescriptor = !isLowSignalProductText(titleKey)
        ? titleKey
        : referenceTitleKey || doiKey || referenceKey;
      const baseKey = [primaryDescriptor, yearKey, typeKey].filter(Boolean).join("|");
      if (baseKey) return baseKey;
      const fallbackKey = [doiKey, referenceTitleKey, referenceKey, venueKey, yearKey, typeKey].filter(Boolean).join("|");
      return fallbackKey || `ROW|${item.id || item.source_row || ""}`;
    }

    function getCoauthorNames(item) {
      const authors = inferScientificAuthors(item);
      return authors.filter((author) => !authorMatchesDocente(author, item.docente));
    }

    function buildLeadershipProductGroups(data) {
      const grouped = new Map();
      data.forEach((item) => {
        const key = getLeadershipProductKey(item);
        if (!grouped.has(key)) {
          grouped.set(key, {
            key,
            ano: item.ano || "Sem ano",
            items: [],
            docentes: new Set(),
            numeroAutores: Number(item.numero_autores) || 1,
          });
        }
        const group = grouped.get(key);
        group.items.push(item);
        group.docentes.add(item.docente);
        group.numeroAutores = Math.max(group.numeroAutores, Number(item.numero_autores) || 1);
      });
      return grouped;
    }

    function getMostardScore(item) {
      const authors = inferScientificAuthors(item);
      const matchedIndex = authors.findIndex((author) => authorMatchesDocente(author, item.docente));
      if (matchedIndex >= 0) {
        const lastIndex = authors.length - 1;
        if (matchedIndex === 0 || matchedIndex === lastIndex) {
          return { score: 1, label: "1ª ou última autoria", source: "lista_autores" };
        }
        if (matchedIndex === 1 || matchedIndex === lastIndex - 1) {
          return { score: 0.5, label: "2ª ou penúltima autoria", source: "lista_autores" };
        }
        return { score: 0.1, label: "Demais posições", source: "lista_autores" };
      }

      if (authorMatchesDocente(item.autor_principal, item.docente)) {
        return { score: 1, label: "1ª autoria", source: "autor_principal" };
      }

      return { score: 0.1, label: "Demais posições", source: "fallback_autor_principal" };
    }

    function formatDecimal(value) {
      return Number(value || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
    }

    function formatPercent(value) {
      return `${formatDecimal(value)}%`;
    }

    function formatCurrency(value) {
      return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    function formatCompactCurrency(value) {
      const amount = Number(value || 0);
      if (amount >= 1000000) return `R$ ${(amount / 1000000).toFixed(2).replace(".", ",")} mi`;
      if (amount >= 1000) return `R$ ${(amount / 1000).toFixed(1).replace(".", ",")} mil`;
      return formatCurrency(amount);
    }

    function getFilteredScientificData() {
      const docentes = [...selectedDocentes];
      const tipos = [...selectedTipos];
      const anos = [...selectedAnos];
      const hasDocentes = scientificFilterValues.docentes.length > 0;
      const hasTipos = scientificFilterValues.tipos.length > 0;
      const hasAnos = scientificFilterValues.anos.length > 0;
      return dataSource.filter((item) => {
        const docenteOk = hasDocentes ? docentes.includes(item.docente) : true;
        const tipoOk = hasTipos ? tipos.includes(item.tipo_producao) : true;
        const anoOk = hasAnos ? anos.includes(item.ano) : true;
        return docenteOk && tipoOk && anoOk;
      });
    }

    function aggregateByDocente(data) {
      const grouped = new Map();
      for (const item of data) {
        if (!grouped.has(item.docente)) {
          grouped.set(item.docente, {
            docente: item.docente,
            total: 0,
            artigo: 0,
            livro: 0,
            capitulo: 0,
            pontuacao: 0,
          });
        }
        const row = grouped.get(item.docente);
        row.total += 1;
        row[item.tipo_producao] += 1;
        row.pontuacao += Number(item.pontuacao) || 0;
      }
      return [...grouped.values()].sort((a, b) =>
        b.pontuacao - a.pontuacao || b.total - a.total || a.docente.localeCompare(b.docente, "pt-BR")
      );
    }

    function aggregateByYear(data) {
      const grouped = new Map();
      for (const item of data) {
        const year = item.ano || "Sem ano";
        if (!grouped.has(year)) {
          grouped.set(year, { ano: year, total: 0, pontuacao: 0 });
        }
        const row = grouped.get(year);
        row.total += 1;
        row.pontuacao += Number(item.pontuacao) || 0;
      }
      return [...grouped.values()].sort((a, b) => Number(a.ano) - Number(b.ano));
    }

    function aggregateByType(data) {
      const base = {
        artigo: { tipo: "artigo", total: 0, pontuacao: 0 },
        livro: { tipo: "livro", total: 0, pontuacao: 0 },
        capitulo: { tipo: "capitulo", total: 0, pontuacao: 0 },
      };
      for (const item of data) {
        const bucket = base[item.tipo_producao];
        if (!bucket) continue;
        bucket.total += 1;
        bucket.pontuacao += Number(item.pontuacao) || 0;
      }
      return Object.values(base);
    }

    function sortTechnicalDocenteSummary(data, mode = tecnicaDocenteSortMode) {
      return [...data].sort((a, b) => {
        if (mode === "alfabetico") {
          return a.docente.localeCompare(b.docente, "pt-BR") || b.total - a.total;
        }
        return (
          b.total - a.total ||
          b.tipos.length - a.tipos.length ||
          a.docente.localeCompare(b.docente, "pt-BR")
        );
      });
    }

    function aggregateTechnicalByDocente(data) {
      const grouped = new Map();
      for (const item of data) {
        if (!grouped.has(item.docente)) {
          grouped.set(item.docente, {
            docente: item.docente,
            total: 0,
            tipos: new Set(),
            subtipos: new Set(),
            status: "Sem produção",
          });
        }
        const row = grouped.get(item.docente);
        if (hasTechnicalProduction(item)) {
          row.total += 1;
          row.status = "Com produção";
          row.tipos.add(formatTechnicalType(item.tipo_produto));
          if (item.subtipo) row.subtipos.add(item.subtipo);
        }
      }
      return sortTechnicalDocenteSummary(
        [...grouped.values()].map((item) => ({
          docente: item.docente,
          total: item.total,
          status: item.status,
          tipos: [...item.tipos].sort((a, b) => a.localeCompare(b, "pt-BR")),
          subtipos: [...item.subtipos].sort((a, b) => a.localeCompare(b, "pt-BR")),
        }))
      );
    }

    function aggregateTechnicalByType(data) {
      const grouped = new Map();
      for (const item of data) {
        if (!hasTechnicalProduction(item)) continue;
        const tipo = formatTechnicalType(item.tipo_produto);
        if (!grouped.has(tipo)) {
          grouped.set(tipo, { tipo, total: 0 });
        }
        grouped.get(tipo).total += 1;
      }
      return [...grouped.values()].sort((a, b) => b.total - a.total || a.tipo.localeCompare(b.tipo, "pt-BR"));
    }

    function aggregateTechnicalBySubtype(data) {
      const grouped = new Map();
      for (const item of data) {
        if (!hasTechnicalProduction(item)) continue;
        const subtipo = getTechnicalSubtype(item);
        if (!grouped.has(subtipo)) grouped.set(subtipo, { subtipo, total: 0 });
        grouped.get(subtipo).total += 1;
      }
      return [...grouped.values()].sort((a, b) => b.total - a.total || a.subtipo.localeCompare(b.subtipo, "pt-BR"));
    }

    function aggregateTechnicalRows(data, docenteSummary) {
      const ranking = new Map(docenteSummary.map((item, index) => [item.docente, index]));
      return [...data].sort((a, b) => {
        if (tecnicaTableSortMode === "alfabetico") {
          return (
            a.docente.localeCompare(b.docente, "pt-BR") ||
            (hasTechnicalProduction(a) === hasTechnicalProduction(b) ? 0 : hasTechnicalProduction(a) ? -1 : 1) ||
            (Number(b.ano) || 0) - (Number(a.ano) || 0) ||
            formatTechnicalType(a.tipo_produto).localeCompare(formatTechnicalType(b.tipo_produto), "pt-BR")
          );
        }
        return (
          (ranking.get(a.docente) ?? 999) - (ranking.get(b.docente) ?? 999) ||
          (hasTechnicalProduction(a) === hasTechnicalProduction(b) ? 0 : hasTechnicalProduction(a) ? -1 : 1) ||
          (Number(b.ano) || 0) - (Number(a.ano) || 0) ||
          formatTechnicalType(a.tipo_produto).localeCompare(formatTechnicalType(b.tipo_produto), "pt-BR")
        );
      });
    }

    function renderMetrics(data, docenteSummary, yearSummary, typeSummary) {
      const totalPoints = data.reduce((acc, item) => acc + (Number(item.pontuacao) || 0), 0);
      const visibleDocentes = docenteSummary.length;
      const media = visibleDocentes ? Math.round(totalPoints / visibleDocentes) : 0;
      document.getElementById("total-registros").textContent = String(data.length);
      document.getElementById("pontuacao-total").textContent = String(totalPoints);
      document.getElementById("docentes-visiveis").textContent = String(visibleDocentes);
      document.getElementById("media-docente").textContent = String(media);

      const bestYear = [...yearSummary].sort((a, b) => b.pontuacao - a.pontuacao)[0];
      const bestType = [...typeSummary].sort((a, b) => b.pontuacao - a.pontuacao)[0];
      const bestDocente = docenteSummary[0];
      insightChips.innerHTML = [
        bestDocente ? `<span class="chip">Maior pontuação: <strong>${bestDocente.docente}</strong> (${bestDocente.pontuacao})</span>` : "",
        bestYear ? `<span class="chip">Ano mais forte: <strong>${bestYear.ano}</strong> (${bestYear.pontuacao} pontos)</span>` : "",
        bestType ? `<span class="chip">Tipo dominante: <strong>${typeLabels[bestType.tipo]}</strong> (${bestType.pontuacao} pontos)</span>` : "",
      ].join("");
    }

    function renderDocenteChart(summary) {
      const sortedSummary = [...summary].sort((a, b) => {
        if (docenteSortMode === "alfabetico") {
          return a.docente.localeCompare(b.docente, "pt-BR") || b.pontuacao - a.pontuacao;
        }
        return b.pontuacao - a.pontuacao || b.total - a.total || a.docente.localeCompare(b.docente, "pt-BR");
      });
      const items = sortedSummary;
      if (!items.length) {
        chartDocentes.innerHTML = `<p class="chart-note">Sem dados para o gráfico.</p>`;
        return;
      }
      docenteChartCaption.textContent = docenteSortMode === "alfabetico"
        ? "Ranking ordenado alfabeticamente no recorte filtrado."
        : "Ranking ordenado pela soma de pontos no recorte filtrado.";
      const maxMetric = Math.max(...items.map((item) => item.pontuacao), 1);
      const rowHeight = 34;
      const height = items.length * rowHeight + 48;
      const labelWidth = 270;
      const chartWidth = 700;
      const usableWidth = chartWidth - labelWidth - 60;
      chartDocentes.innerHTML = `
        <svg viewBox="0 0 ${chartWidth} ${height}" role="img" aria-label="Pontuação por docente">
          ${items.map((item, index) => {
            const y = 24 + index * rowHeight;
            const width = Math.max(8, (item.pontuacao / maxMetric) * usableWidth);
            return `
              <text x="0" y="${y + 16}" fill="#262930" font-size="13">${item.docente}</text>
              <rect x="${labelWidth}" y="${y}" width="${usableWidth}" height="18" rx="9" fill="#eadfce"></rect>
              <rect x="${labelWidth}" y="${y}" width="${width}" height="18" rx="9" fill="url(#docenteGradient)"></rect>
              <text x="${labelWidth + width + 10}" y="${y + 14}" fill="#6d727c" font-size="12">${item.pontuacao}</text>
            `;
          }).join("")}
          <defs>
            <linearGradient id="docenteGradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stop-color="#8c1538"></stop>
              <stop offset="100%" stop-color="#c13d65"></stop>
            </linearGradient>
          </defs>
        </svg>
      `;
    }

    function renderYearChart(summary) {
      if (!summary.length) {
        chartAnos.innerHTML = `<p class="chart-note">Sem dados para o gráfico.</p>`;
        return;
      }
      const maxPoints = Math.max(...summary.map((item) => item.pontuacao), 1);
      const width = 760;
      const height = 320;
      const baseY = 260;
      const left = 44;
      const gap = 18;
      const barWidth = Math.max(28, Math.floor((width - left - 20 - (summary.length - 1) * gap) / summary.length));
      chartAnos.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Pontuação por ano">
          <line x1="${left}" y1="${baseY}" x2="${width - 12}" y2="${baseY}" stroke="#cfc4b3" stroke-width="2"></line>
          ${summary.map((item, index) => {
            const x = left + 10 + index * (barWidth + gap);
            const barHeight = Math.max(10, Math.round((item.pontuacao / maxPoints) * 190));
            const y = baseY - barHeight;
            return `
              <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="10" fill="${index % 2 === 0 ? "#8c1538" : "#d4a017"}"></rect>
              <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" fill="#6d727c" font-size="12">${item.pontuacao}</text>
              <text x="${x + barWidth / 2}" y="${baseY + 18}" text-anchor="middle" fill="#262930" font-size="12">${item.ano}</text>
            `;
          }).join("")}
        </svg>
      `;
    }

    function renderTypePanel(summary, totalPoints) {
      const maxPoints = Math.max(...summary.map((item) => item.pontuacao), 1);
      typeStack.innerHTML = summary.map((item) => `
        <div class="type-row">
          <strong>${typeLabels[item.tipo]}</strong>
          <div class="track">
            <div class="bar" style="width:${(item.pontuacao / maxPoints) * 100}%; background:${item.tipo === "livro" ? "linear-gradient(90deg, #d4a017, #e0b948)" : item.tipo === "capitulo" ? "linear-gradient(90deg, #4d7c68, #76a891)" : "linear-gradient(90deg, #8c1538, #c13d65)"}"></div>
          </div>
          <span>${item.pontuacao}</span>
        </div>
      `).join("");
      typeChips.innerHTML = summary.map((item) => {
        const share = totalPoints ? Math.round((item.pontuacao / totalPoints) * 100) : 0;
        return `<span class="chip">${typeLabels[item.tipo]}: <strong>${item.total}</strong> produtos · ${share}% da pontuação</span>`;
      }).join("");
    }

    function renderResumoDocentes(summary) {
      const sortedSummary = [...summary].sort((a, b) => {
        if (docenteTableSortMode === "alfabetico") {
          return a.docente.localeCompare(b.docente, "pt-BR") || b.pontuacao - a.pontuacao;
        }
        return b.pontuacao - a.pontuacao || b.total - a.total || a.docente.localeCompare(b.docente, "pt-BR");
      });
      resumoDocentesBody.innerHTML = sortedSummary.map((item) => `
        <tr>
          <td>${item.docente}</td>
          <td>${item.total}</td>
          <td>${item.artigo}</td>
          <td>${item.livro}</td>
          <td>${item.capitulo}</td>
          <td>${item.pontuacao}</td>
        </tr>
      `).join("");
    }

    function renderTechnicalMetrics(data, docenteSummary, typeSummary, subtypeSummary) {
      const totalProdutos = data.reduce((acc, item) => acc + getTechnicalAmount(item), 0);
      const docentesComProducao = docenteSummary.filter((item) => item.total > 0);
      const docentesSemProducao = docenteSummary.filter((item) => item.total === 0);
      document.getElementById("tecnica-total-produtos").textContent = String(totalProdutos);
      document.getElementById("tecnica-docentes-com-producao").textContent = String(docentesComProducao.length);
      document.getElementById("tecnica-docentes-sem-producao").textContent = String(docentesSemProducao.length);
      document.getElementById("tecnica-tipos-visiveis").textContent = String(typeSummary.length);
      document.getElementById("tecnica-sem-producao-total").textContent = String(docentesSemProducao.length);

      const bestDocente = docentesComProducao[0];
      const bestType = typeSummary[0];
      const bestSubtype = subtypeSummary[0];
      insightChipsTecnica.innerHTML = [
        bestDocente ? `<span class="chip">Maior quantitativo: <strong>${bestDocente.docente}</strong> (${bestDocente.total})</span>` : "",
        bestType ? `<span class="chip">Tipo dominante: <strong>${bestType.tipo}</strong> (${bestType.total} registros)</span>` : "",
        bestSubtype ? `<span class="chip">Subtipo recorrente: <strong>${bestSubtype.subtipo}</strong> (${bestSubtype.total} ocorrências)</span>` : "",
      ].filter(Boolean).join("");

      tecnicaSemProducaoList.innerHTML = docentesSemProducao.length
        ? docentesSemProducao.map((item) => `
            <div class="sem-producao-item">
              <strong>${item.docente}</strong><br>
              Sem registro técnico no recorte atual.
            </div>
          `).join("")
        : `<p class="chart-note">Não há docentes sem produção técnica no recorte atual.</p>`;
    }

    function renderTechnicalDocenteChart(summary) {
      const items = sortTechnicalDocenteSummary(summary, tecnicaDocenteSortMode);
      if (!items.length) {
        chartTecnicaDocentes.innerHTML = `<p class="chart-note">Sem dados para o gráfico.</p>`;
        return;
      }
      tecnicaDocenteChartCaption.textContent = tecnicaDocenteSortMode === "alfabetico"
        ? "Ranking ordenado alfabeticamente no recorte filtrado."
        : "Ranking ordenado pelo quantitativo de produção técnica no recorte filtrado.";
      const maxTotal = Math.max(...items.map((item) => item.total), 1);
      const rowHeight = 34;
      const height = items.length * rowHeight + 48;
      const labelWidth = 270;
      const chartWidth = 700;
      const usableWidth = chartWidth - labelWidth - 60;
      chartTecnicaDocentes.innerHTML = `
        <svg viewBox="0 0 ${chartWidth} ${height}" role="img" aria-label="Produtos por docente">
          ${items.map((item, index) => {
            const y = 24 + index * rowHeight;
            const width = item.total > 0 ? Math.max(8, (item.total / maxTotal) * usableWidth) : 8;
            const fill = item.total > 0 ? "url(#tecnicaGradient)" : "#d9c7b1";
            const suffix = item.total > 0 ? String(item.total) : "Sem produção";
            return `
              <text x="0" y="${y + 16}" fill="#262930" font-size="13">${item.docente}</text>
              <rect x="${labelWidth}" y="${y}" width="${usableWidth}" height="18" rx="9" fill="#eadfce"></rect>
              <rect x="${labelWidth}" y="${y}" width="${width}" height="18" rx="9" fill="${fill}"></rect>
              <text x="${labelWidth + width + 10}" y="${y + 14}" fill="#6d727c" font-size="12">${suffix}</text>
            `;
          }).join("")}
          <defs>
            <linearGradient id="tecnicaGradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stop-color="#8c1538"></stop>
              <stop offset="100%" stop-color="#d4a017"></stop>
            </linearGradient>
          </defs>
        </svg>
      `;
    }

    function renderTechnicalTypePanel(summary, subtypeSummary, totalProdutos) {
      const maxTotal = Math.max(...summary.map((item) => item.total), 1);
      if (!summary.length) {
        typeStackTecnica.innerHTML = `<p class="chart-note">Sem produção técnica para analisar no recorte atual.</p>`;
        typeChipsTecnica.innerHTML = "";
        return;
      }
      typeStackTecnica.innerHTML = summary.map((item) => `
        <div class="type-row">
          <strong>${item.tipo}</strong>
          <div class="track">
            <div class="bar" style="width:${(item.total / maxTotal) * 100}%; background:linear-gradient(90deg, #8c1538, #d4a017)"></div>
          </div>
          <span>${item.total}</span>
        </div>
      `).join("");
      typeChipsTecnica.innerHTML = [
        ...summary.slice(0, 4).map((item) => {
          const share = totalProdutos ? Math.round((item.total / totalProdutos) * 100) : 0;
          return `<span class="chip">${item.tipo}: <strong>${item.total}</strong> registros · ${share}% do total</span>`;
        }),
        ...subtypeSummary.slice(0, 3).map((item) => `<span class="chip">Subtipo em destaque: <strong>${item.subtipo}</strong> (${item.total})</span>`),
      ].join("");
    }

    function renderTechnicalResumoDocentes(summary) {
      const sortedSummary = sortTechnicalDocenteSummary(summary, tecnicaTableSortMode);
      resumoTecnicaDocentesBody.innerHTML = sortedSummary.map((item) => `
        <tr>
          <td>${item.docente}</td>
          <td><span class="status-pill ${item.total > 0 ? "ok" : "alert"}">${item.status}</span></td>
          <td>${item.tipos.length ? item.tipos.join(", ") : "Sem registros técnicos"}</td>
          <td>${item.total}</td>
        </tr>
      `).join("");
    }

    function renderTechnicalTable(data) {
      tabelaTecnicaBody.innerHTML = data.map((item) => `
        <tr class="${hasTechnicalProduction(item) ? "" : "table-row-alert"}">
          <td>${item.docente || ""}</td>
          <td><span class="status-pill ${hasTechnicalProduction(item) ? "ok" : "alert"}">${getTechnicalStatusLabel(item)}</span></td>
          <td>${formatTechnicalType(item.tipo_produto) || ""}</td>
          <td>${item.ano || "-"}</td>
          <td>${getTechnicalSubtype(item)}</td>
          <td>${getTechnicalDetail(item)}</td>
        </tr>
      `).join("");
      estadoVazioTecnica.style.display = data.length ? "none" : "block";
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function getPercentileValue(values, percentile) {
      if (!values.length) return 0;
      const sorted = [...values].sort((a, b) => a - b);
      const index = clamp((sorted.length - 1) * percentile, 0, sorted.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      if (lower === upper) return sorted[lower];
      const weight = index - lower;
      return sorted[lower] + (sorted[upper] - sorted[lower]) * weight;
    }

    function aggregateMostardByDocente(data) {
      const grouped = new Map();
      for (const item of data) {
        if (!grouped.has(item.docente)) {
          grouped.set(item.docente, {
            docente: item.docente,
            total: 0,
            pontosMostard: 0,
            pontosApcn: 0,
            primeiraUltima: 0,
            segundaPenultima: 0,
            demais: 0,
          });
        }
        const row = grouped.get(item.docente);
        const score = getMostardScore(item);
        row.total += 1;
        row.pontosMostard += score.score;
        row.pontosApcn += Number(item.pontuacao) || 0;
        if (score.score === 1) {
          row.primeiraUltima += 1;
        } else if (score.score === 0.5) {
          row.segundaPenultima += 1;
        } else {
          row.demais += 1;
        }
      }
      return [...grouped.values()]
        .map((item) => ({
          ...item,
          liderancaMedia: item.total ? item.pontosMostard / item.total : 0,
          liderancaPercentual: item.total ? (item.pontosMostard / item.total) * 100 : 0,
          indiceMostarda: item.total ? (1 - (item.pontosMostard / item.total)) * 100 : 0,
          indiceMostardaCorrigido: item.total ? (1 - (item.pontosMostard / item.total)) * item.pontosApcn : 0,
        }))
        .sort((a, b) =>
          b.indiceMostarda - a.indiceMostarda ||
          b.indiceMostardaCorrigido - a.indiceMostardaCorrigido ||
          b.pontosApcn - a.pontosApcn ||
          b.total - a.total ||
          a.docente.localeCompare(b.docente, "pt-BR")
        );
    }

    function aggregateMostardByYear(data) {
      const grouped = new Map();
      for (const item of data) {
        const year = item.ano || "Sem ano";
        if (!grouped.has(year)) {
          grouped.set(year, {
            ano: year,
            total: 0,
            pontosMostard: 0,
            pontosApcn: 0,
            primeiraUltima: 0,
            segundaPenultima: 0,
            demais: 0,
          });
        }
        const row = grouped.get(year);
        const score = getMostardScore(item);
        row.total += 1;
        row.pontosMostard += score.score;
        row.pontosApcn += Number(item.pontuacao) || 0;
        if (score.score === 1) {
          row.primeiraUltima += 1;
        } else if (score.score === 0.5) {
          row.segundaPenultima += 1;
        } else {
          row.demais += 1;
        }
      }
      return [...grouped.values()]
        .map((item) => ({
          ...item,
          liderancaMedia: item.total ? item.pontosMostard / item.total : 0,
          liderancaPercentual: item.total ? (item.pontosMostard / item.total) * 100 : 0,
          indiceMostarda: item.total ? (1 - (item.pontosMostard / item.total)) * 100 : 0,
          indiceMostardaCorrigido: item.total ? (1 - (item.pontosMostard / item.total)) * item.pontosApcn : 0,
        }))
        .sort((a, b) => Number(a.ano) - Number(b.ano));
    }

    function summarizeMostardEvidence(data) {
      const summary = {
        records: data.length,
        parsedRecords: 0,
        parsedAuthorNames: 0,
        parsedRecordsMatchingDocente: 0,
        firstByAutorPrincipal: 0,
        fallbackDemais: 0,
        secondOrPenultimate: 0,
        explicitLastOrFirst: 0,
      };
      data.forEach((item) => {
        const authors = inferScientificAuthors(item);
        if (authors.length) {
          summary.parsedRecords += 1;
          summary.parsedAuthorNames += authors.length;
          if (authors.some((author) => authorMatchesDocente(author, item.docente))) {
            summary.parsedRecordsMatchingDocente += 1;
          }
        }
        const score = getMostardScore(item);
        if (score.source === "autor_principal") summary.firstByAutorPrincipal += 1;
        if (score.source === "fallback_autor_principal") summary.fallbackDemais += 1;
        if (score.label === "2ª ou penúltima autoria") summary.secondOrPenultimate += 1;
        if (score.label === "1ª ou última autoria") summary.explicitLastOrFirst += 1;
      });
      return summary;
    }

    function renderLeadershipMetrics(data, docenteSummary, yearSummary) {
      const pontosMostard = data.reduce((acc, item) => acc + getMostardScore(item).score, 0);
      const pontosApcn = data.reduce((acc, item) => acc + (Number(item.pontuacao) || 0), 0);
      const liderancaMedia = data.length ? pontosMostard / data.length : 0;
      const indiceGeral = (1 - liderancaMedia) * 100;
      const indiceGeralCorrigido = (indiceGeral / 100) * pontosApcn;
      const visibleDocentes = docenteSummary.length;
      const worstDocente = docenteSummary[0];
      const bestDocente = [...docenteSummary].sort((a, b) => a.indiceMostarda - b.indiceMostarda || b.pontosApcn - a.pontosApcn)[0];
      const worstYear = [...yearSummary].sort((a, b) => b.indiceMostarda - a.indiceMostarda || b.total - a.total)[0];
      const evidence = summarizeMostardEvidence(data);

      document.getElementById("lideranca-total-registros").textContent = String(data.length);
      document.getElementById("lideranca-pontos-apcn").textContent = formatDecimal(pontosApcn);
      document.getElementById("lideranca-docentes-visiveis").textContent = String(visibleDocentes);
      document.getElementById("lideranca-indice-geral").textContent = formatPercent(indiceGeral);

      liderancaInsightChips.innerHTML = [
        worstDocente ? `<span class="chip">Maior índice Mostarda: <strong>${worstDocente.docente}</strong> (${formatPercent(worstDocente.indiceMostarda)})</span>` : "",
        bestDocente ? `<span class="chip">Menor índice Mostarda: <strong>${bestDocente.docente}</strong> (${formatPercent(bestDocente.indiceMostarda)})</span>` : "",
        worstYear ? `<span class="chip">Ano mais crítico: <strong>${worstYear.ano}</strong> (${formatPercent(worstYear.indiceMostarda)})</span>` : "",
        `<span class="chip">Índice do recorte corrigido por pontos: <strong>${formatDecimal(indiceGeralCorrigido)}</strong></span>`,
        `<span class="chip">Registros com sequência explícita de autores: <strong>${evidence.parsedRecords}</strong> de ${data.length}</span>`,
        `<span class="chip">Com docente identificado nessa sequência: <strong>${evidence.parsedRecordsMatchingDocente}</strong></span>`,
      ].join("");

      liderancaMetodologiaChips.innerHTML = [
        `<span class="chip">Régua-alvo: 1,0 para primeira/última; 0,5 para segunda/penúltima; 0,1 para demais</span>`,
        `<span class="chip">Índice Mostarda exibido = <strong>1 - média de liderança</strong>; logo, valores maiores indicam menor liderança</span>`,
        `<span class="chip">Índice corrigido = <strong>Índice Mostarda decimal x pontos APCN</strong> do docente ou do ano</span>`,
        `<span class="chip">Base atual com nomes em sequência: <strong>${evidence.parsedAuthorNames}</strong> nomes distribuídos em <strong>${evidence.parsedRecords}</strong> registros</span>`,
        `<span class="chip">Registros operando como 1,0 por <strong>autor_principal</strong>: <strong>${evidence.firstByAutorPrincipal}</strong></span>`,
        `<span class="chip">Registros operando como 0,1 por falta de sequência autoral: <strong>${evidence.fallbackDemais}</strong></span>`,
        `<span class="chip">Ocorrências reais de 0,5 na base atual: <strong>${evidence.secondOrPenultimate}</strong></span>`,
      ].join("");
    }

    function renderLeadershipDocenteChart(summary) {
      const items = summary.slice(0, 18);
      if (!items.length) {
        chartLiderancaDocentes.innerHTML = `<p class="chart-note">Sem dados para o gráfico.</p>`;
        return;
      }
      const maxMetric = Math.max(...items.map((item) => item.indiceMostarda), 1);
      const rowHeight = 34;
      const height = items.length * rowHeight + 48;
      const labelWidth = 270;
      const chartWidth = 720;
      const usableWidth = chartWidth - labelWidth - 70;
      chartLiderancaDocentes.innerHTML = `
        <svg viewBox="0 0 ${chartWidth} ${height}" role="img" aria-label="Índice Mostarda por docente">
          ${items.map((item, index) => {
            const y = 24 + index * rowHeight;
            const width = Math.max(8, (item.indiceMostarda / maxMetric) * usableWidth);
            return `
              <text x="0" y="${y + 16}" fill="#262930" font-size="13">${item.docente}</text>
              <rect x="${labelWidth}" y="${y}" width="${usableWidth}" height="18" rx="9" fill="#eadfce"></rect>
              <rect x="${labelWidth}" y="${y}" width="${width}" height="18" rx="9" fill="url(#liderancaGradient)"></rect>
              <text x="${labelWidth + width + 10}" y="${y + 14}" fill="#6d727c" font-size="12">${formatDecimal(item.indiceMostarda)}%</text>
            `;
          }).join("")}
          <defs>
            <linearGradient id="liderancaGradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stop-color="#8c1538"></stop>
              <stop offset="100%" stop-color="#d4a017"></stop>
            </linearGradient>
          </defs>
        </svg>
      `;
    }

    function renderLeadershipWeightedChart(summary) {
      const items = [...summary]
        .sort((a, b) => b.indiceMostardaCorrigido - a.indiceMostardaCorrigido || b.pontosApcn - a.pontosApcn)
        .slice(0, 18);
      if (!items.length) {
        chartLiderancaCorrigido.innerHTML = `<p class="chart-note">Sem dados para o gráfico.</p>`;
        return;
      }
      const maxMetric = Math.max(...items.map((item) => item.indiceMostardaCorrigido), 1);
      const rowHeight = 34;
      const height = items.length * rowHeight + 48;
      const labelWidth = 270;
      const chartWidth = 720;
      const usableWidth = chartWidth - labelWidth - 70;
      chartLiderancaCorrigido.innerHTML = `
        <svg viewBox="0 0 ${chartWidth} ${height}" role="img" aria-label="Índice Mostarda corrigido por pontos APCN">
          ${items.map((item, index) => {
            const y = 24 + index * rowHeight;
            const width = Math.max(8, (item.indiceMostardaCorrigido / maxMetric) * usableWidth);
            return `
              <text x="0" y="${y + 16}" fill="#262930" font-size="13">${item.docente}</text>
              <rect x="${labelWidth}" y="${y}" width="${usableWidth}" height="18" rx="9" fill="#eadfce"></rect>
              <rect x="${labelWidth}" y="${y}" width="${width}" height="18" rx="9" fill="url(#liderancaWeightedGradient)"></rect>
              <text x="${labelWidth + width + 10}" y="${y + 14}" fill="#6d727c" font-size="12">${formatDecimal(item.indiceMostardaCorrigido)}</text>
            `;
          }).join("")}
          <defs>
            <linearGradient id="liderancaWeightedGradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stop-color="#d4a017"></stop>
              <stop offset="100%" stop-color="#8c1538"></stop>
            </linearGradient>
          </defs>
        </svg>
      `;
    }

    function renderLeadershipScatterChart(summary) {
      if (!summary.length) {
        chartLiderancaDispersao.innerHTML = `<p class="chart-note">Sem dados para o gráfico.</p>`;
        return;
      }
      const width = 992;
      const height = 512;
      const left = 97;
      const right = 27;
      const top = 69;
      const bottom = 67;
      const innerWidth = width - left - right;
      const innerHeight = height - top - bottom;
      const maxPoints = Math.max(...summary.map((item) => item.pontosApcn), 1);
      const maxIndex = Math.max(...summary.map((item) => item.indiceMostarda), 1);
      const items = summary.map((item) => {
        const xRatio = clamp((item.pontosApcn || 0) / maxPoints, 0, 1);
        const inverseMostardRatio = clamp(1 - ((item.indiceMostarda || 0) / maxIndex), 0, 1);
        return {
          ...item,
          xRatio,
          inverseMostardRatio,
          diagonalScore: (xRatio + inverseMostardRatio) / 2,
        };
      });
      const p30 = 0.30;
      const p55 = 0.55;
      const p30Score = getPercentileValue(items.map((item) => item.diagonalScore), p30);
      const p55Score = getPercentileValue(items.map((item) => item.diagonalScore), p55);
      const xTicks = 4;
      const yTicks = 4;
      const plotRight = width - right;
      const plotBottom = height - bottom;
      const bandLineY = (score, xScreen) => {
        const xRatio = clamp((xScreen - left) / innerWidth, 0, 1);
        return top + ((2 * score) - xRatio) * innerHeight;
      };
      const buildBandPolygon = (upperScore, lowerScore) => {
        const pointsTop = [];
        const pointsBottom = [];
        for (let step = 0; step <= 240; step += 1) {
          const x = left + (step / 240) * innerWidth;
          const upperY = clamp(bandLineY(upperScore, x), top, plotBottom);
          const lowerY = clamp(bandLineY(lowerScore, x), top, plotBottom);
          pointsTop.push(`${x.toFixed(1)},${upperY.toFixed(1)}`);
          pointsBottom.push(`${x.toFixed(1)},${lowerY.toFixed(1)}`);
        }
        return [...pointsTop, ...pointsBottom.reverse()].join(" ");
      };
      const buildBoundaryArea = (score, mode) => {
        const boundary = [];
        for (let step = 0; step <= 240; step += 1) {
          const x = left + (step / 240) * innerWidth;
          const lineY = clamp(bandLineY(score, x), top, plotBottom);
          boundary.push(`${x.toFixed(1)},${lineY.toFixed(1)}`);
        }
        const ceiling = mode === "top" ? top : plotBottom;
        const edge = [];
        for (let step = 240; step >= 0; step -= 1) {
          const x = left + (step / 240) * innerWidth;
          edge.push(`${x.toFixed(1)},${ceiling.toFixed(1)}`);
        }
        return [...boundary, ...edge].join(" ");
      };
      const redPolygon = buildBoundaryArea(p30Score, "top");
      const amberPolygon = buildBandPolygon(p30Score, p55Score);
      const greenPolygon = buildBoundaryArea(p55Score, "bottom");
      chartLiderancaDispersao.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Dispersão entre índice Mostarda e pontos APCN por docente">
          <rect x="${left}" y="${top}" width="${innerWidth}" height="${innerHeight}" rx="18" fill="#fbf7f1" stroke="#d7cdbc" stroke-width="1.5"></rect>
          <polygon points="${redPolygon}" fill="#b2344a" fill-opacity="0.12"></polygon>
          <polygon points="${amberPolygon}" fill="#e2b02b" fill-opacity="0.13"></polygon>
          <polygon points="${greenPolygon}" fill="#4d7c68" fill-opacity="0.22"></polygon>
          ${Array.from({ length: yTicks + 1 }, (_, index) => {
            const ratio = index / yTicks;
            const y = top + innerHeight - ratio * innerHeight;
            const value = ratio * maxIndex;
            return `
              <line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="#e5dbcd" stroke-width="1"></line>
              <text x="${left - 10}" y="${y + 4}" text-anchor="end" fill="#6d727c" font-size="11">${formatDecimal(value)}%</text>
            `;
          }).join("")}
          ${Array.from({ length: xTicks + 1 }, (_, index) => {
            const ratio = index / xTicks;
            const x = left + ratio * innerWidth;
            const value = ratio * maxPoints;
            return `
              <line x1="${x}" y1="${top}" x2="${x}" y2="${height - bottom}" stroke="#f0e7da" stroke-width="1"></line>
              <text x="${x}" y="${height - bottom + 18}" text-anchor="middle" fill="#6d727c" font-size="11">${formatDecimal(value)}</text>
            `;
          }).join("")}
          <line x1="${left}" y1="${plotBottom}" x2="${plotRight}" y2="${plotBottom}" stroke="#cfc4b3" stroke-width="2"></line>
          <line x1="${left}" y1="${top}" x2="${left}" y2="${plotBottom}" stroke="#cfc4b3" stroke-width="2"></line>
          ${items.map((item) => {
            const x = left + item.xRatio * innerWidth;
            const y = top + innerHeight - ((item.indiceMostarda || 0) / maxIndex) * innerHeight;
            return `
              <circle cx="${x}" cy="${y}" r="6.2" fill="#8c1538" stroke="#fff9f2" stroke-width="1.6"></circle>
              <text x="${x + 8}" y="${y - 8}" fill="#262930" font-size="10.5">${item.docente}</text>
            `;
          }).join("")}
          <text x="${width / 2}" y="${height - 18}" text-anchor="middle" fill="#262930" font-size="12">Pontos APCN</text>
          <text x="18" y="${height / 2}" transform="rotate(-90 18 ${height / 2})" text-anchor="middle" fill="#262930" font-size="12">Índice Mostarda</text>
        </svg>
        <div class="chart-note" style="margin-top: 12px; line-height: 1.5;">
          <strong>Legenda:</strong> a faixa vermelha representa o perfil <strong>Indesejado</strong>, a faixa amarela representa o perfil <strong>Esperado</strong> e a faixa verde representa o perfil <strong>Desejado</strong>.
          Os cortes usados neste recorte foram <strong>p30,0</strong> e <strong>p55,0</strong>, calculados sobre a combinação entre produtividade APCN e inverso do Índice Mostarda.
          Leitura: <strong>Indesejado</strong> ≤ p30,0; <strong>Esperado</strong> entre p30,0 e p55,0; <strong>Desejado</strong> &gt; p55,0.
        </div>
      `;
    }

    function renderLeadershipYearChart(summary) {
      if (!summary.length) {
        chartLiderancaAnos.innerHTML = `<p class="chart-note">Sem dados para o gráfico.</p>`;
        return;
      }
      const maxIndex = Math.max(...summary.map((item) => item.indiceMostarda), 1);
      const width = 760;
      const height = 320;
      const baseY = 260;
      const left = 44;
      const gap = 18;
      const barWidth = Math.max(28, Math.floor((width - left - 20 - (summary.length - 1) * gap) / summary.length));
      chartLiderancaAnos.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolução anual do Índice Mostarda">
          <line x1="${left}" y1="${baseY}" x2="${width - 12}" y2="${baseY}" stroke="#cfc4b3" stroke-width="2"></line>
          ${summary.map((item, index) => {
            const x = left + 10 + index * (barWidth + gap);
            const barHeight = Math.max(10, Math.round((item.indiceMostarda / maxIndex) * 190));
            const y = baseY - barHeight;
            return `
              <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="10" fill="${index % 2 === 0 ? "#8c1538" : "#d4a017"}"></rect>
              <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" fill="#6d727c" font-size="12">${formatDecimal(item.indiceMostarda)}%</text>
              <text x="${x + barWidth / 2}" y="${baseY + 18}" text-anchor="middle" fill="#262930" font-size="12">${item.ano}</text>
            `;
          }).join("")}
        </svg>
      `;
    }

    function renderLeadershipDocentesTable(summary) {
      liderancaDocentesBody.innerHTML = summary.map((item) => `
        <tr>
          <td>${item.docente}</td>
          <td>${formatPercent(item.indiceMostarda)}</td>
          <td>${formatDecimal(item.pontosApcn)}</td>
          <td>${formatDecimal(item.indiceMostardaCorrigido)}</td>
          <td>${item.total}</td>
          <td>${item.primeiraUltima}</td>
          <td>${item.segundaPenultima}</td>
          <td>${item.demais}</td>
        </tr>
      `).join("");
    }

    function renderLeadershipYearTable(summary) {
      liderancaAnosBody.innerHTML = summary.map((item) => `
        <tr>
          <td>${item.ano}</td>
          <td>${formatPercent(item.indiceMostarda)}</td>
          <td>${formatDecimal(item.pontosApcn)}</td>
          <td>${formatDecimal(item.indiceMostardaCorrigido)}</td>
          <td>${item.total}</td>
          <td>${item.primeiraUltima}</td>
          <td>${item.segundaPenultima}</td>
          <td>${item.demais}</td>
        </tr>
      `).join("");
    }

    function getApcnArticleBucket(item) {
      if (item.tipo_producao !== "artigo") return null;
      const points = Number(item.pontuacao) || 0;
      if (points >= 90) return "90";
      if (points >= 60) return "60";
      if (points >= 30) return "30";
      return "0";
    }

    function aggregateLeadershipQualityByDocente(data) {
      const grouped = new Map();
      data.forEach((item) => {
        if (!grouped.has(item.docente)) {
          grouped.set(item.docente, {
            docente: item.docente,
            jcrSum: 0,
            jcrCount: 0,
            artigos90: 0,
            artigos60: 0,
            artigos30: 0,
            artigos0: 0,
          });
        }
        const row = grouped.get(item.docente);
        const jcr = Number(item.jif_jcr_2025) || 0;
        if (jcr > 0) {
          row.jcrSum += jcr;
          row.jcrCount += 1;
        }
        const bucket = getApcnArticleBucket(item);
        if (bucket === "90") row.artigos90 += 1;
        if (bucket === "60") row.artigos60 += 1;
        if (bucket === "30") row.artigos30 += 1;
        if (bucket === "0") row.artigos0 += 1;
      });
      return [...grouped.values()]
        .map((item) => ({
          ...item,
          jcrAvg: item.jcrCount ? item.jcrSum / item.jcrCount : 0,
        }))
        .sort((a, b) =>
          b.jcrSum - a.jcrSum ||
          b.jcrAvg - a.jcrAvg ||
          b.jcrCount - a.jcrCount ||
          a.docente.localeCompare(b.docente, "pt-BR")
        );
    }

    function aggregateLeadershipQualityTotals(data) {
      return data.reduce((acc, item) => {
        const jcr = Number(item.jif_jcr_2025) || 0;
        if (jcr > 0) {
          acc.jcrSum += jcr;
          acc.jcrCount += 1;
        }
        const bucket = getApcnArticleBucket(item);
        if (bucket === "90") acc.artigos90 += 1;
        if (bucket === "60") acc.artigos60 += 1;
        if (bucket === "30") acc.artigos30 += 1;
        if (bucket === "0") acc.artigos0 += 1;
        return acc;
      }, {
        jcrSum: 0,
        jcrCount: 0,
        artigos90: 0,
        artigos60: 0,
        artigos30: 0,
        artigos0: 0,
      });
    }

    function renderLeadershipQualityMetrics(summary, totals) {
      const docentesComJcr = summary.filter((item) => item.jcrCount > 0);
      const topJcr = summary[0];
      const bestAvg = [...summary]
        .filter((item) => item.jcrCount > 0)
        .sort((a, b) => b.jcrAvg - a.jcrAvg || b.jcrSum - a.jcrSum)[0];

      document.getElementById("lideranca-qualidade-produtos-jcr").textContent = String(totals.jcrCount);
      document.getElementById("lideranca-qualidade-jcr-soma").textContent = formatDecimal(totals.jcrSum);
      document.getElementById("lideranca-qualidade-jcr-media").textContent = formatDecimal(totals.jcrCount ? totals.jcrSum / totals.jcrCount : 0);
      document.getElementById("lideranca-qualidade-docentes-jcr").textContent = String(docentesComJcr.length);

      liderancaQualidadeInsights.innerHTML = [
        topJcr ? `<span class="chip">Maior soma de JCR (SCimago | 2y cites per doc): <strong>${topJcr.docente}</strong> (${formatDecimal(topJcr.jcrSum)})</span>` : "",
        bestAvg ? `<span class="chip">Maior média JCR (SCimago | 2y cites per doc): <strong>${bestAvg.docente}</strong> (${formatDecimal(bestAvg.jcrAvg)})</span>` : "",
        `<span class="chip">Artigos em periódicos de 90 pontos: <strong>${totals.artigos90}</strong></span>`,
        `<span class="chip">Artigos sem pontuação APCN de periódico: <strong>${totals.artigos0}</strong></span>`,
      ].filter(Boolean).join("");

      liderancaQualidadeMetodologia.innerHTML = [
        `<span class="chip">Somatório JCR (SCimago | 2y cites per doc): soma simples dos valores em <strong>jif_jcr_2025</strong> no recorte</span>`,
        `<span class="chip">Média JCR (SCimago | 2y cites per doc): somatório dividido apenas pelos produtos com JCR informado</span>`,
        `<span class="chip">Faixas APCN: agrupamento dos <strong>artigos</strong> por pontuação do periódico (${["90", "60", "30", "0"].join(" / ")})</span>`,
      ].join("");
    }

    function bindLeadershipQualityJcrModeButtons() {
      liderancaQualidadeJcrModeButtons.forEach((button) => {
        button.addEventListener("click", () => {
          liderancaQualidadeJcrMode = button.dataset.liderancaQualidadeJcrMode || "total";
          liderancaQualidadeJcrModeButtons.forEach((item) => {
            item.classList.toggle("active", item === button);
          });
          renderLeadershipQualityJcrChart(aggregateLeadershipQualityByDocente(getFilteredScientificData()));
        });
      });
    }

    function renderLeadershipQualityJcrChart(summary) {
      liderancaQualidadeJcrModeButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.liderancaQualidadeJcrMode === liderancaQualidadeJcrMode);
      });
      const valueKey = liderancaQualidadeJcrMode === "media" ? "jcrAvg" : "jcrSum";
      const items = summary
        .filter((item) => item.jcrCount > 0 && item[valueKey] > 0)
        .sort((a, b) =>
          b[valueKey] - a[valueKey] ||
          b.jcrSum - a.jcrSum ||
          b.jcrCount - a.jcrCount ||
          a.docente.localeCompare(b.docente, "pt-BR")
        )
        .slice(0, 16);
      if (!items.length) {
        chartLiderancaQualidadeJcr.innerHTML = `<p class="chart-note">Sem dados de JCR (SCimago | 2y cites per doc) para o gráfico.</p>`;
        return;
      }
      const maxValue = Math.max(...items.map((item) => item[valueKey]), 1);
      const rowHeight = 34;
      const height = items.length * rowHeight + 48;
      const labelWidth = 270;
      const chartWidth = 760;
      const usableWidth = chartWidth - labelWidth - 84;
      chartLiderancaQualidadeJcr.innerHTML = `
        <svg viewBox="0 0 ${chartWidth} ${height}" role="img" aria-label="${liderancaQualidadeJcrMode === "media" ? "Média de JCR (SCimago | 2y cites per doc) por docente" : "Somatório de JCR (SCimago | 2y cites per doc) por docente"}">
          ${items.map((item, index) => {
            const y = 24 + index * rowHeight;
            const primaryValue = item[valueKey];
            const width = Math.max(8, (primaryValue / maxValue) * usableWidth);
            return `
              <text x="0" y="${y + 16}" fill="#262930" font-size="13">${item.docente}</text>
              <rect x="${labelWidth}" y="${y}" width="${usableWidth}" height="18" rx="9" fill="#eadfce"></rect>
              <rect x="${labelWidth}" y="${y}" width="${width}" height="18" rx="9" fill="url(#liderancaJcrGradient)"></rect>
              <text x="${labelWidth + width + 10}" y="${y + 14}" fill="#6d727c" font-size="12">${liderancaQualidadeJcrMode === "media" ? `m=${formatDecimal(item.jcrAvg)} · Σ=${formatDecimal(item.jcrSum)}` : `${formatDecimal(item.jcrSum)} · m=${formatDecimal(item.jcrAvg)}`}</text>
            `;
          }).join("")}
          <defs>
            <linearGradient id="liderancaJcrGradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stop-color="#4d7c68"></stop>
              <stop offset="100%" stop-color="#d4a017"></stop>
            </linearGradient>
          </defs>
        </svg>
      `;
    }

    function renderLeadershipQualityApcnChart(totals) {
      const items = [
        { label: "90 pontos", total: totals.artigos90, color: "#8c1538" },
        { label: "60 pontos", total: totals.artigos60, color: "#b94b5d" },
        { label: "30 pontos", total: totals.artigos30, color: "#d4a017" },
        { label: "0 ponto", total: totals.artigos0, color: "#c5b9a8" },
      ];
      const maxValue = Math.max(...items.map((item) => item.total), 1);
      const width = 760;
      const height = 300;
      const left = 60;
      const baseY = 242;
      const barWidth = 116;
      const gap = 42;
      chartLiderancaQualidadeApcn.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Faixas APCN dos periódicos">
          <line x1="${left}" y1="${baseY}" x2="${width - 24}" y2="${baseY}" stroke="#cfc4b3" stroke-width="2"></line>
          ${items.map((item, index) => {
            const x = left + 24 + index * (barWidth + gap);
            const barHeight = Math.max(10, (item.total / maxValue) * 160);
            const y = baseY - barHeight;
            return `
              <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="14" fill="${item.color}"></rect>
              <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" fill="#6d727c" font-size="12">${item.total}</text>
              <text x="${x + barWidth / 2}" y="${baseY + 18}" text-anchor="middle" fill="#262930" font-size="12">${item.label}</text>
            `;
          }).join("")}
        </svg>
      `;
    }

    function renderLeadershipQualityTable(summary) {
      liderancaQualidadeBody.innerHTML = summary.map((item) => `
        <tr>
          <td>${item.docente}</td>
          <td>${formatDecimal(item.jcrSum)}</td>
          <td>${formatDecimal(item.jcrAvg)}</td>
          <td>${item.jcrCount}</td>
          <td>${item.artigos90}</td>
          <td>${item.artigos60}</td>
          <td>${item.artigos30}</td>
          <td>${item.artigos0}</td>
        </tr>
      `).join("");
    }

    function aggregateLeadershipPartnershipByDocente(data, productGroups) {
      const grouped = new Map();
      data.forEach((item) => {
        if (!grouped.has(item.docente)) {
          grouped.set(item.docente, {
            docente: item.docente,
            totalProdutos: 0,
            parceirosOcorrencias: 0,
            parceirosDistintosMap: new Map(),
            produtosInternos: 0,
            docentesInternosSet: new Set(),
            forcaInterna: 0,
          });
        }
        const row = grouped.get(item.docente);
        const key = getLeadershipProductKey(item);
        const group = productGroups.get(key);
        row.totalProdutos += 1;
        row.parceirosOcorrencias += Math.max((Number(item.numero_autores) || 1) - 1, 0);
        getCoauthorNames(item).forEach((author) => {
          const normalized = normalizePersonText(author);
          if (normalized) row.parceirosDistintosMap.set(normalized, author);
        });
        const internalDocentes = [...(group?.docentes || [])].filter((docente) => docente !== item.docente);
        if (internalDocentes.length) {
          row.produtosInternos += 1;
          internalDocentes.forEach((docente) => row.docentesInternosSet.add(docente));
          row.forcaInterna += internalDocentes.length;
        }
      });
      return [...grouped.values()]
        .map((item) => ({
          docente: item.docente,
          totalProdutos: item.totalProdutos,
          parceirosOcorrencias: item.parceirosOcorrencias,
          parceirosDistintos: item.parceirosDistintosMap.size,
          parceirosMedios: item.totalProdutos ? item.parceirosOcorrencias / item.totalProdutos : 0,
          produtosInternos: item.produtosInternos,
          docentesInternos: item.docentesInternosSet.size,
          forcaInterna: item.forcaInterna,
        }))
        .sort((a, b) =>
          b.parceirosOcorrencias - a.parceirosOcorrencias ||
          b.docentesInternos - a.docentesInternos ||
          b.parceirosDistintos - a.parceirosDistintos ||
          a.docente.localeCompare(b.docente, "pt-BR")
        );
    }

    function aggregateLeadershipPartnershipTotals(summary, productGroups, data) {
      const uniquePartnerSet = new Set();
      data.forEach((item) => {
        getCoauthorNames(item).forEach((author) => {
          const normalized = normalizePersonText(author);
          if (normalized) uniquePartnerSet.add(normalized);
        });
      });
      const groups = [...productGroups.values()];
      const totalProdutos = groups.length;
      const totalParceiros = groups.reduce((acc, group) => acc + Math.max((group.numeroAutores || 1) - 1, 0), 0);
      const produtosInternos = groups.filter((group) => group.docentes.size > 1).length;
      const docentesIntegrados = summary.filter((item) => item.docentesInternos > 0).length;
      return {
        uniquePartners: uniquePartnerSet.size,
        totalProdutos,
        totalParceiros,
        produtosInternos,
        docentesIntegrados,
        mediaParceiros: totalProdutos ? totalParceiros / totalProdutos : 0,
      };
    }

    function aggregateLeadershipPartnershipByYear(productGroups) {
      const grouped = new Map();
      [...productGroups.values()].forEach((group) => {
        const year = group.ano || "Sem ano";
        if (!grouped.has(year)) {
          grouped.set(year, {
            ano: year,
            totalProdutos: 0,
            parceirosTotal: 0,
            produtosInternos: 0,
          });
        }
        const row = grouped.get(year);
        row.totalProdutos += 1;
        row.parceirosTotal += Math.max((group.numeroAutores || 1) - 1, 0);
        if (group.docentes.size > 1) row.produtosInternos += 1;
      });
      return [...grouped.values()]
        .map((item) => ({
          ...item,
          parceirosMedios: item.totalProdutos ? Number(item.parceirosTotal || 0) / Number(item.totalProdutos || 1) : 0,
        }))
        .sort((a, b) => Number(a.ano) - Number(b.ano));
    }

    function buildLeadershipPartnershipNetwork(summary, productGroups) {
      const edgeMap = new Map();
      [...productGroups.values()].forEach((group) => {
        const docentes = [...group.docentes].sort((a, b) => a.localeCompare(b, "pt-BR"));
        if (docentes.length < 2) return;
        for (let index = 0; index < docentes.length; index += 1) {
          for (let innerIndex = index + 1; innerIndex < docentes.length; innerIndex += 1) {
            const source = docentes[index];
            const target = docentes[innerIndex];
            const key = `${source}|||${target}`;
            edgeMap.set(key, {
              source,
              target,
              weight: (edgeMap.get(key)?.weight || 0) + 1,
            });
          }
        }
      });
      const nodes = summary
        .filter((item) => item.totalProdutos > 0)
        .map((item) => ({
          id: item.docente,
          value: item.docentesInternos || 0,
          produtosInternos: item.produtosInternos || 0,
          parceirosMedios: item.parceirosMedios || 0,
          parceirosOcorrencias: item.parceirosOcorrencias || 0,
        }));
      return {
        nodes,
        edges: [...edgeMap.values()].sort((a, b) => b.weight - a.weight || a.source.localeCompare(b.source, "pt-BR")),
      };
    }

    function buildLeadershipIntegratedWorksAudit(productGroups) {
      const integratedWorks = [];
      const pairMap = new Map();
      [...productGroups.values()].forEach((group) => {
        const docentes = [...group.docentes].sort((a, b) => a.localeCompare(b, "pt-BR"));
        if (docentes.length < 2) return;
        const baseItem = group.items[0] || {};
        const work = {
          key: group.key,
          titulo: baseItem.titulo || "",
          ano: baseItem.ano || "",
          tipo_producao: baseItem.tipo_producao || "",
          docentes,
          referencia: baseItem.produto_referencia || baseItem.autores || baseItem.autor_principal || "",
          totalRegistros: group.items.length,
        };
        integratedWorks.push(work);
        for (let index = 0; index < docentes.length; index += 1) {
          for (let innerIndex = index + 1; innerIndex < docentes.length; innerIndex += 1) {
            const source = docentes[index];
            const target = docentes[innerIndex];
            const pairKey = [source, target].sort((a, b) => a.localeCompare(b, "pt-BR")).join("|||");
            if (!pairMap.has(pairKey)) pairMap.set(pairKey, []);
            pairMap.get(pairKey).push(work);
          }
        }
      });
      integratedWorks.sort((a, b) => (Number(b.ano) || 0) - (Number(a.ano) || 0) || a.titulo.localeCompare(b.titulo, "pt-BR"));
      pairMap.forEach((items) => items.sort((a, b) => (Number(b.ano) || 0) - (Number(a.ano) || 0) || a.titulo.localeCompare(b.titulo, "pt-BR")));
      return { integratedWorks, pairMap };
    }

    function renderLeadershipPartnershipMetrics(summary, totals, yearSummary, network) {
      if (!liderancaParceriaInsights || !liderancaParceriaMetodologia) return;
      const topPartners = summary[0];
      const mostIntegrated = [...summary].sort((a, b) => b.docentesInternos - a.docentesInternos || b.forcaInterna - a.forcaInterna || a.docente.localeCompare(b.docente, "pt-BR"))[0];
      const topYear = [...yearSummary].sort((a, b) => b.parceirosMedios - a.parceirosMedios || b.produtosInternos - a.produtosInternos)[0];
      const topEdge = network.edges[0];
      const rawMediaParceiros = Number(totals?.mediaParceiros);
      const fallbackMediaParceiros = yearSummary.reduce((acc, item) => acc + Number(item?.parceirosTotal || 0), 0);
      const fallbackTotalProdutos = yearSummary.reduce((acc, item) => acc + Number(item?.totalProdutos || 0), 0);
      const mediaParceiros = Number.isFinite(rawMediaParceiros) && rawMediaParceiros > 0
        ? rawMediaParceiros
        : (fallbackTotalProdutos ? fallbackMediaParceiros / fallbackTotalProdutos : 0);

      document.getElementById("lideranca-parceria-media").textContent = formatDecimal(mediaParceiros);
      document.getElementById("lideranca-parceria-distintos").textContent = String(totals.uniquePartners);
      document.getElementById("lideranca-parceria-internos").textContent = String(totals.produtosInternos);
      document.getElementById("lideranca-parceria-docentes").textContent = String(totals.docentesIntegrados);

      liderancaParceriaInsights.innerHTML = [
        topPartners ? `<span class="chip">Maior volume relacional: <strong>${topPartners.docente}</strong> (${topPartners.parceirosOcorrencias} parceiros acumulados)</span>` : "",
        mostIntegrated ? `<span class="chip">Maior integração interna: <strong>${mostIntegrated.docente}</strong> (${mostIntegrated.docentesInternos} docentes conectados)</span>` : "",
        topYear ? `<span class="chip">Ano mais cooperativo: <strong>${topYear.ano}</strong> (média ${formatDecimal(topYear.parceirosMedios)} parceiros)</span>` : "",
        topEdge ? `<span class="chip">Vínculo interno mais forte: <strong>${topEdge.source}</strong> × <strong>${topEdge.target}</strong> (${topEdge.weight} produtos compartilhados na chave título + ano + tipo)</span>` : `<span class="chip">Nenhum vínculo interno entre docentes foi identificado na base atual.</span>`,
      ].filter(Boolean).join("");

      liderancaParceriaMetodologia.innerHTML = [
        `<span class="chip">Parceiros por produto = <strong>numero_autores - 1</strong>, usando os campos estruturados do novo modelo</span>`,
        `<span class="chip">Parceiros distintos usam os nomes explícitos do campo <strong>autores</strong> quando a lista está disponível</span>`,
        `<span class="chip">Produtos internos são consolidados principalmente por <strong>título</strong>, com apoio de <strong>ano</strong> e <strong>tipo</strong></span>`,
        `<span class="chip">Força do vínculo na rede = quantidade de produtos compartilhados entre o mesmo par de docentes</span>`,
      ].join("");
    }

    function bindLeadershipPartnershipSortToggles() {
      liderancaParceriaSortButtons.forEach((button) => {
        button.addEventListener("click", () => {
          liderancaParceriaSortMode = button.dataset.liderancaParceriaSort || "alfabetico";
          liderancaParceriaSortButtons.forEach((item) => item.classList.toggle("active", item === button));
          renderCooperationCriticalCriteriaPanel();
        });
      });
    }

    function renderLeadershipPartnershipDocenteChart(summary) {
      if (!chartLiderancaParceriaDocentes) return;
      liderancaParceriaSortButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.liderancaParceriaSort === liderancaParceriaSortMode);
      });
      const sorted = [...summary].sort((a, b) => {
        if (liderancaParceriaSortMode === "alfabetico") {
          return a.docente.localeCompare(b.docente, "pt-BR") || b.docentesInternos - a.docentesInternos;
        }
        return (
          b.docentesInternos - a.docentesInternos ||
          b.forcaInterna - a.forcaInterna ||
          b.produtosInternos - a.produtosInternos ||
          a.docente.localeCompare(b.docente, "pt-BR")
        );
      });
      const items = sorted.slice(0, 18);
      if (!items.length) {
        chartLiderancaParceriaDocentes.innerHTML = `<p class="chart-note">Sem dados para o gráfico.</p>`;
        return;
      }
      const maxMetric = Math.max(...items.map((item) => item.docentesInternos), 1);
      chartLiderancaParceriaDocentes.innerHTML = `
        <div class="lideranca-parceria-bars" role="img" aria-label="Cooperação interna por docente">
          ${items.map((item) => {
            const width = item.docentesInternos > 0
              ? Math.max(10, (item.docentesInternos / maxMetric) * 100)
              : 0;
            return `
              <div class="lideranca-parceria-bar-row">
                <div class="lideranca-parceria-bar-label">${escapeHtml(item.docente)}</div>
                <div class="lideranca-parceria-bar-track" aria-hidden="true">
                  <div class="lideranca-parceria-bar-fill" style="width:${width}%;"></div>
                </div>
                <div class="lideranca-parceria-bar-meta">${item.docentesInternos} parceiro(s) · força ${item.forcaInterna}</div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    function buildLeadershipPartnershipYearChartSummary(summary, productGroups) {
      const baseSummary = Array.isArray(summary) ? summary : [];
      const hasValidMetrics = baseSummary.some((item) => {
        const media = Number(item?.parceirosMedios);
        const parceirosTotal = Number(item?.parceirosTotal);
        const totalProdutos = Number(item?.totalProdutos);
        return (Number.isFinite(media) && media > 0)
          || (Number.isFinite(parceirosTotal) && parceirosTotal > 0 && Number.isFinite(totalProdutos) && totalProdutos > 0);
      });
      if (hasValidMetrics || !(productGroups instanceof Map)) {
        return baseSummary;
      }
      return aggregateLeadershipPartnershipByYear(productGroups);
    }

    function renderLeadershipPartnershipYearChart(summary, productGroups = null) {
      if (!chartLiderancaParceriaAnos) return;
      const chartSummary = buildLeadershipPartnershipYearChartSummary(summary, productGroups);
      if (!chartSummary.length) {
        chartLiderancaParceriaAnos.innerHTML = `<p class="chart-note">Sem dados para o gráfico.</p>`;
        return;
      }
      const normalizedSummary = chartSummary.map((item) => {
        const rawMedia = Number(item.parceirosMedios);
        const fallbackMedia = Number(item.totalProdutos)
          ? Number(item.parceirosTotal || 0) / Number(item.totalProdutos || 1)
          : 0;
        return {
          ...item,
          parceirosMediosNormalizado: Number.isFinite(rawMedia) && rawMedia > 0 ? rawMedia : fallbackMedia,
        };
      });
      const maxPartners = Math.max(...normalizedSummary.map((item) => item.parceirosMediosNormalizado), 1);
      const maxInternal = Math.max(...normalizedSummary.map((item) => item.produtosInternos), 1);
      const width = 780;
      const height = 330;
      const left = 52;
      const baseY = 266;
      const gap = 20;
      const barWidth = Math.max(34, Math.floor((width - left - 20 - ((normalizedSummary.length - 1) * gap)) / normalizedSummary.length));
      chartLiderancaParceriaAnos.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolução temporal da cooperação autoral">
          <line x1="${left}" y1="${baseY}" x2="${width - 16}" y2="${baseY}" stroke="#cfc4b3" stroke-width="2"></line>
          ${normalizedSummary.map((item, index) => {
            const x = left + 10 + index * (barWidth + gap);
            const barHeight = Math.max(10, Math.round((item.parceirosMediosNormalizado / maxPartners) * 168));
            const y = baseY - barHeight;
            const dotY = baseY - ((item.produtosInternos / maxInternal) * 182);
            return `
              <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="10" fill="#d4a017"></rect>
              <circle cx="${x + (barWidth / 2)}" cy="${dotY}" r="6" fill="#8c1538"></circle>
              <text x="${x + (barWidth / 2)}" y="${y - 8}" text-anchor="middle" fill="#6d727c" font-size="11">${formatDecimal(item.parceirosMediosNormalizado)}</text>
              <text x="${x + (barWidth / 2)}" y="${dotY - 10}" text-anchor="middle" fill="#8c1538" font-size="11">${item.produtosInternos}</text>
              <text x="${x + (barWidth / 2)}" y="${baseY + 18}" text-anchor="middle" fill="#262930" font-size="12">${item.ano}</text>
            `;
          }).join("")}
          <text x="${width / 2}" y="${height - 12}" text-anchor="middle" fill="#262930" font-size="12">Barras: parceiros médios por produto · Pontos: produtos com integração interna</text>
        </svg>
      `;
    }

    function splitNetworkLabel(name, maxChars = 22) {
      const tokens = String(name || "").trim().split(/\s+/).filter(Boolean);
      if (!tokens.length) return [""];
      const lines = [];
      let current = "";
      for (const token of tokens) {
        const next = current ? `${current} ${token}` : token;
        if (next.length <= maxChars || !current) {
          current = next;
          continue;
        }
        lines.push(current);
        current = token;
      }
      if (current) lines.push(current);
      if (lines.length <= 2) return lines;
      return [lines[0], lines.slice(1).join(" ")];
    }

    function renderLeadershipPartnershipNetwork(network) {
      if (!chartLiderancaParceriaRede) return;
      if (!network.edges.length) {
        chartLiderancaParceriaRede.innerHTML = `<p class="chart-note">Sem vínculos internos entre docentes para a rede na base atual.</p>`;
        return;
      }
      const width = 980;
      const height = 620;
      const centerX = width / 2;
      const centerY = 292;
      const radius = 178;
      const labelRadius = 246;
      const sortedNodes = [...network.nodes].sort((a, b) => b.value - a.value || b.parceirosOcorrencias - a.parceirosOcorrencias || a.id.localeCompare(b.id, "pt-BR"));
      const maxEdge = Math.max(...network.edges.map((edge) => edge.weight), 1);
      const maxNode = Math.max(...sortedNodes.map((node) => Math.max(node.value, 1)), 1);
      const positionedNodes = sortedNodes.map((node, index) => {
        const angle = ((Math.PI * 2) / sortedNodes.length) * index - (Math.PI / 2);
        const labelX = centerX + (Math.cos(angle) * labelRadius);
        const labelY = centerY + (Math.sin(angle) * labelRadius);
        const textAnchor = Math.cos(angle) > 0.2 ? "start" : Math.cos(angle) < -0.2 ? "end" : "middle";
        const labelLines = splitNetworkLabel(node.id, 22);
        return {
          ...node,
          angle,
          x: centerX + (Math.cos(angle) * radius),
          y: centerY + (Math.sin(angle) * radius),
          r: 10 + ((Math.max(node.value, 1) / maxNode) * 14),
          labelX,
          labelY,
          textAnchor,
          labelLines,
        };
      });
      const positionMap = new Map(positionedNodes.map((node) => [node.id, node]));
      chartLiderancaParceriaRede.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Rede de cooperação entre docentes">
          <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="24" fill="#fbf7f1" stroke="#dfd2c2"></rect>
          ${network.edges.map((edge) => {
            const source = positionMap.get(edge.source);
            const target = positionMap.get(edge.target);
            if (!source || !target) return "";
            const stroke = 2 + ((edge.weight / maxEdge) * 6);
            return `<line class="network-edge-link" data-source="${escapeHtml(edge.source)}" data-target="${escapeHtml(edge.target)}" x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="#9b2b44" stroke-opacity="0.42" stroke-width="${stroke}" stroke-linecap="round"></line>`;
          }).join("")}
          ${positionedNodes.map((node) => {
            const connectorStartX = node.x + (Math.cos(node.angle) * (node.r + 3));
            const connectorStartY = node.y + (Math.sin(node.angle) * (node.r + 3));
            const connectorEndX = node.labelX - (node.textAnchor === "start" ? 8 : node.textAnchor === "end" ? -8 : 0);
            const connectorEndY = node.labelY - 4;
            return `
              <line x1="${connectorStartX}" y1="${connectorStartY}" x2="${connectorEndX}" y2="${connectorEndY}" stroke="#d8c1c7" stroke-width="1.4"></line>
            `;
          }).join("")}
          ${positionedNodes.map((node) => `
            <circle cx="${node.x}" cy="${node.y}" r="${node.r}" fill="${node.value > 0 ? "#8c1538" : "#d4a017"}" stroke="#fff8f2" stroke-width="3"></circle>
            <text x="${node.labelX}" y="${node.labelY}" text-anchor="${node.textAnchor}" fill="#2e3138" font-size="12">
              ${node.labelLines.map((line, index) => `<tspan x="${node.labelX}" dy="${index === 0 ? 0 : 14}">${escapeHtml(line)}</tspan>`).join("")}
            </text>
          `).join("")}
        </svg>
        <p class="chart-note">Leitura da rede: tamanho do nó = quantidade de conexões internas do docente; espessura da aresta = número de produtos compartilhados; clique na aresta para abrir as obras do vínculo.</p>
      `;
    }

    function updateLeadershipDetailSortButtons() {
      liderancaDetailSortButtons.forEach((button) => {
        const isActive = button.dataset.liderancaDetailSort === liderancaDetailSort.key;
        button.classList.toggle("active", isActive);
        const baseLabel = button.dataset.liderancaDetailSortLabel || button.textContent.replace(/[↑↓]\s*$/, "").trim();
        button.dataset.liderancaDetailSortLabel = baseLabel;
        button.textContent = isActive
          ? `${baseLabel} ${liderancaDetailSort.direction === "asc" ? "↑" : "↓"}`
          : baseLabel;
      });
    }

    function getLeadershipDetailSortValue(item, score, key) {
      switch (key) {
        case "ano":
          return Number(item.ano) || 0;
        case "tipo":
          return typeLabels[item.tipo_producao] || item.tipo_producao || "";
        case "autores":
          return item.autores || item.autor_principal || "";
        case "posicao":
          return score.label;
        case "peso":
          return Number(score.score) || 0;
        case "titulo":
          return item.titulo || "";
        case "docente":
        default:
          return item.docente || "";
      }
    }

    function compareLeadershipDetailRows(left, right) {
      const leftValue = getLeadershipDetailSortValue(left.item, left.score, liderancaDetailSort.key);
      const rightValue = getLeadershipDetailSortValue(right.item, right.score, liderancaDetailSort.key);
      let comparison = 0;
      if (typeof leftValue === "number" && typeof rightValue === "number") {
        comparison = leftValue - rightValue;
      } else {
        comparison = String(leftValue).localeCompare(String(rightValue), "pt-BR", { numeric: true, sensitivity: "base" });
      }
      if (comparison === 0) comparison = left.index - right.index;
      return liderancaDetailSort.direction === "asc" ? comparison : -comparison;
    }

    function renderLeadershipDetailTable(data) {
      updateLeadershipDetailSortButtons();
      const rows = data.map((item, index) => ({
        item,
        score: getMostardScore(item),
        index,
      })).sort(compareLeadershipDetailRows);
      liderancaDetalheBody.innerHTML = rows.map(({ item, score }) => {
        return `
          <tr>
            <td>${item.docente || ""}</td>
            <td>${item.ano || ""}</td>
            <td>${typeLabels[item.tipo_producao] || item.tipo_producao || ""}</td>
            <td><span class="lideranca-authors-text">${item.autores || item.autor_principal || ""}</span></td>
            <td>${score.label}</td>
            <td>${formatDecimal(score.score)}</td>
            <td>${item.titulo || ""}</td>
          </tr>
        `;
      }).join("");
      liderancaEstadoVazio.style.display = data.length ? "none" : "block";
    }

    function bindLeadershipDetailSortToggles() {
      liderancaDetailSortButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const key = button.dataset.liderancaDetailSort || "docente";
          if (liderancaDetailSort.key === key) {
            liderancaDetailSort.direction = liderancaDetailSort.direction === "asc" ? "desc" : "asc";
          } else {
            liderancaDetailSort = { key, direction: "asc" };
          }
          applyLeadershipFilters();
        });
      });
      updateLeadershipDetailSortButtons();
    }

    function applyLeadershipFilters() {
      const filtered = getFilteredScientificData();
      const docenteSummary = aggregateMostardByDocente(filtered);
      const yearSummary = aggregateMostardByYear(filtered);
      const qualitySummary = aggregateLeadershipQualityByDocente(filtered);
      const qualityTotals = aggregateLeadershipQualityTotals(filtered);
      const partnershipProductGroups = buildLeadershipProductGroups(filtered);
      const partnershipSummary = aggregateLeadershipPartnershipByDocente(filtered, partnershipProductGroups);
      const partnershipTotals = aggregateLeadershipPartnershipTotals(partnershipSummary, partnershipProductGroups, filtered);
      const partnershipYearSummary = aggregateLeadershipPartnershipByYear(partnershipProductGroups);
      const partnershipNetwork = buildLeadershipPartnershipNetwork(partnershipSummary, partnershipProductGroups);
      liderancaParceriaAuditState = buildLeadershipIntegratedWorksAudit(partnershipProductGroups);
      renderLeadershipMetrics(filtered, docenteSummary, yearSummary);
      renderLeadershipDocenteChart(docenteSummary);
      renderLeadershipWeightedChart(docenteSummary);
      renderLeadershipScatterChart(docenteSummary);
      renderLeadershipYearChart(yearSummary);
      renderLeadershipDocentesTable(docenteSummary);
      renderLeadershipYearTable(yearSummary);
      renderLeadershipQualityMetrics(qualitySummary, qualityTotals);
      renderLeadershipQualityJcrChart(qualitySummary);
      renderLeadershipQualityApcnChart(qualityTotals);
      renderLeadershipQualityTable(qualitySummary);
      renderLeadershipPartnershipMetrics(partnershipSummary, partnershipTotals, partnershipYearSummary, partnershipNetwork);
      renderLeadershipPartnershipDocenteChart(partnershipSummary);
      renderLeadershipPartnershipYearChart(partnershipYearSummary, partnershipProductGroups);
      renderLeadershipPartnershipNetwork(partnershipNetwork);
      renderLeadershipDetailTable(filtered);
    }

    function aggregateOrientationTotals(data) {
      return data.reduce((acc, item) => {
        acc.docentes += 1;
        acc.andamentoApcn += item.total_andamento_apcn || 0;
        acc.concluidasApcn += item.total_concluidas_apcn || 0;
        acc.baseConcluida += (item.tcc_concluidas || 0) + (item.ic_concluidas || 0);
        acc.mestradoAndamento += item.mestrado_andamento || 0;
        acc.mestradoConcluidas += item.mestrado_concluidas || 0;
        acc.doutoradoAndamento += item.doutorado_andamento || 0;
        acc.doutoradoAndamentoPrincipal += item.doutorado_andamento_principal || 0;
        acc.doutoradoConcluidas += item.doutorado_concluidas || 0;
        acc.doutoradoConcluidasPrincipal += item.doutorado_concluidas_principal || 0;
        acc.concluintes2026 += (item.mestrado_concluintes_2026 || 0) + (item.doutorado_concluintes_2026 || 0) + (item.posdoc_concluintes_2026 || 0);
        acc.posdocConcluidas += item.posdoc_concluidas || 0;
        return acc;
      }, {
        docentes: 0,
        andamentoApcn: 0,
        concluidasApcn: 0,
        baseConcluida: 0,
        mestradoAndamento: 0,
        mestradoConcluidas: 0,
        doutoradoAndamento: 0,
        doutoradoAndamentoPrincipal: 0,
        doutoradoConcluidas: 0,
        doutoradoConcluidasPrincipal: 0,
        concluintes2026: 0,
        posdocConcluidas: 0,
      });
    }

    function renderOrientationMetrics(data) {
      const totals = aggregateOrientationTotals(data);
      document.getElementById("orientacoes-mestrado-andamento-total").textContent = String(totals.mestradoAndamento);
      document.getElementById("orientacoes-mestrado-concluido-total").textContent = String(totals.mestradoConcluidas);
      document.getElementById("orientacoes-doutorado-andamento-total").textContent = String(totals.doutoradoAndamento);
      document.getElementById("orientacoes-doutorado-concluido-total").textContent = String(totals.doutoradoConcluidas);

      const topApcn = [...data].sort((a, b) => b.total_geral_apcn - a.total_geral_apcn || a.docente.localeCompare(b.docente, "pt-BR"))[0];
      const topDoutorado = [...data].sort((a, b) =>
        ((b.doutorado_andamento || 0) + (b.doutorado_concluidas || 0)) -
        ((a.doutorado_andamento || 0) + (a.doutorado_concluidas || 0)) ||
        a.docente.localeCompare(b.docente, "pt-BR")
      )[0];
      const doutoradoAtivo = data.filter((item) => (item.doutorado_andamento || 0) > 0).length;
      const doutoradoPrincipalAtivo = data.filter((item) => (item.doutorado_andamento_principal || 0) > 0).length;
      const doutoradoPrincipalConcluido = data.filter((item) => (item.doutorado_concluidas_principal || 0) > 0).length;
      const diagnostico = totals.concluintes2026 === 0
        ? "Diagnóstico: a planilha recebida não registra concluintes em 2026 nas colunas APCN. Mantive os zeros explicitamente para evitar inferência indevida."
        : `Diagnóstico: há ${totals.concluintes2026} concluintes previstos para 2026 no recorte APCN.`;

      document.getElementById("orientacoes-insights").innerHTML = [
        topDoutorado ? `<span class="chip">Maior estoque de doutorado: <strong>${topDoutorado.docente}</strong> (${(topDoutorado.doutorado_andamento || 0) + (topDoutorado.doutorado_concluidas || 0)})</span>` : "",
        topApcn ? `<span class="chip">Maior APCN: <strong>${topApcn.docente}</strong> (${topApcn.total_geral_apcn})</span>` : "",
        `<span class="chip">Docentes com doutorado em andamento: <strong>${doutoradoAtivo}</strong></span>`,
        `<span class="chip">Doutorado em andamento como principal: <strong>${totals.doutoradoAndamentoPrincipal}</strong></span>`,
        `<span class="chip">Docentes com doutorado principal ativo: <strong>${doutoradoPrincipalAtivo}</strong></span>`,
        `<span class="chip">Docentes com doutorado concluído como principal: <strong>${doutoradoPrincipalConcluido}</strong></span>`,
      ].join("");
      document.getElementById("orientacoes-diagnostico").textContent = diagnostico;
    }

    function renderOrientationChart(data) {
      const items = [...data]
        .map((item) => ({
          docente: item.docente,
          ...getDoutoradoSeries(item),
        }))
        .filter((item) => item.total > 0)
        .sort((a, b) => a.docente.localeCompare(b.docente, "pt-BR"))
        .slice(0, 12);
      if (!items.length) {
        chartOrientacoesDocentes.innerHTML = `<p class="chart-note">Sem dados para o gráfico.</p>`;
        return;
      }
      const maxValue = Math.max(
        ...items.flatMap((item) => [
          item.andamentoCo,
          item.andamentoPrincipal,
          item.concluidasCo,
          item.concluidasPrincipal,
        ]),
        1
      );
      const rowHeight = 86;
      const height = items.length * rowHeight + 64;
      const labelWidth = 320;
      const chartWidth = 1080;
      const usableWidth = chartWidth - labelWidth - 170;
      chartOrientacoesDocentes.innerHTML = `
        <svg viewBox="0 0 ${chartWidth} ${height}" role="img" aria-label="Orientações de doutorado por docente">
          ${items.map((item, index) => {
            const y = 28 + index * rowHeight;
            const andamentoCoWidth = item.andamentoCo ? Math.max(8, (item.andamentoCo / maxValue) * usableWidth) : 0;
            const andamentoPrincipalWidth = item.andamentoPrincipal ? Math.max(8, (item.andamentoPrincipal / maxValue) * usableWidth) : 0;
            const concluidasCoWidth = item.concluidasCo ? Math.max(8, (item.concluidasCo / maxValue) * usableWidth) : 0;
            const concluidasPrincipalWidth = item.concluidasPrincipal ? Math.max(8, (item.concluidasPrincipal / maxValue) * usableWidth) : 0;
            return `
              <text x="0" y="${y + 18}" fill="rgba(255,250,243,0.96)" font-size="15" font-weight="600">${item.docente}</text>
              <rect x="${labelWidth}" y="${y}" width="${usableWidth}" height="16" rx="8" fill="rgba(255,250,243,0.16)"></rect>
              <rect x="${labelWidth}" y="${y}" width="${andamentoCoWidth}" height="16" rx="8" fill="var(--orientation-co-andamento)"></rect>
              <rect x="${labelWidth}" y="${y + 22}" width="${usableWidth}" height="16" rx="8" fill="rgba(255,250,243,0.16)"></rect>
              <rect x="${labelWidth}" y="${y + 22}" width="${andamentoPrincipalWidth}" height="16" rx="8" fill="var(--orientation-principal-andamento)"></rect>
              <rect x="${labelWidth}" y="${y + 44}" width="${usableWidth}" height="16" rx="8" fill="rgba(255,250,243,0.16)"></rect>
              <rect x="${labelWidth}" y="${y + 44}" width="${concluidasCoWidth}" height="16" rx="8" fill="var(--orientation-co-concluida)"></rect>
              <rect x="${labelWidth}" y="${y + 66}" width="${usableWidth}" height="16" rx="8" fill="rgba(255,250,243,0.16)"></rect>
              <rect x="${labelWidth}" y="${y + 66}" width="${concluidasPrincipalWidth}" height="16" rx="8" fill="var(--orientation-principal-concluida)"></rect>
            `;
          }).join("")}
        </svg>
      `;
    }

    function renderOrientationStrictoTable(data) {
      orientacoesStrictoBody.innerHTML = data
        .slice()
        .sort((a, b) => b.total_geral_apcn - a.total_geral_apcn || ((b.doutorado_andamento_co || 0) + (b.doutorado_andamento_principal || 0)) - ((a.doutorado_andamento_co || 0) + (a.doutorado_andamento_principal || 0)) || a.docente.localeCompare(b.docente, "pt-BR"))
        .map((item) => `
        <tr>
          <td>${item.docente}</td>
          <td>${formatOrientationValue(item.mestrado_andamento)}</td>
          <td>${formatOrientationValue(item.mestrado_concluidas)}</td>
          <td class="numeric-soft">${formatOrientationValue(item.doutorado_andamento_co)}</td>
          <td class="numeric-soft">${formatOrientationValue(item.doutorado_andamento_principal)}</td>
          <td class="numeric-soft">${formatOrientationValue(item.doutorado_concluintes_2026)}</td>
          <td class="numeric-soft">${formatOrientationValue(item.doutorado_concluidas_co)}</td>
          <td class="numeric-soft">${formatOrientationValue(item.doutorado_concluidas_principal)}</td>
          <td class="numeric-strong">${formatOrientationValue(item.total_andamento_apcn)}</td>
          <td class="numeric-strong">${formatOrientationValue(item.total_concluidas_apcn)}</td>
          <td class="numeric-strong">${formatOrientationValue(item.total_concluidas_d)}</td>
          <td class="numeric-strong">${formatOrientationValue(item.total_concluintes_2026_apcn)}</td>
          <td class="numeric-strong">${formatOrientationValue(item.total_geral_apcn)}</td>
        </tr>
      `).join("");
    }

    function renderOrientationGraduationTable(data) {
      orientacoesGraduacaoBody.innerHTML = data
        .slice()
        .sort((a, b) =>
          ((b.tcc_concluidas || 0) + (b.ic_concluidas || 0)) -
          ((a.tcc_concluidas || 0) + (a.ic_concluidas || 0)) ||
          a.docente.localeCompare(b.docente, "pt-BR")
        )
        .map((item) => {
          const totalBase = (item.tcc_concluidas || 0) + (item.ic_concluidas || 0);
          return `
        <tr>
          <td>${item.docente}</td>
          <td>${formatOrientationValue(item.tcc_andamento)}</td>
          <td>${formatOrientationValue(item.tcc_concluidas)}</td>
          <td>${formatOrientationValue(item.ic_andamento)}</td>
          <td>${formatOrientationValue(item.ic_concluidas)}</td>
          <td class="numeric-strong">${formatOrientationValue(totalBase)}</td>
        </tr>
      `;
        }).join("");
    }

    function renderOrientationPosdocTable(data) {
      orientacoesPosdocBody.innerHTML = data
        .slice()
        .filter((item) =>
          (item.posdoc_andamento || 0) > 0 ||
          (item.posdoc_concluintes_2026 || 0) > 0 ||
          (item.posdoc_concluidas || 0) > 0
        )
        .sort((a, b) =>
          ((b.posdoc_andamento || 0) + (b.posdoc_concluidas || 0)) -
          ((a.posdoc_andamento || 0) + (a.posdoc_concluidas || 0)) ||
          a.docente.localeCompare(b.docente, "pt-BR")
        )
        .map((item) => {
          const totalPosdoc = (item.posdoc_andamento || 0) + (item.posdoc_concluidas || 0);
          return `
        <tr>
          <td>${item.docente}</td>
          <td>${formatOrientationValue(item.posdoc_andamento)}</td>
          <td>${formatOrientationValue(item.posdoc_concluintes_2026)}</td>
          <td>${formatOrientationValue(item.posdoc_concluidas)}</td>
          <td class="numeric-strong">${formatOrientationValue(totalPosdoc)}</td>
        </tr>
      `;
        }).join("");
    }

    function renderOrientationPanel() {
      renderOrientationMetrics(dataSourceOrientacoes);
      renderOrientationChart(dataSourceOrientacoes);
      renderOrientationStrictoTable(dataSourceOrientacoes);
      renderOrientationGraduationTable(dataSourceOrientacoes);
      renderOrientationPosdocTable(dataSourceOrientacoes);
    }

    function aggregateProductivityCriteria(data) {
      const grouped = new Map();
      for (const item of data) {
        if (!item.docente) continue;
        if (!grouped.has(item.docente)) {
          grouped.set(item.docente, {
            docente: item.docente,
            pontuacao: 0,
            total: 0,
            hasJcr: false,
            hasQ1Q2: false,
          });
        }
        const row = grouped.get(item.docente);
        row.pontuacao += Number(item.pontuacao) || 0;
        row.total += 1;
        const indexacao = String(item.indexacao || "");
        const quartil = String(item.quartil_jcr_2025 || "").toUpperCase().trim();
        const jif = String(item.jif_jcr_2025 || "").trim();
        if (indexacao.includes("Web of Science (JCR)") || jif) {
          row.hasJcr = true;
        }
        if (quartil === "Q1" || quartil === "Q2") {
          row.hasQ1Q2 = true;
        }
      }

      const docentes = [...grouped.values()]
        .map((item) => ({
          ...item,
          criterio1: item.pontuacao >= 330,
          criterio2: item.hasJcr || item.hasQ1Q2,
        }))
        .sort((a, b) => b.pontuacao - a.pontuacao || a.docente.localeCompare(b.docente, "pt-BR"));

      const totalDocentes = docentes.length;
      const minimo = Math.ceil(totalDocentes * 0.75);
      const criterio1Atendidos = docentes.filter((item) => item.criterio1).length;
      const criterio2Atendidos = docentes.filter((item) => item.criterio2).length;

      return {
        totalDocentes,
        minimo,
        criterio1Atendidos,
        criterio2Atendidos,
        criterio1Percentual: totalDocentes ? Math.round((criterio1Atendidos / totalDocentes) * 100) : 0,
        criterio2Percentual: totalDocentes ? Math.round((criterio2Atendidos / totalDocentes) * 100) : 0,
        criterio1Pendentes: docentes.filter((item) => !item.criterio1),
        criterio2Pendentes: docentes.filter((item) => !item.criterio2),
        docentes,
      };
    }

    function renderProductivityCriteriaChart(summary) {
      const itens = [
        {
          criterio: "Critério 1",
          label: "75% com mais de 330 pts",
          atual: summary.criterio1Atendidos,
          minimo: summary.minimo,
          color: "var(--orientation-principal-andamento)",
        },
        {
          criterio: "Critério 2",
          label: "75% com JCR (SCimago | 2y cites per doc) ou Categoria A",
          atual: summary.criterio2Atendidos,
          minimo: summary.minimo,
          color: "var(--orientation-co-andamento)",
        },
      ];
      const maxValue = Math.max(summary.totalDocentes, summary.minimo, summary.criterio1Atendidos, summary.criterio2Atendidos, 1);
      const rowHeight = 82;
      const height = itens.length * rowHeight + 72;
      const chartWidth = 860;
      const labelWidth = 240;
      const usableWidth = chartWidth - labelWidth - 150;
      chartCriteriosProd.innerHTML = `
        <svg viewBox="0 0 ${chartWidth} ${height}" role="img" aria-label="Desempenho nos critérios de produtividade docente">
          ${itens.map((item, index) => {
            const y = 28 + index * rowHeight;
            const minimoWidth = Math.max(8, (item.minimo / maxValue) * usableWidth);
            const atualWidth = Math.max(8, (item.atual / maxValue) * usableWidth);
            return `
              <text x="0" y="${y + 16}" fill="#262930" font-size="15" font-weight="700">${item.criterio}</text>
              <text x="0" y="${y + 36}" fill="#6d727c" font-size="12">${item.label}</text>
              <rect x="${labelWidth}" y="${y}" width="${usableWidth}" height="18" rx="9" fill="#eee5d8"></rect>
              <rect x="${labelWidth}" y="${y}" width="${minimoWidth}" height="18" rx="9" fill="var(--orientation-principal-concluida)"></rect>
              <text x="${labelWidth + minimoWidth + 10}" y="${y + 14}" fill="#6d727c" font-size="12">mínimo ${item.minimo}</text>
              <rect x="${labelWidth}" y="${y + 28}" width="${usableWidth}" height="18" rx="9" fill="#eee5d8"></rect>
              <rect x="${labelWidth}" y="${y + 28}" width="${atualWidth}" height="18" rx="9" fill="${item.color}"></rect>
              <text x="${labelWidth + atualWidth + 10}" y="${y + 42}" fill="#6d727c" font-size="12">atual ${item.atual} docentes</text>
            `;
          }).join("")}
        </svg>
      `;
    }

    function updateCriteriaSortButtons() {
      if (criteriosSortPerformanceButton) {
        criteriosSortPerformanceButton.classList.toggle("active", criteriaDocentesSort === "performance");
      }
      if (criteriosSortAlphaButton) {
        criteriosSortAlphaButton.classList.toggle("active", criteriaDocentesSort === "alpha");
      }
    }

    function bindCriteriaSortButtons() {
      if (criteriosSortPerformanceButton) {
        criteriosSortPerformanceButton.addEventListener("click", () => {
          criteriaDocentesSort = "performance";
          renderProductivityCriteriaPanel();
        });
      }
      if (criteriosSortAlphaButton) {
        criteriosSortAlphaButton.addEventListener("click", () => {
          criteriaDocentesSort = "alpha";
          renderProductivityCriteriaPanel();
        });
      }
      updateCriteriaSortButtons();
    }

    function renderProductivityCriteriaDocentesTable(docentes) {
      const sortedDocentes = [...docentes].sort((a, b) => {
        if (criteriaDocentesSort === "alpha") {
          return a.docente.localeCompare(b.docente, "pt-BR");
        }
        return (
          b.pontuacao - a.pontuacao ||
          Number(b.criterio2) - Number(a.criterio2) ||
          Number(b.criterio1) - Number(a.criterio1) ||
          a.docente.localeCompare(b.docente, "pt-BR")
        );
      });

      document.getElementById("criterios-docentes-body").innerHTML = sortedDocentes.map((item) => `
        <tr>
          <td>${item.docente}</td>
          <td>${item.pontuacao}</td>
          <td><span class="criteria-status ${item.criterio1 ? "ok" : "risk"}">${item.criterio1 ? "Atende" : "Não atende"}</span></td>
          <td>${item.hasJcr ? "Sim" : "Não"}</td>
          <td>${item.hasQ1Q2 ? "Sim" : "Não"}</td>
          <td><span class="criteria-status ${item.criterio2 ? "ok" : "risk"}">${item.criterio2 ? "Atende" : "Não atende"}</span></td>
        </tr>
      `).join("");
      updateCriteriaSortButtons();
    }

    function aggregateOrientationCriticalCriteria(data) {
      const totalDocentes = data.length;
      const graduacaoAtendidos = data.filter((item) => ((item.tcc_concluidas || 0) + (item.ic_concluidas || 0)) > 0).length;
      const mestradoAtendidos = data.filter((item) => (item.mestrado_concluidas || 0) > 0).length;
      const doutoradoAtendidos = data.filter((item) => (item.doutorado_concluidas_principal || 0) > 0).length;

      return {
        totalDocentes,
        graduacaoAtendidos,
        graduacaoPercentual: totalDocentes ? Math.round((graduacaoAtendidos / totalDocentes) * 100) : 0,
        mestradoAtendidos,
        doutoradoAtendidos,
      };
    }

    function aggregateDocenciaCriticalCriteria(data) {
      const docenteSummary = aggregateDisciplinasByDocente(data);
      const totalDocentes = docenteSummary.length;
      const atendidos = docenteSummary.filter((item) => item.ofertas >= 1).length;
      return {
        totalDocentes,
        atendidos,
        percentual: totalDocentes ? Math.round((atendidos / totalDocentes) * 100) : 0,
      };
    }

    function renderOrientationCriteriaChart(summary) {
      const itens = [
        {
          criterio: "Graduação concluída",
          label: "100% com orientação de graduação concluída",
          atual: summary.graduacaoAtendidos,
          minimo: summary.totalDocentes,
          color: "#8c1538",
        },
        {
          criterio: "Mestrado concluído",
          label: "≥ 9 docentes com orientação concluída em mestrado",
          atual: summary.mestradoAtendidos,
          minimo: 9,
          color: "#426132",
        },
        {
          criterio: "Doutorado principal",
          label: "≥ 3 docentes com orientação concluída em doutorado como principal",
          atual: summary.doutoradoAtendidos,
          minimo: 3,
          color: "#d4a017",
        },
      ];
      const maxValue = Math.max(summary.totalDocentes, summary.graduacaoAtendidos, summary.mestradoAtendidos, summary.doutoradoAtendidos, 9, 3, 1);
      const rowHeight = 82;
      const height = itens.length * rowHeight + 72;
      const chartWidth = 860;
      const labelWidth = 240;
      const usableWidth = chartWidth - labelWidth - 150;
      chartCriteriosOrient.innerHTML = `
        <svg viewBox="0 0 ${chartWidth} ${height}" role="img" aria-label="Desempenho nos critérios de orientação">
          ${itens.map((item, index) => {
            const y = 28 + index * rowHeight;
            const minimoWidth = Math.max(8, (item.minimo / maxValue) * usableWidth);
            const atualWidth = Math.max(8, (item.atual / maxValue) * usableWidth);
            return `
              <text x="0" y="${y + 16}" fill="#262930" font-size="15" font-weight="700">${item.criterio}</text>
              <text x="0" y="${y + 36}" fill="#6d727c" font-size="12">${item.label}</text>
              <rect x="${labelWidth}" y="${y}" width="${usableWidth}" height="18" rx="9" fill="#eee5d8"></rect>
              <rect x="${labelWidth}" y="${y}" width="${minimoWidth}" height="18" rx="9" fill="#d4a017"></rect>
              <text x="${labelWidth + minimoWidth + 10}" y="${y + 14}" fill="#6d727c" font-size="12">mínimo ${item.minimo}</text>
              <rect x="${labelWidth}" y="${y + 28}" width="${usableWidth}" height="18" rx="9" fill="#eee5d8"></rect>
              <rect x="${labelWidth}" y="${y + 28}" width="${atualWidth}" height="18" rx="9" fill="${item.color}"></rect>
              <text x="${labelWidth + atualWidth + 10}" y="${y + 42}" fill="#6d727c" font-size="12">atual ${item.atual} docentes</text>
            `;
          }).join("")}
        </svg>
      `;
    }

    function renderOrientationCriticalCriteriaPanel() {
      const summary = aggregateOrientationCriticalCriteria(dataSourceOrientacoes);
      const graduacaoOk = summary.graduacaoAtendidos === summary.totalDocentes;
      const mestradoOk = summary.mestradoAtendidos >= 9;
      const doutoradoOk = summary.doutoradoAtendidos >= 3;

      document.getElementById("orient-crit-docentes-total").textContent = String(summary.totalDocentes);
      document.getElementById("orient-crit-graduacao-percentual").textContent = `${summary.graduacaoPercentual}%`;
      document.getElementById("orient-crit-graduacao-resumo").textContent = `${summary.graduacaoAtendidos} de ${summary.totalDocentes} docentes com orientação de graduação concluída.`;
      document.getElementById("orient-crit-mestrado-total").textContent = String(summary.mestradoAtendidos);
      document.getElementById("orient-crit-mestrado-resumo").textContent = `${summary.mestradoAtendidos} docentes com orientação concluída em mestrado.`;
      document.getElementById("orient-crit-doutorado-total").textContent = String(summary.doutoradoAtendidos);
      document.getElementById("orient-crit-doutorado-resumo").textContent = `${summary.doutoradoAtendidos} docentes com orientação concluída em doutorado como principal.`;

      renderOrientationCriteriaChart(summary);

      document.getElementById("orient-crit-summary-cards").innerHTML = [
        `
          <div class="criteria-score">
            <div>
              <div>Graduação concluída</div>
              <strong>${summary.graduacaoAtendidos}/${summary.totalDocentes}</strong>
            </div>
            <span class="criteria-status ${graduacaoOk ? "ok" : "risk"}">${graduacaoOk ? "Atende" : "Atenção"}</span>
          </div>
        `,
        `
          <div class="criteria-score">
            <div>
              <div>Mestrado concluído</div>
              <strong>${summary.mestradoAtendidos}</strong>
            </div>
            <span class="criteria-status ${mestradoOk ? "ok" : "risk"}">${mestradoOk ? "Atende" : "Atenção"}</span>
          </div>
        `,
        `
          <div class="criteria-score">
            <div>
              <div>Doutorado principal</div>
              <strong>${summary.doutoradoAtendidos}</strong>
            </div>
            <span class="criteria-status ${doutoradoOk ? "ok" : "risk"}">${doutoradoOk ? "Atende" : "Atenção"}</span>
          </div>
        `,
      ].join("");

      document.getElementById("orient-crit-insights").innerHTML = [
        `<span class="chip">Graduação concluída: <strong>${summary.graduacaoAtendidos}/${summary.totalDocentes}</strong></span>`,
        `<span class="chip">Mestrado concluído: <strong>${summary.mestradoAtendidos}</strong> docentes frente ao mínimo de <strong>9</strong></span>`,
        `<span class="chip">Doutorado principal: <strong>${summary.doutoradoAtendidos}</strong> docentes frente ao mínimo de <strong>3</strong></span>`,
      ].join("");

      document.getElementById("orient-crit-metodologia").textContent = "Metodologia: graduação concluída considera pelo menos uma orientação concluída em TCC ou IC. Mestrado considera apenas docentes com pelo menos uma orientação concluída em mestrado. Doutorado considera apenas docentes com orientação concluída em doutorado como principal.";

      document.getElementById("orient-crit-resumo-body").innerHTML = [
        `
          <tr>
            <td>Orientação</td>
            <td>Experiência de orientação</td>
            <td>100% com orientação de graduação concluída</td>
            <td>${summary.graduacaoAtendidos}/${summary.totalDocentes} docentes (${summary.graduacaoPercentual}%)</td>
            <td><span class="criteria-status ${graduacaoOk ? "ok" : "risk"}">${graduacaoOk ? "Atende" : "Não atende"}</span></td>
            <td>${graduacaoOk ? "Todos os docentes possuem orientação de graduação concluída." : `Há ${summary.totalDocentes - summary.graduacaoAtendidos} docente(s) sem registro concluído em graduação.`}</td>
          </tr>
        `,
        `
          <tr>
            <td>Orientação</td>
            <td>Doutorado</td>
            <td>≥ 9 docentes com orientação concluída em mestrado</td>
            <td>${summary.mestradoAtendidos} docentes</td>
            <td><span class="criteria-status ${mestradoOk ? "ok" : "risk"}">${mestradoOk ? "Atende" : "Não atende"}</span></td>
            <td>${mestradoOk ? `Supera o mínimo em ${summary.mestradoAtendidos - 9} docente(s).` : `Faltam ${9 - summary.mestradoAtendidos} docente(s) para o mínimo.`}</td>
          </tr>
        `,
        `
          <tr>
            <td>Orientação</td>
            <td>Doutorado</td>
            <td>≥ 3 com orientação concluída em doutorado como principal</td>
            <td>${summary.doutoradoAtendidos} docentes</td>
            <td><span class="criteria-status ${doutoradoOk ? "ok" : "risk"}">${doutoradoOk ? "Atende" : "Não atende"}</span></td>
            <td>${doutoradoOk ? `Supera o mínimo em ${summary.doutoradoAtendidos - 3} docente(s).` : `Faltam ${3 - summary.doutoradoAtendidos} docente(s) para o mínimo.`}</td>
          </tr>
        `,
      ].join("");
    }

    function renderDocenciaCriticalCriteriaPanel() {
      const summary = aggregateDocenciaCriticalCriteria(getDisciplinasBaseData());
      const docenciaOk = summary.totalDocentes > 0 && summary.atendidos === summary.totalDocentes;

      document.getElementById("docencia-crit-docentes-total").textContent = String(summary.totalDocentes);
      document.getElementById("docencia-crit-atendidos-total").textContent = String(summary.atendidos);
      document.getElementById("docencia-crit-percentual").textContent = `${summary.percentual}%`;
      document.getElementById("docencia-crit-atendidos-resumo").textContent = `${summary.atendidos} docentes com pelo menos uma disciplina na base.`;
      document.getElementById("docencia-crit-percentual-resumo").textContent = `${summary.atendidos} de ${summary.totalDocentes} docentes atendem ao marcador.`;

      docenciaCritSummaryCards.innerHTML = `
        <div class="criteria-score">
          <div>
            <div>Participação em disciplinas</div>
            <strong>${summary.atendidos}/${summary.totalDocentes}</strong>
          </div>
          <span class="criteria-status ${docenciaOk ? "ok" : "risk"}">${docenciaOk ? "Atende" : "Atenção"}</span>
        </div>
      `;

      docenciaCritInsights.innerHTML = [
        `<span class="chip">Docência: <strong>${summary.atendidos}/${summary.totalDocentes}</strong> docentes com pelo menos uma disciplina</span>`,
      ].join("");

      document.getElementById("docencia-crit-metodologia").textContent = "Metodologia: o marcador considera a base de disciplinas do dashboard e contabiliza atendimento quando o docente possui pelo menos uma oferta de disciplina registrada no recorte disponível.";

      document.getElementById("docencia-crit-resumo-body").innerHTML = `
        <tr>
          <td>Docência</td>
          <td>Participação dos docentes em disciplinas</td>
          <td>Mínimo 1 por docente</td>
          <td>${summary.atendidos}/${summary.totalDocentes} docentes (${summary.percentual}%)</td>
          <td><span class="criteria-status ${docenciaOk ? "ok" : "risk"}">${docenciaOk ? "Atende" : "Não atende"}</span></td>
          <td>${docenciaOk ? "Todos os docentes da base de disciplinas possuem pelo menos uma oferta registrada." : `Há ${summary.totalDocentes - summary.atendidos} docente(s) sem oferta registrada na base de disciplinas.`}</td>
        </tr>
      `;
    }

    function renderCooperationCriticalCriteriaPanel() {
      const filtered = getFilteredScientificData();
      const partnershipProductGroups = buildLeadershipProductGroups(filtered);
      const partnershipSummary = aggregateLeadershipPartnershipByDocente(filtered, partnershipProductGroups);
      const partnershipTotals = aggregateLeadershipPartnershipTotals(partnershipSummary, partnershipProductGroups, filtered);
      const partnershipYearSummary = aggregateLeadershipPartnershipByYear(partnershipProductGroups);
      const partnershipNetwork = buildLeadershipPartnershipNetwork(partnershipSummary, partnershipProductGroups);
      liderancaParceriaAuditState = buildLeadershipIntegratedWorksAudit(partnershipProductGroups);

      renderLeadershipPartnershipMetrics(partnershipSummary, partnershipTotals, partnershipYearSummary, partnershipNetwork);
      renderLeadershipPartnershipDocenteChart(partnershipSummary);
      renderLeadershipPartnershipYearChart(partnershipYearSummary, partnershipProductGroups);
      renderLeadershipPartnershipNetwork(partnershipNetwork);
    }

    function aggregateCaptacaoCriticalCriteria() {
      const baseDocentes = [...captacaoPermanentDocenteMeta]
        .map((item) => item.docente)
        .sort((a, b) => a.localeCompare(b, "pt-BR"));
      const baseDocenteKeys = new Set(captacaoPermanentDocenteMeta.map((item) => item.key));
      const relevantRows = getCaptacaoRelevantRows(dataSourceCaptacao).filter((item) => {
        const key = normalizeDisciplinasName(item.docente);
        return baseDocenteKeys.has(key);
      });
      const docenteMap = new Map();
      const statusMap = new Map();
      let totalValor = 0;
      let totalAlertas = 0;
      const pqDocentes = new Set();
      const dtDocentes = new Set();
      const vigentesDocentes = new Set();

      const isStrategicPq = (item) => {
        const strategicText = [item.titulo, item.edital_nome, item.edital_numero, item.observacao_auditoria]
          .filter(Boolean)
          .join(" ")
          .toUpperCase();
        const blocked = /MESTRADO|INICIACAO|INICIAÇÃO|PIBIC|PIBITI|BOLSA DE MESTRADO/.test(strategicText);
        return Boolean(item.bolsa_produtividade) && !blocked;
      };

      const isStrategicDt = (item) => {
        const strategicText = [item.titulo, item.edital_nome, item.edital_numero, item.observacao_auditoria]
          .filter(Boolean)
          .join(" ")
          .toUpperCase();
        const blocked = /MESTRADO|INICIACAO|INICIAÇÃO|PIBIC|PIBITI|BOLSA DE MESTRADO/.test(strategicText);
        return Boolean(item.bolsa_desenvolvimento_tecnologico) && !blocked;
      };

      relevantRows.forEach((item) => {
        totalValor += Number(item.valor_total) || 0;
        totalAlertas += item.suspeita_duplicidade ? 1 : 0;
        statusMap.set(item.status, (statusMap.get(item.status) || 0) + 1);
        if (item.vigente_em_2026) vigentesDocentes.add(item.docente);
        if (item.vigente_em_2026 && isStrategicPq(item)) pqDocentes.add(item.docente);
        if (item.vigente_em_2026 && isStrategicDt(item)) dtDocentes.add(item.docente);
        if (!docenteMap.has(item.docente)) {
          docenteMap.set(item.docente, {
            docente: item.docente,
            registros: 0,
            valorTotal: 0,
            statuses: new Set(),
          });
        }
        const bucket = docenteMap.get(item.docente);
        bucket.registros += 1;
        bucket.valorTotal += Number(item.valor_total) || 0;
        bucket.statuses.add(item.status);
      });

      const docentesComCaptacao = [...docenteMap.values()]
        .map((item) => ({
          ...item,
          statuses: [...item.statuses].sort((a, b) => a.localeCompare(b, "pt-BR")),
        }))
        .sort((a, b) => b.registros - a.registros || b.valorTotal - a.valorTotal || a.docente.localeCompare(b.docente, "pt-BR"));

      const totalBase = baseDocentes.length;
      const totalDocentes = docentesComCaptacao.length;
      const percentual = totalBase ? Math.round((totalDocentes / totalBase) * 100) : 0;

      return {
        baseDocentes,
        totalBase,
        totalDocentes,
        percentual,
        totalRegistros: relevantRows.length,
        totalValor,
        totalAlertas,
        docentesVigentes: [...vigentesDocentes].sort((a, b) => a.localeCompare(b, "pt-BR")),
        docentesPq: [...pqDocentes].sort((a, b) => a.localeCompare(b, "pt-BR")),
        docentesDt: [...dtDocentes].sort((a, b) => a.localeCompare(b, "pt-BR")),
        docentesComCaptacao,
        statusSummary: [...statusMap.entries()]
          .map(([status, total]) => ({ status, total }))
          .sort((a, b) => b.total - a.total || a.status.localeCompare(b.status, "pt-BR")),
      };
    }

    function renderCaptacaoCriticalCriteriaChart(summary) {
      if (!chartCaptacaoCritDocentes) return;
      if (!summary.docentesComCaptacao.length) {
        chartCaptacaoCritDocentes.innerHTML = `<p class="chart-note">Sem registros de captação para o recorte atual.</p>`;
        return;
      }
      const items = summary.docentesComCaptacao.slice(0, 12);
      const width = 860;
      const rowHeight = 34;
      const topPadding = 18;
      const leftLabel = 280;
      const barArea = 300;
      const valueX = 610;
      const metaX = 740;
      const height = Math.max(240, items.length * rowHeight + 30);
      const maxRegistros = Math.max(...items.map((item) => item.registros), 1);

      chartCaptacaoCritDocentes.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Quantitativo de captações por docente">
          ${items.map((item, index) => {
            const y = topPadding + index * rowHeight;
            const barWidth = (item.registros / maxRegistros) * barArea;
            return `
              <text x="0" y="${y + 15}" fill="#262930" font-size="12">${escapeHtml(item.docente)}</text>
              <rect x="${leftLabel}" y="${y}" width="${barWidth}" height="18" rx="9" fill="#8c1538"></rect>
              <text x="${leftLabel + barWidth + 10}" y="${y + 14}" fill="#262930" font-size="12">${item.registros} registro(s)</text>
              <text x="${metaX}" y="${y + 14}" fill="#6d727c" font-size="11">${escapeHtml(formatCompactCurrency(item.valorTotal))}</text>
            `;
          }).join("")}
        </svg>
      `;
    }

    function renderCaptacaoCriticalCriteriaPanel() {
      const summary = aggregateCaptacaoCriticalCriteria();
      const topDocente = summary.docentesComCaptacao[0];
      const statusPrincipal = summary.statusSummary[0];

      document.getElementById("captacao-crit-base-total").textContent = String(summary.totalBase);
      document.getElementById("captacao-crit-docentes-total").textContent = String(summary.totalDocentes);
      document.getElementById("captacao-crit-percentual").textContent = `${summary.percentual}%`;
      document.getElementById("captacao-crit-pq-total").textContent = String(summary.docentesPq.length);
      document.getElementById("captacao-crit-docentes-resumo").textContent = `${summary.totalDocentes} docentes com pelo menos uma captação registrada.`;
      document.getElementById("captacao-crit-percentual-resumo").textContent = `${summary.totalDocentes} de ${summary.totalBase} docentes com captação de recursos.`;
      document.getElementById("captacao-crit-pq-resumo").textContent = `${summary.docentesPq.length} docente(s) com PQ estratégico vigente.`;

      captacaoCritSummaryCards.innerHTML = [
        `
          <div class="criteria-score">
            <div>
              <div>Docentes com captação</div>
              <strong>${summary.totalDocentes}/${summary.totalBase}</strong>
            </div>
            <span class="criteria-status ok">Exploratório</span>
          </div>
        `,
        `
          <div class="criteria-score">
            <div>
              <div>Carteira vigente em 2026</div>
              <strong>${summary.docentesVigentes.length}</strong>
            </div>
            <span class="criteria-status ok">${summary.docentesDt.length} DT</span>
          </div>
        `,
      ].join("");

      captacaoCritInsights.innerHTML = [
        `<span class="chip">Cobertura atual: <strong>${summary.totalDocentes}/${summary.totalBase}</strong> docentes (${summary.percentual}%)</span>`,
        `<span class="chip">Captação vigente em 2026: <strong>${summary.docentesVigentes.length}</strong> docente(s)</span>`,
        `<span class="chip">PQ estratégico vigente: <strong>${summary.docentesPq.length}</strong> docente(s)</span>`,
        `<span class="chip">DT estratégico vigente: <strong>${summary.docentesDt.length}</strong> docente(s)</span>`,
        topDocente ? `<span class="chip">Maior carteira: <strong>${topDocente.docente}</strong> (${topDocente.registros} registro(s) e ${formatCurrency(topDocente.valorTotal)})</span>` : "",
        statusPrincipal ? `<span class="chip">Situação mais frequente: <strong>${statusPrincipal.status}</strong> (${statusPrincipal.total} registro(s))</span>` : "",
        `<span class="chip">Valor total informado: <strong>${formatCurrency(summary.totalValor)}</strong></span>`,
      ].filter(Boolean).join("");

      document.getElementById("captacao-crit-metodologia").textContent = "Metodologia: a seção usa a base de docentes permanentes do ano de referência da aba de captação. Considera registros APCN 2022-2026, destaca vigência em 2026 e separa PQ/DT estratégicos com exclusão de bolsas ordinárias de mestrado e iniciação científica para evitar falso positivo.";

      document.getElementById("captacao-crit-resumo-body").innerHTML = [
        `
          <tr>
            <td>Captação</td>
            <td>Docentes com captação de recursos</td>
            <td>${summary.totalBase} docentes permanentes na base</td>
            <td>${summary.totalDocentes} docentes (${summary.percentual}%)</td>
            <td>Indicador preparado para futura parametrização de corte.</td>
          </tr>
        `,
        `
          <tr>
            <td>Captação</td>
            <td>Docentes com carteira vigente em 2026</td>
            <td>Docentes permanentes com captação ativa no ano de referência</td>
            <td>${summary.docentesVigentes.length} docente(s)</td>
            <td>${summary.docentesVigentes.length ? `Base ativa em 2026: ${summary.docentesVigentes.join(", ")}.` : "Nenhum docente com carteira vigente em 2026."}</td>
          </tr>
        `,
        `
          <tr>
            <td>Captação</td>
            <td>Docentes com PQ estratégico vigente</td>
            <td>Marcador crítico de maturidade em captação qualificada</td>
            <td>${summary.docentesPq.length} docente(s)</td>
            <td>${summary.docentesPq.length ? `PQ vigente identificado em: ${summary.docentesPq.join(", ")}.` : "Nenhum PQ estratégico vigente identificado."}</td>
          </tr>
        `,
        `
          <tr>
            <td>Captação</td>
            <td>Docentes com DT estratégico vigente</td>
            <td>Marcador complementar de desenvolvimento tecnológico</td>
            <td>${summary.docentesDt.length} docente(s)</td>
            <td>${summary.docentesDt.length ? `DT vigente identificado em: ${summary.docentesDt.join(", ")}.` : "Nenhum DT estratégico vigente identificado."}</td>
          </tr>
        `,
        ...summary.statusSummary.map((item) => `
          <tr>
            <td>Captação</td>
            <td>Registros na situação ${item.status}</td>
            <td>Base de captações elegíveis</td>
            <td>${item.total} registro(s)</td>
            <td>Composição operacional do portfólio atual de captação.</td>
          </tr>
        `),
      ].join("");

      renderCaptacaoCriticalCriteriaChart(summary);
    }

    const docentesCriteriaLabels = {
      permanentes_no_corpo: "Permanentes no corpo classificado",
      permanentes_internos: "Permanentes com vínculo com a IES",
      permanentes_exclusivos: "Permanentes exclusivos ao programa",
      permanentes_externos: "Permanentes externos",
      permanentes_colaboradores_outros_ppgs: "Permanentes colaboradores em outros PPGs",
      total_permanentes: "Dimensão do corpo permanente",
    };

    const docentesIssueLabels = {
      colabora_em_outro_ppg_2026: "Permanente com atuação como colaborador em outro PPG",
      nao_exclusivo_ao_programa_2026: "Permanente compartilhado com outros PPGs",
      permanente_externo_2026: "Permanente externo no ano-base",
      temporario_2026: "Docente temporário no ano-base",
      visitante_2026: "Docente visitante no ano-base",
      estabilidade_2025_abaixo_90: "Estabilidade anual de 2025 abaixo de 90%",
    };

    const docentesDashboardState = {
      year: dataSourceCorpoDocente.default_year || "2026",
      origin: "Todos",
      quadStatus: "A",
      search: "",
    };

    function formatDocentesShare(value) {
      if (value === null || value === undefined || value === "") {
        return "—";
      }
      return `${(Number(value) * 100).toFixed(1).replace(".", ",")}%`;
    }

    function formatDocentesCellValue(value) {
      if (value === null || value === undefined || value === "") {
        return "—";
      }
      if (typeof value === "number") {
        return Number.isInteger(value)
          ? String(value)
          : Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      }
      return String(value);
    }

    function getDocentesMetricStatus(metric) {
      if (!metric) {
        return { text: "Sem leitura", className: "docentes-status-fail" };
      }
      if (metric.passed) {
        return { text: "Atende", className: "docentes-status-pass" };
      }
      if (metric.condition === "justificavel_regional") {
        return { text: "Justificar", className: "docentes-status-fail" };
      }
      return { text: "Crítico", className: "docentes-status-fail" };
    }

    function getDocentesMetricValue(metricKey, metric) {
      if (!metric) {
        return "—";
      }
      return metricKey === "total_permanentes"
        ? String(metric.value)
        : formatDocentesShare(metric.value);
    }

    function getDocentesMetricTarget(metricKey, metric) {
      if (!metric) {
        return "Sem parâmetro";
      }
      if (metricKey === "total_permanentes") {
        return `Referência: ${metric.target} ou ${metric.fallback_min} com justificativa regional`;
      }
      return `${metric.direction === "min" ? "Mínimo" : "Máximo"}: ${formatDocentesShare(metric.target)}`;
    }

    function getDocentesBadge(status) {
      const normalized = String(status || "---").trim();
      const classMap = {
        Per: "per",
        Col: "col",
        Temp: "temp",
        Vis: "vis",
      };
      const labelMap = {
        Per: "Per",
        Col: "Col",
        Temp: "Temp",
        Vis: "Vis",
        "---": "—",
      };
      return `<span class="docentes-badge ${classMap[normalized] || ""}">${labelMap[normalized] || escapeHtml(normalized)}</span>`;
    }

    function getDocentesBoolBadge(value) {
      if (value === true) {
        return '<span class="docentes-bool yes">Sim</span>';
      }
      if (value === false) {
        return '<span class="docentes-bool no">Não</span>';
      }
      return '<span class="docentes-bool na">—</span>';
    }

    function getDocenteYearStatus(docente, yearKey = docentesDashboardState.year) {
      return String(docente?.anos?.[yearKey] || "---").trim();
    }

    function getDocenteYearStatusLabel(docente, yearKey = docentesDashboardState.year) {
      const status = getDocenteYearStatus(docente, yearKey);
      const labelMap = {
        Per: "Permanente",
        Col: "Colaborador",
        Temp: "Temporário",
        Vis: "Visitante",
        "---": "Sem atuação",
      };
      return labelMap[status] || status;
    }

    function getDocentesFilteredList() {
      const search = normalizeText(docentesDashboardState.search || "");
      return (dataSourceCorpoDocente.docentes || []).filter((docente) => {
        const matchesOrigin = docentesDashboardState.origin === "Todos" || docente.origem_matriz === docentesDashboardState.origin;
        const matchesQuadStatus = docentesDashboardState.quadStatus === "Todos" || docente.status_quadri === docentesDashboardState.quadStatus;
        const matchesSearch = !search || normalizeText(docente.docente).includes(search);
        return matchesOrigin && matchesQuadStatus && matchesSearch;
      });
    }

    function renderDocentesMetricCards(yearSummary) {
      const metrics = yearSummary?.metrics || {};
      const metricsOrder = [
        "permanentes_no_corpo",
        "permanentes_internos",
        "permanentes_exclusivos",
        "permanentes_externos",
        "permanentes_colaboradores_outros_ppgs",
        "total_permanentes",
      ];
      const container = document.getElementById("docentes-criteria-metrics");
      container.innerHTML = metricsOrder.map((metricKey) => {
        const metric = metrics[metricKey];
        const status = getDocentesMetricStatus(metric);
        const fillBase = metricKey === "total_permanentes"
          ? Number(metric?.target || 1)
          : Number(metric?.target || 1);
        const fill = Math.min((Number(metric?.value || 0) / fillBase) * 100, 100);
        return `
          <div class="card docentes-metric-card">
            <div class="docentes-metric-top">
              <div>
                <div class="docentes-badge">${escapeHtml(docentesCriteriaLabels[metricKey])}</div>
                <div class="docentes-metric-value">${escapeHtml(getDocentesMetricValue(metricKey, metric))}</div>
              </div>
              <span class="docentes-status-pill ${status.className}">${status.text}</span>
            </div>
            <div class="docentes-metric-bar"><div class="docentes-metric-fill" style="width:${fill}%"></div></div>
            <p class="docentes-quad-note">${escapeHtml(getDocentesMetricTarget(metricKey, metric))}</p>
          </div>
        `;
      }).join("");
    }

    function renderDocentesSummary(yearKey, filteredDocentes) {
      const yearSummary = dataSourceCorpoDocente.by_year?.[yearKey];
      const lpSummary = dataSourceCorpoDocente.lp_summary || {};
      const quadRows = dataSourceCorpoDocente.quad_summary?.rows || [];
      const permanentesMedia = quadRows.find((row) => row.key === "permanentes")?.average;
      const classificadosMedia = quadRows.find((row) => row.key === "docentes_classificados")?.average;
      const baseProducaoMedia = quadRows.find((row) => row.key === "docentes_base_producao")?.average;
      document.getElementById("docentes-filter-note").textContent = `${filteredDocentes.length} docente(s) após os filtros nominais. Os indicadores executivos permanecem no recorte institucional do ano ${yearKey}.`;
      document.getElementById("docentes-summary-tiles").innerHTML = [
        { value: lpSummary.active_docentes, label: "Ativos no quadriênio" },
        { value: filteredDocentes.length, label: "Docentes na tabela filtrada" },
        { value: permanentesMedia, label: "Média de permanentes" },
        { value: classificadosMedia, label: "Média de classificados" },
      ].map((item) => `
        <div class="docentes-summary-tile">
          <strong>${escapeHtml(formatDocentesCellValue(item.value))}</strong>
          <span>${escapeHtml(item.label)}</span>
        </div>
      `).join("");
      document.getElementById("docentes-summary-meta").innerHTML = [
        `<span class="docentes-mini-chip">AMS ${formatDocentesShare(lpSummary.ams_share)}</span>`,
        `<span class="docentes-mini-chip">DFE ${formatDocentesShare(lpSummary.dfe_share)}</span>`,
        `<span class="docentes-mini-chip ${Number(lpSummary.balance_ratio || 0) >= 1 ? "ok" : "warn"}">Relação LP ${formatDocentesCellValue(lpSummary.balance_ratio)}</span>`,
        `<span class="docentes-mini-chip">Base científica ${formatDocentesCellValue(baseProducaoMedia)}</span>`,
      ].join("");
    }

    function renderDocentesTimeline() {
      const timelineYears = dataSourceCorpoDocente.quad_years || [];
      const timelineContainer = document.getElementById("docentes-timeline");
      timelineContainer.innerHTML = timelineYears.map((year) => {
        const yearSummary = dataSourceCorpoDocente.by_year?.[year];
        const share = Number(yearSummary?.metrics?.permanentes_no_corpo?.value || 0);
        return `
          <div class="docentes-timeline-row">
            <div class="docentes-timeline-year">${year}</div>
            <div class="docentes-timeline-track">
              <div class="docentes-timeline-fill" style="width:${Math.min(share * 100, 100)}%"></div>
            </div>
            <div class="docentes-timeline-value">${formatDocentesShare(share)}</div>
          </div>
        `;
      }).join("");
    }

    function renderDocentesIssues() {
      const topIssues = Object.entries(dataSourceCorpoDocente.issue_counts || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      document.getElementById("docentes-issues-list").innerHTML = topIssues.map(([issueKey, count]) => `
        <div class="docentes-issue-item">
          <strong>${count} ocorrência(s)</strong>
          <span>${escapeHtml(docentesIssueLabels[issueKey] || issueKey)}</span>
        </div>
      `).join("") || `<div class="docentes-empty-state">Nenhum alerta derivado da planilha atual.</div>`;
    }

    function renderDocentesQuadSummary() {
      const rows = dataSourceCorpoDocente.quad_summary?.rows || [];
      const shareKeys = new Set([
        "estabilidade_anual",
        "percent_permanentes",
        "percent_colaboradores",
        "percent_permanente_interno",
        "percent_permanente_externo",
      ]);
      document.getElementById("docentes-quad-body").innerHTML = rows.map((row) => `
        <tr>
          <td class="docentes-quad-label">${escapeHtml(row.label)}</td>
          ${["2025", "2026", "2027", "2028"].map((year) => `<td>${escapeHtml(shareKeys.has(row.key) ? formatDocentesShare(row.values?.[year]) : formatDocentesCellValue(row.values?.[year]))}</td>`).join("")}
          <td class="docentes-quad-average">${escapeHtml(shareKeys.has(row.key) ? formatDocentesShare(row.average) : formatDocentesCellValue(row.average))}</td>
        </tr>
      `).join("");
      const estabilidadeQuadri = dataSourceCorpoDocente.quad_summary?.estabilidade_quadri;
      const ppgDistribution = dataSourceCorpoDocente.ppg_distribution_2026 || [];
      document.getElementById("docentes-quad-note").innerHTML = [
        `Estabilidade quadrienal consolidada: <strong>${formatDocentesShare(estabilidadeQuadri)}</strong>.`,
        ...ppgDistribution.map((item) => `${item.docentes} docente(s) com ${item.ppgs} PPG(s) como permanente em 2026 (${formatDocentesShare(item.share)}).`),
      ].join(" ");
    }

    function buildDocentesReading(docente) {
      const readings = [];
      const yearKey = docentesDashboardState.year;
      const yearStatus = getDocenteYearStatus(docente, yearKey);
      if (yearStatus === "Vis") {
        readings.push(`Visitante em ${yearKey}`);
      } else if (yearStatus === "Temp") {
        readings.push(`Temporário em ${yearKey}`);
      } else if (yearStatus === "Col") {
        readings.push(`Colaborador em ${yearKey}`);
      } else if (yearStatus === "Per") {
        readings.push(`Permanente em ${yearKey}`);
      }
      if (docente.issues.includes("permanente_externo_2026")) {
        readings.push("Externo no ano-base");
      }
      if (docente.issues.includes("nao_exclusivo_ao_programa_2026")) {
        readings.push("Compartilha permanência");
      }
      if (docente.issues.includes("colabora_em_outro_ppg_2026")) {
        readings.push("Colabora em outro PPG");
      }
      if (docente.issues.includes("temporario_2026") && yearStatus !== "Temp") {
        readings.push("Temporário em 2026");
      }
      if (docente.issues.includes("visitante_2026") && yearStatus !== "Vis") {
        readings.push("Visitante em 2026");
      }
      return readings.length
        ? readings.map((item) => `<span class="docentes-badge issue">${escapeHtml(item)}</span>`).join("")
        : `<span class="docentes-badge per">Sem alerta direto</span>`;
    }

    function renderDocentesStructureTables() {
      const filtered = getDocentesFilteredList()
        .sort((a, b) => a.docente.localeCompare(b.docente, "pt-BR"));
      const structureBody = document.getElementById("docentes-structure-body");
      const historyBody = document.getElementById("docentes-history-body");
      structureBody.innerHTML = filtered.map((docente) => {
        const yearStatus = getDocenteYearStatus(docente);
        const issueClass = docente.issues.includes("permanente_externo_2026") || docente.issues.includes("nao_exclusivo_ao_programa_2026")
          ? "docentes-row-critical"
          : docente.issues.length || yearStatus === "Vis" || yearStatus === "Temp"
            ? "docentes-row-attention"
            : "";
        return `
          <tr class="${issueClass}">
            <td class="docentes-structure-name">
              <strong>${escapeHtml(docente.docente)}</strong>
              <span>${escapeHtml(getDocenteYearStatusLabel(docente))} em ${escapeHtml(String(docentesDashboardState.year))} · ${escapeHtml(docente.status_quadri === "A" ? "Ativo no desenho 2025-2028" : "Inativo no desenho 2025-2028")}</span>
            </td>
            <td>${getDocentesBoolBadge(docente.ams)}</td>
            <td>${getDocentesBoolBadge(docente.dfe)}</td>
            <td>${escapeHtml(docente.origem_matriz || "—")}</td>
            <td>${escapeHtml(formatDocentesCellValue(docente.ppgs_como_permanente_2026))}</td>
            <td>${getDocentesBoolBadge(docente.colabora_outros_ppgs)}</td>
            <td><span class="docentes-badge">${escapeHtml(docente.status_quadri || "—")}</span></td>
            ${["2025", "2026", "2027", "2028"].map((year) => `<td>${getDocentesBadge(docente.anos?.[year])}</td>`).join("")}
            <td>${buildDocentesReading(docente)}</td>
          </tr>
        `;
      }).join("") || `<tr><td colspan="12" class="docentes-empty-state">Nenhum docente encontrado com os filtros atuais.</td></tr>`;
      historyBody.innerHTML = filtered.map((docente) => `
        <tr>
          <td class="docentes-structure-name">
            <strong>${escapeHtml(docente.docente)}</strong>
            <span>${escapeHtml(getDocenteYearStatusLabel(docente))} em ${escapeHtml(String(docentesDashboardState.year))} · ${escapeHtml(docente.origem_matriz || "—")} · status quadri ${escapeHtml(docente.status_quadri || "—")}</span>
          </td>
          <td>
            <div class="docentes-history-line">
              ${(dataSourceCorpoDocente.history_years || []).map((year) => `
                <div class="docentes-history-cell">
                  <strong>${year}</strong>
                  ${getDocentesBadge(docente.anos?.[year])}
                </div>
              `).join("")}
            </div>
          </td>
        </tr>
      `).join("") || `<tr><td colspan="2" class="docentes-empty-state">Nenhum docente encontrado com os filtros atuais.</td></tr>`;
      renderDocentesSummary(docentesDashboardState.year, filtered);
    }

    function populateDocentesYearSelect() {
      const select = document.getElementById("docentes-year-select");
      select.innerHTML = (dataSourceCorpoDocente.quad_years || []).map((year) => `
        <option value="${year}" ${String(year) === String(docentesDashboardState.year) ? "selected" : ""}>${year}</option>
      `).join("");
    }

    function bindDocentesControls() {
      const yearSelect = document.getElementById("docentes-year-select");
      const originFilter = document.getElementById("docentes-origin-filter");
      const statusFilter = document.getElementById("docentes-status-filter");
      yearSelect.addEventListener("change", () => {
        docentesDashboardState.year = yearSelect.value;
        renderDocentesTab();
      });
      originFilter.addEventListener("change", () => {
        docentesDashboardState.origin = originFilter.value;
        renderDocentesStructureTables();
      });
      statusFilter.addEventListener("change", () => {
        docentesDashboardState.quadStatus = statusFilter.value;
        renderDocentesStructureTables();
      });
    }

    function renderDocentesTab() {
      document.getElementById("docentes-origin-filter").value = docentesDashboardState.origin;
      document.getElementById("docentes-status-filter").value = docentesDashboardState.quadStatus;
      const yearSummary = dataSourceCorpoDocente.by_year?.[docentesDashboardState.year];
      renderDocentesMetricCards(yearSummary);
      renderDocentesTimeline();
      renderDocentesIssues();
      renderDocentesQuadSummary();
      renderDocentesStructureTables();
    }

    function renderCorpoDocenteCriticalCriteriaPanel() {
      const summaryYear = dataSourceCorpoDocente.default_year;
      const yearSummary = dataSourceCorpoDocente.by_year?.[summaryYear];
      if (!summaryYear || !yearSummary) {
        document.getElementById("corpo-docente-crit-ano").textContent = "—";
        document.getElementById("corpo-docente-crit-permanentes").textContent = "—";
        document.getElementById("corpo-docente-crit-permanentes-resumo").textContent = "A versão pública não expõe a contagem consolidada do quadro docente.";
        document.getElementById("corpo-docente-crit-atendidos").textContent = "6/6";
        document.getElementById("corpo-docente-crit-atendidos-resumo").textContent = "Os seis critérios estão estruturados no painel como referências institucionais.";
        document.getElementById("corpo-docente-crit-alertas").textContent = "Interno";
        document.getElementById("corpo-docente-crit-alertas-resumo").textContent = "Alertas de consistência mantidos apenas na versão restrita.";
        corpoDocenteCritSummaryCards.innerHTML = `
          <div class="criteria-score">
            <div>
              <div>Publicação</div>
              <strong>Sanitizada</strong>
            </div>
            <span class="criteria-status ok">Segura</span>
          </div>
        `;
        corpoDocenteCritInsights.innerHTML = [
          `<span class="chip">Dimensão mínima do corpo permanente</span>`,
          `<span class="chip">Vínculo institucional e exclusividade</span>`,
          `<span class="chip">Faixas de composição para APCN</span>`,
        ].join("");
        document.getElementById("corpo-docente-crit-metodologia").textContent = "Metodologia: a versão pública preserva apenas a descrição institucional dos critérios. As leituras derivadas de planilhas estratégicas permanecem em ambiente interno.";
        document.getElementById("corpo-docente-crit-resumo-body").innerHTML = [
          ["Corpo Docente", "Permanentes no corpo", "≥ 70% do corpo docente classificado como permanente"],
          ["Corpo Docente", "Permanentes com vínculo com a IES", "≥ 80% dos permanentes com vínculo com a IES proponente"],
          ["Corpo Docente", "Permanentes exclusivos ao programa", "≥ 30% dos permanentes exclusivos ao programa"],
          ["Corpo Docente", "Permanentes com vínculo externo", "≤ 20% dos permanentes com vínculo externo"],
          ["Corpo Docente", "Permanentes colaboradores em outros PPGs", "≤ 40% dos permanentes como colaboradores em outros PPGs"],
          ["Corpo Docente", "Dimensão do corpo permanente", "≥ 12 permanentes ou ≥ 10 com justificativa regional"],
        ].map(([group, indicator, requirement]) => `
          <tr>
            <td>${group}</td>
            <td>${indicator}</td>
            <td>${requirement}</td>
            <td>Versão pública sem dado nominal</td>
            <td><span class="criteria-status ok">Publicável</span></td>
            <td>O critério permanece descrito no painel, com detalhamento quantitativo restrito ao ambiente interno.</td>
          </tr>
        `).join("");
        return;
      }

      const metricLabels = {
        permanentes_no_corpo: "Permanentes no corpo",
        permanentes_internos: "Permanentes com vínculo com a IES",
        permanentes_exclusivos: "Permanentes exclusivos ao programa",
        permanentes_externos: "Permanentes com vínculo externo",
        permanentes_colaboradores_outros_ppgs: "Permanentes colaboradores em outros PPGs",
        total_permanentes: "Dimensão do corpo permanente",
      };

      const metricRequirements = {
        permanentes_no_corpo: "≥ 70% do corpo docente classificado como permanente",
        permanentes_internos: "≥ 80% dos permanentes com vínculo com a IES proponente",
        permanentes_exclusivos: "≥ 30% dos permanentes exclusivos ao programa",
        permanentes_externos: "≤ 20% dos permanentes com vínculo externo",
        permanentes_colaboradores_outros_ppgs: "≤ 40% dos permanentes como colaboradores em outros PPGs",
        total_permanentes: "≥ 12 permanentes ou ≥ 10 com justificativa regional",
      };

      const issueLabels = {
        colabora_em_outro_ppg_2026: "Atua como colaborador em outro PPG",
        permanente_externo_2026: "Permanente externo no ano-base",
        nao_exclusivo_ao_programa_2026: "Permanente compartilhado com outros PPGs",
        temporario_2026: "Temporário no ano-base",
        visitante_2026: "Visitante no ano-base",
        estabilidade_2025_abaixo_90: "Estabilidade de 2025 abaixo de 90%",
      };

      const metrics = Object.values(yearSummary.metrics);
      const passedCount = metrics.filter((metric) => metric.passed).length;
      const totalCount = metrics.length;
      const permanentCount = yearSummary.permanent_count || 0;
      const topIssues = Object.entries(dataSourceCorpoDocente.issue_counts || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

      document.getElementById("corpo-docente-crit-ano").textContent = String(summaryYear);
      document.getElementById("corpo-docente-crit-permanentes").textContent = String(permanentCount);
      document.getElementById("corpo-docente-crit-permanentes-resumo").textContent = `${permanentCount} permanentes entre ${yearSummary.classified_count} docentes classificados.`;
      document.getElementById("corpo-docente-crit-atendidos").textContent = `${passedCount}/${totalCount}`;
      document.getElementById("corpo-docente-crit-atendidos-resumo").textContent = `${passedCount} dos ${totalCount} critérios atendidos no recorte ${summaryYear}.`;
      document.getElementById("corpo-docente-crit-alertas").textContent = String(Object.values(dataSourceCorpoDocente.issue_counts || {}).reduce((acc, value) => acc + value, 0));
      document.getElementById("corpo-docente-crit-alertas-resumo").textContent = `${topIssues.length} famílias principais de alerta na consolidação do quadro docente.`;

      const internalMetric = yearSummary.metrics.permanentes_internos;
      const externalMetric = yearSummary.metrics.permanentes_externos;
      const dimensionMetric = yearSummary.metrics.total_permanentes;

      corpoDocenteCritSummaryCards.innerHTML = [
        `
          <div class="criteria-score">
            <div>
              <div>Critérios atendidos</div>
              <strong>${passedCount}/${totalCount}</strong>
            </div>
            <span class="criteria-status ${passedCount === totalCount ? "ok" : "risk"}">${passedCount === totalCount ? "Atende" : "Atenção"}</span>
          </div>
        `,
        `
          <div class="criteria-score">
            <div>
              <div>Dimensão permanente</div>
              <strong>${dimensionMetric.value}</strong>
            </div>
            <span class="criteria-status ${dimensionMetric.passed ? "ok" : "risk"}">${dimensionMetric.passed ? "Ok" : dimensionMetric.condition === "justificavel_regional" ? "Justificar" : "Crítico"}</span>
          </div>
        `,
      ].join("");

      corpoDocenteCritInsights.innerHTML = [
        `<span class="chip">Internos: <strong>${(internalMetric.value * 100).toFixed(1).replace(".", ",")}%</strong> frente ao mínimo de <strong>80%</strong></span>`,
        `<span class="chip">Externos: <strong>${(externalMetric.value * 100).toFixed(1).replace(".", ",")}%</strong> frente ao teto de <strong>20%</strong></span>`,
        ...topIssues.map(([key, count]) => `<span class="chip">${count} · ${issueLabels[key] || key}</span>`),
      ].join("");

      document.getElementById("corpo-docente-crit-metodologia").textContent = "Metodologia: o painel usa o dataset consolidado da planilha de corpo docente, tomando o ano padrão da simulação atual como base para verificar dimensão, vínculo institucional, exclusividade e limites de composição.";

      document.getElementById("corpo-docente-crit-resumo-body").innerHTML = metrics.map((metric) => {
        const isCount = metric.metric === "total_permanentes";
        const resultText = isCount
          ? `${metric.value} permanentes`
          : `${(metric.value * 100).toFixed(1).replace(".", ",")}%`;
        const statusText = metric.passed
          ? "Atende"
          : metric.condition === "justificavel_regional"
            ? "Justificar"
            : "Não atende";
        const statusClass = metric.passed ? "ok" : "risk";
        const reading = isCount
          ? (metric.passed
            ? `O programa supera a linha principal em ${metric.value - metric.target} docente(s).`
            : metric.condition === "justificavel_regional"
              ? `O programa fica na faixa de ${metric.fallback_min}-${metric.target - 1}, dependente de justificativa regional.`
              : `O programa está abaixo da referência mínima de ${metric.target} permanentes.`)
          : (metric.passed
            ? "O indicador atende ao parâmetro definido para APCN."
            : "O indicador permanece abaixo da exigência crítica para APCN.");

        return `
          <tr>
            <td>Corpo Docente</td>
            <td>${metricLabels[metric.metric] || metric.metric}</td>
            <td>${metricRequirements[metric.metric] || ""}</td>
            <td>${resultText}</td>
            <td><span class="criteria-status ${statusClass}">${statusText}</span></td>
            <td>${reading}</td>
          </tr>
        `;
      }).join("") + topIssues.map(([key, count]) => `
        <tr>
          <td>Depuração</td>
          <td>${issueLabels[key] || key}</td>
          <td>Consistência interna da base</td>
          <td>${count} ocorrência(s)</td>
          <td><span class="criteria-status risk">Revisar</span></td>
          <td>Alerta estrutural identificado na consolidação entre abas da planilha docente.</td>
        </tr>
      `).join("");
    }

    function renderProductivityCriteriaPanel() {
      const summary = aggregateProductivityCriteria(dataSource);
      document.getElementById("criterios-docentes-total").textContent = String(summary.totalDocentes);
      document.getElementById("criterios-docentes-minimo").textContent = String(summary.minimo);
      document.getElementById("criterios-crit1-percentual").textContent = `${summary.criterio1Percentual}%`;
      document.getElementById("criterios-crit2-percentual").textContent = `${summary.criterio2Percentual}%`;
      document.getElementById("criterios-crit1-resumo").textContent = `${summary.criterio1Atendidos} de ${summary.totalDocentes} docentes com mais de 330 pontos.`;
      document.getElementById("criterios-crit2-resumo").textContent = `${summary.criterio2Atendidos} de ${summary.totalDocentes} docentes com evidência estruturada de JCR (SCimago | 2y cites per doc) ou proxy Q1/Q2.`;

      renderProductivityCriteriaChart(summary);

      const criterio1Ok = summary.criterio1Atendidos >= summary.minimo;
      const criterio2Ok = summary.criterio2Atendidos >= summary.minimo;
      const criterio1Faltantes = Math.max(0, summary.minimo - summary.criterio1Atendidos);
      const criterio2Faltantes = Math.max(0, summary.minimo - summary.criterio2Atendidos);

      document.getElementById("criterios-summary-cards").innerHTML = [
        `
          <div class="criteria-score">
            <div>
              <div>Critério 1</div>
              <strong>${summary.criterio1Atendidos}/${summary.totalDocentes}</strong>
            </div>
            <span class="criteria-status ${criterio1Ok ? "ok" : "risk"}">${criterio1Ok ? "Atende" : "Atenção"}</span>
          </div>
        `,
        `
          <div class="criteria-score">
            <div>
              <div>Critério 2</div>
              <strong>${summary.criterio2Atendidos}/${summary.totalDocentes}</strong>
            </div>
            <span class="criteria-status ${criterio2Ok ? "ok" : "risk"}">${criterio2Ok ? "Atende" : "Atenção"}</span>
          </div>
        `,
      ].join("");

      document.getElementById("criterios-insights").innerHTML = [
        `<span class="chip">Linha de corte formal: <strong>${summary.minimo}</strong> docentes</span>`,
        summary.criterio1Pendentes[0] ? `<span class="chip">Fora do critério 1: <strong>${summary.criterio1Pendentes.map((item) => item.docente).join(", ")}</strong></span>` : `<span class="chip">Critério 1 sem pendências individuais.</span>`,
        summary.criterio2Pendentes[0] ? `<span class="chip">Fora do critério 2: <strong>${summary.criterio2Pendentes.map((item) => item.docente).join(", ")}</strong></span>` : `<span class="chip">Critério 2 sem pendências individuais.</span>`,
        `<span class="chip">Margem sobre a exigência: <strong>+${summary.criterio1Atendidos - summary.minimo}</strong> no critério 1 e <strong>+${summary.criterio2Atendidos - summary.minimo}</strong> no critério 2</span>`,
      ].join("");

      document.getElementById("criterios-metodologia").textContent = "Metodologia: o critério 1 soma a pontuação APCN agregada por docente. O critério 2 usa evidência estruturada de JCR (SCimago | 2y cites per doc) na base sincronizada; como não há coluna nativa de Categoria A, o painel também sinaliza Q1/Q2 quando presentes apenas como reforço visual. O resultado atual permanece 17/18 em ambos os critérios.";

      document.getElementById("criterios-resumo-body").innerHTML = [
        `
          <tr>
            <td>Critério 1<br><small>75% com mais de 330 pontos de produção intelectual</small></td>
            <td>${summary.minimo} docentes</td>
            <td>${summary.criterio1Atendidos}/${summary.totalDocentes} docentes (${summary.criterio1Percentual}%)</td>
            <td><span class="criteria-status ${criterio1Ok ? "ok" : "risk"}">${criterio1Ok ? "Atende" : "Não atende"}</span></td>
            <td>${criterio1Ok ? `Supera a linha de corte em ${summary.criterio1Atendidos - summary.minimo} docente(s).` : `Faltam ${criterio1Faltantes} docente(s) para a linha de corte.`}</td>
          </tr>
        `,
        `
          <tr>
            <td>Critério 2<br><small>75% dos docentes com JCR (SCimago | 2y cites per doc) ou Categoria A</small></td>
            <td>${summary.minimo} docentes</td>
            <td>${summary.criterio2Atendidos}/${summary.totalDocentes} docentes (${summary.criterio2Percentual}%)</td>
            <td><span class="criteria-status ${criterio2Ok ? "ok" : "risk"}">${criterio2Ok ? "Atende" : "Não atende"}</span></td>
            <td>${criterio2Ok ? `Supera a linha de corte em ${summary.criterio2Atendidos - summary.minimo} docente(s).` : `Faltam ${criterio2Faltantes} docente(s) para a linha de corte.`}</td>
          </tr>
        `,
      ].join("");

      renderProductivityCriteriaDocentesTable(summary.docentes);
    }

    function renderTable(data) {
      tabelaBody.innerHTML = data.map((item) => `
        <tr>
          <td>${item.docente || ""}</td>
          <td>${item.ano || ""}</td>
          <td>${typeLabels[item.tipo_producao] || item.tipo_producao || ""}</td>
          <td>${item.titulo || ""}</td>
          <td>${item.revista_ou_veiculo || ""}</td>
          <td>${item.indexacao || ""}</td>
          <td>${item.jif_jcr_2025 || ""}</td>
          <td>${item.quartil_jcr_2025 || ""}</td>
          <td>${item.pontuacao || ""}</td>
        </tr>
      `).join("");
      estadoVazio.style.display = data.length ? "none" : "block";
    }

    function applyTechnicalFilters() {
      syncTechnicalFilterViews();
      const docentes = [...selectedDocentesTecnica];
      const tipos = [...selectedTiposTecnica];
      const anos = [...selectedAnosTecnica];
      const status = [...selectedStatusTecnica];
      const filtered = dataSourceTecnica.filter((item) => {
        const docenteOk = !docentes.length || docentes.includes(item.docente);
        const statusOk = !status.length || status.includes(getTechnicalStatusKey(item));
        const anoOk = !anos.length || anos.includes(getTechnicalYearLabel(item));
        const tipoOk = !hasTechnicalProduction(item) || !tipos.length || tipos.includes(formatTechnicalType(item.tipo_produto));
        return docenteOk && statusOk && anoOk && tipoOk;
      });
      const docenteSummary = aggregateTechnicalByDocente(filtered);
      const typeSummary = aggregateTechnicalByType(filtered);
      const subtypeSummary = aggregateTechnicalBySubtype(filtered);
      const rowSummary = aggregateTechnicalRows(filtered, docenteSummary);
      const totalProdutos = filtered.reduce((acc, item) => acc + getTechnicalAmount(item), 0);
      renderTechnicalMetrics(filtered, docenteSummary, typeSummary, subtypeSummary);
      renderTechnicalDocenteChart(docenteSummary);
      renderTechnicalTypePanel(typeSummary, subtypeSummary, totalProdutos);
      renderTechnicalResumoDocentes(docenteSummary);
      renderTechnicalTable(rowSummary);
    }

    function applyFilters() {
      const filtered = getFilteredScientificData();
      const docenteSummary = aggregateByDocente(filtered);
      const yearSummary = aggregateByYear(filtered);
      const typeSummary = aggregateByType(filtered);
      const totalPoints = filtered.reduce((acc, item) => acc + (Number(item.pontuacao) || 0), 0);
      renderMetrics(filtered, docenteSummary, yearSummary, typeSummary);
      renderDocenteChart(docenteSummary);
      renderYearChart(yearSummary);
      renderTypePanel(typeSummary, totalPoints);
      renderResumoDocentes(docenteSummary);
      renderTable(filtered);
    }

    populateFilters(dataSource);
    populateTechnicalFilters(dataSourceTecnica);
    populateDisciplinasFilters(getDisciplinasBaseData());
    populateCaptacaoFilters(dataSourceCaptacao);
    bindDocenteChips();
    bindTypeFilters();
    bindYearFilters();
    bindScientificFilterToggles();
    bindTechnicalFilters();
    bindTechnicalFilterToggles();
    bindDisciplinasFilters();
    bindDisciplinasFilterToggles();
    bindCaptacaoFilters();
    bindCaptacaoFilterToggles();
    bindCriteriaSortButtons();
    initializeScientificFilters();
    initializeTechnicalFilters();
    initializeDisciplinasFilters();
    initializeCaptacaoFilters();
    bindTabs();
    bindApcnCollapsibleSections();
    bindApcnScoringModal();
    bindLiderancaParceriaModal();
    bindDocenteSortToggles();
    bindDocenteTableSortToggles();
    bindTechnicalDocenteSortToggles();
    bindTechnicalTableSortToggles();
    bindDisciplinasDocenteSortToggles();
    bindCaptacaoDocenteSortToggles();
    bindLeadershipQualityJcrModeButtons();
    bindLeadershipPartnershipSortToggles();
    bindLeadershipDetailSortToggles();
    applyFilters();
    applyLeadershipFilters();
    applyTechnicalFilters();
    applyDisciplinasFilters();
    applyCaptacaoFilters();
    renderOrientationPanel();
    renderProductivityCriteriaPanel();
    renderOrientationCriticalCriteriaPanel();
    renderDocenciaCriticalCriteriaPanel();
    renderCaptacaoCriticalCriteriaPanel();
    populateDocentesYearSelect();
    bindDocentesControls();
    renderDocentesTab();
    renderCorpoDocenteCriticalCriteriaPanel();
    renderGuideDocentePanel();
    renderDocumentsPanel();
  