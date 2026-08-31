// =========================================
// صلاحيات الدخول - Front-End
// =========================================
(function enforceAccess() {
    let user = null;
    try { user = JSON.parse(localStorage.getItem("quranUser") || "null"); } catch (e) { user = null; }
    if (!user || user.role !== "admin") {
        window.location.replace("index.html");
        return;
    }
    localStorage.setItem("currentRole", "admin");
})();

/* =====================================================
   ADMIN DASHBOARD
   مكتب الجمعية الشرعية - كفر الشيخ
===================================================== */


/* =====================================================
   DATA
===================================================== */

function showSuccess(message) {
    let toast = document.getElementById("successToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "successToast";
        toast.style.cssText = "position:fixed;bottom:25px;right:25px;z-index:9999;background:#087443;color:#fff;padding:14px 20px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.18);font-weight:700;transition:.25s;";
        document.body.appendChild(toast);
    }
    toast.textContent = "✓ " + message;
    toast.style.opacity = "1";
    clearTimeout(window.__successToastTimer);
    window.__successToastTimer = setTimeout(function(){ toast.style.opacity = "0"; }, 2600);
}


let students = JSON.parse(
    localStorage.getItem("quranStudents")
) || [];

let tasmee3Records = JSON.parse(
    localStorage.getItem("tasmee3Records") ||
    localStorage.getItem("tasmeeHistory") ||
    "[]"
) || [];

// توحيد بيانات الطلاب بين لوحة الإدارة والمعلم والطالب
students = students.map(function (student) {
    const group = student.group || "الحفظ والمراجعة";
    const groupTeachers = {
        "الحفظ والمراجعة": "الشيخ محمد سعدالله",
        "التجويد وتصحيح التلاوة": "الشيخ إبراهيم عطية",
        "المراجعة المكثفة": "الشيخ سامي نصار",
        "حلقة الفتيات - حفظ ومراجعة": "المعلمة رحمة إدريس",
        "حلقة الناشئات - تلاوة": "المعلمة أميرة إدريس",
        "حلقة التلاوة والمراجعة": "المعلمة ياسمين الصعيدي"
    };
    const teacher = groupTeachers[group] || student.teacher || "الشيخ محمد سعدالله";
    return {
        progress: 0,
        attendance: "present",
        lastSurah: "-",
        ...student,
        group: group,
        teacher: teacher
    };
});

if (students.length > 0) {
    localStorage.setItem("quranStudents", JSON.stringify(students));
    localStorage.setItem("teacherStudents", JSON.stringify(students));
}

let notifications = JSON.parse(
    localStorage.getItem("adminNotifications")
) || [
    {
        title: "مرحبًا بك في لوحة الإدارة",
        text: "يمكنك متابعة الطلاب والمعلمين والحلقات والتسميع من هنا."
    },
    {
        title: "تذكير",
        text: "يرجى متابعة تسميع الطلاب وتحديث سجلاتهم بشكل مستمر."
    }
];


/* =====================================================
   DOM ELEMENTS
===================================================== */

const dashboard = document.getElementById("dashboard");

const contentSections = document.querySelectorAll(
    ".content-section"
);

const menuLinks = document.querySelectorAll(
    ".menu-link"
);

const sidebar = document.getElementById(
    "sidebar"
);

const mobileMenu = document.getElementById(
    "mobileMenu"
);


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    displayStudents();

    displayNotifications();

    displayTasmee3();

    updateStatistics();

    loadSavedSection();

});


/* =====================================================
   SIDEBAR NAVIGATION
===================================================== */

menuLinks.forEach(function (link) {

    link.addEventListener("click", function (event) {

        event.preventDefault();

        const sectionId =
            link.getAttribute("href").replace("#", "");

        showSection(sectionId);

        menuLinks.forEach(function (item) {
            item.classList.remove("active");
        });

        link.classList.add("active");

        if (window.innerWidth <= 850) {
            sidebar.classList.remove("open");
        }

    });

});


/* =====================================================
   SHOW SECTION
===================================================== */

