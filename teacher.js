// =========================================
// صلاحيات الدخول - Front-End
// =========================================
(function enforceAccess() {
    let user = null;
    try { user = JSON.parse(localStorage.getItem("quranUser") || "null"); } catch (e) { user = null; }
    if (!user || user.role !== "teacher") {
        window.location.replace("index.html");
        return;
    }
    localStorage.setItem("currentRole", "teacher");
})();

// ==========================================
// TEACHER DASHBOARD
// مكتب الجمعية الشرعية - كفر الشيخ
// ==========================================


function showTeacherSuccess(message) {
    let toast = document.getElementById("teacherSuccessToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "teacherSuccessToast";
        toast.style.cssText = "position:fixed;bottom:25px;right:25px;z-index:9999;background:#087443;color:#fff;padding:14px 20px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.18);font-weight:700;transition:.25s;";
        document.body.appendChild(toast);
    }
    toast.textContent = "✓ " + message;
    toast.style.opacity = "1";
    clearTimeout(window.__teacherToastTimer);
    window.__teacherToastTimer = setTimeout(function(){ toast.style.opacity = "0"; }, 2600);
}

// ==========================================
// STUDENTS DATA
// ==========================================

const defaultStudents = [

    {
        id: 1,
        name: "أحمد محمد علي",
        level: "الجزء الثالث",
        progress: 82,
        attendance: "present",
        status: "normal",
        lastSurah: "سورة آل عمران",
        note: "طالب ملتزم ويتقدم بشكل جيد."
    },

    {
        id: 2,
        name: "عبد الرحمن محمود",
        level: "الجزء الخامس",
        progress: 91,
        attendance: "present",
        status: "excellent",
        lastSurah: "سورة النساء",
        note: "مستوى ممتاز في الحفظ."
    },

    {
        id: 3,
        name: "يوسف أحمد",
        level: "الجزء الثاني",
        progress: 65,
        attendance: "absent",
        status: "review",
        lastSurah: "سورة البقرة",
        note: "يحتاج إلى مراجعة ما تم حفظه."
    },

    {
        id: 4,
        name: "عمر خالد",
        level: "الجزء السابع",
        progress: 88,
        attendance: "present",
        status: "excellent",
        lastSurah: "سورة المائدة",
        note: "تقدم ممتاز هذا الأسبوع."
    },

    {
        id: 5,
        name: "محمد إيهاب",
        level: "الجزء الأول",
        progress: 55,
        attendance: "present",
        status: "review",
        lastSurah: "سورة الفاتحة",
        note: "يحتاج إلى متابعة أكثر."
    },

    {
        id: 6,
        name: "زياد حسن",
        level: "الجزء الرابع",
        progress: 75,
        attendance: "present",
        status: "normal",
        lastSurah: "سورة النساء",
        note: "مستوى جيد."
    },

    {
        id: 7,
        name: "عبد الله سامح",
        level: "الجزء السادس",
        progress: 94,
        attendance: "present",
        status: "excellent",
        lastSurah: "سورة المائدة",
        note: "من الطلاب المتميزين."
    },

    {
        id: 8,
        name: "سيف الدين أحمد",
        level: "الجزء الثاني",
        progress: 60,
        attendance: "absent",
        status: "review",
        lastSurah: "سورة البقرة",
        note: "يحتاج لمراجعة الحفظ السابق."
    }

];


// ==========================================
// LOCAL STORAGE
// ==========================================

let students = JSON.parse(localStorage.getItem("quranStudents") || "[]");

// لو المشروع بدأ من الصفر، نستخدم البيانات التجريبية ونضيف الحلقة والمعلم لكل طالب
if (students.length === 0) {
    students = defaultStudents.map(function (student, index) {
        const groups = [
            ["الحفظ والمراجعة", "الشيخ محمد سعدالله"],
            ["التجويد وتصحيح التلاوة", "الشيخ إبراهيم عطية"],
            ["المراجعة المكثفة", "الشيخ سامي نصار"]
        ];
        const pair = groups[index % groups.length];
        return {
            ...student,
            group: pair[0],
            teacher: pair[1]
        };
    });
    localStorage.setItem("quranStudents", JSON.stringify(students));
}

// توافق مع اسم التخزين القديم
localStorage.setItem("teacherStudents", JSON.stringify(students));

