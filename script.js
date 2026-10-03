// ============================================================
//  KONFIGURASI API — Edit di sini jika ingin ganti endpoint
// ============================================================
const API_BASE = "https://am.dapjisync.my.id";
const API_KEY  = "FREE";
// Isi dengan Cloudflare Turnstile SITE KEY milik server/API Anda.
// Site Key bersifat publik; jangan masukkan Secret Key di sini.
const TURNSTILE_SITE_KEY = "GANTI_DENGAN_TURNSTILE_SITE_KEY";
// ============================================================

const emailInput  = document.getElementById("emailInput");
const magicInput  = document.getElementById("magicInput");
const sendBtn     = document.getElementById("sendBtn");
const activateBtn = document.getElementById("activateBtn");
const btnText     = document.getElementById("btnText");
const msgBox      = document.getElementById("msgBox");
const turnstileWidget = document.getElementById("turnstileWidget");

let turnstileToken = "";
let turnstileWidgetId = null;

// jobId WAJIB dari response Step 1 (/api/send)
let cachedJobId = "";

// ── Utility ──────────────────────────────────────────────────

function showMsg(text, type = "error") {
  const icon = type === "success"
    ? '<i class="fas fa-circle-check"></i>'
    : '<i class="fas fa-circle-exclamation"></i>';
  msgBox.innerHTML = icon + "<span>" + text + "</span>";
  msgBox.className = "message show " + type;
}

function hideMsg() {
  msgBox.className = "message";
  msgBox.innerHTML = "";
}

function parseApiError(data) {
  if (!data) return "Terjadi kesalahan tidak diketahui.";
  if (typeof data.error === "object" && data.error !== null) {
    const msg = data.error.message || "";
    if (msg.toLowerCase().includes("quota")) return "Kuota server sedang penuh. Coba lagi beberapa saat.";
    return msg || "Gagal memproses permintaan.";
  }
  if (typeof data.error === "string") {
    if (data.error.toLowerCase().includes("quota")) return "Kuota server sedang penuh. Coba lagi beberapa saat.";
    return data.error;
  }
  if (data.message) return data.message;
  return "Gagal memproses permintaan.";
}

// ── Cloudflare Turnstile ─────────────────────────────────────
function initTurnstile() {
  if (!turnstileWidget) return;

  if (!TURNSTILE_SITE_KEY || TURNSTILE_SITE_KEY === "GANTI_DENGAN_TURNSTILE_SITE_KEY") {
    turnstileWidget.innerHTML = '<div class="captcha-config">Cloudflare Turnstile belum dikonfigurasi. Isi TURNSTILE_SITE_KEY di script.js.</div>';
    return;
  }

  if (!window.turnstile) {
    setTimeout(initTurnstile, 300);
    return;
  }

  turnstileWidgetId = window.turnstile.render(turnstileWidget, {
    sitekey: TURNSTILE_SITE_KEY,
    callback: token => {
      turnstileToken = token || "";
      hideMsg();
    },
    'expired-callback': () => {
      turnstileToken = "";
      showMsg("Verifikasi Cloudflare kedaluwarsa. Selesaikan captcha lagi.", "error");
    },
    'error-callback': () => {
      turnstileToken = "";
      showMsg("Verifikasi Cloudflare gagal. Muat ulang halaman lalu coba lagi.", "error");
    }
  });
}

function resetTurnstile() {
  turnstileToken = "";
  if (window.turnstile && turnstileWidgetId !== null) {
    window.turnstile.reset(turnstileWidgetId);
  }
}

function captchaBody(token) {
  // Beberapa backend memakai nama field berbeda. Semua alias umum dikirim
  // agar mudah disesuaikan; server tetap harus memvalidasi token di backend.
  return {
    'cf-turnstile-response': token,
    turnstileToken: token,
    cfToken: token,
    captchaToken: token
  };
}

initTurnstile();

