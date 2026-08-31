// =========================================
// مكتب الجمعية الشرعية - MAIN JS
// ربط الصفحة الرئيسية باللوحات الثلاث
// =========================================

const currentYear = document.getElementById("currentYear");
if (currentYear) currentYear.textContent = new Date().getFullYear();

const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.forEach(function (item) { item.classList.remove("active"); });
        this.classList.add("active");
    });
});

const navMenu = document.getElementById("mainNav");
navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        if (window.innerWidth < 992 && window.bootstrap && navMenu) {
            const collapse = bootstrap.Collapse.getInstance(navMenu);
            if (collapse) collapse.hide();
        }
    });
});

// =========================================
// بيانات الحلقات - Array + Objects
// =========================================
const halaqat = [
    {
        id: 1,
        name: "حلقة التجويد وتصحيح التلاوة",
        teacher: "الشيخ إبراهيم عطية",
        level: "جميع الأعمار"
    },
    {
        id: 2,
        name: "حلقة المراجعة المكثفة",
        teacher: "الشيخ سامي نصار",
        level: "للمحفوظ السابق"
    },
    {
        id: 3,
        name: "حلقة الحفظ والمراجعة",
        teacher: "الشيخ محمد سعدالله",
        level: "مبتدئين ومتقدمين"
    },
    {
        id: 4,
        name: "حلقة الفتيات - حفظ ومراجعة",
        teacher: "المعلمة رحمة إدريس",
        level: "للفتيات"
    },
    {
        id: 5,
        name: "حلقة الناشئات - تلاوة",
        teacher: "المعلمة أميرة إدريس",
        level: "للفتيات"
    },
    {
        id: 6,
        name: "حلقة التلاوة والمراجعة",
        teacher: "المعلمة ياسمين الصعيدي",
        level: "للفتيات"
    }
];

// =========================================
// قاعدة البيانات التجريبية المشتركة (Front-End فقط)
// =========================================
const groupTeacherMap = {
    "الحفظ والمراجعة": "الشيخ محمد سعدالله",
    "التجويد وتصحيح التلاوة": "الشيخ إبراهيم عطية",
    "المراجعة المكثفة": "الشيخ سامي نصار",
    "حلقة الفتيات - حفظ ومراجعة": "المعلمة رحمة إدريس",
    "حلقة الناشئات - تلاوة": "المعلمة أميرة إدريس",
    "حلقة التلاوة والمراجعة": "المعلمة ياسمين الصعيدي"
};

const demoStudents = [
    { id: 1, name: "أحمد محمد علي", group: "الحفظ والمراجعة", level: "المرحلة المتوسطة", progress: 82, attendance: "present", lastSurah: "سورة آل عمران", note: "طالب ملتزم ويتقدم بشكل جيد." },
    { id: 2, name: "محمد إبراهيم", group: "التجويد وتصحيح التلاوة", level: "ممتاز", progress: 91, attendance: "present", lastSurah: "سورة النساء", note: "مستوى ممتاز في التلاوة." },
    { id: 3, name: "عبد الرحمن محمود", group: "المراجعة المكثفة", level: "جيد", progress: 65, attendance: "present", lastSurah: "سورة البقرة", note: "يحتاج إلى متابعة المراجعة." },
    { id: 4, name: "يوسف أحمد", group: "الحفظ والمراجعة", level: "جيد", progress: 55, attendance: "present", lastSurah: "سورة الفاتحة", note: "يتقدم بشكل جيد." },
    { id: 5, name: "عمر خالد", group: "التجويد وتصحيح التلاوة", level: "ممتاز", progress: 88, attendance: "present", lastSurah: "سورة المائدة", note: "تقدم ممتاز هذا الأسبوع." },
    { id: 6, name: "محمد إيهاب", group: "المراجعة المكثفة", level: "جيد", progress: 60, attendance: "absent", lastSurah: "سورة البقرة", note: "يحتاج إلى مراجعة الحفظ السابق." },
    { id: 7, name: "رحمة أحمد", group: "حلقة الفتيات - حفظ ومراجعة", level: "جيد جدًا", progress: 74, attendance: "present", lastSurah: "سورة الملك", note: "طالبة ملتزمة." },
    { id: 8, name: "سارة محمد", group: "حلقة الناشئات - تلاوة", level: "جيد", progress: 68, attendance: "present", lastSurah: "سورة يس", note: "تحتاج إلى المزيد من المراجعة." },
    { id: 9, name: "مريم علي", group: "حلقة التلاوة والمراجعة", level: "ممتاز", progress: 95, attendance: "present", lastSurah: "سورة الرحمن", note: "مستوى متميز." }
];