let tasmeeHistory =
    JSON.parse(localStorage.getItem("tasmeeHistory")) ||
    [];



// توحيد اسم المعلم حسب الحلقة حتى لو فتحت لوحة المعلم مباشرة.
const teacherByGroup = {
    "الحفظ والمراجعة": "الشيخ محمد سعدالله",
    "التجويد وتصحيح التلاوة": "الشيخ إبراهيم عطية",
    "المراجعة المكثفة": "الشيخ سامي نصار",
    "حلقة الفتيات - حفظ ومراجعة": "المعلمة رحمة إدريس",
    "حلقة الناشئات - تلاوة": "المعلمة أميرة إدريس",
    "حلقة التلاوة والمراجعة": "المعلمة ياسمين الصعيدي"
};

students = students.map(function (student) {
    const group = student.group || "الحفظ والمراجعة";
    return {
        ...student,
        group: group,
        teacher: teacherByGroup[group] || student.teacher || "الشيخ محمد سعدالله"
    };
});

localStorage.setItem("quranStudents", JSON.stringify(students));

// ==========================================
// SAVE STUDENTS
// ==========================================

function saveStudents() {

    // الطلاب المعروضون في لوحة المعلم هم جزء من القائمة المشتركة،
    // لذلك نحدث سجلاتهم فقط بدون حذف طلاب باقي المعلمين.
    let allStudents = [];
    try {
        allStudents = JSON.parse(localStorage.getItem("quranStudents") || "[]");
    } catch (e) {
        allStudents = [];
    }

    students.forEach(function (updatedStudent) {
        const index = allStudents.findIndex(function (item) {
            return Number(item.id) === Number(updatedStudent.id);
        });

        if (index !== -1) {
            allStudents[index] = {
                ...allStudents[index],
                ...updatedStudent
            };
        } else {
            allStudents.push(updatedStudent);
        }
    });

    localStorage.setItem("quranStudents", JSON.stringify(allStudents));
    localStorage.setItem("teacherStudents", JSON.stringify(allStudents));

}


// ==========================================
// SAVE TASME3
// ==========================================

function saveTasmee() {

    localStorage.setItem("tasmeeHistory", JSON.stringify(tasmeeHistory));
    localStorage.setItem("tasmee3Records", JSON.stringify(tasmeeHistory));

}

// ==========================================
// المعلم الحالي - يُقرأ من الحساب الذي سجّل الدخول
// ==========================================
let currentTeacherName = "";
let currentTeacherUsername = "";
let currentTeacherGroup = "";

try {
    const loggedTeacher = JSON.parse(localStorage.getItem("quranUser") || "null");
    currentTeacherUsername = localStorage.getItem("currentTeacherUsername") || "";

    if (loggedTeacher && loggedTeacher.role === "teacher") {
        currentTeacherName = loggedTeacher.name || "";
    }

    const savedGroup = localStorage.getItem("selectedHalaqaName") || "";
    currentTeacherGroup = savedGroup;
} catch (e) {}

if (!currentTeacherName && currentTeacherUsername) {
    const accounts = {
        ibrahim: {name:"الشيخ إبراهيم عطية", group:"حلقة التجويد وتصحيح التلاوة"},
        sami: {name:"الشيخ سامي نصار", group:"حلقة المراجعة المكثفة"},
        mohamed: {name:"الشيخ محمد سعدالله", group:"حلقة الحفظ والمراجعة"},
        rahma: {name:"المعلمة رحمة إدريس", group:"حلقة الفتيات - حفظ ومراجعة"},
        amira: {name:"المعلمة أميرة إدريس", group:"حلقة الناشئات - تلاوة"},
        yasmeen: {name:"المعلمة ياسمين الصعيدي", group:"حلقة التلاوة والمراجعة"}
    };
    const account = accounts[currentTeacherUsername];
    if (account) {
        currentTeacherName = account.name;
        currentTeacherGroup = account.group;
    }
}

