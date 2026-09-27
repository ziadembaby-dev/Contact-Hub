let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
let editingId = null;
let tempPhoto = "";
let searchTerm = "";

const nameRegex = /^[A-Za-z\u0600-\u06FF ]{2,50}$/;
const phoneRegex = /^01[0125][0-9]{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const groupColors = {
  family: "#7f22fe",
  friends: "#2b7fff",
  work: "#ffb900",
  school: "#009966",
  other: "#99a1af",
};

function saveContacts() {
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

function getInitials(name) {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function avatarHTML(contact, size) {
  if (contact.photo) {
    return `<img src="${contact.photo}" alt="${contact.name}" style="width:100%;height:100%;object-fit:cover;">`;
  }
  return `<div class="w-100 h-100 d-flex justify-content-center align-items-center text-white fw-bold" style="background:linear-gradient(to bottom right,var(--primary-color),var(--primary-dark));font-size:${
    size === "mini" ? "0.75rem" : "1.1rem"
  };">${getInitials(contact.name)}</div>`;
}

function toggleModel(state) {
  const model = document.getElementById("model");
  if (state === "open") {
    model.classList.remove("d-none");
    model.classList.add("d-flex");
    document.body.style.overflow = "hidden";
  } else {
    model.classList.add("d-none");
    model.classList.remove("d-flex");
    document.body.style.overflow = "";
    resetForm();
  }
}

function resetForm() {
  editingId = null;
  tempPhoto = "";

  document.getElementById("model-title").textContent = "Add New Contact";
  document.getElementById("name").value = "";
  document.getElementById("number").value = "";
  document.getElementById("email").value = "";
  document.getElementById("address").value = "";
  document.getElementById("group").value = "";
  document.getElementById("notes").value = "";
  document.getElementById("isFavorite").checked = false;
  document.getElementById("isEmergency").checked = false;
  document.getElementById("img").value = "";

  ["emsgName", "emsgNumber", "emsgEmail"].forEach((id) =>
    document.getElementById(id).classList.add("d-none"),
  );

  const preview = document.querySelector(".avatarPreview");
  preview.innerHTML = '<i class="fa-solid fa-user"></i>';

  document.getElementById("addContactBtn").classList.remove("d-none");
  document.getElementById("updateContactBtn").classList.add("d-none");
}

document.getElementById("img").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (ev) {
    tempPhoto = ev.target.result;
    const preview = document.querySelector(".avatarPreview");
    preview.innerHTML = `<img src="${tempPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  };
  reader.readAsDataURL(file);
});

function validator(field, value) {
  if (field === "name") {
    const ok = nameRegex.test(value.trim());
    document
      .getElementById("emsgName")
      .classList.toggle("d-none", ok || value.trim() === "");
    return ok;
  }
  if (field === "number") {
    const ok = phoneRegex.test(value.trim());
    document
      .getElementById("emsgNumber")
      .classList.toggle("d-none", ok || value.trim() === "");
    return ok;
  }
  if (field === "email") {
    const ok = value.trim() === "" || emailRegex.test(value.trim());
    document.getElementById("emsgEmail").classList.toggle("d-none", ok);
    return ok;
  }
}

function validateForm() {
  const name = document.getElementById("name").value.trim();
  const number = document.getElementById("number").value.trim();
  const email = document.getElementById("email").value.trim();

  const nameOk = validator("name", name);
  const numberOk = validator("number", number);
  const emailOk = validator("email", email);

  if (name === "")
    document.getElementById("emsgName").classList.remove("d-none");
  if (number === "")
    document.getElementById("emsgNumber").classList.remove("d-none");

  return nameOk && numberOk && emailOk && name !== "" && number !== "";
}

function readFormData() {
  return {
    name: document.getElementById("name").value.trim(),
    number: document.getElementById("number").value.trim(),
    email: document.getElementById("email").value.trim(),
    address: document.getElementById("address").value.trim(),
    group: document.getElementById("group").value,
    notes: document.getElementById("notes").value.trim(),
    isFavorite: document.getElementById("isFavorite").checked,
    isEmergency: document.getElementById("isEmergency").checked,
    photo: tempPhoto,
  };
}

function addContact() {
  if (!validateForm()) return;

  const data = readFormData();
  data.id = Date.now().toString();

  contacts.unshift(data);
  saveContacts();
  renderAll();
  toggleModel("close");
}

function editContact(id) {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;

  editingId = id;
  tempPhoto = contact.photo || "";

  document.getElementById("model-title").textContent = "Edit Contact";
  document.getElementById("name").value = contact.name;
  document.getElementById("number").value = contact.number;
  document.getElementById("email").value = contact.email;
  document.getElementById("address").value = contact.address;
  document.getElementById("group").value = contact.group;
  document.getElementById("notes").value = contact.notes;
  document.getElementById("isFavorite").checked = contact.isFavorite;
  document.getElementById("isEmergency").checked = contact.isEmergency;

  const preview = document.querySelector(".avatarPreview");
  preview.innerHTML = contact.photo
    ? `<img src="${contact.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
    : '<i class="fa-solid fa-user"></i>';

  document.getElementById("addContactBtn").classList.add("d-none");
  document.getElementById("updateContactBtn").classList.remove("d-none");

  toggleModel("open");
}

function updateContact() {
  if (!validateForm()) return;
  if (!editingId) return;

  const idx = contacts.findIndex((c) => c.id === editingId);
  if (idx === -1) return;

  const data = readFormData();
  data.id = editingId;

  contacts[idx] = data;
  saveContacts();
  renderAll();
  toggleModel("close");
}

function deleteContact(id) {
  if (!confirm("Are you sure you want to delete this contact?")) return;
  contacts = contacts.filter((c) => c.id !== id);
  saveContacts();
  renderAll();
}

function toggleFavorite(id) {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;
  contact.isFavorite = !contact.isFavorite;
  saveContacts();
  renderAll();
}

function toggleEmergency(id) {
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;
  contact.isEmergency = !contact.isEmergency;
  saveContacts();
  renderAll();
}

function search(value) {
  searchTerm = value.trim().toLowerCase();
  renderAll();
}

function getFilteredContacts() {
  if (!searchTerm) return contacts;
  return contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm) ||
      c.number.toLowerCase().includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm)),
  );
}

