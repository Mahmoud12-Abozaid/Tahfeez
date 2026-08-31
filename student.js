// =========================================
// صلاحيات الدخول - Front-End
// =========================================
(function enforceAccess() {
    let user = null;
    try { user = JSON.parse(localStorage.getItem("quranUser") || "null"); } catch (e) { user = null; }
    if (!user || user.role !== "student") {
        window.location.replace("index.html");
        return;
    }
    // مزامنة الدور إذا كان quranUser صحيحًا حتى لا تعود الصفحة للرئيسية بسبب قيمة قديمة. 
    localStorage.setItem("currentRole", "student");
})();

/* =========================================
   مكتب الجمعية الشرعية
   Student Dashboard JavaScript
========================================= */


/* =========================================
   DEFAULT STUDENT DATA
========================================= */

const defaultStudent = {

    name: "أحمد محمد علي",

    level: "المرحلة المتوسطة",

    circle: "حلقة الحفظ والمراجعة",

    teacher: "الشيخ محمد سعدالله",

    savedParts: 4,

    progress: 13,

    commitmentDays: 15,

    points: 320,

    weeklyCompleted: 3,

    weeklyTarget: 5,

    lastSurah: "سورة الملك",

    nextLesson: "سورة القلم - الآيات 1 : 10",

    tasmee3: [

        {
            surah: "سورة الملك",
            type: "مراجعة",
            evaluation: "ممتاز",
            date: "2026-08-16",
            note: "أداء ممتاز، استمر على نفس المستوى."
        },

        {
            surah: "سورة التحريم",
            type: "حفظ جديد",
            evaluation: "جيد جداً",
            date: "2026-08-13",
            note: "راجع الآيات الأخيرة."
        }

    ]

};



/* =========================================
   GET DATA FROM LOCAL STORAGE
========================================= */

function getStudentData() {

    let data = { ...defaultStudent };

    const saved = localStorage.getItem("studentData");
    if (saved) {
        try {
            data = { ...data, ...JSON.parse(saved) };
        } catch (error) {
            console.log("تعذر قراءة بيانات الطالب المحفوظة.");
        }
    }

    // المصدر الرئيسي المشترك بين الطالب والمعلم والإدارة
    let students = JSON.parse(localStorage.getItem("quranStudents") || "[]");
    const currentId = Number(localStorage.getItem("currentStudentId") || 1);

    // إنشاء السجل المشترك إذا دخل الطالب للمشروع أولًا
    if (students.length === 0) {
        students = [{
            id: 1,
            name: defaultStudent.name,
            group: defaultStudent.circle,
            teacher: defaultStudent.teacher,
            level: defaultStudent.level,
            status: "نشط",
            progress: defaultStudent.progress,
            attendance: "present",
            lastSurah: defaultStudent.lastSurah,
            note: "طالب ملتزم ويتقدم بشكل جيد."
        }];
        localStorage.setItem("quranStudents", JSON.stringify(students));
    }

    const sharedStudent = students.find(function (item) {
        return Number(item.id) === currentId;
    }) || students[0];

    if (sharedStudent) {
        data.id = sharedStudent.id;
        data.name = sharedStudent.name || data.name;
        data.level = sharedStudent.level || data.level;
        data.circle = sharedStudent.group || data.circle;
        data.teacher = sharedStudent.teacher || data.teacher;
        data.progress = Number(sharedStudent.progress ?? data.progress);
        data.attendance = sharedStudent.attendance || data.attendance || "present";
        data.lastSurah = sharedStudent.lastSurah || data.lastSurah;
        data.note = sharedStudent.note || data.note || "";
    }

    if (!Array.isArray(data.tasmee3)) data.tasmee3 = [];
    if (typeof data.points !== "number") data.points = Number(data.points) || 0;
    if (typeof data.weeklyCompleted !== "number") data.weeklyCompleted = Number(data.weeklyCompleted) || 0;
    if (typeof data.weeklyTarget !== "number") data.weeklyTarget = Number(data.weeklyTarget) || 5;
    if (typeof data.progress !== "number" || Number.isNaN(data.progress)) data.progress = 0;
    if (typeof data.savedParts !== "number" || Number.isNaN(data.savedParts)) data.savedParts = 0;
    if (typeof data.commitmentDays !== "number" || Number.isNaN(data.commitmentDays)) data.commitmentDays = 0;

    localStorage.setItem("studentData", JSON.stringify(data));
    return data;
}