// لا يوجد معلم افتراضي. إذا لم توجد جلسة صحيحة، نخرج بدل فتح لوحة معلم آخر.
if (!currentTeacherName) {
    window.location.replace("index.html");
} else {
    // بيانات الحلقة تُحدد من الحساب نفسه، وليس من قيمة افتراضية.
    const groupByTeacher = {
        "الشيخ إبراهيم عطية": "حلقة التجويد وتصحيح التلاوة",
        "الشيخ سامي نصار": "حلقة المراجعة المكثفة",
        "الشيخ محمد سعدالله": "حلقة الحفظ والمراجعة",
        "المعلمة رحمة إدريس": "حلقة الفتيات - حفظ ومراجعة",
        "المعلمة أميرة إدريس": "حلقة الناشئات - تلاوة",
        "المعلمة ياسمين الصعيدي": "حلقة التلاوة والمراجعة"
    };
    currentTeacherGroup = groupByTeacher[currentTeacherName] || currentTeacherGroup;

    // المعلم يرى طلاب حلقته فقط.
    students = students.filter(function (student) {
        return student.teacher === currentTeacherName ||
               student.group === currentTeacherGroup;
    });

    // تحديث عناصر الواجهة التي كانت ثابتة سابقًا باسم الشيخ إبراهيم.
    document.addEventListener("DOMContentLoaded", function () {
        const name = currentTeacherName;
        const group = currentTeacherGroup || "الحلقة التعليمية";

        document.querySelectorAll(".teacher-mini-profile strong, .top-user strong").forEach(function (el) {
            el.textContent = name;
        });

        document.querySelectorAll(".welcome-box h1").forEach(function (el) {
            el.textContent = "أهلاً بك يا " + name.replace(/^الشيخ |^المعلمة /, "");
        });

        document.querySelectorAll(".top-user small").forEach(function (el) {
            el.textContent = "معلم " + group.replace(/^حلقة /, "");
        });

        document.querySelectorAll(".welcome-box p").forEach(function (el) {
            el.textContent = "تابع طلابك، سجل التسميع، وتابع مستوى " + group + " بسهولة.";
        });
    });
}


// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

const menuLinks =
    document.querySelectorAll(".menu-link");

const sections =
    document.querySelectorAll(".dashboard-section");


menuLinks.forEach(function(link) {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        const sectionName =
            link.getAttribute("data-section");

        menuLinks.forEach(function(item) {

            item.classList.remove("active");

        });

        link.classList.add("active");

        sections.forEach(function(section) {

            section.classList.remove("active-section");

        });

        const selectedSection =
            document.getElementById(sectionName);

        if (selectedSection) {

            selectedSection.classList.add(
                "active-section"
            );

        }

        // Close mobile sidebar
        document
            .getElementById("sidebar")
            .classList.remove("open");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

});


// ==========================================
// MOBILE SIDEBAR
// ==========================================

const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

const sidebar =
    document.getElementById("sidebar");


mobileMenuBtn.addEventListener(
    "click",
    function() {

        sidebar.classList.toggle("open");

    }
);


// ==========================================
// OPEN SECTION FROM BUTTON
// ==========================================

document
    .querySelectorAll("[data-go]")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                const target =
                    button.getAttribute("data-go");

                const targetLink =
                    document.querySelector(
                        `[data-section="${target}"]`
                    );

                if (targetLink) {

                    targetLink.click();

                }

            }
        );

    });


// ==========================================
// STUDENT CARD
// ==========================================

function createStudentCard(student) {

    let statusText = "حاضر";
    let statusClass = "present";

    if (student.attendance === "absent") {

        statusText = "غائب";
        statusClass = "absent";

    }

    if (student.status === "review") {

        statusText = "يحتاج مراجعة";
        statusClass = "review";

    }

    return `

        <div class="student-card">

            <div class="student-card-top">

                <div class="student-avatar">

                    ${student.name.charAt(0)}

                </div>

                <div>

                    <strong>
                        ${student.name}
                    </strong>

                    <small>
                        ${student.lastSurah}
                    </small>

                </div>

            </div>


            <div class="student-level">

                <span>
                    مستوى الحفظ
                </span>

                <strong>
                    ${student.level}
                </strong>

            </div>


            <div class="d-flex justify-content-between mb-2">

                <small>
                    نسبة التقدم
                </small>

                <small>
                    ${student.progress}%
                </small>

            </div>


            <div class="student-progress">

                <div style="width:${student.progress}%"></div>

            </div>


            <div class="mt-3">

                <span class="status ${statusClass}">
                    ${statusText}
                </span>

            </div>


            <div class="card-buttons">

                <button
                    class="history-btn"
                    onclick="showStudentHistory(${student.id})"
                >

                    <i class="bi bi-clock-history"></i>

                    السجل

                </button>


                <button
                    class="quick-tasmee"
                    onclick="quickTasmee(${student.id})"
                >

                    <i class="bi bi-book"></i>

                    تسميع

                </button>

            </div>

        </div>

    `;

}