function showSection(sectionId) {

    if (sectionId === "dashboard") {

        dashboard.classList.remove("hidden");

        contentSections.forEach(function (section) {
            section.classList.remove("active");
        });

    } else {

        dashboard.classList.add("hidden");

        contentSections.forEach(function (section) {
            section.classList.remove("active");
        });

        const section =
            document.getElementById(sectionId);

        if (section) {
            section.classList.add("active");
        }

    }

    history.replaceState(
        null,
        null,
        "#" + sectionId
    );

    localStorage.setItem(
        "adminCurrentSection",
        sectionId
    );

}


/* =====================================================
   LOAD SAVED SECTION
===================================================== */

function loadSavedSection() {

    const sectionFromUrl =
        window.location.hash.replace("#", "");

    const savedSection =
        localStorage.getItem("adminCurrentSection");

    const section =
        sectionFromUrl ||
        savedSection ||
        "dashboard";

    if (section === "dashboard") {

        showSection("dashboard");

        menuLinks.forEach(function (link) {

            link.classList.remove("active");

            if (
                link.getAttribute("href") === "#dashboard"
            ) {
                link.classList.add("active");
            }

        });

    } else {

        showSection(section);

        menuLinks.forEach(function (link) {

            link.classList.remove("active");

            if (
                link.getAttribute("href") === "#" + section
            ) {
                link.classList.add("active");
            }

        });

    }

}


/* =====================================================
   MOBILE MENU
===================================================== */

mobileMenu.addEventListener("click", function () {

    sidebar.classList.toggle("open");

});


/* =====================================================
   STUDENT MODAL
===================================================== */

function openStudentModal() {

    document
        .getElementById("studentModal")
        .classList.add("show");

}


function closeStudentModal() {

    document
        .getElementById("studentModal")
        .classList.remove("show");

}


/* =====================================================
   ADD STUDENT
===================================================== */

document
    .getElementById("studentForm")
    .addEventListener("submit", function (event) {

        event.preventDefault();

        const name =
            document.getElementById("studentName").value.trim();

        const username =
            document.getElementById("studentUsername").value.trim().toLowerCase();

        const password =
            document.getElementById("studentPassword").value;

        const age =
            document.getElementById("studentAge").value.trim();

        const group =
            document.getElementById("studentGroup").value;

        const level =
            document.getElementById("studentLevel").value;


        if (!name || !username || !password || !group) {

            alert("من فضلك أكمل اسم الطالب واسم المستخدم وكلمة المرور والحلقة.");

            return;

        }

        if (password.length < 4) {
            alert("كلمة المرور يجب أن تكون 4 أحرف أو أرقام على الأقل.");
            return;
        }

        const usernameExists = students.some(function (student) {
            return String(student.username || "").toLowerCase() === username;
        });

        if (usernameExists || ["student", "teacher", "admin"].includes(username)) {
            alert("اسم المستخدم مستخدم بالفعل. اختاري اسم مستخدم آخر.");
            return;
        }


        const teacherMap = {
            "الحفظ والمراجعة": "الشيخ محمد سعدالله",
            "التجويد وتصحيح التلاوة": "الشيخ إبراهيم عطية",
            "المراجعة المكثفة": "الشيخ سامي نصار",
            "حلقة الفتيات - حفظ ومراجعة": "المعلمة رحمة إدريس",
            "حلقة الناشئات - تلاوة": "المعلمة أميرة إدريس",
            "حلقة التلاوة والمراجعة": "المعلمة ياسمين الصعيدي"
        };

        const teacher = teacherMap[group] || "";


        const newStudent = {

            id: Date.now(),

            name: name,

            username: username,

            password: password,

            age: age ? Number(age) : "",

            group: group,

            teacher: teacher,

            level: level,

            status: "نشط",

            progress: 0,

            attendance: "present",

            lastSurah: "-",

            note: "طالب جديد - لم يتم تسجيل ملاحظات بعد."

        };


        students.push(newStudent);


        localStorage.setItem(
            "quranStudents",
            JSON.stringify(students)
        );
        localStorage.setItem(
            "teacherStudents",
            JSON.stringify(students)
        );


        displayStudents();

        updateStatistics();

        document
            .getElementById("studentForm")
            .reset();


        closeStudentModal();


        showSuccess("تم إضافة الطالب بنجاح");

    });