/* =========================================
   SAVE DATA
========================================= */

function saveStudentData(data) {

    localStorage.setItem("studentData", JSON.stringify(data));

    // مزامنة بيانات الطالب مع المصدر المشترك
    const students = JSON.parse(localStorage.getItem("quranStudents") || "[]");
    const id = Number(data.id || localStorage.getItem("currentStudentId") || 1);

    const index = students.findIndex(function (item) {
        return Number(item.id) === id;
    });

    if (index !== -1) {
        students[index] = {
            ...students[index],
            name: data.name,
            level: data.level,
            group: data.circle,
            teacher: data.teacher,
            progress: Number(data.progress) || 0,
            attendance: data.attendance || students[index].attendance || "present",
            lastSurah: data.lastSurah || students[index].lastSurah || "-",
            note: data.note || students[index].note || ""
        };
        localStorage.setItem("quranStudents", JSON.stringify(students));
    }
}

/* =========================================
   NOTIFICATIONS
========================================= */

const notifications = [

    {
        title: "موعد التسميع",
        text: "موعد التسميع القادم يوم الأربعاء الساعة 5 مساءً.",
        icon: "bi-calendar-check",
        unread: true
    },

    {
        title: "ملاحظة من المعلم",
        text: "لا تنس مراجعة سورة الملك قبل الحلقة القادمة.",
        icon: "bi-chat-left-text",
        unread: true
    },

    {
        title: "إنجاز جديد",
        text: "أحسنت! وصلت إلى 300 نقطة في رحلتك.",
        icon: "bi-trophy",
        unread: false
    },

    {
        title: "تذكير",
        text: "حاول الالتزام بورد المراجعة اليوم.",
        icon: "bi-bell",
        unread: false
    }

];



// إشعارات الإدارة تظهر للطالب أيضًا (مزامنة Front-End عبر localStorage)
try {
    const adminNotifications = JSON.parse(
        localStorage.getItem("adminNotifications") || "[]"
    );
    if (Array.isArray(adminNotifications)) {
        adminNotifications.forEach(function (item) {
            notifications.unshift({
                title: item.title || "إشعار من الإدارة",
                text: item.text || "",
                icon: "bi-bell-fill",
                unread: true
            });
        });
    }
} catch (error) {
    console.warn("تعذر قراءة إشعارات الإدارة.");
}

/* =========================================
   ACHIEVEMENTS
========================================= */

const achievements = [

    {
        title: "البداية المباركة",
        description: "سجل أول تسميع لك.",
        icon: "bi-flag-fill",
        condition: function(data) {

            return data.tasmee3.length >= 1;

        }
    },

    {
        title: "أول 5 تسميعات",
        description: "سجل 5 تسميعات.",
        icon: "bi-mic-fill",
        condition: function(data) {

            return data.tasmee3.length >= 5;

        }
    },

    {
        title: "300 نقطة",
        description: "وصل إلى 300 نقطة.",
        icon: "bi-star-fill",
        condition: function(data) {

            return data.points >= 300;

        }
    },

    {
        title: "ملتزم",
        description: "وصل إلى 20 يوم التزام.",
        icon: "bi-calendar-check",
        condition: function(data) {

            return data.commitmentDays >= 20;

        }
    }

];



/* =========================================
   SAFE ELEMENT
========================================= */

function getElement(id) {

    return document.getElementById(id);

}



/* =========================================
   UPDATE DASHBOARD
========================================= */