// ==========================================
// DISPLAY STUDENTS
// ==========================================

function displayStudents(list = students) {

    const grid =
        document.getElementById("studentsGrid");

    if (!grid) return;

    if (list.length === 0) {

        grid.innerHTML = `

            <div class="panel-card text-center">

                <i class="bi bi-search fs-2"></i>

                <p class="mt-2">
                    لا يوجد طلاب مطابقون للبحث.
                </p>

            </div>

        `;

        return;

    }

    grid.innerHTML =
        list.map(createStudentCard).join("");

}


// ==========================================
// HOME STUDENTS
// ==========================================

function displayHomeStudents() {

    const container =
        document.getElementById(
            "homeStudentsList"
        );

    if (!container) return;

    container.innerHTML =
        students
        .slice(0, 5)
        .map(function(student) {

            let statusText = "حاضر";
            let statusClass = "present";

            if (student.attendance === "absent") {

                statusText = "غائب";
                statusClass = "absent";

            }

            return `

                <div class="student-mini-item">

                    <div class="student-avatar">

                        ${student.name.charAt(0)}

                    </div>

                    <div class="student-mini-info">

                        <strong>
                            ${student.name}
                        </strong>

                        <small>
                            ${student.level}
                        </small>

                    </div>

                    <span class="status ${statusClass}">
                        ${statusText}
                    </span>

                </div>

            `;

        })
        .join("");

}


// ==========================================
// SEARCH
// ==========================================

const studentSearch =
    document.getElementById("studentSearch");


studentSearch.addEventListener(
    "input",
    function() {

        const searchValue =
            studentSearch.value
                .trim()
                .toLowerCase();

        const filtered =
            students.filter(function(student) {

                return student.name
                    .toLowerCase()
                    .includes(searchValue);

            });

        displayStudents(filtered);

    }
);


// ==========================================
// FILTERS
// ==========================================

const filterButtons =
    document.querySelectorAll(".filter-btn");


filterButtons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            filterButtons.forEach(
                function(btn) {

                    btn.classList.remove("active");

                }
            );

            button.classList.add("active");

            const filter =
                button.getAttribute("data-filter");

            let filteredStudents = students;


            if (filter === "present") {

                filteredStudents =
                    students.filter(function(student) {

                        return student.attendance === "present";

                    });

            }


            if (filter === "absent") {

                filteredStudents =
                    students.filter(function(student) {

                        return student.attendance === "absent";

                    });

            }


            if (filter === "review") {

                filteredStudents =
                    students.filter(function(student) {

                        return student.status === "review";

                    });

            }


            displayStudents(filteredStudents);

        }
    );

});


// ==========================================
// TASME3 SELECT
// ==========================================

function fillStudentSelect() {

    const select =
        document.getElementById(
            "tasmeeStudent"
        );

    if (!select) return;

    select.innerHTML =
        `<option value="">اختر الطالب</option>`;

    students.forEach(function(student) {

        const option =
            document.createElement("option");

        option.value = student.id;

        option.textContent =
            student.name;

        select.appendChild(option);

    });

}


// ==========================================
// TASME3 FORM
// ==========================================

const tasmeeForm =
    document.getElementById("tasmeeForm");


tasmeeForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const studentId =
            Number(
                document.getElementById(
                    "tasmeeStudent"
                ).value
            );


        const student =
            students.find(function(item) {

                return item.id === studentId;

            });


        if (!student) {

            alert("من فضلك اختر الطالب.");

            return;

        }


        const tasmee = {

            id: Date.now(),

            studentId: student.id,

            studentName: student.name,

            type:
                document.getElementById(
                    "tasmeeType"
                ).value,

            surah:
                document.getElementById(
                    "surah"
                ).value,

            from:
                document.getElementById(
                    "fromAyah"
                ).value,

            to:
                document.getElementById(
                    "toAyah"
                ).value,

            evaluation:
                document.getElementById(
                    "evaluation"
                ).value,

            note:
                document.getElementById(
                    "teacherNote"
                ).value,

            date:
                new Date().toLocaleDateString(
                    "ar-EG"
                )

        };


        tasmeeHistory.unshift(tasmee);

        saveTasmee();


        // Update student data

        student.lastSurah =
            tasmee.surah;


        if (
            tasmee.evaluation ===
            "يحتاج مراجعة"
        ) {

            student.status = "review";

        } else {

            student.status = "normal";

        }


        // مزامنة بيانات الطالب مع لوحة الطالب
        const currentStudentId = Number(localStorage.getItem("currentStudentId") || 1);
        if (student.id === currentStudentId) {
            let portalStudent = {};
            try {
                portalStudent = JSON.parse(localStorage.getItem("studentData") || "{}");
            } catch (e) {
                portalStudent = {};
            }

            portalStudent.id = student.id;
            portalStudent.name = student.name;
            portalStudent.circle = student.group || portalStudent.circle || "";
            portalStudent.teacher = student.teacher || portalStudent.teacher || "";
            portalStudent.level = student.level || portalStudent.level || "";
            portalStudent.progress = Number(student.progress) || Number(portalStudent.progress) || 0;
            portalStudent.lastSurah = tasmee.surah;
            portalStudent.note = tasmee.note || "";
            portalStudent.tasmee3 = Array.isArray(portalStudent.tasmee3) ? portalStudent.tasmee3 : [];
            portalStudent.tasmee3.unshift({
                surah: tasmee.surah,
                type: tasmee.type,
                evaluation: tasmee.evaluation,
                date: tasmee.date,
                note: tasmee.note
            });
            portalStudent.tasmee3 = portalStudent.tasmee3.slice(0, 20);
            portalStudent.points = (Number(portalStudent.points) || 0) + (tasmee.evaluation === "ممتاز" ? 30 : tasmee.evaluation === "جيد جداً" ? 25 : 20);
            portalStudent.progress = Math.min(100, (Number(portalStudent.progress) || 0) + 1);
            localStorage.setItem("studentData", JSON.stringify(portalStudent));

            // تحديث نفس السجل المشترك بعد التقدم
            student.progress = portalStudent.progress;
            saveStudents();
        } else {
            saveStudents();
        }


        displayStudents();

        displayHomeStudents();

        displayTasmeeHistory();

        updateStatistics();


        tasmeeForm.reset();


        alert(
            "تم حفظ التسميع بنجاح ✓"
        );

    }
);


// ==========================================
// TASME3 HISTORY
// ==========================================

