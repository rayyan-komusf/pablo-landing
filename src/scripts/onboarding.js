/**
 * Motor de navegación del onboarding de Pablo.
 *
 * Reconstruido desde el deployment original y extendido con:
 *  - Pregunta inicial "step-primer" (Quiero que Pablo me ayude a…)
 *  - Barra de progreso proporcional real (antes tenía valores trucados)
 *  - Pregunta 3 (estrés): con nivel <= 2 se salta la animación "No estás solo"
 *  - Visitante recurrente: entra directo a las preguntas (se salta el intro)
 *  - Métricas PostHog por pantalla y por respuesta
 *  - Salida directa (sin modal) desde la primera pantalla
 */

/** Orden lineal de pantallas; las ramificaciones se resuelven en resolveNextStep. */
const STEP_ORDER = [
  "step-primer", // Pregunta inicial: "Quiero que Pablo me ayude a…"
  "entry", // ¡Hola, soy Pablo!
  "step-2", // No tienes que ser millonario…
  "step-3", // Hoy puedes hacerlo desde WhatsApp
  "step-4", // Demo WhatsApp: tu "primer gasto"
  "step-5", // Ahora, algunas preguntas…
  "step-6", // Pregunta 1: edad
  "step-7", // Pregunta 2: experiencia presupuestando
  "step-8", // Pregunta 3: nivel de estrés (slider)
  "step-nuevo-1", // Animación "No estás solo" (se salta si estrés <= 2)
  "step-9", // Pregunta 4: claridad del dinero
  "step-10", // Animación donut "claridad total"
  "step-11", // Pregunta 5: cómo registrar transacciones
  "step-12", // Pregunta 6: ¿endeudado?
  "step-13", // Pregunta 7: otras deudas (solo si tiene deuda)
  "step-nuevo-2", // Animación tarjeta de crédito (rama con deuda)
  "step-nuevo-3B", // Mensaje "¡Eso es genial!" (rama sin deuda)
  "step-14", // Pregunta 8: cash flow
  "step-15", // Pregunta 9: meta de ahorro
  "step-nuevo-4", // Animación meta de ahorro
  "step-16", // Funciones para ti (checkboxes automáticos)
  "step-17", // Testimonios
  "step-18", // Paywall / prueba gratuita
];

/** Configuración de topbar por pantalla. */
const STEP_FLAGS = {
  "step-primer": { showTopbar: false, showSkip: false },
  entry: { showTopbar: false, showSkip: false },
  "step-2": { showTopbar: false, showSkip: true },
  "step-3": { showTopbar: false, showSkip: true },
  "step-4": { showTopbar: false, showSkip: true },
  "step-5": { showTopbar: false, showSkip: false },
  "step-6": { showTopbar: true, showSkip: true },
  "step-7": { showTopbar: true, showSkip: true },
  "step-8": { showTopbar: true, showSkip: true },
  "step-nuevo-1": { showTopbar: false, showSkip: true },
  "step-9": { showTopbar: true, showSkip: true },
  "step-10": { showTopbar: false, showSkip: true },
  "step-11": { showTopbar: true, showSkip: true },
  "step-12": { showTopbar: true, showSkip: true },
  "step-13": { showTopbar: true, showSkip: true },
  "step-nuevo-2": { showTopbar: false, showSkip: true },
  "step-nuevo-3B": { showTopbar: false, showSkip: true },
  "step-14": { showTopbar: true, showSkip: true },
  "step-15": { showTopbar: true, showSkip: true },
  "step-nuevo-4": { showTopbar: false, showSkip: true },
  "step-16": { showTopbar: false, showSkip: false },
  "step-17": { showTopbar: false, showSkip: true },
  "step-18": { showTopbar: false, showSkip: false },
};

/** Progreso proporcional real: posición en el flujo lineal. */
function progressFor(stepId) {
  const i = STEP_ORDER.indexOf(stepId);
  if (i <= 0) return 0;
  return Math.round((i / (STEP_ORDER.length - 1)) * 100);
}