function updateDashboard() {

    const student = getStudentData();


    /* Student name */

    if (getElement("sideStudentName")) {

        getElement("sideStudentName").textContent =
            student.name;

    }


    if (getElement("headerStudentName")) {

        getElement("headerStudentName").textContent =
            student.name;

    }


    /* Stats */

    setText(
        "savedParts",
        student.savedParts
    );

    setText(
        "progressPercent",
        student.progress + "%"
    );

    setText(
        "commitmentDays",
        student.commitmentDays
    );

    setText(
        "studentPoints",
        student.points
    );


    /* Memorization */

    setText(
        "dashboardProgress",
        student.progress + "%"
    );

    setText(
        "dashboardParts",
        student.savedParts
    );

    setText(
        "lastSurah",
        student.lastSurah
    );

    setText(
        "nextLesson",
        student.nextLesson
    );


    setText(
        "memoryProgressText",
        student.progress + "%"
    );

    setText(
        "memoryPartsText",
        student.savedParts
    );


    /* Circle */

    setText(
        "circleName",
        student.circle
    );

    setText(
        "circleTeacher",
        student.teacher
    );


    /* Weekly goal */

    setText(
        "weeklyCompleted",
        student.weeklyCompleted
    );

    setText(
        "weeklyTarget",
        student.weeklyTarget
    );


    const weeklyPercent =
        Math.min(
            100,
            Math.round(
                (student.weeklyCompleted /
                    student.weeklyTarget) * 100
            )
        );


    const weeklyProgress =
        getElement("weeklyProgress");

    if (weeklyProgress) {

        weeklyProgress.style.width =
            weeklyPercent + "%";

    }


    if (getElement("weeklyMessage")) {

        if (
            student.weeklyCompleted >=
            student.weeklyTarget
        ) {

            getElement("weeklyMessage").textContent =
                "ممتاز! حققت هدف هذا الأسبوع 🏆";

        } else {

            getElement("weeklyMessage").textContent =
                "باقي لك " +
                (
                    student.weeklyTarget -
                    student.weeklyCompleted
                ) +
                " مهام لتحقيق هدفك 🌱";

        }

    }


    /* Progress bars */

    const progressBars = [

        "dashboardProgressBar",
        "memoryProgressBar"

    ];


    progressBars.forEach(function(id) {

        const bar = getElement(id);

        if (bar) {

            bar.style.width =
                student.progress + "%";

        }

    });


    /* Notifications */

    renderNotifications();


    /* Achievements */

    renderAchievements();


    /* Tasmee3 */

    renderTasmee3();


    /* Year */

    setText(
        "currentYear",
        new Date().getFullYear()
    );

}



/* =========================================
   SET TEXT SAFELY
========================================= */

function setText(id, value) {

    const element =
        getElement(id);

    if (element) {

        element.textContent =
            value !== undefined &&
            value !== null
                ? value
                : "";

    }

}



/* =========================================
   NAVIGATION
========================================= */

function showSection(sectionName) {

    const sections =
        document.querySelectorAll(
            ".page-section"
        );


    sections.forEach(function(section) {

        section.classList.add("d-none");

    });


    const selected =
        getElement(
            "section-" + sectionName
        );


    if (selected) {

        selected.classList.remove("d-none");

    }


    /* Active sidebar */

    const links =
        document.querySelectorAll(
            ".sidebar-link"
        );


    links.forEach(function(link) {

        link.classList.remove("active");

    });


    const activeLink =
        document.querySelector(
            '.sidebar-link[data-section="' +
            sectionName +
            '"]'
        );


    if (activeLink) {

        activeLink.classList.add("active");

    }


    /* Mobile close */

    const sidebar =
        getElement("sidebar");

    const overlay =
        getElement("sidebarOverlay");


    if (sidebar) {

        sidebar.classList.remove("open");

    }


    if (overlay) {

        overlay.classList.remove("show");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}



/* =========================================
   SIDEBAR LINKS
========================================= */

function setupNavigation() {

    const links =
        document.querySelectorAll(
            "[data-section]"
        );


    links.forEach(function(link) {

        link.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                const section =
                    this.getAttribute(
                        "data-section"
                    );

                showSection(section);

                history.replaceState(
                    null,
                    "",
                    "#" + section
                );

            }
        );

    });


    /* Other internal links */

    const internalLinks =
        document.querySelectorAll(
            "[data-section-link]"
        );


    internalLinks.forEach(function(link) {

        link.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                const section =
                    this.getAttribute(
                        "data-section-link"
                    );

                showSection(section);

                history.replaceState(
                    null,
                    "",
                    "#" + section
                );

            }
        );

    });


    /* Welcome button */

    const welcomeButton =
        document.querySelector(
            "[data-go]"
        );


    if (welcomeButton) {

        welcomeButton.addEventListener(
            "click",
            function() {

                showSection(
                    this.dataset.go
                );

            }
        );

    }

}