function displayTasmeeHistory() {

    const container =
        document.getElementById(
            "tasmeeHistory"
        );

    if (!container) return;


    if (tasmeeHistory.length === 0) {

        container.innerHTML = `

            <div class="text-center p-4">

                <i class="bi bi-book fs-2"></i>

                <p>
                    لم يتم تسجيل أي تسميع حتى الآن.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        tasmeeHistory
        .slice(0, 8)
        .map(function(item) {

            return `

                <div class="history-item">

                    <div class="history-info">

                        <strong>
                            ${item.studentName}
                        </strong>

                        <small>
                            ${item.surah}
                            -
                            من ${item.from}
                            إلى ${item.to}
                            -
                            ${item.date}
                        </small>

                    </div>

                    <span class="evaluation">

                        ${item.evaluation}

                    </span>

                </div>

            `;

        })
        .join("");

}


// ==========================================
// QUICK TASME3
// ==========================================

function quickTasmee(studentId) {

    const select =
        document.getElementById(
            "tasmeeStudent"
        );

    select.value = studentId;


    document
        .querySelector(
            '[data-section="tasmee"]'
        )
        .click();


    document
        .getElementById("surah")
        .focus();

}


// ==========================================
// STUDENT HISTORY
// ==========================================

function showStudentHistory(studentId) {

    const student =
        students.find(function(item) {

            return item.id === studentId;

        });


    if (!student) return;


    const history =
        tasmeeHistory.filter(function(item) {

            return item.studentId === studentId;

        });


    let historyHTML = `

        <div class="text-center mb-3">

            <div class="student-avatar mx-auto mb-2">

                ${student.name.charAt(0)}

            </div>

            <h5>
                ${student.name}
            </h5>

            <small class="text-muted">
                ${student.level}
            </small>

        </div>

    `;


    if (history.length === 0) {

        historyHTML += `

            <div class="text-center p-3">

                <i class="bi bi-journal-x fs-2"></i>

                <p>
                    لا يوجد سجل تسميع لهذا الطالب حتى الآن.
                </p>

            </div>

        `;

    } else {

        historyHTML += history
            .map(function(item) {

                return `

                    <div class="modal-history">

                        <strong>
                            ${item.surah}
                            (${item.type})
                        </strong>

                        <small>
                            الآيات من
                            ${item.from}
                            إلى
                            ${item.to}
                        </small>

                        <small>
                            التقييم:
                            ${item.evaluation}
                        </small>

                        ${
                            item.note
                                ? `
                                    <small>
                                        ملاحظة:
                                        ${item.note}
                                    </small>
                                `
                                : ""
                        }

                    </div>

                `;

            })
            .join("");

    }


    document.getElementById(
        "studentModalBody"
    ).innerHTML = historyHTML;


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "studentModal"
            )
        );


    modal.show();

}


// ==========================================
// ATTENDANCE
// ==========================================

function displayAttendance() {

    const container =
        document.getElementById(
            "attendanceList"
        );

    if (!container) return;


    container.innerHTML =
        students
        .map(function(student) {

            return `

                <div class="attendance-row">

                    <div class="attendance-name">

                        <strong>
                            ${student.name}
                        </strong>

                        <small>
                            ${student.level}
                        </small>

                    </div>


                    <div class="attendance-actions">

                        <button
                            class="present-btn
                            ${student.attendance === "present" ? "selected" : ""}"
                            onclick="setAttendance(${student.id}, 'present')"
                        >
                            حاضر
                        </button>


                        <button
                            class="absent-btn
                            ${student.attendance === "absent" ? "selected" : ""}"
                            onclick="setAttendance(${student.id}, 'absent')"
                        >
                            غائب
                        </button>


                        <button
                            class="late-btn
                            ${student.attendance === "late" ? "selected" : ""}"
                            onclick="setAttendance(${student.id}, 'late')"
                        >
                            متأخر
                        </button>

                    </div>

                </div>

            `;

        })
        .join("");

}


// ==========================================
// SET ATTENDANCE
// ==========================================

function setAttendance(studentId, status) {

    const student =
        students.find(function(item) {

            return item.id === studentId;

        });


    if (!student) return;


    student.attendance = status;

    const currentStudentId = Number(localStorage.getItem("currentStudentId") || 1);
    if (student.id === currentStudentId) {
        let portalStudent = {};
        try { portalStudent = JSON.parse(localStorage.getItem("studentData") || "{}"); } catch (e) { portalStudent = {}; }
        portalStudent.attendance = status;
        if (status === "present") portalStudent.commitmentDays = (Number(portalStudent.commitmentDays) || 0) + 1;
        localStorage.setItem("studentData", JSON.stringify(portalStudent));
    }

    saveStudents();


    displayAttendance();

    displayStudents();

    displayHomeStudents();

    updateStatistics();

}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    const studentsCount =
        document.getElementById(
            "studentsCount"
        );

    const presentCount =
        document.getElementById(
            "presentCount"
        );

    const tasmeeCount =
        document.getElementById(
            "tasmeeCount"
        );


    if (studentsCount) {

        studentsCount.textContent =
            students.length;

    }


    if (presentCount) {

        const present =
            students.filter(function(student) {

                return (
                    student.attendance ===
                    "present"
                );

            }).length;

        presentCount.textContent =
            present;

    }


    if (tasmeeCount) {

        const today =
            new Date().toLocaleDateString(
                "ar-EG"
            );

        const todayTasmee =
            tasmeeHistory.filter(function(item) {

                return item.date === today;

            }).length;


        tasmeeCount.textContent =
            todayTasmee;

    }

}


// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        function() {

            const confirmLogout =
                confirm(
                    "هل تريد تسجيل الخروج؟"
                );


            if (confirmLogout) {
                localStorage.removeItem("quranUser");
                localStorage.removeItem("currentRole");
                localStorage.removeItem("currentTeacher");
                window.location.href =
                    "index.html";

            }

        }
    );


// ==========================================
// NOTIFICATION BUTTON
// ==========================================

document
    .getElementById("notificationBtn")
    .addEventListener(
        "click",
        function() {

            document
                .querySelector(
                    '[data-section="notifications"]'
                )
                .click();

        }
    );


// ==========================================
// INITIALIZATION
// ==========================================

displayStudents();

displayHomeStudents();

fillStudentSelect();

displayTasmeeHistory();

displayAttendance();

updateStatistics();