/* =====================================================
   DISPLAY STUDENTS
===================================================== */

function displayStudents() {

    const table =
        document.getElementById("studentsTable");


    if (!table) return;


    if (students.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    لا يوجد طلاب مسجلون حتى الآن
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = "";


    students.forEach(function (student) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>${student.name}</strong>
            </td>

            <td>
                ${student.group}
            </td>

            <td>
                ${student.teacher || "غير محدد"}
            </td>

            <td>
                ${student.level || "مبتدئ"}
            </td>

            <td>

                <span class="status-badge">
                    ${student.status || "نشط"}
                </span>

            </td>

            <td>

                <button
                    class="delete-student"
                    onclick="deleteStudent(${student.id})"
                    style="
                        border:none;
                        background:#fff0f0;
                        color:#d44;
                        border-radius:8px;
                        padding:6px 9px;
                    "
                >
                    <i class="bi bi-trash"></i>
                </button>

            </td>
        `;


        table.appendChild(row);

    });

}


/* =====================================================
   DELETE STUDENT
===================================================== */

function deleteStudent(id) {

    const confirmDelete =
        confirm("هل أنت متأكد من حذف هذا الطالب؟");


    if (!confirmDelete) return;


    students =
        students.filter(function (student) {

            return student.id !== id;

        });


    localStorage.setItem(
        "quranStudents",
        JSON.stringify(students)
    );
    localStorage.setItem(
        "teacherStudents",
        JSON.stringify(students)
    );

    tasmee3Records = tasmee3Records.filter(function (record) {
        return Number(record.studentId) !== Number(id);
    });
    localStorage.setItem("tasmee3Records", JSON.stringify(tasmee3Records));
    localStorage.setItem("tasmeeHistory", JSON.stringify(tasmee3Records));

    const currentStudentId = Number(localStorage.getItem("currentStudentId") || 1);
    if (currentStudentId === Number(id) && students[0]) {
        localStorage.setItem("currentStudentId", String(students[0].id));
    }


    displayStudents();

    updateStatistics();

}


/* =====================================================
   STUDENT SEARCH
===================================================== */

/* =====================================================
   STUDENT FILTERS
===================================================== */

function applyStudentFilters() {
    const search = (document.getElementById("studentSearch")?.value || "").toLowerCase().trim();
    const group = document.getElementById("groupFilter")?.value || "all";
    const teacher = document.getElementById("teacherFilter")?.value || "all";

    const filtered = students.filter(function (student) {
        const matchesSearch = !search || String(student.name || "").toLowerCase().includes(search);
        const matchesGroup = group === "all" || student.group === group;
        const matchesTeacher = teacher === "all" || student.teacher === teacher;
        return matchesSearch && matchesGroup && matchesTeacher;
    });

    renderFilteredStudents(filtered);
}

document.getElementById("studentSearch")?.addEventListener("input", applyStudentFilters);
document.getElementById("groupFilter")?.addEventListener("change", applyStudentFilters);
document.getElementById("teacherFilter")?.addEventListener("change", applyStudentFilters);


/* =====================================================
   FILTERED STUDENTS
===================================================== */

function renderFilteredStudents(data) {

    const table =
        document.getElementById("studentsTable");


    if (data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    لم يتم العثور على طالب
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML = "";


    data.forEach(function (student) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>${student.name}</strong>
            </td>

            <td>${student.group}</td>

            <td>${student.teacher || "غير محدد"}</td>

            <td>${student.level || "مبتدئ"}</td>

            <td>
                <span class="status-badge">
                    ${student.status || "نشط"}
                </span>
            </td>

            <td>
                <button
                    onclick="deleteStudent(${student.id})"
                    style="
                        border:none;
                        background:#fff0f0;
                        color:#d44;
                        border-radius:8px;
                        padding:6px 9px;
                    "
                >
                    <i class="bi bi-trash"></i>
                </button>
            </td>

        `;


        table.appendChild(row);

    });

}


/* =====================================================
   TASME3
===================================================== */