/* =========================================
   NOTIFICATIONS RENDER
========================================= */

function renderNotifications() {

    const unread =
        notifications.filter(
            item => item.unread
        ).length;


    setText(
        "notificationCount",
        unread
    );

    setText(
        "headerNotificationCount",
        unread
    );


    const dashboard =
        getElement(
            "dashboardNotifications"
        );


    const all =
        getElement(
            "allNotifications"
        );


    const createNotification =
        function(item) {

            return `

                <div class="notification-item
                    ${item.unread ? "unread" : ""}"
                    onclick="readNotification(this)">

                    <div class="notification-icon">

                        <i class="bi ${item.icon}"></i>

                    </div>

                    <div class="notification-content">

                        <strong>
                            ${item.title}
                        </strong>

                        <p>
                            ${item.text}
                        </p>

                    </div>

                    ${
                        item.unread
                        ?
                        '<span class="new-dot"></span>'
                        :
                        ''
                    }

                </div>

            `;

        };


    const html =
        notifications
        .map(createNotification)
        .join("");


    if (dashboard) {

        dashboard.innerHTML =
            notifications
            .slice(0, 3)
            .map(createNotification)
            .join("");

    }


    if (all) {

        all.innerHTML =
            html;

    }

}



/* =========================================
   READ NOTIFICATION
========================================= */

function readNotification(element) {

    element.classList.remove(
        "unread"
    );


    const dot =
        element.querySelector(
            ".new-dot"
        );


    if (dot) {

        dot.remove();

    }

}



/* =========================================
   ACHIEVEMENTS
========================================= */

function renderAchievements() {

    const student =
        getStudentData();


    const createAchievement =
        function(item) {

            const unlocked =
                item.condition(student);


            return `

                <div class="
                    achievement-card
                    ${
                        unlocked
                        ? "unlocked"
                        : "locked"
                    }">

                    <div class="achievement-icon">

                        <i class="bi ${item.icon}"></i>

                    </div>

                    <h4>
                        ${item.title}
                    </h4>

                    <p>
                        ${item.description}
                    </p>

                    <span class="achievement-status">

                        ${
                            unlocked
                            ?
                            "✓ تم فتحه"
                            :
                            "🔒 لم يفتح بعد"
                        }

                    </span>

                </div>

            `;

        };


    const html =
        achievements
        .map(createAchievement)
        .join("");


    const dashboard =
        getElement(
            "dashboardAchievements"
        );


    const all =
        getElement(
            "allAchievements"
        );


    if (dashboard) {

        dashboard.innerHTML =
            achievements
            .slice(0, 4)
            .map(createAchievement)
            .join("");

    }


    if (all) {

        all.innerHTML =
            html;

    }

}



/* =========================================
   TASME3 RENDER
========================================= */

