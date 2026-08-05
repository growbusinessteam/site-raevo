(function () {
  "use strict";

  var STORAGE_KEY = "raevo.salesPlaybook.call";
  var SCHEMA_VERSION = 2;
  var TOTAL_STEPS = 12;

  var FALLBACK_STAGES = [
    ["Pré-call", "Ficha inicial", "Organize o contexto antes de iniciar a conversa."],
    ["Rapport", "Rapport", "Crie conexão genuína antes de conduzir a descoberta."],
    ["Abertura", "Abertura", "Alinhe o propósito e estabeleça o acordo da call."],
    ["Diagnóstico", "Diagnóstico", "Mapeie a maturidade da operação em cinco pilares."],
    ["Metas", "Metas e números", "Transforme o cenário desejado em números concretos."],
    ["Dores", "Aprofundamento das dores", "Evidencie impacto, tentativas e custo da inércia."],
    ["Stack Dor", "Stack de dor e desejo", "Consolide a distância entre o agora e o objetivo."],
    ["Plano", "Plano e gargalos", "Priorize os pontos de maior ineficiência."],
    ["Pitch", "Céu × Inferno", "Conecte a solução ao futuro que o cliente quer construir."],
    ["Oferta", "Oferta e munição", "Apresente a solução a partir do diagnóstico feito."],
    ["Fechamento", "Fechamento", "Trate objeções sem perder o compromisso construído."],
    ["Resumo", "Resumo executivo", "Revise, copie ou imprima o relatório consolidado."]
  ];

  var FALLBACK_RAPPORT = [
    "Como conheceu o trabalho do(a) médico(a)?",
    "O que mais chamou sua atenção no perfil e na trajetória dele(a)?",
    "Como está a rotina da clínica hoje?",
    "Qual conquista recente merece ser celebrada?",
    "O que faria esta conversa valer muito a pena?"
  ];

  var els = {};
  var config = {};
  var state = createInitialState();
  var toastTimer = null;

  function createInitialState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      currentStep: 1,
      activeDiagnosticTab: "",
      fields: {},
      diagnostics: {},
      procedures: [],
      accordions: {}
    };
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHTML(value).replace(/`/g, "&#096;");
  }

  function cleanObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function safeNumber(value) {
    var parsed = Number(String(value == null ? "" : value).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function currency(value) {
    try {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0
      }).format(safeNumber(value));
    } catch (_error) {
      return "R$ " + Math.round(safeNumber(value)).toLocaleString("pt-BR");
    }
  }

  function valueOf(name, fallback) {
    var value = state.fields[name];
    return value === undefined || value === null || value === "" ? (fallback || "") : value;
  }

  function doctorName() {
    return valueOf("doctorName", "Doutor(a)");
  }

  function firstName() {
    var full = doctorName().trim();
    return full === "Doutor(a)" ? full : full.split(/\s+/)[0];
  }

  function stageProgress() {
    return Math.round(((state.currentStep - 1) / 11) * 100);
  }

  function normalizeStage(stage, index) {
    var fallback = FALLBACK_STAGES[index] || ["Etapa " + (index + 1), "Etapa " + (index + 1), ""];
    stage = cleanObject(stage);
    return {
      id: stage.id || "stage-" + (index + 1),
      number: index + 1,
      shortTitle: stage.shortTitle || stage.navTitle || fallback[0],
      title: stage.title || fallback[1],
      subtitle: stage.subtitle || stage.description || fallback[2],
      fields: Array.isArray(stage.fields) ? stage.fields : [],
      prompts: Array.isArray(stage.prompts) ? stage.prompts : []
    };
  }

  function normalizeDiagnosticCard(card, pillarIndex, cardIndex) {
    card = cleanObject(card);
    var rawOptions = Array.isArray(card.options) ? card.options : (Array.isArray(card.buttons) ? card.buttons : []);
    var options = rawOptions.map(function (option, optionIndex) {
      if (typeof option === "string") {
        return { id: "option-" + optionIndex, label: option };
      }
      option = cleanObject(option);
      return {
        id: option.id || option.value || "option-" + optionIndex,
        label: option.label || option.title || option.text || option.value || "Opção " + (optionIndex + 1)
      };
    });
    var painLabels = ["Baixa", "Média", "Alta"];
    if (!card.options && options.length >= 3 && painLabels.every(function (label, i) {
      return options[options.length - 3 + i].label === label;
    })) {
      options = options.slice(0, -3);
    }
    var rawFields = Array.isArray(card.extraFields) ? card.extraFields : (Array.isArray(card.fields) ? card.fields : []);
    var extraFields = rawFields.filter(function (field) {
      var label = String((field && field.label) || "").toLowerCase();
      return label.indexOf("observação do closer") === -1 && label.indexOf("outro cenário") === -1;
    }).map(function (field, fieldIndex) {
      field = cleanObject(field);
      return {
        id: field.id || field.name || "extra-" + fieldIndex,
        label: field.label || "Informação adicional",
        type: field.type || (field.tag === "TEXTAREA" ? "textarea" : "text"),
        placeholder: field.placeholder || ""
      };
    });
    var paragraphs = Array.isArray(card.paragraphs) ? card.paragraphs : [];
    return {
      id: String(card.id || card.code || "diagnostic-" + pillarIndex + "-" + cardIndex),
      code: card.code || paragraphs[0] || (pillarIndex + 1) + "." + (cardIndex + 1),
      title: card.title || "",
      question: card.question || paragraphs[1] || card.title || "Pergunta de diagnóstico",
      hint: card.hint || paragraphs[2] || "",
      multi: Boolean(card.multi),
      options: options,
      extraFields: extraFields
    };
  }

  function normalizeConfig(raw) {
    raw = cleanObject(raw);
    var stages = Array.isArray(raw.stages) ? raw.stages.slice(0, TOTAL_STEPS) : [];
    while (stages.length < TOTAL_STEPS) stages.push({});
    stages = stages.map(normalizeStage);

    var rawDiagnostics = Array.isArray(raw.diagnostics) ? raw.diagnostics : [];
    var diagnostics = rawDiagnostics.map(function (pillar, pillarIndex) {
      pillar = cleanObject(pillar);
      var cards = Array.isArray(pillar.cards) ? pillar.cards : [];
      return {
        id: String(pillar.id || "pillar-" + pillarIndex),
        title: pillar.title || pillar.tab || "Pilar " + (pillarIndex + 1),
        cards: cards.map(function (card, cardIndex) {
          return normalizeDiagnosticCard(card, pillarIndex, cardIndex);
        })
      };
    }).filter(function (pillar) {
      return pillar.cards.length > 0;
    }).slice(0, 5);

    return {
      stages: stages,
      diagnostics: diagnostics,
      painOptions: Array.isArray(raw.painOptions) ? raw.painOptions : ["Baixa", "Média", "Alta"],
      rapportPrompts: Array.isArray(raw.rapportPrompts) ? raw.rapportPrompts : FALLBACK_RAPPORT,
      spinPrompts: Array.isArray(raw.spinPrompts) ? raw.spinPrompts : [],
      objections: Array.isArray(raw.objections) ? raw.objections : [],
      objectionTypes: Array.isArray(raw.objectionTypes) ? raw.objectionTypes : [],
      objectionCategories: Array.isArray(raw.objectionCategories) ? raw.objectionCategories : [],
      results: Array.isArray(raw.results) ? raw.results : [],
      pitch: cleanObject(raw.pitch),
      offer: cleanObject(raw.offer)
    };
  }

  function migrateState(saved) {
    var next = createInitialState();
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return next;
    next.currentStep = clamp(Math.round(safeNumber(saved.currentStep || saved.currentStage || 1)), 1, TOTAL_STEPS);
    next.activeDiagnosticTab = typeof saved.activeDiagnosticTab === "string" ? saved.activeDiagnosticTab : "";
    next.fields = cleanObject(saved.fields);
    next.diagnostics = cleanObject(saved.diagnostics);
    next.procedures = Array.isArray(saved.procedures) ? saved.procedures.map(function (row, index) {
      row = cleanObject(row);
      return {
        id: String(row.id || "procedure-" + Date.now() + "-" + index),
        name: String(row.name || row.procedure || ""),
        value: row.value == null ? "" : row.value,
        qty: row.qty == null ? (row.quantity == null ? "" : row.quantity) : row.qty
      };
    }) : [];
    next.accordions = cleanObject(saved.accordions);
    return next;
  }

  function loadState() {
    try {
      return migrateState(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null"));
    } catch (_error) {
      return createInitialState();
    }
  }

  function persist() {
    state.schemaVersion = SCHEMA_VERSION;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_error) {
      showToast("Não foi possível salvar localmente neste navegador.", "warning");
    }
  }

  function hasMeaningfulData() {
    var hasFields = Object.keys(state.fields).some(function (key) {
      return String(state.fields[key] == null ? "" : state.fields[key]).trim() !== "";
    });
    var hasDiagnostics = Object.keys(state.diagnostics).some(function (key) {
      var item = cleanObject(state.diagnostics[key]);
      return (Array.isArray(item.selected) && item.selected.length) ||
        String(item.selected || "").trim() ||
        String(item.pain || "").trim() ||
        String(item.other || "").trim() ||
        String(item.notes || "").trim() ||
        Object.keys(cleanObject(item.extras)).some(function (extraKey) {
          return String(item.extras[extraKey] || "").trim();
        });
    });
    return hasFields || hasDiagnostics || state.procedures.length > 0;
  }

  function getDiagnostic(id) {
    var existing = cleanObject(state.diagnostics[id]);
    if (!state.diagnostics[id] || state.diagnostics[id] !== existing) {
      state.diagnostics[id] = existing;
    }
    if (!Array.isArray(existing.selected) && typeof existing.selected !== "string") existing.selected = [];
    existing.extras = cleanObject(existing.extras);
    return existing;
  }

  function answered(card) {
    var item = cleanObject(state.diagnostics[card.id]);
    return card.multi ? Array.isArray(item.selected) && item.selected.length > 0 : typeof item.selected === "string" && item.selected !== "";
  }

  function cardScore(card) {
    if (!answered(card)) return null;
    if (card.multi) return 50;
    var item = cleanObject(state.diagnostics[card.id]);
    var index = card.options.findIndex(function (option) { return option.id === item.selected; });
    if (index < 0) return null;
    return card.options.length <= 1 ? 100 : Math.round((index / (card.options.length - 1)) * 100);
  }

  function diagnosticStats() {
    var total = 0;
    var answeredCount = 0;
    var pillars = config.diagnostics.map(function (pillar) {
      var scores = [];
      pillar.cards.forEach(function (card) {
        total += 1;
        var score = cardScore(card);
        if (score !== null) {
          answeredCount += 1;
          scores.push(score);
        }
      });
      return {
        id: pillar.id,
        title: pillar.title,
        answered: scores.length,
        total: pillar.cards.length,
        score: scores.length ? Math.round(scores.reduce(function (sum, score) { return sum + score; }, 0) / scores.length) : 0
      };
    });
    var health = pillars.length
      ? Math.round(pillars.reduce(function (sum, pillar) { return sum + pillar.score; }, 0) / pillars.length)
      : 0;
    return {
      total: total,
      answered: answeredCount,
      fill: total ? Math.round((answeredCount / total) * 100) : 0,
      pillars: pillars,
      health: health
    };
  }

  function severity(score) {
    if (score < 40) return { label: "Crítico", className: "severity--critical" };
    if (score < 70) return { label: "Atenção", className: "severity--attention" };
    return { label: "Saudável", className: "severity--healthy" };
  }

  function financials() {
    var procedureLoss = state.procedures.reduce(function (sum, row) {
      return sum + safeNumber(row.value) * safeNumber(row.qty);
    }, 0);
    var consultationLoss = safeNumber(valueOf("missedConsultations")) * safeNumber(valueOf("consultationValue"));
    var monthlyLoss = consultationLoss + procedureLoss;
    return {
      current: safeNumber(valueOf("currentRevenue")),
      goal: safeNumber(valueOf("revenueGoal")),
      consultationLoss: consultationLoss,
      procedureLoss: procedureLoss,
      monthlyLoss: monthlyLoss,
      annualLoss: monthlyLoss * 12,
      gap: Math.max(safeNumber(valueOf("revenueGoal")) - safeNumber(valueOf("currentRevenue")), 0)
    };
  }

  function fieldMarkup(name, label, options) {
    options = options || {};
    var type = options.type || "text";
    var value = valueOf(name);
    var className = "field" + (options.full ? " field--full" : "");
    var help = options.help ? '<span class="field-help">' + escapeHTML(options.help) + "</span>" : "";
    if (type === "textarea") {
      return '<label class="' + className + '"><span>' + escapeHTML(label) + '</span><textarea data-field="' +
        escapeAttr(name) + '" rows="' + escapeAttr(options.rows || 4) + '" placeholder="' +
        escapeAttr(options.placeholder || "") + '">' + escapeHTML(value) + "</textarea>" + help + "</label>";
    }
    if (type === "select") {
      var optionList = (options.options || []).map(function (option) {
        var optionValue = typeof option === "string" ? option : option.value;
        var optionLabel = typeof option === "string" ? option : option.label;
        return '<option value="' + escapeAttr(optionValue) + '"' + (String(value) === String(optionValue) ? " selected" : "") +
          ">" + escapeHTML(optionLabel) + "</option>";
      }).join("");
      return '<label class="' + className + '"><span>' + escapeHTML(label) + '</span><select data-field="' +
        escapeAttr(name) + '"><option value="">Selecione</option>' + optionList + "</select>" + help + "</label>";
    }
    return '<label class="' + className + '"><span>' + escapeHTML(label) + '</span><input data-field="' +
      escapeAttr(name) + '" type="' + escapeAttr(type) + '" value="' + escapeAttr(value) + '" placeholder="' +
      escapeAttr(options.placeholder || "") + '"' + (options.min != null ? ' min="' + escapeAttr(options.min) + '"' : "") +
      (options.step != null ? ' step="' + escapeAttr(options.step) + '"' : "") + ">" + help + "</label>";
  }

  function sectionIntro(step, eyebrow) {
    var stage = config.stages[step - 1];
    return '<header class="section-head"><span class="eyebrow">' + escapeHTML(eyebrow || "Etapa " + step) +
      "</span><h1>" + escapeHTML(stage.title) + '</h1><p class="lead">' + escapeHTML(stage.subtitle) + "</p></header>";
  }

  function renderStage1() {
    return sectionIntro(1, "Preparação") +
      '<div class="content-section"><h2>Dados do lead</h2><div class="field-grid">' +
      fieldMarkup("doctorName", "Nome do(a) médico(a)", { placeholder: "Ex.: Dra. Marina Costa" }) +
      fieldMarkup("specialty", "Especialidade", { placeholder: "Ex.: Dermatologia" }) +
      fieldMarkup("city", "Cidade") +
      fieldMarkup("state", "Estado", { placeholder: "UF" }) +
      fieldMarkup("ddd", "DDD", { type: "tel", placeholder: "11" }) +
      fieldMarkup("clinicName", "Nome da clínica") +
      fieldMarkup("instagram", "Instagram", { placeholder: "@perfil" }) +
      fieldMarkup("site", "Site", { type: "url", placeholder: "https://" }) +
      "</div></div>" +
      '<div class="content-section"><h2>Contexto da call</h2><div class="field-grid">' +
      fieldMarkup("scheduledBy", "Agendada por") +
      fieldMarkup("leadSource", "Origem do lead", { type: "select", options: ["Indicação", "Instagram", "Google", "Tráfego pago", "Evento", "Prospecção", "Outro"] }) +
      fieldMarkup("callDate", "Data da call", { type: "date" }) +
      fieldMarkup("closerName", "Closer responsável") +
      "</div></div>";
  }

  function renderStage2() {
    var prompts = config.rapportPrompts.length ? config.rapportPrompts : FALLBACK_RAPPORT;
    return sectionIntro(2, "Conexão") +
      '<div class="content-section"><h2>Pesquisa e anotações</h2>' +
      fieldMarkup("rapportNotes", "O que você já sabe sobre o lead?", {
        type: "textarea",
        rows: 6,
        full: true,
        placeholder: "Perfil, trajetória, conteúdo, interesses, conquistas, pontos de conexão..."
      }) + "</div>" +
      '<div class="content-section"><h2>Prompts para abrir a conversa</h2><div class="prompt-grid">' +
      prompts.map(function (prompt, index) {
        var text = typeof prompt === "string" ? prompt : (prompt.text || prompt.title || "");
        return '<article class="prompt-card"><span>0' + (index + 1) + "</span><p>" + escapeHTML(text) + "</p></article>";
      }).join("") + "</div></div>";
  }

  function renderStage3() {
    var suggested = "Obrigado por separar este tempo, " + firstName() + ". Minha intenção hoje é entender onde a clínica está, aonde você quer chegar e quais gargalos estão impedindo esse avanço. Se eu enxergar que conseguimos ajudar, no final te mostro o caminho. Tudo bem?";
    return sectionIntro(3, "Acordo da conversa") +
      '<div class="content-section">' +
      fieldMarkup("openingScript", "Sua abertura", {
        type: "textarea",
        rows: 8,
        full: true,
        placeholder: suggested
      }) +
      '<div class="generated-block"><div><span class="eyebrow">Sugestão</span><p>' + escapeHTML(suggested) +
      '</p></div><button type="button" class="generated-copy" data-action="copy" data-copy-text="' +
      escapeAttr(suggested) + '">Copiar</button></div></div>' +
      '<div class="content-section"><h2>Motivação declarada</h2>' +
      fieldMarkup("callMotivation", "O que fez você aceitar esta conversa hoje?", {
        type: "textarea",
        full: true,
        placeholder: "Registre as palavras exatas do lead."
      }) + "</div>";
  }

  function renderScoreDashboard(stats) {
    var cards = stats.pillars.map(function (pillar) {
      var level = severity(pillar.score);
      return '<article class="score-card ' + level.className + '"><span>' + escapeHTML(pillar.title) +
        "</span><strong>" + pillar.score + '</strong><small>' + level.label + " · " + pillar.answered + "/" + pillar.total + "</small></article>";
    }).join("");
    var healthLevel = severity(stats.health);
    return '<div class="score-dashboard">' +
      '<article class="score-card score-card--primary ' + healthLevel.className + '"><span>Saúde da clínica</span><strong>' +
      stats.health + '</strong><small>' + healthLevel.label + "</small></article>" + cards +
      '<article class="score-card"><span>Diagnóstico preenchido</span><strong>' + stats.fill + '%</strong><small>' +
      stats.answered + " de " + stats.total + "</small></article></div>";
  }

  function renderDiagnosticCard(card) {
    var item = getDiagnostic(card.id);
    var selected = card.multi ? (Array.isArray(item.selected) ? item.selected : []) : item.selected;
    var options = card.options.map(function (option) {
      var isSelected = card.multi ? selected.indexOf(option.id) !== -1 : selected === option.id;
      return '<button type="button" class="option-button' + (isSelected ? " is-selected" : "") +
        '" data-action="diagnostic-option" data-card-id="' + escapeAttr(card.id) + '" data-option-id="' +
        escapeAttr(option.id) + '" aria-pressed="' + isSelected + '">' + escapeHTML(option.label) + "</button>";
    }).join("");
    var painOptions = config.painOptions.map(function (pain) {
      var painValue = typeof pain === "string" ? pain : (pain.value || pain.label || "");
      var painLabel = typeof pain === "string" ? pain : (pain.label || pain.value || "");
      var isSelected = item.pain === painValue;
      return '<button type="button" class="pain-button' + (isSelected ? " is-selected" : "") +
        '" data-action="diagnostic-pain" data-card-id="' + escapeAttr(card.id) + '" data-pain="' +
        escapeAttr(painValue) + '" aria-pressed="' + isSelected + '">' + escapeHTML(painLabel) + "</button>";
    }).join("");
    var extras = card.extraFields.map(function (field) {
      var currentValue = cleanObject(item.extras)[field.id] || "";
      if (field.type === "textarea") {
        return '<label class="field"><span>' + escapeHTML(field.label) + '</span><textarea rows="3" data-diagnostic-extra="' +
          escapeAttr(field.id) + '" data-card-id="' + escapeAttr(card.id) + '" placeholder="' +
          escapeAttr(field.placeholder) + '">' + escapeHTML(currentValue) + "</textarea></label>";
      }
      return '<label class="field"><span>' + escapeHTML(field.label) + '</span><input type="' +
        escapeAttr(field.type || "text") + '" data-diagnostic-extra="' + escapeAttr(field.id) +
        '" data-card-id="' + escapeAttr(card.id) + '" value="' + escapeAttr(currentValue) +
        '" placeholder="' + escapeAttr(field.placeholder) + '"></label>';
    }).join("");
    return '<article class="diagnostic-card" id="card-' + escapeAttr(card.id) + '"><div class="diagnostic-card__head"><span>' +
      escapeHTML(card.code) + "</span><div><h3>" + escapeHTML(card.title || card.question) + "</h3>" +
      (card.title ? "<p>" + escapeHTML(card.question) + "</p>" : "") +
      (card.hint ? "<small>" + escapeHTML(card.hint) + "</small>" : "") + "</div></div>" +
      '<div class="diagnostic-options" role="group" aria-label="' + escapeAttr(card.question) + '">' + options + "</div>" +
      '<div class="extra-grid"><label class="field"><span>Outro cenário</span><input type="text" data-diagnostic-prop="other" data-card-id="' +
      escapeAttr(card.id) + '" value="' + escapeAttr(item.other || "") + '" placeholder="Descreva uma situação diferente"></label>' +
      extras +
      '<label class="field field--full"><span>Observação do closer</span><textarea rows="3" data-diagnostic-prop="notes" data-card-id="' +
      escapeAttr(card.id) + '" placeholder="Evidências, frases e contexto importante">' + escapeHTML(item.notes || "") + "</textarea></label></div>" +
      '<div class="pain-picker"><span>Dor percebida</span><div role="group" aria-label="Intensidade da dor">' + painOptions + "</div></div></article>";
  }

  function renderSpin() {
    var defaults = [
      { title: "Situação", prompts: ["Como funciona hoje?", "Quem é responsável?", "Quais números acompanham?"] },
      { title: "Problema", prompts: ["O que não está funcionando?", "Onde mais perdem oportunidades?"] },
      { title: "Implicação", prompts: ["O que isso custa por mês?", "Como afeta sua equipe e sua rotina?"] },
      { title: "Necessidade", prompts: ["O que mudaria se resolvesse?", "Qual seria o cenário ideal?"] }
    ];
    var groups = config.spinPrompts.length ? config.spinPrompts : defaults;
    return '<div class="content-section"><h2>Biblioteca SPIN</h2><div class="spin-grid">' +
      groups.map(function (group) {
        group = cleanObject(group);
        var prompts = Array.isArray(group.prompts) ? group.prompts : [];
        return '<article class="spin-card"><h3>' + escapeHTML(group.title || "") + "</h3><ul>" +
          prompts.map(function (prompt) {
            return "<li>" + escapeHTML(typeof prompt === "string" ? prompt : (prompt.text || prompt.question || "")) + "</li>";
          }).join("") + "</ul></article>";
      }).join("") + "</div></div>";
  }

  function renderStage4() {
    var stats = diagnosticStats();
    if (!state.activeDiagnosticTab || !config.diagnostics.some(function (pillar) { return pillar.id === state.activeDiagnosticTab; })) {
      state.activeDiagnosticTab = config.diagnostics[0] ? config.diagnostics[0].id : "";
    }
    var active = config.diagnostics.find(function (pillar) { return pillar.id === state.activeDiagnosticTab; });
    var tabs = config.diagnostics.map(function (pillar) {
      var selected = pillar.id === state.activeDiagnosticTab;
      return '<button type="button" class="diagnostic-tab' + (selected ? " is-active" : "") +
        '" role="tab" aria-selected="' + selected + '" data-action="diagnostic-tab" data-tab-id="' +
        escapeAttr(pillar.id) + '">' + escapeHTML(pillar.title) + "</button>";
    }).join("");
    return sectionIntro(4, "Descoberta") +
      '<div class="content-section"><h2>Contexto operacional</h2><div class="field-grid">' +
      fieldMarkup("careType", "Atende particular ou convênio?", { type: "select", options: ["Particular", "Convênio", "Particular + Convênio"] }) +
      fieldMarkup("secretaries", "Quantas secretárias você tem?", { type: "number", min: 0 }) +
      fieldMarkup("serviceDays", "Quais dias da semana atende?") +
      fieldMarkup("waitlist", "Sua agenda está com fila de espera?", { type: "select", options: ["Sim", "Não"] }) +
      fieldMarkup("followUpProgram", "Tem programa de acompanhamento?", { type: "select", options: ["Sim", "Não"] }) +
      fieldMarkup("hasProtocol", "Tem protocolo ou infoproduto?", { type: "select", options: ["Sim", "Não"] }) +
      fieldMarkup("proceduresPerformed", "Quais procedimentos você realiza?", { full: true, placeholder: "Ex.: Botox, preenchimento, cirurgia..." }) +
      "</div></div>" +
      '<div class="content-section"><h2>Score de maturidade</h2>' + renderScoreDashboard(stats) + "</div>" +
      (config.diagnostics.length
        ? '<div class="content-section"><div class="diagnostic-tabs" role="tablist" aria-label="Pilares do diagnóstico">' + tabs +
          '</div><div class="pillar-block" role="tabpanel">' + (active ? active.cards.map(renderDiagnosticCard).join("") : "") + "</div></div>"
        : '<div class="empty-state"><h2>Diagnóstico indisponível</h2><p>Os dados dos pilares não puderam ser carregados.</p></div>') +
      renderSpin();
  }

  function renderProcedures() {
    if (!state.procedures.length) {
      return '<div class="empty-state"><p>Nenhum procedimento perdido adicionado.</p></div>';
    }
    return '<div class="procedure-list">' + state.procedures.map(function (row) {
      return '<div class="procedure-row"><label class="field"><span>Procedimento</span><input type="text" data-procedure-field="name" data-procedure-id="' +
        escapeAttr(row.id) + '" value="' + escapeAttr(row.name) + '" placeholder="Ex.: Implante"></label>' +
        '<label class="field"><span>Ticket (R$)</span><input type="number" min="0" step="0.01" data-procedure-field="value" data-procedure-id="' +
        escapeAttr(row.id) + '" value="' + escapeAttr(row.value) + '"></label>' +
        '<label class="field"><span>Perdidos/mês</span><input type="number" min="0" step="1" data-procedure-field="qty" data-procedure-id="' +
        escapeAttr(row.id) + '" value="' + escapeAttr(row.qty) + '"></label>' +
        '<button type="button" class="icon-button" data-action="remove-procedure" data-procedure-id="' +
        escapeAttr(row.id) + '" aria-label="Remover procedimento">×</button></div>';
    }).join("") + "</div>";
  }

  function renderFinancialCards(finance) {
    return '<div class="metrics-grid">' +
      '<article class="metric-card"><span>Gap até a meta</span><strong>' + currency(finance.gap) + "</strong></article>" +
      '<article class="metric-card"><span>Perda em consultas/mês</span><strong>' + currency(finance.consultationLoss) + "</strong></article>" +
      '<article class="metric-card"><span>Perda em procedimentos/mês</span><strong>' + currency(finance.procedureLoss) + "</strong></article>" +
      '<article class="metric-card metric-card--highlight"><span>Perda total/mês</span><strong>' + currency(finance.monthlyLoss) + "</strong></article>" +
      '<article class="metric-card metric-card--highlight"><span>Perda projetada/ano</span><strong>' + currency(finance.annualLoss) + "</strong></article></div>";
  }

  function renderStage5() {
    var finance = financials();
    return sectionIntro(5, "Futuro desejado") +
      '<div class="content-section"><h2>Visão e impacto</h2><div class="field-grid">' +
      fieldMarkup("desiredState", "Qual é o cenário ideal?", { type: "textarea", full: true, placeholder: "Como a clínica deveria operar e crescer?" }) +
      fieldMarkup("personalImpact", "O que essa conquista muda pessoalmente?", { type: "textarea", full: true }) +
      fieldMarkup("challenges", "Quais desafios precisam ser vencidos?", { type: "textarea", full: true }) +
      "</div></div>" +
      '<div class="content-section"><h2>Números da meta</h2><div class="field-grid">' +
      fieldMarkup("currentRevenue", "Faturamento atual/mês (R$)", { type: "number", min: 0, step: "0.01" }) +
      fieldMarkup("revenueGoal", "Meta de faturamento/mês (R$)", { type: "number", min: 0, step: "0.01" }) +
      fieldMarkup("consultationValue", "Ticket da consulta (R$)", { type: "number", min: 0, step: "0.01" }) +
      fieldMarkup("leadsPerMonth", "Leads por mês", { type: "number", min: 0 }) +
      fieldMarkup("missedConsultations", "Consultas perdidas/mês", { type: "number", min: 0 }) +
      fieldMarkup("missedProcedures", "Procedimentos perdidos/mês", { type: "number", min: 0, help: "Referência declarada; o cálculo usa as linhas abaixo." }) +
      "</div>" + renderFinancialCards(finance) + "</div>" +
      '<div class="content-section"><div class="section-title-row"><div><h2>Procedimentos perdidos</h2><p>Adicione ticket e quantidade para calcular a perda real.</p></div>' +
      '<button type="button" class="secondary-button" data-action="add-procedure">+ Adicionar procedimento</button></div>' +
      renderProcedures() + "</div>";
  }

  function renderStage6() {
    return sectionIntro(6, "Aprofundamento") +
      '<div class="content-section"><div class="field-grid">' +
      fieldMarkup("painDuration", "Há quanto tempo isso acontece?", { type: "textarea", rows: 5, placeholder: "Capture tempo e recorrência." }) +
      fieldMarkup("attemptedSolutions", "O que já tentou para resolver?", { type: "textarea", rows: 5, placeholder: "Fornecedores, equipe, cursos, ações isoladas..." }) +
      fieldMarkup("biggestLoss", "Qual é a maior perda causada por isso?", { type: "textarea", rows: 5, placeholder: "Dinheiro, tempo, energia, pacientes, reputação..." }) +
      fieldMarkup("inertiaConsequence", "O que acontece se nada mudar?", { type: "textarea", rows: 5, placeholder: "Consequência em 6 a 12 meses." }) +
      "</div></div>";
  }

  function keyPains() {
    var pains = [];
    Object.keys(state.diagnostics).forEach(function (id) {
      var item = cleanObject(state.diagnostics[id]);
      if (item.pain === "Alta" || item.pain === "Média") {
        var card = null;
        config.diagnostics.some(function (pillar) {
          card = pillar.cards.find(function (candidate) { return candidate.id === id; });
          return Boolean(card);
        });
        if (card) pains.push({ label: card.title || card.question, level: item.pain, notes: item.notes || "" });
      }
    });
    return pains.sort(function (a, b) {
      return (b.level === "Alta" ? 2 : 1) - (a.level === "Alta" ? 2 : 1);
    });
  }

  function generatedContext() {
    var finance = financials();
    var pains = keyPains();
    return {
      doctor: doctorName(),
      first: firstName(),
      desired: valueOf("desiredState", "uma clínica previsível, rentável e com mais liberdade"),
      personal: valueOf("personalImpact", "mais tranquilidade e capacidade de crescimento"),
      duration: valueOf("painDuration", "algum tempo"),
      loss: valueOf("biggestLoss", "oportunidades, tempo e faturamento"),
      consequence: valueOf("inertiaConsequence", "o problema continuará drenando crescimento e energia"),
      goal: finance.goal ? currency(finance.goal) : "a meta definida",
      monthlyLoss: currency(finance.monthlyLoss),
      annualLoss: currency(finance.annualLoss),
      gap: currency(finance.gap),
      pains: pains
    };
  }

  function copyBlock(title, text) {
    return '<div class="generated-block"><div><span class="eyebrow">' + escapeHTML(title) + "<p>" +
      escapeHTML(text) + '</p></div><button type="button" class="generated-copy" data-action="copy" data-copy-text="' +
      escapeAttr(text) + '">Copiar</button></div>';
  }

  function renderStage7() {
    var ctx = generatedContext();
    var painText = ctx.pains.length
      ? ctx.pains.slice(0, 4).map(function (pain) { return pain.label; }).join(", ")
      : valueOf("biggestLoss", "os gargalos mapeados na operação");
    var script = ctx.first + ", pelo que você me mostrou, hoje " + painText +
      " estão afastando a clínica do cenário que você quer. Isso já representa cerca de " + ctx.monthlyLoss +
      " por mês e " + ctx.annualLoss + " por ano. Você convive com isso há " + ctx.duration +
      " e, se nada mudar, " + ctx.consequence + ". Ao mesmo tempo, o que você busca é " + ctx.desired +
      ", chegando a " + ctx.goal + " e conquistando " + ctx.personal + ". Faz sentido dizer que resolver isso agora virou prioridade?";
    return sectionIntro(7, "Síntese da descoberta") +
      '<div class="stack-grid"><article class="text-card"><span class="eyebrow">Agora</span><h2>A dor acumulada</h2><p>' +
      escapeHTML(valueOf("biggestLoss", "Registre as perdas na etapa anterior para fortalecer esta síntese.")) +
      '</p><strong>' + escapeHTML(ctx.monthlyLoss) + '/mês</strong></article>' +
      '<article class="text-card"><span class="eyebrow">Depois</span><h2>O desejo declarado</h2><p>' +
      escapeHTML(ctx.desired) + '</p><strong>Meta: ' + escapeHTML(ctx.goal) + "</strong></article></div>" +
      '<div class="content-section"><h2>Stack gerado</h2>' + copyBlock("Script de confirmação", script) + "</div>";
  }

  function bottlenecks() {
    var list = [];
    config.diagnostics.forEach(function (pillar) {
      pillar.cards.forEach(function (card) {
        var score = cardScore(card);
        var item = cleanObject(state.diagnostics[card.id]);
        if (score !== null) {
          list.push({
            title: card.title || card.question,
            pillar: pillar.title,
            score: score,
            pain: item.pain || "Não classificada",
            notes: item.notes || item.other || ""
          });
        }
      });
    });
    return list.sort(function (a, b) {
      var painWeightA = a.pain === "Alta" ? -30 : (a.pain === "Média" ? -15 : 0);
      var painWeightB = b.pain === "Alta" ? -30 : (b.pain === "Média" ? -15 : 0);
      return (a.score + painWeightA) - (b.score + painWeightB);
    });
  }

  function renderStage8() {
    var stats = diagnosticStats();
    var finance = financials();
    var ranked = bottlenecks().slice(0, 8);
    var efficiency = Math.max(0, 100 - stats.health);
    return sectionIntro(8, "Plano de prioridade") +
      '<div class="metrics-grid"><article class="metric-card metric-card--highlight"><span>Ineficiência estimada</span><strong>' +
      efficiency + '%</strong></article><article class="metric-card"><span>Perda mensal mapeada</span><strong>' +
      currency(finance.monthlyLoss) + '</strong></article><article class="metric-card"><span>Gap de faturamento</span><strong>' +
      currency(finance.gap) + "</strong></article></div>" +
      '<div class="content-section"><h2>Gargalos priorizados</h2>' +
      (ranked.length ? '<ol class="bottleneck-list">' + ranked.map(function (item) {
        var level = severity(item.score);
        return '<li class="bottleneck-item"><div><span>' + escapeHTML(item.pillar) + "</span><h3>" +
          escapeHTML(item.title) + "</h3>" + (item.notes ? "<p>" + escapeHTML(item.notes) + "</p>" : "") +
          '</div><strong class="' + level.className + '">' + item.score + " · " + level.label + "</strong></li>";
      }).join("") + "</ol>" : '<div class="empty-state"><p>Responda ao diagnóstico para gerar o ranking de gargalos.</p></div>') + "</div>" +
      '<div class="content-section">' +
      fieldMarkup("inefficiencyNotes", "Leitura estratégica do closer", { type: "textarea", full: true, rows: 5, placeholder: "Quais gargalos devem ser atacados primeiro e por quê?" }) +
      "</div>";
  }

  function renderStage9() {
    var ctx = generatedContext();
    var hell = "Se a clínica mantiver o cenário atual, os mesmos gargalos continuarão consumindo aproximadamente " +
      ctx.monthlyLoss + " por mês. Em um ano, são " + ctx.annualLoss + ", além do impacto de " + ctx.consequence + ".";
    var heaven = "Com marketing, comercial e gestão trabalhando como um sistema, a clínica passa a buscar " +
      ctx.goal + " com previsibilidade. Isso aproxima " + ctx.doctor + " de " + ctx.desired + " e traz " + ctx.personal + ".";
    var bridge = ctx.first + ", existem dois caminhos a partir daqui. Um é manter o cenário que você descreveu e aceitar o custo que ele traz. O outro é corrigir os gargalos agora e construir " +
      ctx.desired + ". Pelo que conversamos, qual desses caminhos faz sentido para você?";
    return sectionIntro(9, "Transição emocional") +
      '<div class="stack-grid"><article class="text-card text-card--danger"><span class="eyebrow">Inferno</span><h2>Manter como está</h2><p>' +
      escapeHTML(hell) + '</p></article><article class="text-card text-card--success"><span class="eyebrow">Céu</span><h2>Construir o próximo nível</h2><p>' +
      escapeHTML(heaven) + "</p></article></div>" +
      '<div class="content-section"><h2>Pitch de transição</h2>' + copyBlock("Céu × Inferno", bridge) + "</div>" +
      '<div class="content-section">' + fieldMarkup("pitchNotes", "Ajustes e pontos de ênfase", { type: "textarea", full: true, rows: 5 }) + "</div>";
  }

  function executiveSummaryText() {
    var ctx = generatedContext();
    var stats = diagnosticStats();
    var weakest = stats.pillars.slice().sort(function (a, b) { return a.score - b.score; }).slice(0, 3);
    var pillarText = weakest.length ? weakest.map(function (pillar) {
      return pillar.title + " (" + pillar.score + "/100)";
    }).join(", ") : "os pilares ainda não avaliados";
    return ctx.doctor + " busca " + ctx.desired + ", com objetivo de chegar a " + ctx.goal +
      ". O diagnóstico aponta saúde geral de " + stats.health + "/100, com prioridade em " + pillarText +
      ". As perdas mapeadas somam " + ctx.monthlyLoss + "/mês (" + ctx.annualLoss +
      "/ano), enquanto o gap até a meta é de " + ctx.gap + ". A recomendação é estruturar aquisição, conversão e gestão como um único sistema para remover os gargalos e gerar previsibilidade.";
  }

  function renderStage10() {
    var summary = executiveSummaryText();
    var ctx = generatedContext();
    var bullets = [
      "O custo de manter o cenário é " + ctx.monthlyLoss + " por mês.",
      "O objetivo declarado é " + ctx.goal + " mensais.",
      "A solução conecta crescimento previsível ao desejo de " + ctx.desired + ".",
      "Adiar mantém a consequência: " + ctx.consequence + "."
    ];
    var transition = ctx.first + ", agora que ficou claro onde a clínica está, o que está travando o crescimento e quanto isso custa, quero te mostrar como a Raevo estrutura esses pontos para levar a operação até " + ctx.goal + " com previsibilidade.";
    return sectionIntro(10, "Recomendação") +
      '<div class="content-section"><h2>Resumo executivo</h2>' + copyBlock("Leitura da operação", summary) + "</div>" +
      '<div class="content-section"><h2>Munição comercial</h2><ul class="ammunition-list">' +
      bullets.map(function (bullet) { return "<li>" + escapeHTML(bullet) + "</li>"; }).join("") + "</ul>" +
      copyBlock("Transição para a oferta", transition) + "</div>" +
      '<div class="content-section"><div class="field-grid">' +
      fieldMarkup("proposedSolution", "Solução recomendada", { type: "textarea", full: true, rows: 5 }) +
      fieldMarkup("investment", "Investimento apresentado (R$)", { type: "number", min: 0, step: "0.01" }) +
      fieldMarkup("offerNotes", "Condições e observações", { type: "textarea", full: true }) +
      "</div></div>";
  }

  function substitute(text) {
    var ctx = generatedContext();
    return String(text || "")
      .replace(/\[nome(?: do médico)?\]/gi, ctx.doctor)
      .replace(/\[doutor\(a\)\]/gi, ctx.doctor)
      .replace(/\[meta\]/gi, ctx.goal)
      .replace(/\[valor mensal(?: × 6)?\]/gi, function (match) {
        return match.indexOf("× 6") >= 0 ? currency(financials().monthlyLoss * 6) : ctx.monthlyLoss;
      })
      .replace(/\[valor anual\]/gi, ctx.annualLoss)
      .replace(/\[estado ideal\]/gi, ctx.desired)
      .replace(/\[tempo\]/gi, ctx.duration)
      .replace(/\[consequência\]/gi, ctx.consequence);
  }

  function renderObjectionLibrary() {
    if (!config.objections.length) return '<div class="empty-state"><p>Biblioteca de objeções indisponível.</p></div>';
    return '<div class="objection-library">' + config.objections.map(function (objection, index) {
      objection = cleanObject(objection);
      var id = String(objection.id || "objection-" + index);
      var open = Boolean(state.accordions[id]);
      var responses = Array.isArray(objection.responses) ? objection.responses : [];
      return '<article class="accordion-item' + (open ? " is-open" : "") + '"><button type="button" class="accordion-trigger" data-action="toggle-accordion" data-accordion-id="' +
        escapeAttr(id) + '" aria-expanded="' + open + '"><span>' + escapeHTML(objection.heading || objection.title || "Objeção") +
        '</span><span aria-hidden="true">+</span></button><div class="accordion-panel"' + (open ? "" : " hidden") + ">" +
        responses.map(function (response, responseIndex) {
          var text = substitute(typeof response === "string" ? response : (response.text || ""));
          return '<div class="generated-block"><p>' + escapeHTML(text) +
            '</p><div class="action-row"><button type="button" class="text-button" data-action="use-objection" data-copy-text="' +
            escapeAttr(text) + '">Usar</button><button type="button" class="generated-copy" data-action="copy" data-copy-text="' +
            escapeAttr(text) + '">Copiar</button></div></div>';
        }).join("") + "</div></article>";
    }).join("") + "</div>";
  }

  function renderStage11() {
    var resultOptions = config.results.length ? config.results : ["Fechado", "Follow-up", "Não fechado", "Desqualificado"];
    var status = valueOf("closingStatus");
    return sectionIntro(11, "Decisão") +
      '<div class="content-section"><h2>Resultado da call</h2><div class="status-options" role="group" aria-label="Status da call">' +
      resultOptions.map(function (result) {
        var resultValue = typeof result === "string" ? result : (result.value || result.label || "");
        var resultLabel = typeof result === "string" ? result : (result.label || result.value || "");
        var selected = status === resultValue;
        return '<button type="button" class="status-button' + (selected ? " is-selected" : "") +
          '" data-action="select-status" data-status="' + escapeAttr(resultValue) + '" aria-pressed="' + selected + '">' +
          escapeHTML(resultLabel) + "</button>";
      }).join("") + "</div><div class=\"field-grid\">" +
      fieldMarkup("mainObjection", "Objeção principal", { type: "textarea", full: true, rows: 4, placeholder: "Qual foi a objeção principal?" }) +
      choiceGroupMarkup("objectionType", "Objeção real ou superficial?", config.objectionTypes.length ? config.objectionTypes : ["Real", "Superficial"]) +
      choiceGroupMarkup("objectionCategory", "Categoria da objeção", config.objectionCategories.length ? config.objectionCategories : ["Tempo", "Dinheiro", "Prioridade", "Confiança", "Sócio", "Cônjuge", "Momento"]) +
      fieldMarkup("objectionResponse", "Quebra de objeção aplicada", { type: "textarea", full: true, rows: 5, placeholder: "O que foi dito para contornar?" }) +
      fieldMarkup("nextStep", "Próximo passo", { type: "textarea", full: true, rows: 3 }) +
      fieldMarkup("followUpDate", "Data do follow-up", { type: "date" }) +
      "</div></div>" +
      '<div class="content-section"><h2>Biblioteca quebra-objeções</h2><p>Os textos já usam os dados desta call.</p>' +
      renderObjectionLibrary() + "</div>";
  }

  function choiceGroupMarkup(name, label, options) {
    var selected = valueOf(name);
    return '<fieldset class="choice-group field--full"><legend>' + escapeHTML(label) + '</legend><div>' +
      options.map(function (option) {
        var optionValue = typeof option === "string" ? option : (option.value || option.label || "");
        var optionLabel = typeof option === "string" ? option : (option.label || option.value || "");
        var active = selected === optionValue;
        return '<button type="button" class="option-button' + (active ? " is-selected" : "") +
          '" data-action="select-field-option" data-field-name="' + escapeAttr(name) +
          '" data-field-value="' + escapeAttr(optionValue) + '" aria-pressed="' + active + '">' +
          escapeHTML(optionLabel) + "</button>";
      }).join("") + "</div></fieldset>";
  }

  function summaryCard(title, items) {
    return '<article class="summary-card"><h2>' + escapeHTML(title) + "<dl>" + items.map(function (item) {
      return "<div><dt>" + escapeHTML(item[0]) + "</dt><dd>" + escapeHTML(item[1] || "—") + "</dd></div>";
    }).join("") + "</dl></article>";
  }

  function summaryText() {
    var stats = diagnosticStats();
    var finance = financials();
    return [
      "RELATÓRIO EXECUTIVO — RAEVO",
      "Cliente: " + doctorName() + (valueOf("clinicName") ? " · " + valueOf("clinicName") : ""),
      "Especialidade: " + valueOf("specialty", "Não informada"),
      "Objetivo: " + valueOf("desiredState", "Não informado"),
      "Faturamento atual: " + currency(finance.current),
      "Meta mensal: " + currency(finance.goal),
      "Gap: " + currency(finance.gap),
      "Perda estimada/mês: " + currency(finance.monthlyLoss),
      "Perda estimada/ano: " + currency(finance.annualLoss),
      "Saúde do diagnóstico: " + stats.health + "/100 (" + stats.fill + "% preenchido)",
      "Maior dor: " + valueOf("biggestLoss", "Não informada"),
      "Consequência de não agir: " + valueOf("inertiaConsequence", "Não informada"),
      "Solução recomendada: " + valueOf("proposedSolution", "Não informada"),
      "Objeção: " + valueOf("mainObjection", "Nenhuma registrada"),
      "Status: " + valueOf("closingStatus", "Em andamento"),
      "Próximo passo: " + valueOf("nextStep", "Não definido")
    ].join("\n");
  }

  function renderStage12() {
    var stats = diagnosticStats();
    var finance = financials();
    var level = severity(stats.health);
    var pillarRows = stats.pillars.map(function (pillar) {
      return [pillar.title, pillar.score + "/100 · " + severity(pillar.score).label];
    });
    var html = sectionIntro(12, "Relatório final") +
      '<div class="action-row action-row--end"><button type="button" class="secondary-button" data-action="copy-summary">Copiar resumo</button>' +
      '<button type="button" class="primary-button" data-action="print-report">Gerar PDF / Imprimir</button></div>' +
      '<div class="print-report"><div class="summary-grid">' +
      summaryCard("Cliente", [
        ["Médico(a)", doctorName()],
        ["Clínica", valueOf("clinicName")],
        ["Especialidade", valueOf("specialty")],
        ["Cidade", [valueOf("city"), valueOf("state")].filter(Boolean).join(" / ")],
        ["Data", valueOf("callDate")],
        ["Closer", valueOf("closerName")]
      ]) +
      summaryCard("Objetivo", [
        ["Estado desejado", valueOf("desiredState")],
        ["Impacto pessoal", valueOf("personalImpact")],
        ["Faturamento atual", currency(finance.current)],
        ["Meta mensal", currency(finance.goal)],
        ["Gap", currency(finance.gap)]
      ]) +
      summaryCard("Diagnóstico", [
        ["Saúde geral", stats.health + "/100 · " + level.label],
        ["Preenchimento", stats.fill + "%"],
        ["Questões respondidas", stats.answered + " de " + stats.total]
      ].concat(pillarRows)) +
      summaryCard("Impacto financeiro", [
        ["Consultas perdidas", currency(finance.consultationLoss) + "/mês"],
        ["Procedimentos perdidos", currency(finance.procedureLoss) + "/mês"],
        ["Perda total", currency(finance.monthlyLoss) + "/mês"],
        ["Projeção anual", currency(finance.annualLoss)]
      ]) +
      summaryCard("Dor e solução", [
        ["Maior perda", valueOf("biggestLoss")],
        ["Tempo com o problema", valueOf("painDuration")],
        ["Consequência", valueOf("inertiaConsequence")],
        ["Solução recomendada", valueOf("proposedSolution")],
        ["Investimento", valueOf("investment") ? currency(valueOf("investment")) : ""]
      ]) +
      summaryCard("Fechamento", [
        ["Status", valueOf("closingStatus", "Em andamento")],
        ["Objeção", valueOf("mainObjection")],
        ["Resposta", valueOf("objectionResponse")],
        ["Próximo passo", valueOf("nextStep")],
        ["Follow-up", valueOf("followUpDate")]
      ]) +
      "</div></div>";
    return html;
  }

  function renderCurrentStage() {
    var renderers = [
      renderStage1, renderStage2, renderStage3, renderStage4, renderStage5, renderStage6,
      renderStage7, renderStage8, renderStage9, renderStage10, renderStage11, renderStage12
    ];
    els.stageContent.innerHTML = '<section class="stage-panel" data-step="' + state.currentStep + '">' +
      renderers[state.currentStep - 1]() + "</section>";
    els.stageContent.scrollTop = 0;
  }

  function renderNavigation() {
    var progress = stageProgress();
    els.stageNav.innerHTML = config.stages.map(function (stage) {
      var active = stage.number === state.currentStep;
      var complete = stage.number < state.currentStep;
      return '<button type="button" class="stage-button' + (active ? " is-active" : "") + (complete ? " is-complete" : "") +
        '" data-action="go-step" data-step="' + stage.number + '" aria-current="' + (active ? "step" : "false") +
        '"><span class="stage-button__number">' + String(stage.number).padStart(2, "0") +
        '</span><span class="stage-button__label">' + escapeHTML(stage.shortTitle) + "</span></button>";
    }).join("");
    els.sidebarProgress.innerHTML = '<div class="progress-track" aria-hidden="true"><span class="progress-fill" style="width:' +
      progress + '%"></span></div><span>' + progress + "% concluído</span>";
  }

  function renderChrome() {
    var stage = config.stages[state.currentStep - 1];
    var progress = stageProgress();
    els.topbarTitle.textContent = String(stage.number).padStart(2, "0") + " · " + stage.title;
    els.topbarProgress.textContent = progress + "%";
    els.topbarProgress.setAttribute("aria-label", progress + "% concluído");
    els.prevStep.disabled = state.currentStep === 1;
    els.nextStep.disabled = state.currentStep === TOTAL_STEPS;
    els.nextStep.textContent = state.currentStep === TOTAL_STEPS ? "Concluído" : "Próxima etapa";
  }

  function render() {
    renderNavigation();
    renderChrome();
    renderCurrentStage();
    persist();
  }

  function goToStep(step) {
    var next = clamp(Math.round(safeNumber(step)), 1, TOTAL_STEPS);
    if (next === state.currentStep) return;
    state.currentStep = next;
    render();
    var activeButton = els.stageNav.querySelector('[data-step="' + next + '"]');
    if (activeButton) activeButton.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function showToast(message, tone) {
    if (!els.toastRegion) return;
    window.clearTimeout(toastTimer);
    els.toastRegion.textContent = message;
    els.toastRegion.className = "toast is-visible" + (tone ? " toast--" + tone : "");
    els.toastRegion.setAttribute("role", "status");
    toastTimer = window.setTimeout(function () {
      els.toastRegion.classList.remove("is-visible");
    }, 2800);
  }

  function copyText(text) {
    var content = String(text || "");
    var promise;
    if (navigator.clipboard && window.isSecureContext) {
      promise = navigator.clipboard.writeText(content);
    } else {
      promise = new Promise(function (resolve, reject) {
        var textarea = document.createElement("textarea");
        textarea.value = content;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy") ? resolve() : reject(new Error("copy failed"));
        } catch (error) {
          reject(error);
        } finally {
          textarea.remove();
        }
      });
    }
    promise.then(function () {
      showToast("Conteúdo copiado.");
    }).catch(function () {
      showToast("Não foi possível copiar. Selecione o texto manualmente.", "warning");
    });
  }

  function rerenderPreservingFocus() {
    var active = document.activeElement;
    var selector = "";
    if (active && active.dataset) {
      if (active.dataset.field) selector = '[data-field="' + CSS.escape(active.dataset.field) + '"]';
      if (active.dataset.procedureId && active.dataset.procedureField) {
        selector = '[data-procedure-id="' + CSS.escape(active.dataset.procedureId) + '"][data-procedure-field="' +
          CSS.escape(active.dataset.procedureField) + '"]';
      }
    }
    render();
    if (selector) {
      var replacement = els.stageContent.querySelector(selector);
      if (replacement) replacement.focus();
    }
  }

  function handleClick(event) {
    var target = event.target.closest("[data-action]");
    if (!target) return;
    var action = target.dataset.action;
    if (action === "go-step") goToStep(target.dataset.step);
    if (action === "previous") goToStep(state.currentStep - 1);
    if (action === "next") goToStep(state.currentStep + 1);
    if (action === "diagnostic-tab") {
      state.activeDiagnosticTab = target.dataset.tabId;
      renderCurrentStage();
      persist();
    }
    if (action === "diagnostic-option") {
      var cardId = target.dataset.cardId;
      var optionId = target.dataset.optionId;
      var card = null;
      config.diagnostics.some(function (pillar) {
        card = pillar.cards.find(function (candidate) { return candidate.id === cardId; });
        return Boolean(card);
      });
      if (!card) return;
      var item = getDiagnostic(cardId);
      if (card.multi) {
        var selected = Array.isArray(item.selected) ? item.selected.slice() : [];
        var index = selected.indexOf(optionId);
        if (index === -1) selected.push(optionId);
        else selected.splice(index, 1);
        item.selected = selected;
      } else {
        item.selected = item.selected === optionId ? "" : optionId;
      }
      renderCurrentStage();
      persist();
    }
    if (action === "diagnostic-pain") {
      var diagnostic = getDiagnostic(target.dataset.cardId);
      diagnostic.pain = diagnostic.pain === target.dataset.pain ? "" : target.dataset.pain;
      renderCurrentStage();
      persist();
    }
    if (action === "add-procedure") {
      state.procedures.push({ id: "procedure-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7), name: "", value: "", qty: "" });
      renderCurrentStage();
      persist();
    }
    if (action === "remove-procedure") {
      state.procedures = state.procedures.filter(function (row) { return row.id !== target.dataset.procedureId; });
      renderCurrentStage();
      persist();
    }
    if (action === "copy") copyText(target.dataset.copyText);
    if (action === "copy-summary") copyText(summaryText());
    if (action === "print-report") {
      document.body.classList.add("is-printing");
      window.setTimeout(function () { window.print(); }, 50);
    }
    if (action === "toggle-accordion") {
      var accordionId = target.dataset.accordionId;
      state.accordions[accordionId] = !state.accordions[accordionId];
      renderCurrentStage();
      persist();
    }
    if (action === "use-objection") {
      state.fields.objectionResponse = target.dataset.copyText || "";
      renderCurrentStage();
      persist();
      showToast("Resposta adicionada ao fechamento.");
    }
    if (action === "select-status") {
      state.fields.closingStatus = state.fields.closingStatus === target.dataset.status ? "" : target.dataset.status;
      renderCurrentStage();
      persist();
    }
    if (action === "select-field-option") {
      var fieldName = target.dataset.fieldName;
      var fieldValue = target.dataset.fieldValue;
      state.fields[fieldName] = state.fields[fieldName] === fieldValue ? "" : fieldValue;
      renderCurrentStage();
      persist();
    }
    if (action === "new-call") {
      if (hasMeaningfulData() && !window.confirm("Iniciar uma nova call? Os dados atuais serão apagados deste navegador.")) return;
      state = createInitialState();
      state.activeDiagnosticTab = config.diagnostics[0] ? config.diagnostics[0].id : "";
      try { window.localStorage.removeItem(STORAGE_KEY); } catch (_error) {}
      render();
      showToast("Nova call iniciada.");
    }
  }

  function handleInput(event) {
    var target = event.target;
    if (target.dataset.field) {
      state.fields[target.dataset.field] = target.value;
      persist();
      if (["currentRevenue", "revenueGoal", "consultationValue", "missedConsultations", "missedProcedures"].indexOf(target.dataset.field) !== -1) {
        rerenderPreservingFocus();
      }
      return;
    }
    if (target.dataset.cardId && target.dataset.diagnosticProp) {
      getDiagnostic(target.dataset.cardId)[target.dataset.diagnosticProp] = target.value;
      persist();
      return;
    }
    if (target.dataset.cardId && target.dataset.diagnosticExtra) {
      getDiagnostic(target.dataset.cardId).extras[target.dataset.diagnosticExtra] = target.value;
      persist();
      return;
    }
    if (target.dataset.procedureId && target.dataset.procedureField) {
      var row = state.procedures.find(function (procedure) { return procedure.id === target.dataset.procedureId; });
      if (row) {
        row[target.dataset.procedureField] = target.value;
        persist();
        rerenderPreservingFocus();
      }
    }
  }

  function handleChange(event) {
    var target = event.target;
    if (target.tagName === "SELECT") handleInput(event);
  }

  function bindEvents() {
    document.addEventListener("click", handleClick);
    document.addEventListener("input", handleInput);
    document.addEventListener("change", handleChange);
    window.addEventListener("afterprint", function () {
      document.body.classList.remove("is-printing");
      showToast("Relatório pronto para salvar ou imprimir.");
    });
  }

  function cacheElements() {
    els.stageNav = document.getElementById("stage-nav");
    els.sidebarProgress = document.getElementById("sidebar-progress");
    els.topbarTitle = document.getElementById("topbar-title");
    els.topbarProgress = document.getElementById("topbar-progress");
    els.stageContent = document.getElementById("stage-content");
    els.prevStep = document.getElementById("prev-step");
    els.nextStep = document.getElementById("next-step");
    els.newCall = document.getElementById("new-call");
    els.toastRegion = document.getElementById("toast-region");
    return els.stageNav && els.sidebarProgress && els.topbarTitle && els.topbarProgress &&
      els.stageContent && els.prevStep && els.nextStep && els.newCall && els.toastRegion;
  }

  function ensureActionAttributes() {
    els.prevStep.dataset.action = "previous";
    els.nextStep.dataset.action = "next";
    els.newCall.dataset.action = "new-call";
  }

  function loadConfig() {
    return fetch("/data/sales-playbook.json", { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .catch(function () {
        showToast("Conteúdo complementar indisponível. O modo básico foi carregado.", "warning");
        return {};
      });
  }

  function init() {
    if (!cacheElements()) return;
    ensureActionAttributes();
    state = loadState();
    bindEvents();
    loadConfig().then(function (raw) {
      config = normalizeConfig(raw);
      if (!state.activeDiagnosticTab && config.diagnostics[0]) state.activeDiagnosticTab = config.diagnostics[0].id;
      render();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