// ── STEP 1: Kirim Magic Link → dapat jobId dari response ─────
sendBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email || !email.includes("@")) {
    showMsg("Masukkan alamat email yang valid.", "error");
    emailInput.focus();
    return;
  }

  if (!turnstileToken) {
    showMsg("Selesaikan verifikasi Cloudflare terlebih dahulu.", "error");
    return;
  }

  const oldHtml = sendBtn.innerHTML;
  sendBtn.innerHTML = '<div class="loader"></div>';
  sendBtn.disabled = true;
  activateBtn.disabled = true;
  cachedJobId = "";
  hideMsg();

  try {
    const res  = await fetch(`${API_BASE}/api/send`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ gmail: email, apikey: API_KEY, ...captchaBody(turnstileToken) })
    });
    const data = await res.json();
    // Turnstile token umumnya hanya boleh dipakai sekali.
    resetTurnstile();

    // Ambil jobId dari response Step 1 — ini satu-satunya sumber jobId
    const jobId = data.jobId || data.job_id
      || data.result?.jobId || data.result?.job_id
      || "";

    if (jobId) {
      cachedJobId = jobId;
      showMsg("Magic Link terkirim! Cek inbox email → salin URL-nya → tempel di bawah.", "success");
      magicInput.focus();
      sendBtn.classList.add("sent");
      sendBtn.innerHTML = '<i class="fas fa-check"></i>';
      activateBtn.disabled = false;
      setTimeout(() => {
        sendBtn.innerHTML = oldHtml;
        sendBtn.classList.remove("sent");
        sendBtn.disabled = false;
      }, 3000);
    } else {
      // Respons OK tapi ga ada jobId — tampilkan error
      showMsg(parseApiError(data) || "Gagal mendapatkan Job ID. Coba lagi.", "error");
      sendBtn.innerHTML = oldHtml;
      sendBtn.disabled = false;
      activateBtn.disabled = false;
    }
  } catch (err) {
    showMsg("Koneksi gagal. Periksa internet kamu lalu coba lagi.", "error");
    sendBtn.innerHTML = oldHtml;
    sendBtn.disabled = false;
    activateBtn.disabled = false;
  }
});

// ── STEP 2: Verifikasi pakai jobId dari Step 1 + link dari email ──
activateBtn.addEventListener("click", async () => {
  const magic = magicInput.value.trim();

  // Validasi: jobId harus sudah ada dari Step 1
  if (!cachedJobId) {
    showMsg("Kamu harus tekan Kirim dulu untuk mendapatkan Magic Link ke email.", "error");
    emailInput.focus();
    return;
  }

  if (!magic || !magic.startsWith("http")) {
    showMsg("Tempel URL Magic Link dari email kamu.", "error");
    magicInput.focus();
    return;
  }

  btnText.innerHTML = '<div class="loader"></div> Menghubungkan...';
  activateBtn.disabled = true;
  hideMsg();

  try {
    const body = {
      jobId:  cachedJobId,
      link:   magic,
      apikey: API_KEY
    };

    const res  = await fetch(`${API_BASE}/api/verif`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body)
    });
    const data = await res.json();

    if (data.status || data.success || data.result?.state === "SUCCESS" || res.ok) {
      activateBtn.classList.add("success-state");
      btnText.innerHTML = '<i class="fas fa-circle-check"></i> Berhasil Diaktifkan!';
      showMsg("Lisensi Premium berhasil diaktifkan! Buka Alight Motion sekarang.", "success");
      cachedJobId = "";
    } else {
      showMsg(parseApiError(data), "error");
      btnText.innerHTML = '<i class="fas fa-shield-halved"></i> Verifikasi & Aktifkan';
      activateBtn.disabled = false;
    }
  } catch (err) {
    showMsg("Koneksi gagal. Periksa internet kamu lalu coba lagi.", "error");
    btnText.innerHTML = '<i class="fas fa-shield-halved"></i> Verifikasi & Aktifkan';
    activateBtn.disabled = false;
  }
});

// ── Keyboard shortcuts ────────────────────────────────────────
emailInput.addEventListener("keydown", e => { if (e.key === "Enter") sendBtn.click(); });
magicInput.addEventListener("keydown", e => { if (e.key === "Enter") activateBtn.click(); });