function renderTasmee3() {

    const student =
        getStudentData();


    const table =
        getElement(
            "tasmee3Table"
        );


    if (!table) {

        return;

    }


    if (
        !student.tasmee3 ||
        student.tasmee3.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center">

                    لم يتم تسجيل أي تسميع حتى الآن.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        student.tasmee3
        .map(function(item) {

            return `

                <tr>

                    <td>
                        ${item.surah}
                    </td>

                    <td>
                        ${item.type}
                    </td>

                    <td>
                        <span class="badge bg-success">
                            ${item.evaluation}
                        </span>
                    </td>

                    <td>
                        ${item.date}
                    </td>

                </tr>

            `;

        })
        .join("");


    /* Last tasmee3 */

    const last =
        student.tasmee3[0];


    if (last) {

        setText(
            "lastTasmee3Surah",
            last.surah
        );

        setText(
            "lastTasmee3Date",
            last.date
        );

        setText(
            "lastEvaluation",
            last.evaluation
        );

        setText(
            "teacherNote",
            last.note
        );

    }

}



/* =========================================
   TASME3 FORM
========================================= */

function setupTasmee3Form() {

    const form =
        getElement(
            "tasmee3Form"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const student =
                getStudentData();


            const surah =
                getElement(
                    "tasmee3Surah"
                ).value;


            const type =
                getElement(
                    "tasmee3Type"
                ).value;


            const evaluation =
                getElement(
                    "tasmee3Evaluation"
                ).value;


            const note =
                getElement(
                    "tasmee3Note"
                ).value;


            const today =
                new Date();


            const date =
                today
                .toISOString()
                .split("T")[0];


            const newTasmee3 = {

                surah: "سورة " + surah,

                type: type,

                evaluation: evaluation,

                date: date,

                note:
                    note ||
                    "بارك الله فيك، استمر في المراجعة."

            };


            if (!student.tasmee3) {

                student.tasmee3 = [];

            }


            /* Add to beginning */

            student.tasmee3.unshift(
                newTasmee3
            );


            /* Increase points */

            let addedPoints = 20;


            if (
                evaluation === "ممتاز"
            ) {

                addedPoints = 30;

            } else if (
                evaluation === "جيد جداً"
            ) {

                addedPoints = 25;

            }


            student.points +=
                addedPoints;


            /* Weekly task */

            if (
                student.weeklyCompleted <
                student.weeklyTarget
            ) {

                student.weeklyCompleted++;

            }


            /* Progress */

            student.progress =
                Math.min(
                    100,
                    student.progress + 1
                );


            /* Saved parts */

            if (
                type === "حفظ جديد" &&
                student.progress % 5 === 0
            ) {

                student.savedParts =
                    Math.min(
                        30,
                        student.savedParts + 1
                    );

            }


            /* Last surah */

            student.lastSurah =
                "سورة " + surah;


            /* Save */

            saveStudentData(
                student
            );

            // مزامنة آخر تسميع مع لوحة المعلم والإدارة
            const sharedTasmee = JSON.parse(localStorage.getItem("tasmeeHistory") || "[]");
            sharedTasmee.unshift({
                id: Date.now(),
                studentId: student.id || Number(localStorage.getItem("currentStudentId") || 1),
                studentName: student.name,
                type: newTasmee3.type,
                surah: newTasmee3.surah,
                from: "-",
                to: "-",
                evaluation: newTasmee3.evaluation,
                note: newTasmee3.note,
                date: newTasmee3.date
            });
            localStorage.setItem("tasmeeHistory", JSON.stringify(sharedTasmee));
            localStorage.setItem("tasmee3Records", JSON.stringify(sharedTasmee));


            /* Reset */

            form.reset();


            /* Update */

            updateDashboard();


            alert(
                "تم تسجيل التسميع بنجاح 🌿"
            );

        }
    );

}



/* =========================================
   WEEKLY TASKS
========================================= */