function displayTasmee3() {

    const table =
        document.getElementById("recentTasmee3");


    if (!table) return;


    if (tasmee3Records.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    لا توجد عمليات تسميع حتى الآن
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML = "";


    const latest =
        tasmee3Records.slice(-6).reverse();


    latest.forEach(function (record) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${record.studentName || "طالب"}
                </strong>
            </td>

            <td>
                ${record.group || "—"}
            </td>

            <td>
                ${record.teacher || "—"}
            </td>

            <td>
                ${record.surah || "—"}
            </td>

            <td>
                ${record.evaluation || "جيد"}
            </td>

        `;


        table.appendChild(row);

    });

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {

    try {
        students = JSON.parse(localStorage.getItem("quranStudents") || "[]");
        tasmee3Records = JSON.parse(localStorage.getItem("tasmee3Records") || localStorage.getItem("tasmeeHistory") || "[]");
    } catch (e) {}

    const studentCount =
        students.length;


    const tasmee3Count =
        tasmee3Records.length;


    document.getElementById(
        "studentsCount"
    ).textContent = studentCount;


    document.getElementById(
        "tasmee3Count"
    ).textContent = tasmee3Count;


    document.getElementById(
        "reportStudents"
    ).textContent = studentCount;


    document.getElementById(
        "reportTasmee3"
    ).textContent = tasmee3Count;


    document.getElementById(
        "totalTasmee3"
    ).textContent = tasmee3Count;


    const excellent =
        tasmee3Records.filter(function (record) {

            return record.evaluation === "ممتاز";

        }).length;


    const good =
        tasmee3Records.filter(function (record) {

            return record.evaluation === "جيد جدًا";

        }).length;


    document.getElementById(
        "excellentCount"
    ).textContent = excellent;


    document.getElementById(
        "goodCount"
    ).textContent = good;

}


/* =====================================================
   NOTIFICATIONS
===================================================== */

function displayNotifications() {

    const container =
        document.getElementById(
            "notificationsList"
        );


    if (!container) return;


    container.innerHTML = "";


    notifications.forEach(function (notification) {

        const item =
            document.createElement("div");


        item.className =
            "notification-item";


        item.innerHTML = `

            <div class="notification-icon">

                <i class="bi bi-bell-fill"></i>

            </div>

            <div>

                <h4>
                    ${notification.title}
                </h4>

                <p>
                    ${notification.text}
                </p>

            </div>

        `;


        container.appendChild(item);

    });

}


/* =====================================================
   ADD NOTIFICATION
===================================================== */

function openNotificationModal() {
    const modal = document.getElementById("notificationModal");
    if (modal) {
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        const title = document.getElementById("notificationTitle");
        if (title) title.focus();
    }
}

function closeNotificationModal() {
    const modal = document.getElementById("notificationModal");
    if (modal) {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
    }
}

function addNotification() {
    openNotificationModal();
}

const notificationForm = document.getElementById("notificationForm");
if (notificationForm) {
    notificationForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = document.getElementById("notificationTitle").value.trim();
        const text = document.getElementById("notificationText").value.trim();

        if (!title || !text) return;

        notifications.push({ title: title, text: text });
        localStorage.setItem("adminNotifications", JSON.stringify(notifications));

        displayNotifications();
        notificationForm.reset();
        closeNotificationModal();
        alert("تم إضافة الإشعار بنجاح ✓");
    });
}

const closeNotificationBtn = document.getElementById("closeNotificationModal");
if (closeNotificationBtn) {
    closeNotificationBtn.addEventListener("click", closeNotificationModal);
}

const notificationModal = document.getElementById("notificationModal");
if (notificationModal) {
    notificationModal.addEventListener("click", function (event) {
        if (event.target === notificationModal) closeNotificationModal();
    });
}

/* =====================================================
   NOTIFICATION BUTTON
===================================================== */

document
    .getElementById("notificationBtn")
    .addEventListener("click", function () {

        showSection("notifications");


        menuLinks.forEach(function (link) {

            link.classList.remove("active");


            if (
                link.getAttribute("href") ===
                "#notifications"
            ) {

                link.classList.add("active");

            }

        });

    });


/* =====================================================
   CLOSE MODAL WHEN CLICK OUTSIDE
===================================================== */

document
    .getElementById("studentModal")
    .addEventListener("click", function (event) {

        if (event.target === this) {

            closeStudentModal();

        }

    });


/* =====================================================
   STATUS BADGE STYLE
===================================================== */

const statusStyle =
document.createElement("style");


statusStyle.textContent = `

.status-badge {

    display: inline-block;

    background: #eaf7f0;

    color: #087443;

    padding: 5px 9px;

    border-radius: 7px;

    font-size: 9px;

    font-weight: 700;

}

`;


document.head.appendChild(statusStyle);


/* =====================================================
   DEMO DATA
   لو مفيش طلاب، نضيف بيانات تجريبية بسيطة
===================================================== */

if (students.length === 0) {

    students = [
        { id: 1, name: "أحمد محمد علي", group: "الحفظ والمراجعة", teacher: "الشيخ محمد سعدالله", level: "جيد جدًا", status: "نشط", progress: 82, attendance: "present", lastSurah: "سورة آل عمران", note: "طالب ملتزم ويتقدم بشكل جيد." },
        { id: 2, name: "محمد إبراهيم", group: "التجويد وتصحيح التلاوة", teacher: "الشيخ إبراهيم عطية", level: "ممتاز", status: "نشط", progress: 91, attendance: "present", lastSurah: "سورة النساء", note: "مستوى ممتاز في التلاوة." },
        { id: 3, name: "عبد الرحمن محمود", group: "المراجعة المكثفة", teacher: "الشيخ سامي نصار", level: "جيد", status: "نشط", progress: 65, attendance: "present", lastSurah: "سورة البقرة", note: "يحتاج إلى متابعة المراجعة." },
        { id: 4, name: "يوسف أحمد", group: "الحفظ والمراجعة", teacher: "الشيخ محمد سعدالله", level: "جيد", status: "نشط", progress: 55, attendance: "present", lastSurah: "سورة الفاتحة", note: "يتقدم بشكل جيد." },
        { id: 5, name: "عمر خالد", group: "التجويد وتصحيح التلاوة", teacher: "الشيخ إبراهيم عطية", level: "ممتاز", status: "نشط", progress: 88, attendance: "present", lastSurah: "سورة المائدة", note: "تقدم ممتاز هذا الأسبوع." },
        { id: 6, name: "محمد إيهاب", group: "المراجعة المكثفة", teacher: "الشيخ سامي نصار", level: "جيد", status: "نشط", progress: 60, attendance: "absent", lastSurah: "سورة البقرة", note: "يحتاج إلى مراجعة الحفظ السابق." },
        { id: 7, name: "رحمة أحمد", group: "حلقة الفتيات - حفظ ومراجعة", teacher: "المعلمة رحمة إدريس", level: "جيد جدًا", status: "نشط", progress: 74, attendance: "present", lastSurah: "سورة الملك", note: "طالبة ملتزمة." },
        { id: 8, name: "سارة محمد", group: "حلقة الناشئات - تلاوة", teacher: "المعلمة أميرة إدريس", level: "جيد", status: "نشط", progress: 68, attendance: "present", lastSurah: "سورة يس", note: "تحتاج إلى المزيد من المراجعة." },
        { id: 9, name: "مريم علي", group: "حلقة التلاوة والمراجعة", teacher: "المعلمة ياسمين الصعيدي", level: "ممتاز", status: "نشط", progress: 95, attendance: "present", lastSurah: "سورة الرحمن", note: "مستوى متميز." }
    ];

    localStorage.setItem("quranStudents", JSON.stringify(students));
    localStorage.setItem("teacherStudents", JSON.stringify(students));
}



updateStatistics();

displayStudents();

// =========================================
// إدارة المعلمين - إضافة حسابات جديدة
// =========================================
(function setupTeacherManagement() {
    const openBtn = document.getElementById("openTeacherModal");
    const form = document.getElementById("teacherForm");
    const list = document.getElementById("customTeachersList");
    const modalEl = document.getElementById("teacherModal");
    if (!form || !list) return;

    let customTeachers = {};
    try { customTeachers = JSON.parse(localStorage.getItem("quranTeachers") || "{}"); } catch (e) { customTeachers = {}; }

    const defaultNames = {
        ibrahim: "الشيخ إبراهيم عطية", sami: "الشيخ سامي نصار", mohamed: "الشيخ محمد سعدالله",
        rahma: "المعلمة رحمة إدريس", amira: "المعلمة أميرة إدريس", yasmeen: "المعلمة ياسمين الصعيدي"
    };

    function renderTeacherList() {
        const keys = Object.keys(customTeachers);
        if (!keys.length) {
            list.innerHTML = '<div class="text-muted p-3">لا توجد حسابات إضافية حتى الآن. الحسابات الأساسية الستة جاهزة للدخول.</div>';
            return;
        }
        list.innerHTML = `
            <table class="admin-table">
                <thead><tr><th>المعلم</th><th>اسم المستخدم</th><th>الحلقة</th><th>التخصص</th><th>إجراء</th></tr></thead>
                <tbody>
                    ${keys.map(function(username) {
                        const t = customTeachers[username];
                        return `<tr>
                            <td>${t.name}</td><td>${username}</td><td>${t.group || "-"}</td><td>${t.specialty || "-"}</td>
                            <td><button class="btn btn-sm btn-outline-danger" data-delete-teacher="${username}"><i class="bi bi-trash"></i> حذف</button></td>
                        </tr>`;
                    }).join("")}
                </tbody>
            </table>`;
    }

    renderTeacherList();

    if (openBtn) {
        openBtn.addEventListener("click", function () {
            if (window.bootstrap && modalEl) new bootstrap.Modal(modalEl).show();
        });
    }

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const name = document.getElementById("teacherName").value.trim();
        const username = document.getElementById("teacherUsername").value.trim().toLowerCase();
        const password = document.getElementById("teacherPassword").value;
        const group = document.getElementById("teacherGroup").value;
        const type = document.getElementById("teacherType").value;
        const specialty = document.getElementById("teacherSpecialty").value.trim();
        const msg = document.getElementById("teacherFormMessage");

        const allStudentUsernames = students.map(s => String(s.username || "").toLowerCase());
        const reserved = ["student", "teacher", "admin", "ibrahim", "sami", "mohamed", "rahma", "amira", "yasmeen"];
        if (reserved.includes(username) || customTeachers[username] || allStudentUsernames.includes(username)) {
            msg.className = "small text-danger";
            msg.textContent = "اسم المستخدم مستخدم بالفعل، اختاري اسمًا آخر.";
            return;
        }
        if (password.length < 4) {
            msg.className = "small text-danger";
            msg.textContent = "كلمة المرور يجب أن تكون 4 أحرف أو أرقام على الأقل.";
            return;
        }

        customTeachers[username] = { name, password, group, specialty, type };
        localStorage.setItem("quranTeachers", JSON.stringify(customTeachers));

        // تحديث الطلاب الموجودين في الحلقة المختارة ليظهروا للمعلم الجديد.
        students = students.map(function(student) {
            if (student.group === group) return Object.assign({}, student, { teacher: name });
            return student;
        });
        localStorage.setItem("quranStudents", JSON.stringify(students));
        localStorage.setItem("teacherStudents", JSON.stringify(students));

        msg.className = "small text-success";
        msg.textContent = "تم إضافة الحساب بنجاح ✓";
        form.reset();
        renderTeacherList();
        if (typeof updateStatistics === "function") updateStatistics();
        setTimeout(function() {
            if (window.bootstrap && modalEl) {
                const instance = bootstrap.Modal.getInstance(modalEl);
                if (instance) instance.hide();
            }
            msg.textContent = "";
        }, 700);
    });

    list.addEventListener("click", function(event) {
        const button = event.target.closest("[data-delete-teacher]");
        if (!button) return;
        const username = button.getAttribute("data-delete-teacher");
        if (!confirm("هل تريدين حذف حساب هذا المعلم؟")) return;
        delete customTeachers[username];
        localStorage.setItem("quranTeachers", JSON.stringify(customTeachers));
        renderTeacherList();
    });
})();

// =========================================
// LOGOUT
// =========================================
const adminLogout = document.getElementById("adminLogout");
if (adminLogout) {
    adminLogout.addEventListener("click", function () {
        localStorage.removeItem("quranUser");
        localStorage.removeItem("currentRole");
        localStorage.removeItem("currentStudentId");
        localStorage.removeItem("currentTeacher");
        window.location.href = "index.html";
    });
}

// =========================================
// طلبات الالتحاق: مراجعة وقبول/رفض
// =========================================
(function setupAdmissionRequests(){
  function render(){
    const body=document.getElementById("admissionRequestsTable"); if(!body) return;
    const requests=JSON.parse(localStorage.getItem("quranAdmissionRequests")||"[]");
    body.innerHTML=requests.length?requests.map(r=>`<tr>
      <td><strong>${r.name}</strong><br><small>${r.username}</small></td>
      <td>${r.guardian}</td><td>${r.phone}</td><td>${r.group}</td><td>${r.level}</td>
      <td>${r.status==="pending"?"قيد المراجعة":r.status==="accepted"?"مقبول":"مرفوض"}</td>
      <td>${r.status==="pending"?`<button class="btn btn-sm btn-success" data-accept-admission="${r.id}">قبول</button>
      <button class="btn btn-sm btn-outline-danger" data-reject-admission="${r.id}">رفض</button>`:"—"}</td>
    </tr>`).join(""):'<tr><td colspan="7" class="text-center p-4">لا توجد طلبات حاليًا.</td></tr>';
  }
  function accept(id){
    const requests=JSON.parse(localStorage.getItem("quranAdmissionRequests")||"[]");
    const r=requests.find(x=>String(x.id)===String(id)); if(!r) return;
    let students=JSON.parse(localStorage.getItem("quranStudents")||"[]");
    if(students.some(s=>String(s.username||"").toLowerCase()===String(r.username).toLowerCase())){alert("اسم المستخدم مستخدم بالفعل.");return;}
    const student={id:Date.now(),name:r.name,username:r.username,password:r.password,age:r.age,guardian:r.guardian,phone:r.phone,group:r.group,teacher:r.teacher,level:r.level,status:"نشط",progress:0,attendance:"pending",note:r.notes||"",admissionSource:"website"};
    students.push(student);
    localStorage.setItem("quranStudents",JSON.stringify(students));
    localStorage.setItem("teacherStudents",JSON.stringify(students));
    r.status="accepted"; r.acceptedAt=new Date().toISOString();
    localStorage.setItem("quranAdmissionRequests",JSON.stringify(requests));
    render();
    if(typeof updateStatistics==="function") updateStatistics();
  }
  function init(){
    render();
    // تحديث عداد الطلبات المعلقة في القائمة الجانبية إن وجد
    const requests=JSON.parse(localStorage.getItem("quranAdmissionRequests")||"[]");
    const pending=requests.filter(r=>r.status==="pending").length;
    const link=document.querySelector('a[href="#admissionRequests"]');
    if(link){
      let badge=link.querySelector(".admission-badge");
      if(!badge){ badge=document.createElement("span"); badge.className="admission-badge"; badge.style.cssText="margin-right:auto;background:#198754;color:#fff;border-radius:20px;padding:2px 8px;font-size:11px;"; link.appendChild(badge); }
      badge.textContent=pending>0?pending:"";
      badge.style.display=pending>0?"inline-block":"none";
    }
  }
  document.addEventListener("click",e=>{
    const ac=e.target.closest("[data-accept-admission]"); if(ac){accept(ac.dataset.acceptAdmission);init();return;}
    const re=e.target.closest("[data-reject-admission]");
    if(re){const requests=JSON.parse(localStorage.getItem("quranAdmissionRequests")||"[]");const r=requests.find(x=>String(x.id)===String(re.dataset.rejectAdmission));if(r){r.status="rejected";localStorage.setItem("quranAdmissionRequests",JSON.stringify(requests));init();}}
  });
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();