/** Pantalla desde la que un visitante recurrente retoma el flujo. */
const RETURNING_START_STEP = "step-5";
const INTRO_SEEN_KEY = "pablo_intro_vista";

/* ------------------------------------------------------------------ */
/* Métricas (PostHog)                                                  */
/* ------------------------------------------------------------------ */

function track(event, props = {}) {
  try {
    window.posthog?.capture(event, props);
  } catch (e) {
    console.warn("[Pablo] No se pudo enviar métrica:", e);
  }
}

class OnboardingEngine {
  currentStepId = STEP_ORDER[0];
  history = [];
  answers = {};
  steps = null;
  topbar = null;
  progressFill = null;
  progressTrack = null;
  skipBtn = null;

  init() {
    this.steps = document.querySelectorAll(".step");
    this.topbar = document.getElementById("topbar");
    this.progressFill = document.getElementById("progressFill");
    this.progressTrack = document.getElementById("progressTrack");
    this.skipBtn = document.getElementById("topbarSkip");

    if (!this.steps || this.steps.length === 0) {
      console.warn("[Pablo] No se encontraron steps en el DOM.");
      return;
    }

    this.steps.forEach((s) => {
      s.setAttribute("inert", "");
      s.setAttribute("aria-hidden", "true");
    });

    // Restaurar sesión en curso (recarga de página)
    const savedStep = sessionStorage.getItem("pablo_current_step");
    const savedHistory = sessionStorage.getItem("pablo_history");
    const savedAnswers = sessionStorage.getItem("pablo_answers");
    if (savedHistory) {
      try {
        this.history = JSON.parse(savedHistory);
      } catch {}
    }
    if (savedAnswers) {
      try {
        this.answers = JSON.parse(savedAnswers);
      } catch {}
    }

    // Visitante recurrente (ya vio el intro en una visita anterior):
    // entra directo a la antesala de las preguntas.
    const introSeen = localStorage.getItem(INTRO_SEEN_KEY) === "1";
    const initial = savedStep || (introSeen ? RETURNING_START_STEP : STEP_ORDER[0]);

    this.goTo(initial);
    this.bindGlobalHandlers();
    track("onboarding_started", {
      is_returning_user: introSeen,
      initial_step_id: initial,
      is_resumed_session: !!savedStep,
    });
    console.log("[Pablo] Onboarding engine iniciado ✓");
  }

