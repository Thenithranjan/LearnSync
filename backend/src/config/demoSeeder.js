const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const Module = require('../models/Module');
const Material = require('../models/Material');
const LearningProgress = require('../models/LearningProgress');
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const Intervention = require('../models/Intervention');
const Thread = require('../models/Thread');
const Reply = require('../models/Reply');

/**
 * Demo Data Seeder.
 * Ensures default demonstration accounts, courses, and student enrollments exist.
 */
async function seedDemoData() {
  try {
    const demoAccounts = [
      {
        name: 'John Student',
        email: 'student@example.com',
        password: 'Password123!',
        role: 'STUDENT',
        department: 'Computer Science'
      },
      {
        name: 'Dr. Alan Faculty',
        email: 'faculty@example.com',
        password: 'Password123!',
        role: 'FACULTY',
        department: 'Computer Science'
      },
      {
        name: 'System Admin',
        email: 'admin@example.com',
        password: 'Password123!',
        role: 'ADMIN',
        department: 'Administration'
      }
    ];

    const users = {};
    for (const acc of demoAccounts) {
      let user = await User.findOne({ email: acc.email });
      if (!user) {
        user = await User.create(acc);
        console.log(`[Seed] Created demo account: ${acc.email} (${acc.role})`);
      }
      users[acc.role] = user;
    }

    // Extra demo personas: a strong student, an at-risk student, and a second
    // faculty member in another department (feeds rosters, analytics, alerts).
    const extraAccounts = [
      { name: 'Priya Sharma', email: 'student2@example.com', password: 'Password123!', role: 'STUDENT', department: 'Computer Science' },
      { name: 'Rahul Verma', email: 'student3@example.com', password: 'Password123!', role: 'STUDENT', department: 'Computer Science' },
      { name: 'Ananya Iyer', email: 'student4@example.com', password: 'Password123!', role: 'STUDENT', department: 'Mathematics' },
      { name: 'Dr. Meera Nair', email: 'faculty2@example.com', password: 'Password123!', role: 'FACULTY', department: 'Mathematics' }
    ];
    const extra = {};
    for (const acc of extraAccounts) {
      let user = await User.findOne({ email: acc.email });
      if (!user) {
        user = await User.create(acc);
        console.log(`[Seed] Created demo account: ${acc.email} (${acc.role})`);
      }
      extra[acc.email] = user;
    }
    users['STUDENT2'] = extra['student2@example.com'];
    users['STUDENT3'] = extra['student3@example.com'];
    users['STUDENT4'] = extra['student4@example.com'];
    users['FACULTY2'] = extra['faculty2@example.com'];

    // A Mathematics course so department analytics show more than one dept.
    const mathsCourse = {
      title: 'Linear Algebra',
      code: 'MATH201',
      description: 'Vector spaces, matrices, eigenvalues, and applications in computing.',
      department: 'Mathematics',
      faculty: users['FACULTY2']?._id,
      createdBy: users['FACULTY2']?._id || users['ADMIN']?._id,
      status: 'PUBLISHED'
    };
    let mathCourse = await Course.findOne({ code: mathsCourse.code });
    if (!mathCourse) {
      mathCourse = await Course.create(mathsCourse);
      console.log(`[Seed] Created demo course: MATH201 - Linear Algebra`);
    }

    // Managed department records for the admin Departments page
    const Department = require('../models/Department');
    for (const d of [
      { name: 'Computer Science', code: 'CS', description: 'Computing, algorithms, systems and software.' },
      { name: 'Mathematics', code: 'MATH', description: 'Pure and applied mathematics for computing.' }
    ]) {
      const exists = await Department.findOne({ name: d.name });
      if (!exists) {
        await Department.create(d);
        console.log(`[Seed] Created department: ${d.name}`);
      }
    }

    // Enroll demo students across courses
    const enrollmentPlan = [
      [users['STUDENT'], ['CS201', 'CS301', 'CS401', 'MATH201']],
      [users['STUDENT2'], ['CS201', 'CS301', 'CS401', 'MATH201']],
      [users['STUDENT3'], ['CS201', 'CS301']],
      [users['STUDENT4'], ['MATH201']]
    ];
    for (const [student, codes] of enrollmentPlan) {
      if (!student) continue;
      for (const code of codes) {
        const course = await Course.findOne({ code });
        if (!course) continue;
        const enrolled = await Enrollment.findOne({ studentId: student._id, courseId: course._id });
        if (!enrolled) {
          await Enrollment.create({ studentId: student._id, courseId: course._id, status: 'ACTIVE' });
          console.log(`[Seed] Enrolled ${student.email} in ${code}`);
        }
      }
    }

    // Seed default courses if empty
    const demoCourses = [
      {
        title: 'Data Structures & Algorithms',
        code: 'CS201',
        description: 'Core fundamental algorithms, binary trees, dynamic programming, and complexity analysis.',
        department: 'Computer Science',
        faculty: users['FACULTY']?._id,
        createdBy: users['FACULTY']?._id || users['ADMIN']?._id,
        status: 'PUBLISHED'
      },
      {
        title: 'Database Management Systems',
        code: 'CS301',
        description: 'Relational data models, normalization, SQL, indexing, and NoSQL architecture.',
        department: 'Computer Science',
        faculty: users['FACULTY']?._id,
        createdBy: users['FACULTY']?._id || users['ADMIN']?._id,
        status: 'PUBLISHED'
      },
      {
        title: 'Computer Networks',
        code: 'CS401',
        description: 'TCP/IP protocol suite, routing protocols, flow control, and network security.',
        department: 'Computer Science',
        faculty: users['FACULTY']?._id,
        createdBy: users['FACULTY']?._id || users['ADMIN']?._id,
        status: 'PUBLISHED'
      }
    ];

    for (const c of demoCourses) {
      let course = await Course.findOne({ code: c.code });
      if (!course) {
        course = await Course.create(c);
        console.log(`[Seed] Created demo course: ${c.code} - ${c.title}`);
      }

      // Automatically enroll John Student in these courses
      if (users['STUDENT'] && course) {
        const enrolled = await Enrollment.findOne({ studentId: users['STUDENT']._id, courseId: course._id });
        if (!enrolled) {
          await Enrollment.create({
            studentId: users['STUDENT']._id,
            courseId: course._id,
            status: 'ACTIVE'
          });
          console.log(`[Seed] Enrolled student in ${course.code}`);
        }
      }

      // Seed initial sample assessments (Assignment & Quiz)
      const Assessment = require('../models/Assessment');
      const existingAssessments = await Assessment.find({ courseId: course._id });
      if (existingAssessments.length === 0) {
        const quizQuestions = courseQuizQuestions(course);
        await Assessment.create([
          {
            title: `${course.code} Problem Set 1`,
            description: `Core practical assignment covering key topics of ${course.title}.`,
            type: 'ASSIGNMENT',
            courseId: course._id,
            facultyId: users['FACULTY']._id,
            totalPoints: 100,
            passingScore: 50,
            dueDate: new Date(Date.now() + 7 * 86400000),
            isPublished: true
          },
          {
            title: `${course.code} Concept Evaluation Quiz`,
            description: `A 10-question MCQ quiz covering fundamentals of ${course.title}.`,
            type: 'QUIZ',
            courseId: course._id,
            facultyId: users['FACULTY']._id,
            totalPoints: 100,
            passingScore: 60,
            dueDate: new Date(Date.now() + 3 * 86400000),
            isPublished: true,
            timeLimitMinutes: 30,
            questions: quizQuestions
          }
        ]);
        console.log(`[Seed] Created demo assessments (incl. 10-question quiz) for ${course.code}`);
      } else {
        // Ensure each course always has a 10-question quiz even if partially seeded before
        const hasQuiz = existingAssessments.some((a) => a.type === 'QUIZ');
        if (!hasQuiz) {
          await Assessment.create({
            title: `${course.code} Concept Evaluation Quiz`,
            description: `A 10-question MCQ quiz covering fundamentals of ${course.title}.`,
            type: 'QUIZ',
            courseId: course._id,
            facultyId: users['FACULTY']._id,
            totalPoints: 100,
            passingScore: 60,
            dueDate: new Date(Date.now() + 3 * 86400000),
            isPublished: true,
            timeLimitMinutes: 30,
            questions: courseQuizQuestions(course)
          });
          console.log(`[Seed] Added missing 10-question quiz for ${course.code}`);
        }
      }

      // Seed an active attendance session for check-in demo
      const AttendanceSession = require('../models/AttendanceSession');
      const activeSession = await AttendanceSession.findOne({ courseId: course._id, isOtpActive: true });
      if (!activeSession) {
        await AttendanceSession.create({
          courseId: course._id,
          facultyId: users['FACULTY']._id,
          title: `${course.code} Lecture: Deep Dive`,
          date: new Date(),
          sessionType: 'LECTURE',
          otpCode: '849201',
          isOtpActive: true,
          otpExpiresAt: new Date(Date.now() + 86400000),
          status: 'ACTIVE'
        });
        console.log(`[Seed] Created active attendance session for ${course.code} with OTP 849201`);
      }
    }

    await seedRichDemoContent(users);
  } catch (err) {
    console.warn(`[Seed Warning] Could not seed default demo accounts: ${err.message}`);
  }
}

