// const G8RUN_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzU7qWJSR4HraZo9lAqgW2tkNWUC8uBTMH9fq1juqiVcP_aZ5VDgc-1p1H5_CbBrEo/exec";
const G8RUN_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbx-pV9Wz5O-WIONGMuUIy3PrELUId-mWWh2CdnwXY4EtyUu-v5RNqHKrg-UpP59tRI/exec";

const form = document.getElementById("g8run-form");
const btnSubmit = document.getElementById("submit-btn");
const successBox = document.getElementById("status-success");
const errorBox = document.getElementById("status-error");

const inputEmail = document.getElementById("email");
const inputTelefone = document.getElementById("telefone");

// --- Helpers visuais de status ---
function showStatus(type) {
  successBox.style.display = "none";
  errorBox.style.display = "none";

  if (type === "success") successBox.style.display = "block";
  if (type === "error") errorBox.style.display = "block";
}

function setFieldError(field, hasError) {
  if (!field) return;
  if (hasError) {
    field.classList.add("field-error");
  } else {
    field.classList.remove("field-error");
  }
}

// --- Máscara de telefone (formato BR) ---
function maskTelefone(value) {
  let v = value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);

  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    v = v.replace(/^(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
  }
  return v;
}

if (inputTelefone) {
  inputTelefone.addEventListener("input", (e) => {
    const cursorPos = e.target.selectionStart;
    const oldLength = e.target.value.length;

    e.target.value = maskTelefone(e.target.value);

    const newLength = e.target.value.length;
    const diff = newLength - oldLength;
    e.target.selectionEnd = cursorPos + diff;
  });

  inputTelefone.addEventListener("blur", () => {
    const valid = validateTelefone(inputTelefone.value);
    setFieldError(inputTelefone, !valid);
  });
}

// --- Validação de e-mail ---
function validateEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email);
}

// --- Validação de telefone ---
function validateTelefone(telefone) {
  if (!telefone) return false;
  const digits = telefone.replace(/\D/g, "");
  return digits.length >= 10;
}

// --- Validação ao sair do campo de e-mail ---
if (inputEmail) {
  inputEmail.addEventListener("blur", () => {
    const valid = validateEmail(inputEmail.value.trim());
    setFieldError(inputEmail, !valid);
  });
}

// --- Utilitário para pegar valores de checkboxes ---
function getCheckedValues(name) {
  return Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(
    (el) => el.value
  );
}

// --- Submit do formulário ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showStatus(null);

  // Limpa erros anteriores
  const camposObrigatorios = [
    form.nome,
    form.email,
    form.telefone,
    form.cidade,
    form.percepcao,
    form.participaria,
    form.faixa_etaria,
    form.nivel,
    form.distancia,
    form.beneficios,
  ];
  camposObrigatorios.forEach((c) => setFieldError(c, false));
  setFieldError(inputEmail, false);
  setFieldError(inputTelefone, false);

  // Validações
  let hasError = false;

  if (!form.nome.value.trim()) {
    setFieldError(form.nome, true);
    hasError = true;
  }

  if (!validateEmail(form.email.value.trim())) {
    setFieldError(form.email, true);
    hasError = true;
  }

  if (!validateTelefone(form.telefone.value.trim())) {
    setFieldError(form.telefone, true);
    hasError = true;
  }

  if (!form.cidade.value.trim()) {
    setFieldError(form.cidade, true);
    hasError = true;
  }

  if (!form.percepcao.value) {
    setFieldError(form.percepcao, true);
    hasError = true;
  }

  const valorG8 = form.querySelector('input[name="valor_g8"]:checked');
  if (!valorG8) {
    alert("Por favor, responda quanto a G8 RUN agrega valor para a empresa (escala 1 a 5).");
    hasError = true;
  }

  if (!form.participaria.value) {
    setFieldError(form.participaria, true);
    hasError = true;
  }

  if (!form.faixa_etaria.value) {
    setFieldError(form.faixa_etaria, true);
    hasError = true;
  }

  if (!form.nivel.value) {
    setFieldError(form.nivel, true);
    hasError = true;
  }

  if (!form.distancia.value) {
    setFieldError(form.distancia, true);
    hasError = true;
  }

  if (!form.beneficios.value.trim()) {
    setFieldError(form.beneficios, true);
    hasError = true;
  }

  if (hasError) {
    alert("Por favor, confira os campos destacados antes de enviar.");
    return;
  }

  const atracoes = getCheckedValues("atracao");
  const kitItens = getCheckedValues("kit_item");
  const kitOutrosTexto = form.kit_outros ? form.kit_outros.value.trim() : "";

  if (kitOutrosTexto && !kitItens.includes("Outros")) {
    kitItens.push("Outros: " + kitOutrosTexto);
  } else if (kitOutrosTexto && kitItens.includes("Outros")) {
    const idx = kitItens.indexOf("Outros");
    kitItens[idx] = "Outros: " + kitOutrosTexto;
  }

  const familia = form.querySelector('input[name="familia"]:checked');
  const embaixador = form.querySelector('input[name="embaixador"]:checked');

  const payload = {
    nome: form.nome.value.trim(),
    email: form.email.value.trim(),
    telefone: form.telefone.value.trim(),
    cidade: form.cidade.value.trim(),
    percepcao: form.percepcao.value,
    valor_g8: valorG8 ? valorG8.value : "",
    participaria: form.participaria.value,
    faixa_etaria: form.faixa_etaria.value,
    nivel: form.nivel.value,
    distancia: form.distancia.value,
    familia: familia ? familia.value : "",
    atracoes: atracoes.join(", "),
    local_preferido: form.local_preferido.value,
    kit_itens: kitItens.join(", "),
    beneficios: form.beneficios.value.trim(),
    preocupacoes: form.preocupacoes.value.trim(),
    ideias: form.ideias.value.trim(),
    embaixador: embaixador ? embaixador.value : "",
    marketing: form.marketing.checked ? "Sim" : "Não",
  };

  btnSubmit.disabled = true;
  btnSubmit.textContent = "Enviando...";

  try {
    await fetch(G8RUN_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    showStatus("success");
    form.reset();
  } catch (err) {
    console.error("Erro ao enviar dados:", err);
    showStatus("error");
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Enviar minha opinião";
  }
});