function initializeSharedData() {
    let students = [];
    try {
        students = JSON.parse(localStorage.getItem("quranStudents") || "[]");
    } catch (error) {
        students = [];
    }

    if (!Array.isArray(students) || students.length === 0) {
        students = demoStudents.map(function (student) {
            return {
                ...student,
                teacher: groupTeacherMap[student.group],
                status: "نشط"
            };
        });
    } else {
        students = students.map(function (student) {
            const group = student.group || "الحفظ والمراجعة";
            return {
                progress: 0,
                attendance: "present",
                lastSurah: "-",
                status: "نشط",
                ...student,
                group: group,
                teacher: groupTeacherMap[group] || student.teacher || "الشيخ محمد سعدالله"
            };
        });
    }

    localStorage.setItem("quranStudents", JSON.stringify(students));
    localStorage.setItem("teacherStudents", JSON.stringify(students));

    if (!localStorage.getItem("adminNotifications")) {
        localStorage.setItem("adminNotifications", JSON.stringify([
            {
                title: "مرحبًا بك في لوحة الإدارة",
                text: "يمكنك متابعة الطلاب والمعلمين والحلقات والتسميع من مكان واحد."
            },
            {
                title: "تذكير",
                text: "يرجى متابعة تسميع الطلاب وتحديث سجلاتهم بشكل مستمر."
            }
        ]));
    }
}

initializeSharedData();

// حفظ بيانات الحلقة التي شاهدها المستخدم
const halaqaCards = document.querySelectorAll(".halaqa-card");
halaqaCards.forEach(function (card, index) {
    card.addEventListener("click", function () {
        if (halaqat[index]) {
            localStorage.setItem("lastHalaqa", JSON.stringify(halaqat[index]));
        }
    });
});

// =========================================
// الانتقال إلى اللوحات
// =========================================
// من الصفحة الرئيسية لا ندخل أي لوحة مباشرة.
// الطالب يمر أولاً بتسجيل الدخول ثم يختار الحلقة.
// المعلم والإدارة يمران بتسجيل الدخول ثم ينتقلان للوحة المناسبة.
function openDashboard(type) {
    const modal = document.getElementById("loginModal");
    const role = document.getElementById("loginRole");

    if (role) role.value = type;

    if (modal) {
        modal.classList.add("show");
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");

        const username = document.getElementById("loginUsername");
        if (username) {
            username.value = type === "teacher" ? "teacher" :
                             type === "admin" ? "admin" : "student";
        }

        const password = document.getElementById("loginPassword");
        if (password) password.value = "";

        const error = document.getElementById("loginError");
        if (error) error.textContent = "";
        if (password) setTimeout(() => password.focus(), 100);
    }
}

const dashboardButtons = document.querySelectorAll(".dashboard-btn");
dashboardButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        openDashboard(this.getAttribute("data-dashboard"));
    });
});


// =========================================
// اختيار الحلقة للطالب
// =========================================
const studentHalaqat = [
    { id: 1, name: "حلقة الحفظ والمراجعة", teacher: "الشيخ محمد سعدالله", level: "مبتدئين ومتقدمين" },
    { id: 2, name: "حلقة التجويد وتصحيح التلاوة", teacher: "الشيخ إبراهيم عطية", level: "جميع الأعمار" },
    { id: 3, name: "حلقة المراجعة المكثفة", teacher: "الشيخ سامي نصار", level: "للمحفوظ السابق" },
    { id: 4, name: "حلقة الفتيات - حفظ ومراجعة", teacher: "المعلمة رحمة إدريس", level: "للفتيات" },
    { id: 5, name: "حلقة الناشئات - تلاوة", teacher: "المعلمة أميرة إدريس", level: "للفتيات" },
    { id: 6, name: "حلقة التلاوة والمراجعة", teacher: "المعلمة ياسمين الصعيدي", level: "للفتيات" }
];

