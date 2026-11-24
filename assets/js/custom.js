document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     1. KOMPETENCIJŲ PAŽANGOS MODULIS (PASPAUDŽIAMI LANGELIAI)
     ========================================================= */
  const STORAGE_KEY = "gustina_competencies_v3";

  const defaultSkills = [
    { id: 1, name: "Elektros tinklų modeliavimas", status: "Planuojama", xp: 50 },
    { id: 2, name: "JavaScript interaktyvumas", status: "Planuojama", xp: 30 },
    { id: 3, name: "MATLAB skaitiniai metodai", status: "Mokomasi", xp: 70 },
    { id: 4, name: "Saulės elektrinių skaičiavimai", status: "Mokomasi", xp: 60 },
    { id: 5, name: "HTML5 ir CSS3 maketavimas", status: "Atlikta", xp: 45 },
    { id: 6, name: "3D grafikų vizualizacija", status: "Atlikta", xp: 45 },
    { id: 7, name: "Techninė dokumentacija", status: "Atlikta", xp: 30 }
  ];

  const statusOrder = ["Planuojama", "Mokomasi", "Atlikta"];

  const plannedCol = document.getElementById("comp-col-planned");
  const learningCol = document.getElementById("comp-col-learning");
  const doneCol = document.getElementById("comp-col-done");

  const totalXpEl = document.getElementById("comp-total-xp");
  const levelEl = document.getElementById("comp-level");
  const rankEl = document.getElementById("comp-rank");
  const progressTextEl = document.getElementById("comp-progress-text");
  const progressBarEl = document.getElementById("comp-progress-bar");
  const totalSkillsEl = document.getElementById("comp-total-skills");
  const doneSkillsEl = document.getElementById("comp-done-skills");
  const donePercentEl = document.getElementById("comp-done-percent");

  function loadSkills() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Nepavyko nuskaityti įgūdžių:", err);
    }
    return defaultSkills.map((item) => ({ ...item }));
  }

  let skills = loadSkills();

  function saveSkills() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
    } catch (err) {
      console.error("Nepavyko išsaugoti įgūdžių:", err);
    }
  }

  function getLevelAndRank(xp) {
    if (xp >= 300) {
      return { level: 4, rank: "Profesionalas", progress: 100 };
    }
    if (xp >= 150) {
      const progress = Math.round(((xp - 150) / 150) * 100);
      return { level: 3, rank: "Specialistas", progress };
    }
    if (xp >= 50) {
      const progress = Math.round(((xp - 50) / 100) * 100);
      return { level: 2, rank: "Praktikantas", progress };
    }
    const progress = Math.max(0, Math.min(100, Math.round((xp / 50) * 100)));
    return { level: 1, rank: "Pradedantysis", progress };
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cycleSkillStatus(skillId) {
    const skill = skills.find((s) => s.id === skillId);
    if (!skill) return;
    const currentIndex = statusOrder.indexOf(skill.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    skill.status = statusOrder[nextIndex];
    saveSkills();
    renderCompetencies();
  }

  function renderCompetencies() {
    if (!plannedCol || !learningCol || !doneCol) return;

    plannedCol.innerHTML = "";
    learningCol.innerHTML = "";
    doneCol.innerHTML = "";

    let earnedXp = 0;
    let doneCount = 0;

    skills.forEach((skill) => {
      const skillXp = Number(skill.xp) || 0;

      // XP įskaičiuojami, kai įgūdis yra "Atlikta" (100% XP) arba "Mokomasi" (50% XP)
      if (skill.status === "Atlikta") {
        earnedXp += skillXp;
        doneCount += 1;
      } else if (skill.status === "Mokomasi") {
        earnedXp += Math.round(skillXp * 0.5);
      }

      const card = document.createElement("div");
      card.className = "comp-skill-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("title", "Spustelėkite, kad pakeistumėte įgūdžio būseną");
      card.innerHTML = `
        <h4>${escapeHtml(skill.name)}</h4>
        <p class="comp-status">Būsena: ${escapeHtml(skill.status)}</p>
        <span class="comp-xp">${skillXp} XP</span>
      `;

      card.addEventListener("click", () => cycleSkillStatus(skill.id));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          cycleSkillStatus(skill.id);
        }
      });

      if (skill.status === "Planuojama") {
        plannedCol.appendChild(card);
      } else if (skill.status === "Mokomasi") {
        learningCol.appendChild(card);
      } else {
        doneCol.appendChild(card);
      }
    });

    const totalCount = skills.length;
    const donePercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    const { level, rank, progress } = getLevelAndRank(earnedXp);

    if (totalXpEl) totalXpEl.textContent = `${earnedXp} XP`;
    if (levelEl) levelEl.textContent = `${level} lygis`;
    if (rankEl) rankEl.textContent = rank;
    if (progressTextEl) progressTextEl.textContent = `${progress}%`;
    if (progressBarEl) progressBarEl.style.width = `${progress}%`;
    if (totalSkillsEl) totalSkillsEl.textContent = `${totalCount}`;
    if (doneSkillsEl) doneSkillsEl.textContent = `${doneCount}`;
    if (donePercentEl) donePercentEl.textContent = `${donePercent}%`;
  }

  renderCompetencies();

  /* =========================================================
     2. KONTAKTŲ FORMOS VALIDACIJA, FORMATAVIMAS IR APDOROJIMAS
     ========================================================= */
  const form = document.getElementById("custom-contact-form");
  if (!form) return;

  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const addressInput = document.getElementById("address");
  const rating1Input = document.getElementById("rating1");
  const rating2Input = document.getElementById("rating2");
  const rating3Input = document.getElementById("rating3");

  const submitBtn = document.getElementById("submit-btn");
  const clearBtn = document.getElementById("clear-btn");
  const resultBox = document.getElementById("form-result");

  const nameRegex = /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (message) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      if (errorEl) errorEl.textContent = message;
      return false;
    } else {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      if (errorEl) errorEl.textContent = "";
      return true;
    }
  }

  function clearValidationState(input, errorId) {
    input.classList.remove("is-invalid", "is-valid");
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = "";
  }

  function formatLithuanianPhone(rawValue) {
    let digits = rawValue.replace(/\D/g, "");

    if (digits.startsWith("86")) {
      digits = "370" + digits.slice(1);
    }

    if (digits.startsWith("6")) {
      digits = "370" + digits;
    }

    if (!digits.startsWith("370")) {
      if (digits.length === 0) return "";
      digits = "370" + digits;
    }

    digits = digits.slice(0, 11);

    const country = digits.slice(0, 3);
    const part1 = digits.slice(3, 6);
    const part2 = digits.slice(6, 11);

    let formatted = `+${country}`;
    if (part1.length > 0) {
      formatted += ` ${part1}`;
    }
    if (part2.length > 0) {
      formatted += ` ${part2}`;
    }
    return formatted;
  }

  function validatePhone() {
    const formatted = formatLithuanianPhone(phoneInput.value);
    phoneInput.value = formatted;

    const fullPhoneRegex = /^\+370 6\d{2} \d{5}$/;
    if (!formatted.trim()) {
      return setError(phoneInput, "error-phone", "Telefono numeris yra privalomas.");
    }
    if (!fullPhoneRegex.test(formatted)) {
      return setError(phoneInput, "error-phone", "Įveskite formatu +370 6xx xxxxx (8 skaitmenys po +370).");
    }
    return setError(phoneInput, "error-phone", "");
  }

  function validateFirstName() {
    const val = firstNameInput.value.trim();
    if (!val) {
      return setError(firstNameInput, "error-firstName", "Vardas yra privalomas.");
    }
    if (!nameRegex.test(val)) {
      return setError(firstNameInput, "error-firstName", "Vardą gali sudaryti tik raidės.");
    }
    return setError(firstNameInput, "error-firstName", "");
  }

  function validateLastName() {
    const val = lastNameInput.value.trim();
    if (!val) {
      return setError(lastNameInput, "error-lastName", "Pavardė yra privaloma.");
    }
    if (!nameRegex.test(val)) {
      return setError(lastNameInput, "error-lastName", "Pavardę gali sudaryti tik raidės.");
    }
    return setError(lastNameInput, "error-lastName", "");
  }

  function validateEmail() {
    const val = emailInput.value.trim();
    if (!val) {
      return setError(emailInput, "error-email", "El. paštas yra privalomas.");
    }
    if (!emailRegex.test(val)) {
      return setError(emailInput, "error-email", "Įveskite teisingą el. pašto adresą.");
    }
    return setError(emailInput, "error-email", "");
  }

  function validateAddress() {
    const val = addressInput.value.trim();
    if (!val) {
      return setError(addressInput, "error-address", "Adresas yra privalomas.");
    }
    return setError(addressInput, "error-address", "");
  }

  function validateRating(input, errorId, label) {
    const raw = input.value.trim();
    if (raw === "") {
      return setError(input, errorId, `${label} yra privalomas (1–10).`);
    }
    const num = Number(raw);
    if (!Number.isInteger(num) || num < 1 || num > 10) {
      return setError(input, errorId, "Vertė turi būti sveikas skaičius nuo 1 iki 10.");
    }
    return setError(input, errorId, "");
  }

  function checkFormValiditySilent() {
    const firstOk = firstNameInput.value.trim() !== "" && nameRegex.test(firstNameInput.value.trim());
    const lastOk = lastNameInput.value.trim() !== "" && nameRegex.test(lastNameInput.value.trim());
    const emailOk = emailInput.value.trim() !== "" && emailRegex.test(emailInput.value.trim());
    const phoneOk = /^\+370 6\d{2} \d{5}$/.test(phoneInput.value.trim());
    const addressOk = addressInput.value.trim() !== "";

    const ratingsOk = [rating1Input, rating2Input, rating3Input].every((inp) => {
      const n = Number(inp.value.trim());
      return inp.value.trim() !== "" && Number.isInteger(n) && n >= 1 && n <= 10;
    });

    const isAllValid = firstOk && lastOk && emailOk && phoneOk && addressOk && ratingsOk;
    submitBtn.disabled = !isAllValid;
    return isAllValid;
  }

  firstNameInput.addEventListener("input", () => {
    validateFirstName();
    checkFormValiditySilent();
  });

  lastNameInput.addEventListener("input", () => {
    validateLastName();
    checkFormValiditySilent();
  });

  emailInput.addEventListener("input", () => {
    validateEmail();
    checkFormValiditySilent();
  });

  phoneInput.addEventListener("input", () => {
    validatePhone();
    checkFormValiditySilent();
  });

  addressInput.addEventListener("input", () => {
    validateAddress();
    checkFormValiditySilent();
  });

  rating1Input.addEventListener("input", () => {
    validateRating(rating1Input, "error-rating1", "1-as vertinimas");
    checkFormValiditySilent();
  });

  rating2Input.addEventListener("input", () => {
    validateRating(rating2Input, "error-rating2", "2-as vertinimas");
    checkFormValiditySilent();
  });

  rating3Input.addEventListener("input", () => {
    validateRating(rating3Input, "error-rating3", "3-ias vertinimas");
    checkFormValiditySilent();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const v1 = validateFirstName();
    const v2 = validateLastName();
    const v3 = validateEmail();
    const v4 = validatePhone();
    const v5 = validateAddress();
    const v6 = validateRating(rating1Input, "error-rating1", "1-as vertinimas");
    const v7 = validateRating(rating2Input, "error-rating2", "2-as vertinimas");
    const v8 = validateRating(rating3Input, "error-rating3", "3-ias vertinimas");

    if (!(v1 && v2 && v3 && v4 && v5 && v6 && v7 && v8)) {
      submitBtn.disabled = true;
      return;
    }

    const r1 = Number(rating1Input.value.trim());
    const r2 = Number(rating2Input.value.trim());
    const r3 = Number(rating3Input.value.trim());
    const average = ((r1 + r2 + r3) / 3).toFixed(1);

    const formDataObj = {
      vardas: firstNameInput.value.trim(),
      pavarde: lastNameInput.value.trim(),
      elPastas: emailInput.value.trim(),
      telefonoNumeris: phoneInput.value.trim(),
      adresas: addressInput.value.trim(),
      ivertinimas1: r1,
      ivertinimas2: r2,
      ivertinimas3: r3,
      vidurkis: Number(average)
    };

    console.log("Formos duomenų objektas:", formDataObj);

    resultBox.innerHTML = `
      <p><strong>Vardas:</strong> ${formDataObj.vardas}</p>
      <p><strong>Pavardė:</strong> ${formDataObj.pavarde}</p>
      <p><strong>El. paštas:</strong> ${formDataObj.elPastas}</p>
      <p><strong>Tel. Numeris:</strong> ${formDataObj.telefonoNumeris}</p>
      <p><strong>Adresas:</strong> ${formDataObj.adresas}</p>
      <p><strong>Vertinimai:</strong> ${r1}, ${r2}, ${r3}</p>
      <p class="mt-2"><strong>${formDataObj.vardas} ${formDataObj.pavarde}: ${average}</strong></p>
    `;
    resultBox.classList.add("visible");
  });

  clearBtn.addEventListener("click", () => {
    form.reset();
    clearValidationState(firstNameInput, "error-firstName");
    clearValidationState(lastNameInput, "error-lastName");
    clearValidationState(emailInput, "error-email");
    clearValidationState(phoneInput, "error-phone");
    clearValidationState(addressInput, "error-address");
    clearValidationState(rating1Input, "error-rating1");
    clearValidationState(rating2Input, "error-rating2");
    clearValidationState(rating3Input, "error-rating3");

    resultBox.innerHTML = "";
    resultBox.classList.remove("visible");
    submitBtn.disabled = true;
  });
});