function renderStats() {
  document.getElementById("totalNum").textContent = contacts.length;
  document.getElementById("favoritesNum").textContent = contacts.filter(
    (c) => c.isFavorite,
  ).length;
  document.getElementById("emergencyNum").textContent = contacts.filter(
    (c) => c.isEmergency,
  ).length;
  document.getElementById("totalContactsNum").textContent = contacts.length;
}

function renderContacts() {
  const container = document.getElementById("contactContainer");
  const empty = document.getElementById("emptyContact");
  const list = getFilteredContacts();

  if (list.length === 0) {
    container.innerHTML = "";
    empty.classList.remove("d-none");
    empty.classList.add("d-flex");
    return;
  }

  empty.classList.add("d-none");
  empty.classList.remove("d-flex");

  container.innerHTML = list
    .map((c) => {
      const groupBadge = c.group
        ? `<span class="badge rounded-pill fs-8 fw-medium" style="background-color:${groupColors[c.group] || "#99a1af"}1a;color:${groupColors[c.group] || "#99a1af"};">${c.group}</span>`
        : "";

      return `
      <div class="col-12 col-md-6">
        <div class="card rounded-4 p-3-5 bg-white border h-100">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div class="d-flex gap-3">
              <figure class="card-icon rounded-3 m-0 overflow-hidden flex-shrink-0">
                ${avatarHTML(c, "normal")}
              </figure>
              <div>
                <h3 class="fs-6 fw-bold m-0 d-flex align-items-center gap-2">
                  ${c.name}
                  ${c.isFavorite ? '<i class="fa-solid fa-star text-warning fs-8"></i>' : ""}
                </h3>
                <p class="m-0 fs-8 text-secondary">${c.number}</p>
              </div>
            </div>
            <div class="d-flex flex-column align-items-end gap-1">
              ${c.isEmergency ? '<span class="badge rounded-pill isEmergency fs-8 fw-medium">Emergency</span>' : ""}
              ${groupBadge}
            </div>
          </div>

          ${
            c.email || c.address || c.notes
              ? `<div class="d-flex flex-column gap-2 mt-3">
                  ${
                    c.email
                      ? `<div class="d-flex align-items-center gap-2">
                          <span class="card-body-icon card-body-icon-3"><i class="fa-solid fa-envelope"></i></span>
                          <span class="fs-8 text-secondary">${c.email}</span>
                        </div>`
                      : ""
                  }
                  ${
                    c.address
                      ? `<div class="d-flex align-items-center gap-2">
                          <span class="card-body-icon card-body-icon-1"><i class="fa-solid fa-location-dot"></i></span>
                          <span class="fs-8 text-secondary">${c.address}</span>
                        </div>`
                      : ""
                  }
                  ${
                    c.notes
                      ? `<div class="d-flex align-items-center gap-2">
                          <span class="card-body-icon card-body-icon-2"><i class="fa-solid fa-note-sticky"></i></span>
                          <span class="fs-8 text-secondary">${c.notes}</span>
                        </div>`
                      : ""
                  }
                </div>`
              : ""
          }

          <div class="card-footer d-flex gap-2 mt-3 justify-content-between">
           <div class="d-flex gap-2">
            <a href="tel:${c.number}" title="Call">
              <i class="fa-solid fa-phone"></i>
            </a>
            <a href="mailto:${c.email || ""}" title="Email">
              <i class="fa-solid fa-envelope"></i>
            </a>
           
           </div>
           <div class="d-flex gap-2">
           
            <button onclick="toggleFavorite('${c.id}')" title="Favorite">
              <i class="fa-solid fa-star ${c.isFavorite ? "text-warning" : ""}"></i>
            </button>
            <button onclick="toggleEmergency('${c.id}')" title="Emergency">
              <i class="fa-solid fa-heart-pulse ${c.isEmergency ? "text-danger" : ""}"></i>
            </button>
            <button onclick="editContact('${c.id}')" title="Edit">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button onclick="deleteContact('${c.id}')" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
           </div>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

function renderMiniList(list, containerId, emptyId, type) {
  const container = document.getElementById(containerId);
  const empty = document.getElementById(emptyId);

  if (list.length === 0) {
    container.innerHTML = "";
    empty.classList.remove("d-none");
    return;
  }

  empty.classList.add("d-none");

  container.innerHTML = list
    .map(
      (c) => `
      <div class="mini-card ${
        type === "favorite" ? "mini-card-favorite" : "mini-card-emergency"
      } d-flex align-items-center gap-2 p-2 rounded-3 w-100">
        <figure class="card-icon-mini rounded-circle m-0 overflow-hidden flex-shrink-0">
          ${avatarHTML(c, "mini")}
        </figure>
        <div class="flex-grow-1 overflow-hidden">
          <p class="m-0 fs-8 fw-bold text-truncate">${c.name}</p>
          <p class="m-0 fs-8 text-secondary text-truncate">${c.number}</p>
        </div>
        <a href="tel:${c.number}" title="Call">
          <i class="fa-solid fa-phone"></i>
        </a>
      </div>`,
    )
    .join("");
}

function renderSidebars() {
  renderMiniList(
    contacts.filter((c) => c.isFavorite),
    "favoritesContact",
    "empty-favorites",
    "favorite",
  );
  renderMiniList(
    contacts.filter((c) => c.isEmergency),
    "emergencyContact",
    "empty-emergency",
    "emergency",
  );
}

function renderAll() {
  renderStats();
  renderContacts();
  renderSidebars();
}

renderAll();