function createHalaqaModal() {
    if (document.getElementById("halaqaChoiceModal")) return;

    const modal = document.createElement("div");
    modal.id = "halaqaChoiceModal";
    modal.className = "halaqa-choice-modal";
    modal.innerHTML = `
        <div class="halaqa-choice-box" role="dialog" aria-modal="true">
            <button type="button" class="halaqa-choice-close" id="closeHalaqaChoice">×</button>
            <div class="halaqa-choice-icon"><i class="bi bi-book-half"></i></div>
            <h2>اختاري الحلقة</h2>
            <p>بعد تسجيل الدخول كطالب، اختاري الحلقة التي تريدين الانضمام إليها.</p>
            <div class="halaqa-choice-grid" id="halaqaChoiceGrid"></div>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("closeHalaqaChoice").addEventListener("click", closeHalaqaChoice);
    modal.addEventListener("click", function(e) {
        if (e.target === modal) closeHalaqaChoice();
    });
}

function showHalaqaChoice() {
    createHalaqaModal();
    const modal = document.getElementById("halaqaChoiceModal");
    const grid = document.getElementById("halaqaChoiceGrid");

    grid.innerHTML = studentHalaqat.map(function(h) {
        return `
            <button class="halaqa-choice-card" type="button" data-halaqa-id="${h.id}">
                <span class="choice-icon"><i class="bi bi-book"></i></span>
                <span class="choice-content">
                    <strong>${h.name}</strong>
                    <small>${h.teacher}</small>
                    <em>${h.level}</em>
                </span>
                <i class="bi bi-arrow-left"></i>
            </button>
        `;
    }).join("");

    grid.querySelectorAll(".halaqa-choice-card").forEach(function(card) {
        card.addEventListener("click", function() {
            const id = Number(this.dataset.halaqaId);
            const group = studentHalaqat.find(h => h.id === id);
            if (!group) return;

            // نختار طالبًا تجريبيًا من نفس الحلقة، حتى تظهر البيانات
            // مترابطة في لوحة الطالب والمعلم والإدارة.
            const students = JSON.parse(localStorage.getItem("quranStudents") || "[]");
            const sharedStudent = students.find(s =>
                s.group === group.name ||
                (s.teacher === group.teacher)
            );

            // تثبيت جلسة الطالب قبل الانتقال للوحة
            const studentId = sharedStudent ? sharedStudent.id : 1;
            const studentName = sharedStudent ? sharedStudent.name : "أحمد محمد علي";

            localStorage.setItem("currentRole", "student");
            localStorage.setItem("currentStudentId", String(studentId));
            localStorage.setItem("selectedHalaqaId", String(group.id));
            localStorage.setItem("selectedHalaqaName", group.name);
            localStorage.setItem("selectedHalaqaTeacher", group.teacher);
            localStorage.setItem("quranUser", JSON.stringify({
                id: studentId,
                name: studentName,
                role: "student"
            }));

            closeHalaqaChoice();
            window.location.href = "student.html";
        });
    });

    modal.classList.add("show");
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
}

function closeHalaqaChoice() {
    const modal = document.getElementById("halaqaChoiceModal");
    if (!modal) return;
    modal.classList.remove("show");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
}

// =========================================
// تسجيل الدخول - Front-End فقط
// لا يوجد Backend أو API خارجي.
// الحسابات التجريبية:
// طالب: student / 1234
// معلم: teacher / 1234
// إدارة: admin / 1234
// =========================================
const builtInTeacherAccounts = {
    ibrahim: { name: "الشيخ إبراهيم عطية", password: "1111", group: "حلقة التجويد وتصحيح التلاوة" },
    sami: { name: "الشيخ سامي نصار", password: "2222", group: "حلقة المراجعة المكثفة" },
    mohamed: { name: "الشيخ محمد سعدالله", password: "3333", group: "حلقة الحفظ والمراجعة" },
    rahma: { name: "المعلمة رحمة إدريس", password: "4444", group: "حلقة الفتيات - حفظ ومراجعة" },
    amira: { name: "المعلمة أميرة إدريس", password: "5555", group: "حلقة الناشئات - تلاوة" },
    yasmeen: { name: "المعلمة ياسمين الصعيدي", password: "6666", group: "حلقة التلاوة والمراجعة" }
};

// نحتفظ بأي معلمين أضافتهم الإدارة، لكن الحسابات الأساسية لها الأولوية.
let teacherAccounts = {};
try {
    const savedTeachers = JSON.parse(localStorage.getItem("quranTeachers") || "{}");
    if (savedTeachers && typeof savedTeachers === "object") {
        teacherAccounts = Object.assign({}, savedTeachers);
    }
} catch (e) {}
teacherAccounts = Object.assign({}, teacherAccounts, builtInTeacherAccounts);

(function setupLogin() {
    if (window.__quranLoginReady) return;
    window.__quranLoginReady = true;

    function get(id) {
        return document.getElementById(id);
    }

    function showLoginModal() {
        const modal = get("loginModal");
        if (!modal) return;
        modal.classList.add("show");
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");

        const error = get("loginError");
        if (error) error.textContent = "";

        const role = get("loginRole");
        const username = get("loginUsername");
        if (role && username && !username.value) {
            username.value = role.value === "teacher" ? Object.keys(teacherAccounts)[0] :
                             role.value === "admin" ? "admin" : "student";
        }
        if (username) setTimeout(function () { username.focus(); }, 50);
    }

    function hideLoginModal() {
        const modal = get("loginModal");
        if (!modal) return;
        modal.classList.remove("show");
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
    }

    function openDashboard(type) {
        localStorage.setItem("currentRole", type);

        if (type === "student") {
            localStorage.setItem("currentStudentId", "1");
            window.location.href = "student.html";
        } else if (type === "teacher") {
            const teacher = teacherAccounts[localStorage.getItem("currentTeacherUsername") || "ibrahim"];
            localStorage.setItem("currentTeacher", teacher ? teacher.name : "الشيخ إبراهيم عطية");
            window.location.href = "teacher.html";
        } else if (type === "admin") {
            window.location.href = "admin.html";
        }
    }

    // Event delegation: يعمل حتى لو تغير مكان زر الدخول أو أُعيد رسمه.
    document.addEventListener("click", function (event) {
        const loginButton = event.target.closest("#loginBtn");
        if (loginButton) {
            event.preventDefault();
            showLoginModal();
            return;
        }

        const closeButton = event.target.closest("#closeLoginModal");
        if (closeButton) {
            event.preventDefault();
            hideLoginModal();
            return;
        }

        const modal = get("loginModal");
        if (modal && event.target === modal) {
            hideLoginModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") hideLoginModal();
    });

    document.addEventListener("change", function (event) {
        if (event.target && event.target.id === "loginRole") {
            const username = get("loginUsername");
            if (username) {
                username.value =
                    event.target.value === "teacher" ? Object.keys(teacherAccounts)[0] :
                    event.target.value === "admin" ? "admin" : "student";
            }
        }
    });

    document.addEventListener("submit", function (event) {
        if (!event.target || event.target.id !== "loginForm") return;

        event.preventDefault();

        const role = (get("loginRole")?.value || "student").trim();
        const username = (get("loginUsername")?.value || "").trim().toLowerCase();
        const password = get("loginPassword")?.value || "";
        const error = get("loginError");

        let matchedStudent = null;

        if (role === "student") {
            let students = [];
            try {
                students = JSON.parse(localStorage.getItem("quranStudents") || "[]");
            } catch (e) {
                students = [];
            }

            matchedStudent = students.find(function (student) {
                return String(student.username || "").toLowerCase() === username &&
                       String(student.password || "") === password;
            }) || null;
        }

        const teacherAccount = role === "teacher" ? teacherAccounts[username] : null;

// لو كانت كلمة المرور صحيحة لحساب معلم لكن اسم المستخدم لم يتغير،
// نحدد الحساب الصحيح من كلمة المرور الفريدة للحسابات الأساسية.
let resolvedTeacherUsername = username;
let resolvedTeacherAccount = teacherAccount;
if (role === "teacher" && !resolvedTeacherAccount) {
    const match = Object.keys(teacherAccounts).find(function (key) {
        return String(teacherAccounts[key].password) === String(password);
    });
    if (match) {
        resolvedTeacherUsername = match;
        resolvedTeacherAccount = teacherAccounts[match];
    }
}
const teacherValid = Boolean(
    resolvedTeacherAccount &&
    String(resolvedTeacherAccount.password) === String(password)
);
const demoValid =
            password === "1234" &&
            ((role === "student" && username === "student") ||
             (role === "admin" && username === "admin"));

        const valid = Boolean(matchedStudent || teacherValid || demoValid);

        if (!valid) {
            if (error) error.textContent =
                role === "student"
                    ? "بيانات الطالب غير صحيحة. استخدمي بيانات طالب أضافتها الإدارة، أو student / 1234 للتجربة."
                    : "بيانات الدخول غير صحيحة. استخدمي كلمة المرور 1234 للحساب التجريبي.";
            return;
        }

        const user = {
            id: matchedStudent ? matchedStudent.id : (role === "student" ? 1 : role),
            name: matchedStudent ? matchedStudent.name :
                  role === "student" ? "أحمد محمد علي" :
                  role === "teacher" ? (resolvedTeacherAccount ? resolvedTeacherAccount.name : "المعلم") :
                  "مدير المكتب",
            role: role
        };

        localStorage.setItem("quranUser", JSON.stringify(user));

        if (teacherValid) {
            localStorage.setItem("currentTeacherUsername", resolvedTeacherUsername);
            localStorage.setItem("currentTeacher", resolvedTeacherAccount.name);
            localStorage.setItem("selectedHalaqaName", resolvedTeacherAccount.group);
            const teacherGroup = studentHalaqat.find(function (h) { return h.name === resolvedTeacherAccount.group; });
            if (teacherGroup) {
                localStorage.setItem("selectedHalaqaId", String(teacherGroup.id));
                localStorage.setItem("selectedHalaqaTeacher", resolvedTeacherAccount.name);
            }
        }

        if (matchedStudent) {
            localStorage.setItem("currentStudentId", String(matchedStudent.id));
            localStorage.setItem("selectedHalaqaName", matchedStudent.group || "");
            localStorage.setItem("selectedHalaqaTeacher", matchedStudent.teacher || "");
        }

        hideLoginModal();

        // الطالب المسجل ببياناته يدخل إلى الحلقة المسجلة له.
        // الحساب التجريبي فقط يعرض شاشة اختيار الحلقة.
        if (role === "student") {
            if (matchedStudent && matchedStudent.group) {
                const selected = studentHalaqat.find(function (h) {
                    return h.name === matchedStudent.group;
                });
                if (selected) {
                    localStorage.setItem("selectedHalaqaId", String(selected.id));
                    localStorage.setItem("selectedHalaqaName", selected.name);
                    localStorage.setItem("selectedHalaqaTeacher", selected.teacher);
                }
                window.location.href = "student.html";
            } else {
                setTimeout(showHalaqaChoice, 150);
            }
        } else {
            openDashboard(role);
        }
    });
})();

// =========================================
// Sidebar التجريبي في الصفحة الرئيسية
// =========================================
const dashboardSidebar = document.getElementById("dashboardSidebar");
const dashboardOverlay = document.getElementById("dashboardOverlay");
const closeSidebar = document.getElementById("closeSidebar");
const sidebarTitle = document.getElementById("sidebarTitle");
const sidebarItems = document.querySelectorAll(".sidebar-item");

function closeDashboardSidebar() {
    if (dashboardSidebar) dashboardSidebar.classList.remove("open");
    if (dashboardOverlay) dashboardOverlay.classList.remove("show");
    document.body.style.overflow = "";
}

if (closeSidebar) closeSidebar.addEventListener("click", closeDashboardSidebar);
if (dashboardOverlay) dashboardOverlay.addEventListener("click", closeDashboardSidebar);

sidebarItems.forEach(function (item) {
    item.addEventListener("click", function () {
        sidebarItems.forEach(function (element) { element.classList.remove("active"); });
        this.classList.add("active");
    });
});

// زر الدخول القديم إن كان موجودًا في النسخة الحالية
const oldDashboardButtons = document.querySelectorAll("[data-dashboard]");
oldDashboardButtons.forEach(function (button) {
    button.addEventListener("mouseenter", function () {
        if (sidebarTitle) {
            const type = this.getAttribute("data-dashboard");
            sidebarTitle.textContent = type === "student" ? "لوحة الطالب" :
                type === "teacher" ? "لوحة المعلم" : "لوحة الإدارة";
        }
    });
});

// =========================================
// قراءة آخر حلقة
// =========================================
const lastHalaqa = localStorage.getItem("lastHalaqa");
if (lastHalaqa) {
    try {
        console.log("آخر حلقة تمت زيارتها:", JSON.parse(lastHalaqa));
    } catch (error) {
        console.log("تعذر قراءة آخر حلقة.");
    }
}

// =========================================
// Scroll effect
// =========================================
window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".main-navbar");
    if (!navbar) return;

    navbar.style.boxShadow = window.scrollY > 50
        ? "0 8px 30px rgba(0,0,0,0.18)"
        : "0 5px 25px rgba(0,0,0,0.12)";
});


// زر "الانضمام إلى حلقة" في الصفحة الرئيسية
document.addEventListener("click", function(event) {
    const joinBtn = event.target.closest("#joinHalaqaBtn");
    if (!joinBtn) return;
    event.preventDefault();
    openDashboard("student");
});

// =========================================
// طلب تسجيل طالب جديد
// =========================================
(function setupStudentRegistration(){
    function get(id){ return document.getElementById(id); }
    function createModal(){
        if(get("studentRegisterModal")) return;
        const modal=document.createElement("div");
        modal.id="studentRegisterModal";
        modal.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;z-index:9999;padding:20px;";
        modal.innerHTML=`<div style="background:#fff;border-radius:18px;max-width:620px;width:100%;padding:25px;direction:rtl;max-height:90vh;overflow:auto">
          <button type="button" id="closeStudentRegister" style="float:left;border:0;background:none;font-size:28px">×</button>
          <h2>طلب التسجيل في حلقات التحفيظ</h2>
          <p>اكتبي بيانات الطالب، وسيتم مراجعة الطلب من الإدارة قبل تفعيل الحساب.</p>
          <form id="studentRegisterForm">
            <label>اسم الطالب</label><input class="form-control mb-2" id="regName" required>
            <label>السن</label><input class="form-control mb-2" id="regAge" type="number" min="4" max="80" required>
            <label>اسم ولي الأمر</label><input class="form-control mb-2" id="regGuardian" required>
            <label>رقم الهاتف</label><input class="form-control mb-2" id="regPhone" required>
            <label>الحلقة المطلوبة</label>
            <select class="form-select mb-2" id="regGroup" required>
              <option value="">اختاري الحلقة</option>
              ${studentHalaqat.map(h=>`<option value="${h.name}" data-teacher="${h.teacher}">${h.name}</option>`).join("")}
            </select>
            <label>المستوى الحالي</label><select class="form-select mb-2" id="regLevel"><option>مبتدئ</option><option>متوسط</option><option>متقدم</option></select>
            <label>هل سبق له الحفظ؟</label><textarea class="form-control mb-2" id="regExperience" rows="2"></textarea>
            <label>ملاحظات</label><textarea class="form-control mb-2" id="regNotes" rows="2"></textarea>
            <label>اسم المستخدم المقترح</label><input class="form-control mb-2" id="regUsername" required>
            <label>كلمة المرور</label><input class="form-control mb-2" id="regPassword" type="password" minlength="4" required>
            <div id="regMessage" class="mb-2"></div>
            <button class="btn btn-success w-100" type="submit">إرسال طلب الالتحاق</button>
          </form>
        </div>`;
        document.body.appendChild(modal);
        get("closeStudentRegister").onclick=()=>modal.style.display="none";
        get("studentRegisterForm").onsubmit=function(e){
          e.preventDefault();
          const username=get("regUsername").value.trim().toLowerCase();
          let students=JSON.parse(localStorage.getItem("quranStudents")||"[]");
          let requests=JSON.parse(localStorage.getItem("quranAdmissionRequests")||"[]");
          const teachers=JSON.parse(localStorage.getItem("quranTeachers")||"{}");
          const reserved=["student","teacher","admin","ibrahim","sami","mohamed","rahma","amira","yasmeen"];
          const exists=students.some(x=>String(x.username||"").toLowerCase()===username) || reserved.includes(username) || Object.keys(teachers).includes(username);
          const msg=get("regMessage");
          if(exists){msg.className="text-danger";msg.textContent="اسم المستخدم مستخدم بالفعل.";return;}
          const group=get("regGroup").value;
          const teacher=studentHalaqat.find(h=>h.name===group)?.teacher||"";
          requests.push({id:Date.now(),name:get("regName").value.trim(),age:get("regAge").value,guardian:get("regGuardian").value.trim(),phone:get("regPhone").value.trim(),group,teacher,level:get("regLevel").value,experience:get("regExperience").value.trim(),notes:get("regNotes").value.trim(),username,password:get("regPassword").value,status:"pending",createdAt:new Date().toISOString()});
          localStorage.setItem("quranAdmissionRequests",JSON.stringify(requests));
          msg.className="text-success";msg.textContent="تم إرسال طلبك بنجاح، وسيتم مراجعته من الإدارة.";
          this.reset();
        };
    }
    document.addEventListener("click",function(e){
      if(e.target.closest("#studentRegisterBtn")){createModal();get("studentRegisterModal").style.display="flex";}
    });
})();