  next() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const nextId = this.resolveNextStep();
    if (nextId) {
      this.history.push(this.currentStepId);
      this.goTo(nextId);
    }
  }

  skip() {
    track("onboarding_skipped", { step_id: this.currentStepId });
    this.next();
  }

  prev() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const prevId = this.history.pop();
    if (prevId) {
      track("onboarding_back", { from_step_id: this.currentStepId, to_step_id: prevId });
      this.goTo(prevId);
    }
  }

  goTo(stepId) {
    const flags = STEP_FLAGS[stepId];
    if (!flags) {
      console.warn(`[Pablo] Step no encontrado en config: ${stepId}`);
      return;
    }
    this.steps?.forEach((s) => {
      s.classList.remove("active");
      s.setAttribute("aria-hidden", "true");
      s.setAttribute("inert", "");
    });
    const el = document.querySelector(`[data-step="${stepId}"]`);
    if (!el) {
      console.warn(`[Pablo] Elemento DOM no encontrado: ${stepId}`);
      return;
    }
    el.classList.add("active");
    el.setAttribute("aria-hidden", "false");
    el.removeAttribute("inert");
    this.currentStepId = stepId;
    this.updateTopbar(flags);
    this.updateProgress(progressFor(stepId));
    el.scrollTop = 0;

    if (stepId === "step-16") this.initStep16();

    // El intro queda visto cuando el usuario llega a la antesala de preguntas.
    if (STEP_ORDER.indexOf(stepId) >= STEP_ORDER.indexOf(RETURNING_START_STEP)) {
      localStorage.setItem(INTRO_SEEN_KEY, "1");
    }

    track("onboarding_screen_viewed", {
      step_id: stepId,
      step_index: STEP_ORDER.indexOf(stepId),
      progress_percent: progressFor(stepId),
    });

    if (stepId === "step-18" && !sessionStorage.getItem("pablo_paywall_seen")) {
      sessionStorage.setItem("pablo_paywall_seen", "1");
      track("onboarding_completed", {
        steps_navigated: this.history.length + 1,
        main_goal: this.answers.mainGoal,
        age: this.answers.age,
        stress_level: this.answers.stressLevel,
        has_debt: this.answers.hasDebt,
        has_savings_goal: this.answers.hasSavingsGoal,
        cash_flow: this.answers.cashFlow,
        money_clarity: this.answers.moneyClarity,
      });
    }

    this.saveState();
  }

  saveState() {
    sessionStorage.setItem("pablo_current_step", this.currentStepId);
    sessionStorage.setItem("pablo_history", JSON.stringify(this.history));
    sessionStorage.setItem("pablo_answers", JSON.stringify(this.answers));
  }

  setAnswer(key, value) {
    this.answers[key] = value;
    track("onboarding_answer_selected", {
      step_id: this.currentStepId,
      question: key,
      answer: value,
    });
    this.saveState();
  }

  toggleAnswer(key, value) {
    const list = this.answers[key] ?? [];
    const selected = !list.includes(value);
    this.answers[key] = selected ? [...list, value] : list.filter((v) => v !== value);
    track("onboarding_answer_toggled", {
      step_id: this.currentStepId,
      question: key,
      option: value,
      selected,
    });
    this.saveState();
  }

  getAnswers() {
    return { ...this.answers };
  }

  selectOption(el, key, value) {
    el
      .closest(".option-list, [role='radiogroup']")
      ?.querySelectorAll(".option-card")
      .forEach((c) => {
        c.classList.remove("selected");
        c.setAttribute("aria-checked", "false");
      });
    el.classList.add("selected");
    el.setAttribute("aria-checked", "true");
    this.setAnswer(key, value);
    const cta = document.querySelector(".cta-footer .btn-primary");
    if (cta?.classList.contains("disabled")) {
      cta.classList.remove("disabled");
      cta.removeAttribute("disabled");
    }
  }

  toggleOption(el, value, key = "otherDebts") {
    if (el.classList.contains("selected")) {
      el.classList.remove("selected");
      el.setAttribute("aria-checked", "false");
    } else {
      el.classList.add("selected");
      el.setAttribute("aria-checked", "true");
    }
    this.toggleAnswer(key, value);
  }

  resolveNextStep() {
    const i = STEP_ORDER.indexOf(this.currentStepId);
    if (i === -1 || i >= STEP_ORDER.length - 1) return null;

    // Pregunta 3 (estrés): con poco estrés (<= 2) no se muestra la
    // animación "No estás solo"; se pasa directo a la pregunta 4.
    if (this.currentStepId === "step-8" && (this.answers.stressLevel ?? 2) <= 2) {
      return "step-9";
    }
    // Pregunta 4: si tiene todo bajo control, no ve la animación del donut.
    if (this.currentStepId === "step-9" && this.answers.moneyClarity === "bajo-control") {
      return "step-11";
    }
    // Pregunta 6: rama según tenga deuda o no.
    if (this.currentStepId === "step-12") {
      return this.answers.hasDebt === true ? "step-13" : "step-nuevo-3B";
    }
    if (this.currentStepId === "step-13") return "step-nuevo-2";
    if (this.currentStepId === "step-nuevo-2" || this.currentStepId === "step-nuevo-3B") {
      return "step-14";
    }
    return STEP_ORDER[i + 1] ?? null;
  }

  updateTopbar(flags) {
    if (!this.topbar) return;
    this.topbar.classList.toggle("hidden", !flags.showTopbar);
    if (this.skipBtn) {
      this.skipBtn.style.visibility = flags.showSkip ? "visible" : "hidden";
    }
  }

  updateProgress(percent) {
    if (this.progressFill) this.progressFill.style.width = `${percent}%`;
    this.progressTrack?.setAttribute("aria-valuenow", String(percent));
  }

  bindGlobalHandlers() {
    window.pabloNext = () => this.next();
    window.pabloSkip = () => this.skip();
    window.pabloPrev = () => this.prev();
    window.pabloGoTo = (id) => this.goTo(id);
    window.pabloSelect = (el, key, value) => this.selectOption(el, key, value);
    window.pabloToggle = (el, value) => this.toggleOption(el, value);
    window.pabloConfirmExit = () => this.confirmExit();
    window.pabloCancelExit = () => this.cancelExit();
    window.pabloDoExit = () => this.doExit();
    window.pabloExitDirect = () => this.exitDirect();
    window.pabloTrack = track;
    window.onboarding = this;
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.cancelExit();
    });
  }

  /* Salida con confirmación (X de la topbar en pasos avanzados) */
  confirmExit() {
    const modal = document.getElementById("exitModal");
    modal?.classList.remove("hidden");
    modal?.classList.add("flex");
  }

  cancelExit() {
    const modal = document.getElementById("exitModal");
    modal?.classList.add("hidden");
    modal?.classList.remove("flex");
  }

  doExit() {
    track("onboarding_exited", { step_id: this.currentStepId, method: "modal" });
    window.location.href = "/";
  }

  /* Salida directa desde la primera pantalla: sin modal de confirmación */
  exitDirect() {
    track("onboarding_exited", { step_id: this.currentStepId, method: "direct" });
    window.location.href = "/";
  }

  /**
   * step-16: marca automáticamente las funciones sugeridas según las
   * respuestas, primero las relevantes y luego el resto, escalonadas.
   */
  initStep16() {
    const { age, budgetingExp, moneyClarity, registrationPref, hasDebt, cashFlow, hasSavingsGoal } =
      this.answers;
    const relevant = new Set();
    if (registrationPref === "whatsapp") relevant.add("whatsapp");
    if (moneyClarity === "siempre" || moneyClarity === "a-veces") {
      relevant.add("presupuesto");
      relevant.add("categorias");
      relevant.add("resumen");
    }
    if (hasDebt === true) relevant.add("deuda");
    if (cashFlow === "siempre" || cashFlow === "a-veces") {
      relevant.add("presupuesto");
      relevant.add("categorias");
    }
    if (hasSavingsGoal === "si" || hasSavingsGoal === "quiero-empezar") {
      relevant.add("metas");
      relevant.add("resumen");
    }
    if (budgetingExp === "primera-vez") {
      relevant.add("presupuesto");
      relevant.add("resumen");
    }
    if (budgetingExp === "app" || budgetingExp === "excel" || budgetingExp === "manual") {
      relevant.add("resumen");
    }
    if (age === "menor-18" || age === "18-24") relevant.add("metas");
    if (age === "35-50" || age === "mayor-50") {
      relevant.add("deuda");
      relevant.add("presupuesto");
    }

    const all = ["whatsapp", "presupuesto", "deuda", "categorias", "resumen", "metas"];
    document
      .querySelectorAll('[data-step="step-16"] .option-card.checkbox')
      .forEach((c) => {
        c.setAttribute("aria-checked", "false");
        c.classList.remove("selected");
      });

    const check = (value) => {
      const card = document.querySelector(`[data-step="step-16"] [onclick*="'${value}'"]`);
      if (card) {
        card.setAttribute("aria-checked", "true");
        card.classList.add("selected");
      }
    };

    const first = all.filter((v) => relevant.has(v));
    const rest = all.filter((v) => !relevant.has(v));
    const stepMs = 500;
    const pauseMs = 500;
    first.forEach((v, i) => setTimeout(() => check(v), i * stepMs));
    const offset = first.length * stepMs + pauseMs;
    rest.forEach((v, i) => setTimeout(() => check(v), offset + i * stepMs));
  }

  getCurrentStep() {
    return this.currentStepId;
  }
}

const engine = new OnboardingEngine();
engine.init();