/**
 * Build a fixed 10-question MCQ quiz for any given course.
 * Each question is worth 10 points (total 100). Correct answers are stored
 * server-side and stripped when quizzes are served to students.
 */
function courseQuizQuestions(course) {
  const title = course.title || 'this course';
  const code = course.code || 'CRS';
  return [
    {
      questionText: `What is the primary focus of ${title}?`,
      options: ['Master core concepts and apply them', 'Memorize every detail', 'Skip the assessments', 'None of the above'],
      correctOptionIndex: 0,
      points: 10,
      topic: 'Fundamentals',
      explanation: 'The course is designed to build core conceptual understanding and practical application.'
    },
    {
      questionText: `Which practice best helps you master ${code} topics?`,
      options: ['Consistent practice and review', 'Cramming only before exams', 'Skipping lectures', 'Guessing on assessments'],
      correctOptionIndex: 0,
      points: 10,
      topic: 'Study Approach',
      explanation: 'Regular, spaced practice and review leads to better retention than last-minute cramming.'
    },
    {
      questionText: `When approaching problems in ${title}, what is the recommended first step?`,
      options: ['Understand the problem statement and requirements', 'Start writing code immediately', 'Skip to the hardest part', 'Copy a solution from a peer'],
      correctOptionIndex: 0,
      points: 10,
      topic: 'Problem Solving',
      explanation: 'Clarifying requirements before solving prevents rework and wrong assumptions.'
    },
    {
      questionText: `Which resource best supports learning in ${code}?`,
      options: ['Lecture notes, materials, and recommended readings', 'Only random internet searches', 'Ignoring course materials', 'Waiting until the final exam'],
      correctOptionIndex: 0,
      points: 10,
      topic: 'Resources',
      explanation: 'Course-provided materials and readings are aligned with the syllabus and learning outcomes.'
    },
    {
      questionText: `How should you prepare for assessments in ${title}?`,
      options: ['Review notes and attempt practice questions regularly', 'Only study the night before', 'Skip all preparation', 'Rely entirely on classmates'],
      correctOptionIndex: 0,
      points: 10,
      topic: 'Assessment Prep',
      explanation: 'Consistent review and practice questions build confidence and identify gaps early.'
    },
    {
      questionText: `What indicates strong understanding of ${code} material?`,
      options: ['Ability to explain concepts and solve related problems', 'Memorizing definitions without context', 'Attending class but never reviewing', 'Finishing assignments quickly'],
      correctOptionIndex: 0,
      points: 10,
      topic: 'Mastery',
      explanation: 'True understanding means you can explain concepts and apply them to solve problems.'
    },
    {
      questionText: `Which of the following is true about ${title}?`,
      options: ['It builds knowledge progressively across modules', 'All topics are equally difficult', 'Only the final topic matters', 'It requires no active engagement'],
      correctOptionIndex: 0,
      points: 10,
      topic: 'Course Structure',
      explanation: 'The course is structured so each module builds on the previous one.'
    },
    {
      questionText: `How do you apply ${code} concepts to real-world scenarios?`,
      options: ['Relate theory to practical examples and case studies', 'Ignore real-world context', 'Only apply concepts during exams', 'Apply them without understanding'],
      correctOptionIndex: 0,
      points: 10,
      topic: 'Application',
      explanation: 'Connecting theory to practical examples deepens understanding and retention.'
    },
    {
      questionText: `What is a common mistake to avoid in ${title}?`,
      options: ['Procrastinating until the deadline', 'Asking questions when unsure', 'Reviewing feedback on submissions', 'Practicing regularly'],
      correctOptionIndex: 0,
      points: 10,
      topic: 'Common Pitfalls',
      explanation: 'Procrastination leads to rushed work and missed learning opportunities.'
    },
    {
      questionText: `How do you track your progress in ${code}?`,
      options: ['Check quiz scores, feedback, and completion status', 'Ignore all grades', 'Only check progress at year-end', 'Compare only with classmates'],
      correctOptionIndex: 0,
      points: 10,
      topic: 'Progress Tracking',
      explanation: 'Monitoring scores and feedback helps you identify strengths and areas to improve.'
    }
  ];
}