function renderWeeklyTasks() {

    const student =
        getStudentData();


    const container =
        getElement(
            "weeklyTasks"
        );


    if (!container) {

        return;

    }


    const tasks = [

        {
            title: "مراجعة سورة الملك",
            done:
                student.weeklyCompleted >= 1
        },

        {
            title: "حفظ الآيات الجديدة",
            done:
                student.weeklyCompleted >= 2
        },

        {
            title: "تسميع الحلقة",
            done:
                student.weeklyCompleted >= 3
        },

        {
            title: "مراجعة المحفوظ القديم",
            done:
                student.weeklyCompleted >= 4
        },

        {
            title: "اختبار نهاية الأسبوع",
            done:
                student.weeklyCompleted >= 5
        }

    ];


    container.innerHTML =
        tasks
        .map(function(task) {

            return `

                <div
                    class="notification-item
                    ${
                        task.done
                        ? "unread"
                        : ""
                    }">

                    <div class="notification-icon">

                        <i class="bi
                            ${
                                task.done
                                ?
                                "bi-check-circle-fill"
                                :
                                "bi-book"
                            }">
                        </i>

                    </div>

                    <div
                        class="notification-content">

                        <strong>
                            ${task.title}
                        </strong>

                        <p>

                            ${
                                task.done
                                ?
                                "تم إنجاز المهمة ✓"
                                :
                                "المهمة مطلوبة هذا الأسبوع"
                            }

                        </p>

                    </div>

                </div>

            `;

        })
        .join("");

}



/* =========================================
   PROFILE
========================================= */

function setupProfile() {

    const button =
        getElement(
            "saveProfile"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function() {

            const student =
                getStudentData();


            const name =
                getElement(
                    "profileName"
                ).value.trim();


            const level =
                getElement(
                    "profileLevel"
                ).value.trim();


            if (name) {

                student.name =
                    name;

            }


            if (level) {

                student.level =
                    level;

            }


            saveStudentData(
                student
            );


            updateDashboard();


            alert(
                "تم حفظ بيانات الملف الشخصي ✓"
            );

        }
    );

}



/* =========================================
   MOBILE SIDEBAR
========================================= */

function setupMobileMenu() {

    const button =
        getElement(
            "mobileMenu"
        );


    const sidebar =
        getElement(
            "sidebar"
        );


    const overlay =
        getElement(
            "sidebarOverlay"
        );


    if (
        !button ||
        !sidebar ||
        !overlay
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function() {

            sidebar.classList.add(
                "open"
            );

            overlay.classList.add(
                "show"
            );

        }
    );


    overlay.addEventListener(
        "click",
        function() {

            sidebar.classList.remove(
                "open"
            );

            overlay.classList.remove(
                "show"
            );

        }
    );

}



/* =========================================
   HEADER NOTIFICATION
========================================= */

function setupHeaderNotification() {

    const button =
        getElement(
            "headerNotification"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function() {

            showSection(
                "notifications"
            );

        }
    );

}



/* =========================================
   HASH NAVIGATION
========================================= */

function loadHashSection() {

    const hash =
        window.location.hash
        .replace("#", "");


    const validSections = [

        "dashboard",
        "memorization",
        "tasmee3",
        "schedule",
        "notifications",
        "achievements",
        "profile"

    ];


    if (
        validSections.includes(hash)
    ) {

        showSection(hash);

    } else {

        showSection(
            "dashboard"
        );

    }

}



/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /* Create data */

        getStudentData();


        /* Dashboard */

        updateDashboard();


        /* Navigation */

        setupNavigation();


        /* Tasmee3 */

        setupTasmee3Form();


        /* Weekly tasks */

        renderWeeklyTasks();


        /* Profile */

        setupProfile();


        /* Mobile */

        setupMobileMenu();


        /* Notification */

        setupHeaderNotification();


        /* Hash */

        loadHashSection();


    }
);

// =========================================
// LOGOUT
// =========================================
const studentLogout = document.getElementById("studentLogout");
if (studentLogout) {
    studentLogout.addEventListener("click", function () {
        localStorage.removeItem("quranUser");
        localStorage.removeItem("currentRole");
        localStorage.removeItem("currentStudentId");
        window.location.href = "index.html";
    });
}