module.exports = seedDemoData;

/**
 * Rich demo content that makes dashboards, analytics, intelligence,
 * interventions and discussions come alive. Fully idempotent — safe to run
 * on every boot.
 */
async function seedRichDemoContent(users) {
  const student = users['STUDENT'];
  const strongStudent = users['STUDENT2'];
  const atRiskStudent = users['STUDENT3'];
  const mathStudent = users['STUDENT4'];
  const faculty = users['FACULTY'];
  if (!student || !faculty) return;

  const courses = await Course.find({ status: 'PUBLISHED' }).lean();
  const daysAgo = (n) => new Date(Date.now() - n * 86400000);

  for (const course of courses) {
    const courseFaculty = course.faculty || faculty._id;

    // ── Module + materials ──
    let mod = await Module.findOne({ courseId: course._id });
    if (!mod) {
      mod = await Module.create({
        courseId: course._id,
        title: `${course.code} Core Concepts`,
        description: `Foundational modules for ${course.title}.`,
        order: 1,
        isPublished: true
      });
    }
    const materialDefs = [
      { title: `${course.code} Lecture Notes Vol.1`, type: 'DOCUMENT', topic: 'Fundamentals' },
      { title: `${course.code} Guided Lab Video`, type: 'VIDEO', topic: 'Application' }
    ];
    const materials = [];
    for (let i = 0; i < materialDefs.length; i++) {
      const def = materialDefs[i];
      let mat = await Material.findOne({ moduleId: mod._id, title: def.title });
      if (!mat) {
        mat = await Material.create({
          moduleId: mod._id,
          title: def.title,
          description: `Demo ${def.type.toLowerCase()} for ${course.title}.`,
          type: def.type,
          url: 'https://example.com/demo-material',
          topic: def.topic,
          order: i + 1,
          isPublished: true,
          createdBy: courseFaculty
        });
      }
      materials.push(mat);
    }

    // ── Second (4-question) quiz for varied topic analytics ──
    const quiz2Title = `${course.code} Mid-Term Practice Quiz`;
    let quiz2 = await Assessment.findOne({ courseId: course._id, title: quiz2Title });
    if (!quiz2) {
      quiz2 = await Assessment.create({
        title: quiz2Title,
        description: `Extended practice quiz for ${course.title}.`,
        type: 'QUIZ',
        courseId: course._id,
        facultyId: courseFaculty,
        totalPoints: 100,
        passingScore: 50,
        dueDate: daysAgo(-4),
        isPublished: true,
        questions: [
          { questionText: `Core fundamentals check for ${course.code}?`, options: ['Correct approach', 'Wrong A', 'Wrong B', 'Wrong C'], correctOptionIndex: 0, points: 25, topic: 'Fundamentals' },
          { questionText: `Efficiency trade-off in ${course.code}?`, options: ['Wrong A', 'Correct approach', 'Wrong B', 'Wrong C'], correctOptionIndex: 1, points: 25, topic: 'Efficiency' },
          { questionText: `Problem solving pattern in ${course.code}?`, options: ['Wrong A', 'Wrong B', 'Correct approach', 'Wrong C'], correctOptionIndex: 2, points: 25, topic: 'Problem Solving' },
          { questionText: `Applied scenario in ${course.code}?`, options: ['Wrong A', 'Wrong B', 'Wrong C', 'Correct approach'], correctOptionIndex: 3, points: 25, topic: 'Application' }
        ]
      });
      console.log(`[Seed] Created ${quiz2Title}`);
    }

    // ── Graded quiz submissions (drives trends, topics, distributions) ──
    const quiz1 = await Assessment.findOne({ courseId: course._id, type: 'QUIZ', title: { $ne: quiz2Title } });
    const quizzes = [quiz1, quiz2].filter(Boolean);
    // correct-question counts per student: strong Allen, mixed John, weak Rahul
    const quizPlan = [
      [strongStudent, [null, null]], // all correct
      [student, [null, 1]],          // all correct on quiz1, miss Q2 on quiz2
      [mathStudent, [null, null]],   // all correct
      [atRiskStudent, [0, 0]]        // only Q1 correct on each
    ];
    for (const [st, missPlan] of quizPlan) {
      if (!st) continue;
      const enrolled = await Enrollment.findOne({ studentId: st._id, courseId: course._id });
      if (!enrolled) continue;
      for (let qi = 0; qi < quizzes.length; qi++) {
        const quiz = quizzes[qi];
        const exists = await Submission.findOne({ studentId: st._id, assessmentId: quiz._id });
        if (exists) continue;
        const missIdx = missPlan[qi];
        let earned = 0;
        const answers = quiz.questions.map((q, idx) => {
          const correct = missIdx === null || missIdx === undefined || idx !== missIdx;
          if (correct) earned += (q.points || 1);
          return {
            questionIndex: idx,
            selectedOptionIndex: correct ? q.correctOptionIndex : (q.correctOptionIndex + 1) % q.options.length,
            isCorrect: correct,
            pointsEarned: correct ? (q.points || 1) : 0
          };
        });
        const percentage = quiz.totalPoints > 0 ? Math.round((earned / quiz.totalPoints) * 100) : 0;
        await Submission.create({
          assessmentId: quiz._id,
          studentId: st._id,
          courseId: course._id,
          status: 'GRADED',
          answers,
          score: earned,
          totalPoints: quiz.totalPoints,
          percentage,
          isPassed: percentage >= 50,
          feedback: 'Demo auto-graded submission.',
          gradedAt: daysAgo(2 - qi),
          submittedAt: daysAgo(3 - qi)
        });
      }
    }

    // ── Assignment submissions: one graded, two pending review ──
    const assignment = await Assessment.findOne({ courseId: course._id, type: 'ASSIGNMENT' });
    if (assignment) {
      const assignmentPlan = [
        [student, 'GRADED', 85, 'Well-structured solution with clear reasoning.'],
        [strongStudent, 'SUBMITTED', 0, ''],
        [mathStudent, 'SUBMITTED', 0, ''],
        [atRiskStudent, 'SUBMITTED', 0, '']
      ];
      for (const [st, status, score, feedback] of assignmentPlan) {
        if (!st) continue;
        const enrolled = await Enrollment.findOne({ studentId: st._id, courseId: course._id });
        if (!enrolled) continue;
        const exists = await Submission.findOne({ studentId: st._id, assessmentId: assignment._id });
        if (exists) continue;
        await Submission.create({
          assessmentId: assignment._id,
          studentId: st._id,
          courseId: course._id,
          status,
          content: `Demo assignment submission by ${st.name} for ${course.code}.`,
          score,
          totalPoints: assignment.totalPoints || 100,
          percentage: status === 'GRADED' ? Math.round((score / (assignment.totalPoints || 100)) * 100) : 0,
          isPassed: status === 'GRADED' ? score >= 50 : false,
          feedback,
          submittedAt: daysAgo(status === 'GRADED' ? 5 : 1)
        });
      }
    }

    // ── Past attendance sessions + records (drives calendars, streaks, flags) ──
    const pastDays = [19, 16, 13, 9, 6, 2];
    for (const d of pastDays) {
      const title = `${course.code} Lecture - ${d}d ago`;
      let session = await AttendanceSession.findOne({ courseId: course._id, title });
      if (!session) {
        session = await AttendanceSession.create({
          courseId: course._id,
          facultyId: courseFaculty,
          title,
          date: daysAgo(d),
          sessionType: 'LECTURE',
          otpCode: '',
          isOtpActive: false,
          status: 'CLOSED'
        });
      }
      const recordPlan = [
        [student, d === 9 ? 'ABSENT' : 'PRESENT'],
        [strongStudent, 'PRESENT'],
        [mathStudent, 'PRESENT'],
        [atRiskStudent, d === 16 || d === 2 ? 'PRESENT' : 'ABSENT']
      ];
      for (const [st, status] of recordPlan) {
        if (!st) continue;
        const enrolled = await Enrollment.findOne({ studentId: st._id, courseId: course._id });
        if (!enrolled) continue;
        const exists = await AttendanceRecord.findOne({ sessionId: session._id, studentId: st._id });
        if (!exists) {
          await AttendanceRecord.create({
            sessionId: session._id,
            courseId: course._id,
            studentId: st._id,
            status,
            markedBy: 'FACULTY',
            markedAt: daysAgo(d)
          });
        }
      }
    }

    // ── Learning progress (strong: all, John: all, Rahul: first only) ──
    const progressPlan = [
      [strongStudent, materials.map((_, i) => i)],
      [student, materials.map((_, i) => i)],
      [mathStudent, materials.map((_, i) => i)],
      [atRiskStudent, [0]]
    ];
    for (const [st, indices] of progressPlan) {
      if (!st) continue;
      const enrolled = await Enrollment.findOne({ studentId: st._id, courseId: course._id });
      if (!enrolled) continue;
      for (const i of indices) {
        const mat = materials[i];
        if (!mat) continue;
        const exists = await LearningProgress.findOne({ studentId: st._id, materialId: mat._id });
        if (!exists) {
          await LearningProgress.create({ studentId: st._id, courseId: course._id, materialId: mat._id, completed: true });
        }
      }
    }
  }

  // ── Interventions (pending, in-progress, resolved) ──
  const cs201 = await Course.findOne({ code: 'CS201' });
  const cs301 = await Course.findOne({ code: 'CS301' });
  const interventionDefs = [
    {
      student: atRiskStudent, course: cs201, topic: 'Dynamic Programming',
      title: 'Structured study plan for Dynamic Programming',
      actionType: 'STUDY_PLAN', priority: 'HIGH', status: 'PENDING',
      dueDate: new Date(Date.now() + 5 * 86400000)
    },
    {
      student: atRiskStudent, course: cs301, topic: 'Normalization',
      title: 'One-on-one doubt session on Normalization',
      actionType: 'DOUBT_SESSION', priority: 'MEDIUM', status: 'IN_PROGRESS',
      startedAt: daysAgo(1), dueDate: new Date(Date.now() + 6 * 86400000)
    },
    {
      student, course: cs201, topic: 'Graph Traversals',
      title: 'Practice tasks for Graph Traversals',
      actionType: 'PRACTICE_TASK', priority: 'MEDIUM', status: 'REVIEWED',
      outcome: 'IMPROVED', completedAt: daysAgo(2), reviewedAt: daysAgo(1),
      dueDate: daysAgo(-1), studentResponse: 'Completed all practice tasks.',
      facultyNotes: 'Noticeable improvement in follow-up quiz.'
    }
  ];
  for (const def of interventionDefs) {
    if (!def.student || !def.course) continue;
    const exists = await Intervention.findOne({
      studentId: def.student._id, courseId: def.course._id, topic: def.topic
    });
    if (exists) continue;
    await Intervention.create({
      studentId: def.student._id,
      courseId: def.course._id,
      createdBy: faculty._id,
      assignedFaculty: def.course.faculty || faculty._id,
      topic: def.topic,
      title: def.title,
      sourceType: 'FACULTY_MANUAL',
      actionType: def.actionType,
      priority: def.priority,
      status: def.status,
      outcome: def.outcome || 'PENDING',
      dueDate: def.dueDate,
      startedAt: def.startedAt || null,
      completedAt: def.completedAt || null,
      reviewedAt: def.reviewedAt || null,
      studentResponse: def.studentResponse || '',
      facultyNotes: def.facultyNotes || ''
    });
    console.log(`[Seed] Created demo intervention: ${def.title}`);
  }

  // ── Forum thread + endorsed reply ──
  if (cs201) {
    const threadTitle = 'Doubt: how do recurrence relations drive divide & conquer?';
    let thread = await Thread.findOne({ courseId: cs201._id, title: threadTitle });
    if (!thread) {
      thread = await Thread.create({
        courseId: cs201._id,
        authorId: student._id,
        title: threadTitle,
        content: 'I understand the recursion tree but get confused writing the recurrence for merge sort vs quick sort. Any simple mental model?',
        category: 'QUESTION',
        tags: ['recurrence', 'divide-and-conquer']
      });
      await Reply.create({
        threadId: thread._id,
        authorId: faculty._id,
        content: 'Think "work done at this level × number of levels". Merge sort always splits evenly (log n levels of n work), while quick sort depends on pivot quality. Practice writing T(n) first, then unfold it once — the pattern becomes visible.',
        isFacultyEndorsed: true,
        endorsedBy: faculty._id,
        endorsedAt: new Date()
      });
      thread.replyCount = 1;
      thread.isResolved = true;
      await thread.save();
      console.log(`[Seed] Created demo forum thread in CS201`);
    }
  }
}

module.exports = seedDemoData;



