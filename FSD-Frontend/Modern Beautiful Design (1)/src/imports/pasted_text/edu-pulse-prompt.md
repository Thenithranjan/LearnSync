# STITCH UI/UX GENERATION PROMPT — EDUPULSE

Design a complete, modern, production-quality web application UI/UX for:

# EduPulse

### Intelligent Academic Learning & Performance Platform

EduPulse is a centralized educational platform that combines learning management, assessments, attendance, faculty interaction, performance analytics, academic intelligence, personalized recommendations, and intervention tracking into one connected system.

This is NOT just another LMS.

The core product concept is:

**Collect → Analyze → Understand → Recommend → Intervene → Measure → Improve**

The UI/UX must make this closed-loop learning experience visually obvious.

---

# 1. PRODUCT VISION

EduPulse connects three major user groups:

### STUDENT

The student should understand:

* What courses am I taking?
* What have I completed?
* How am I performing?
* Which topics need attention?
* Why am I struggling?
* What should I study next?
* Do I have any faculty support actions?
* Am I improving?

### FACULTY

The faculty member should understand:

* How is my class performing?
* Which students require attention?
* Which topics are difficult for the class?
* Why is a student struggling?
* What intervention should I provide?
* Did the intervention help?

### ADMIN

The administrator should understand:

* How is the institution performing?
* How are departments performing?
* How many students require support?
* What are the major academic attention areas?
* How effective are interventions?

---

# 2. DESIGN DIRECTION

Create a premium modern educational SaaS product.

Visual style:

* Clean
* Professional
* Intelligent
* Minimal
* Trustworthy
* Data-driven
* Friendly
* Modern
* Accessible
* Enterprise-quality

Avoid:

* Generic school-management-system appearance
* Excessive gradients
* Excessive glassmorphism
* Cartoonish illustrations
* Overly colorful dashboards
* Cluttered interfaces
* Too many cards
* Excessive shadows
* Tiny text
* Dense tables without hierarchy

The application should feel like a combination of:

**Modern SaaS + Learning Platform + Analytics Dashboard**

---

# 3. BRAND PERSONALITY

EduPulse should communicate:

```text
Intelligent
Supportive
Data-driven
Human-centered
Academic
Progress-focused
Trustworthy
```

The interface should never feel like a surveillance or punishment system.

Academic risk should be presented as:

> **An opportunity for support**

not:

> **A prediction of failure**

---

# 4. COLOR SYSTEM

Create a consistent design system.

Primary brand color:

**Deep blue / indigo**

Supporting colors:

* Teal / cyan for positive learning progress
* Green for success
* Amber for attention
* Red only for high-priority warnings
* Neutral gray backgrounds
* White surfaces

Use semantic colors consistently:

```text
Green  → Strong / Improved / Completed
Blue   → Information / Learning
Amber  → Attention / Moderate
Red    → High Priority / Critical
Gray   → Inactive / Neutral
```

Do not overuse red.

---

# 5. TYPOGRAPHY

Use a clean modern sans-serif font.

Recommended:

**Inter**

Typography hierarchy:

```text
Page Title
Section Heading
Card Heading
Body
Secondary Text
Labels
Metadata
```

Prioritize readability.

Use generous whitespace.

---

# 6. RESPONSIVE DESIGN

Design all screens for:

```text
Desktop
Laptop
Tablet
Mobile
```

Desktop should use:

```text
Sidebar
Top Header
Main Content
```

Mobile should use:

```text
Compact Header
Bottom Navigation or collapsible navigation
Scrollable content
Stacked cards
Responsive charts
```

Tables should become horizontally scrollable or transform into cards on mobile.

---

# 7. GLOBAL APPLICATION LAYOUT

Create a consistent authenticated layout:

```text
┌───────────────────────────────────────────────────┐
│ EduPulse                         🔔   Profile     │
├───────────────┬───────────────────────────────────┤
│               │                                   │
│ Dashboard     │                                   │
│ Courses       │                                   │
│ Assignments   │         MAIN CONTENT              │
│ Quizzes       │                                   │
│ Attendance    │                                   │
│ Discussions   │                                   │
│ Analytics     │                                   │
│ Intelligence  │                                   │
│ Interventions │                                   │
│               │                                   │
│ Settings      │                                   │
│               │                                   │
└───────────────┴───────────────────────────────────┘
```

Navigation must change based on role.

---

# 8. AUTHENTICATION SCREENS

Design:

### Login

```text
EduPulse

Learn. Analyze. Improve.

Email
[________________________]

Password
[________________________]

[        Sign In        ]

Don't have an account?
Create account
```

Include:

* Password visibility
* Validation
* Loading state
* Error state
* Forgot password placeholder
* Responsive design

---

# 9. REGISTRATION

Create:

```text
Create your EduPulse account

Full Name
Email
Password
Confirm Password
Role
Department

[Create Account]
```

Roles:

```text
Student
Faculty
```

Do not show Admin as a public registration option.

---

# 10. STUDENT EXPERIENCE

Design a complete student application.

Student navigation:

```text
Dashboard
My Courses
Assignments
Quizzes
Attendance
Discussions
My Analytics
Learning Insights
My Interventions
Profile
```

---

# 11. STUDENT DASHBOARD

This is the primary student screen.

Create:

```text
Good morning, Arun 👋

Here's your academic overview.

------------------------------------------------

Overall Performance        76.5%
Attendance                  82%
Learning Progress           74%
Assignments                 88%

------------------------------------------------

Performance Trend
[Line Chart]

------------------------------------------------

My Courses

Data Structures       82%
Database Systems      76%
Operating Systems     69%

------------------------------------------------

Learning Insights

⚠ Trees needs attention
⚠ Graphs needs practice

------------------------------------------------

Recommended for You

Review Binary Tree Traversal
Practice Graph Algorithms

------------------------------------------------

Upcoming

Assignment — DBMS
Quiz — Data Structures
```

Make this screen visually balanced.

Do not put too many metrics above the fold.

---

# 12. STUDENT COURSE PAGE

Create a course card:

```text
Data Structures
CSE201

Learn algorithms and fundamental
data structures.

Progress
████████████░░ 76%

Faculty:
John Doe

[Continue Learning]
```

---

# 13. COURSE DETAILS

Create:

```text
Data Structures

Faculty: John Doe
Progress: 76%

Course Description

------------------------------------------------

Course Modules

✓ Module 1 — Introduction
✓ Module 2 — Arrays
▶ Module 3 — Linked Lists
○ Module 4 — Trees
○ Module 5 — Graphs

------------------------------------------------

Current Module

Linked Lists

Materials

✓ Introduction PDF
✓ Lecture Video
○ Practice Material

[Continue]
```

Use clear completion states.

---

# 14. LEARNING MATERIAL VIEW

Create a focused learning interface.

Left:

```text
Course Contents
```

Center:

```text
Learning Material

Linked List Introduction

[Video / PDF / Document]

Description
```

Bottom:

```text
[Mark as Complete]
```

Show progress clearly.

---

# 15. ASSIGNMENT UI

Student assignment list:

```text
Assignments

------------------------------------------------
Data Structures Assignment 3

Due:
Sep 10

Status:
Not Submitted

[View Assignment]
------------------------------------------------

Database Assignment 2

Due:
Sep 12

Status:
Submitted ✓

[View Submission]
------------------------------------------------
```

Use status badges.

---

# 16. QUIZ UI

Create a modern quiz experience.

```text
Data Structures Quiz

Question 4 of 10

Which traversal visits...

○ A
○ B
○ C
○ D

[Previous]              [Next]
```

Show:

```text
Progress: ███████░░░
```

Do not make the quiz UI visually distracting.

---

# 17. QUIZ RESULT

After completion:

```text
Quiz Completed 🎉

Score
78%

Correct       8
Incorrect     2

------------------------------------------------

Topic Performance

Arrays        90%
Trees         50%
Graphs        60%

------------------------------------------------

[View Learning Insights]
```

This should naturally lead to the Intelligence module.

---

# 18. ATTENDANCE PAGE

Create:

```text
Attendance

Overall Attendance
82%

------------------------------------------------

Course                  Attendance

Data Structures            91%
Database Systems            84%
Operating Systems           73%
Networks                    79%

------------------------------------------------

Attendance History

Sep 01     Present
Aug 30     Present
Aug 28     Absent
Aug 26     Present
```

Use a clear calendar/history representation.

---

# 19. DISCUSSION PAGE

Create course-specific discussion UI.

```text
Data Structures Discussions

[ + Ask Question ]

------------------------------------------------

Why do we use AVL trees?

Arun · 2 hours ago

12 replies

Faculty Response ✓

[View Discussion]
------------------------------------------------
```

Include:

* Search
* Categories/topics
* Reply
* Faculty badge
* Resolved state

---

# 20. STUDENT ANALYTICS PAGE

This is Module 6.

Create:

```text
My Performance

Overall Performance
76.5%

------------------------------------------------

Assignment      80%
Quiz            70%
Attendance      90%
Learning        75%
Engagement      60%

------------------------------------------------

Performance Trend

[Large Line Chart]

------------------------------------------------

Course Performance

Data Structures        82%
Database Systems       76%
Operating Systems      69%
Networks               84%

------------------------------------------------

Topic Performance

Arrays                  88%
Linked Lists            79%
Trees                    46%
Graphs                   51%
Dynamic Programming     38%
```

Use charts sparingly and effectively.

---

# 21. THE MOST IMPORTANT SCREEN — LEARNING INSIGHTS

This is Module 7.

Create a premium intelligent dashboard.

Header:

```text
Learning Insights

Understand your performance
and discover what to focus on next.
```

---

# 22. INTELLIGENCE SUMMARY

Top section:

```text
Overall Performance
68%

Academic Risk
MODERATE

Trend
IMPROVING
```

Use visual hierarchy.

Risk should never dominate the entire page.

---

# 23. "WHY?" EXPLANATION

Create expandable cards.

Example:

```text
Academic Risk
Moderate

Why?

✓ Quiz performance: 68%
⚠ Attendance: 64%
⚠ Learning progress: 58%
✓ Assignment performance: 78%

[View Details]
```

The user should understand exactly why the system reached the result.

---

# 24. LEARNING GAPS

Create:

```text
Topics Requiring Attention

------------------------------------------------

Dynamic Programming
38%

HIGH ATTENTION

12 questions attempted

[View Recommendations]

------------------------------------------------

Trees
48%

MEDIUM ATTENTION

20 questions attempted

[View Recommendations]

------------------------------------------------

Graphs
51%

MEDIUM ATTENTION

15 questions attempted

[View Recommendations]
```

Do not call the student "weak."

Use supportive language.

---

# 25. STRONG TOPICS

Create a separate positive section:

```text
Your Strong Areas

✓ Arrays                  88%
✓ Sorting                 84%
✓ Searching               81%
```

This prevents the intelligence dashboard from feeling negative.

---

# 26. PERSONALIZED RECOMMENDATIONS

Create:

```text
Recommended for You

🎯 Review Binary Tree Traversal

Why:
Your recent accuracy is 48%.

Action:
Review the lecture material
and complete the practice quiz.

[Start]
```

Another:

```text
🎯 Practice Graph Traversal

Why:
Recent performance indicates
additional practice may help.

[Start]
```

Each recommendation should include:

* Topic
* Reason
* Action
* Priority
* CTA

---

# 27. INSUFFICIENT DATA STATE

Create a special state:

```text
Not enough data yet

We need more learning activity
before generating reliable insights.

Complete a few quizzes and learning
activities to unlock personalized insights.

[Explore My Courses]
```

Do not show fake risk scores.

---

# 28. IMPROVING STUDENT STATE

When performance is improving:

```text
You're improving! 📈

Trees
42% → 64%

+22 percentage points

Keep going — your recent performance
shows strong improvement.
```

This should feel motivating.

---

# 29. INTERVENTION MODULE — STUDENT

Create:

```text
My Support Actions
```

Example:

```text
🔴 High Priority

Trees Practice

Course:
Data Structures

Reason:
Your recent topic performance indicates
additional practice may help.

Due:
Sep 10

Status:
Assigned

[View Details]
```

---

# 30. INTERVENTION DETAIL

Create a timeline:

```text
Academic Support

Trees Practice

Reason
Topic accuracy: 48%

Action
Complete targeted practice

------------------------------------------------

✓ Intervention Assigned
✓ Acknowledged
● In Progress
○ Completed
○ Faculty Review
○ Outcome Measurement
```

This timeline is extremely important.

---

# 31. COMPLETE INTERVENTION

Create:

```text
Complete Support Action

What did you find difficult?

[____________________________]

What did you learn?

[____________________________]

[Mark as Completed]
```

---

# 32. STUDENT IMPROVEMENT PAGE

Create:

```text
My Improvement

Interventions Completed       8
Topics Improved               5
Average Improvement          +13%

------------------------------------------------

Before → After

Trees
42% → 71%
+29 points

Graphs
51% → 68%
+17 points

Dynamic Programming
38% → 42%
+4 points
```

Make improvement visually prominent.

---

# 33. FACULTY EXPERIENCE

Faculty navigation:

```text
Dashboard
My Courses
Students
Assignments
Quizzes
Attendance
Discussions
Performance Analytics
Academic Intelligence
Interventions
Profile
```

---

# 34. FACULTY DASHBOARD

Create:

```text
Good morning, Dr. John 👋

Academic Overview

Students                62
Average Performance     74%
Attendance              81%
High Attention           7

------------------------------------------------

Course Performance

Data Structures          78%
Database Systems         74%
Networks                 81%

------------------------------------------------

Students Requiring Attention

🔴 Arun        48%     HIGH
🔴 Karthik     54%     HIGH
🟡 Rahul       64%     MODERATE

[View Academic Intelligence]
```

---

# 35. FACULTY COURSE ANALYTICS

Create:

```text
Data Structures
Course Analytics

Students              62
Average Score         74%
Attendance            81%
Quiz Score            69%
Assignment Score      78%
Learning Progress     72%

------------------------------------------------

Performance Distribution
[Bar Chart]

------------------------------------------------

Performance Trend
[Line Chart]

------------------------------------------------

Topic Performance
[Horizontal Bar Chart]
```

---

# 36. FACULTY STUDENT TABLE

Create a clean table:

```text
Student        Score     Attendance    Quiz     Risk

Arun           48%        62%           42%      HIGH
Rahul          64%        71%           61%      MODERATE
Priya           87%        92%           89%      LOW
```

Features:

* Search
* Sort
* Filter
* Pagination
* Click student

---

# 37. FACULTY ACADEMIC INTELLIGENCE

This is the most important faculty page.

Create:

```text
Academic Intelligence

Students Requiring Attention

🔴 High Risk       7
🟡 Moderate       14
🟢 Low Risk       41

------------------------------------------------

Class Attention Areas

Dynamic Programming    41%
Graphs                 49%
Trees                  53%

------------------------------------------------

Students

Arun
Risk: HIGH

Why?

Quiz Performance       42%
Attendance              61%
Topic: Trees            38%
Trend: Declining

[View Details]
[Create Intervention]
```

---

# 38. STUDENT INTELLIGENCE DETAIL FOR FACULTY

Create:

```text
Arun
Data Structures

Risk Indicator
HIGH — 72

------------------------------------------------

Performance

Quiz                  42%
Assignment            64%
Attendance             61%
Progress               55%
Engagement             58%

------------------------------------------------

Attention Topics

Trees                  38%
Graphs                 47%

------------------------------------------------

Evidence

• 12 questions attempted
• Low recent accuracy
• Declining quiz trend
• Attendance below course average

------------------------------------------------

Suggested Support

Review Trees material
Targeted practice
Doubt-clearing session

[Create Intervention]
```

---

# 39. CREATE INTERVENTION FORM

Create a professional form:

```text
Create Academic Support

Student
[Arun ▼]

Course
[Data Structures ▼]

Topic
[Trees]

Title
[Review Tree Traversal]

Action Type
[Practice Task ▼]

Priority
[High ▼]

Due Date
[Sep 10]

Description

[________________________]

Suggested Action

[________________________]

[Create Intervention]
```

If launched from Module 7, prefill intelligence data.

---

# 40. FACULTY INTERVENTION CENTER

Create:

```text
Intervention Center

Pending        12
In Progress     8
Completed      31
Overdue         4

------------------------------------------------

Student     Topic      Priority     Status

Arun        Trees      HIGH         Pending
Rahul       Graphs     MEDIUM       In Progress
Priya        Arrays     LOW         Completed
```

Add filters.

---

# 41. INTERVENTION TIMELINE FOR FACULTY

Show:

```text
Student Support Timeline

Risk Detected
     ↓
Recommendation
     ↓
Intervention Created
     ↓
Student Acknowledged
     ↓
Student Started
     ↓
Student Completed
     ↓
Faculty Reviewed
     ↓
Outcome Measured
```

Make this one of the signature UX patterns of EduPulse.

---

# 42. FACULTY OUTCOME REVIEW

Create:

```text
Intervention Review

Student:
Arun

Topic:
Trees

Before:
42%

After:
71%

Improvement:
+29 points

------------------------------------------------

Student Response

"I understood tree traversal better..."

------------------------------------------------

Outcome

[Improved ▼]

Faculty Notes

[________________________]

[Save Review]
```

---

# 43. INTERVENTION ANALYTICS

Create:

```text
Intervention Analytics

Total Interventions       52
Completed                 41
Measured                  36
Improved                  25

Observed Improvement
69%

------------------------------------------------

Outcome Distribution

Improved
Partial
No Significant Change
Further Support Required

------------------------------------------------

Topic Effectiveness

Trees                  72%
Graphs                 64%
DP                     51%
```

Clearly label this as:

**Observed Improvement**

Do not visually imply causation.

---

# 44. ADMIN EXPERIENCE

Admin navigation:

```text
Dashboard
Users
Students
Faculty
Courses
Departments
Academic Analytics
Academic Intelligence
Interventions
Settings
```

---

# 45. ADMIN DASHBOARD

Create:

```text
Institution Overview

Students             1,240
Faculty                 84
Courses                126

Average Performance    73%
Average Attendance     81%

------------------------------------------------

Department Performance

CSE        76%
ECE        72%
MECH       68%
CIVIL      74%

------------------------------------------------

Academic Attention

High Risk Students       46
Moderate Risk           132

------------------------------------------------

Intervention Overview

Completed                317
Measured                 284
Improved                 191
```

---

# 46. ADMIN ACADEMIC ANALYTICS

Create:

```text
Institution Analytics

Average Performance
[Line Chart]

Department Performance
[Bar Chart]

Attendance
[Chart]

Course Performance
[Chart]
```

Add filters:

```text
Department
Course
Time Period
```

---

# 47. ADMIN ACADEMIC INTELLIGENCE

Create:

```text
Institution Intelligence

Students Requiring Attention

High Risk             46
Moderate Risk         132

------------------------------------------------

Most Common Attention Topics

Trees                   51%
Graphs                  55%
Dynamic Programming     48%

------------------------------------------------

Department Risk Overview

CSE
High Risk: 12

ECE
High Risk: 8
```

Keep institution-level information aggregated.

---

# 48. ADMIN INTERVENTION ANALYTICS

Create:

```text
Institution Intervention Analytics

Total Interventions      428
Completed                 317
Overdue                    29

Measured                  284
Improved                  191

Observed Improvement      67%
```

---

# 49. USER PROFILE

Create profile page:

```text
Profile

[Profile Image]

John Doe
Faculty

Email
john@example.com

Department
Computer Science

[Edit Profile]
```

Student/faculty/admin versions should be consistent.

---

# 50. NOTIFICATIONS

Create notification dropdown:

```text
Notifications

🔵 New intervention assigned
   Trees Practice

🟡 Quiz results available
   Data Structures Quiz

🟢 Your performance improved
   Trees: +18 points

🔵 Faculty feedback received
```

Include:

```text
Mark all as read
View all
```

---

# 51. EMPTY STATES

Design elegant empty states.

Examples:

### No Courses

```text
No courses yet

Your enrolled courses will appear here.

[Explore Courses]
```

### No Recommendations

```text
You're doing well!

No additional recommendations right now.
```

### No Interventions

```text
No support actions assigned

You're all caught up.
```

### No Analytics

```text
Not enough data yet

Complete more academic activities
to unlock insights.
```

---

# 52. LOADING STATES

Use skeleton loaders instead of generic spinners wherever possible.

Create skeletons for:

* Dashboard cards
* Course cards
* Analytics charts
* Tables
* Intelligence cards
* Intervention lists

---

# 53. ERROR STATES

Create consistent error UI:

```text
Something went wrong

We couldn't load your academic data.

[Try Again]
```

Do not show raw API errors.

---

# 54. MODALS

Create reusable modals for:

* Delete confirmation
* Course archive
* Intervention creation
* Intervention cancellation
* Faculty assignment
* Feedback submission

Use clear primary and secondary actions.

---

# 55. COMPONENT DESIGN SYSTEM

Create reusable components:

```text
Button
Input
Select
Modal
Badge
Card
Avatar
Dropdown
Tabs
ProgressBar
ProgressRing
Table
Pagination
Tooltip
Toast
Skeleton
EmptyState
ErrorState
```

Analytics components:

```text
PerformanceCard
MetricCard
TrendChart
BarChart
TopicChart
RiskIndicator
RiskFactors
RecommendationCard
LearningGapCard
InterventionTimeline
OutcomeCard
```

---

# 56. DASHBOARD CARD DESIGN

Avoid making every piece of information a card.

Use cards only for:

* Key metrics
* Important insights
* Recommendations
* Alerts

Use normal sections for:

* Tables
* Charts
* Course lists
* Timelines

---

# 57. ACCESSIBILITY

Follow accessibility best practices:

* Sufficient color contrast
* Keyboard navigation
* Visible focus states
* Proper labels
* Accessible buttons
* Tooltips where necessary
* Do not rely only on color to communicate status

Example:

Instead of only:

```text
🔴
```

show:

```text
🔴 HIGH
```

---

# 58. RESPONSIVE BREAKPOINTS

Design:

### Desktop

```text
Sidebar: 240–260px
Main content: flexible
```

### Tablet

Collapse sidebar.

### Mobile

Use:

```text
Top header
Bottom navigation / drawer
Stacked sections
Horizontal chart scrolling where necessary
```

---

# 59. MICROINTERACTIONS

Use subtle animations:

* Button hover
* Card hover
* Progress animation
* Chart entrance
* Modal transition
* Toast notification
* Status transition

Avoid excessive animation.

---

# 60. SIGNATURE EDUPULSE UX

Create one distinctive visual component called:

### "Learning Pulse"

A compact visual summary of:

```text
Performance
Attendance
Engagement
Learning Progress
Risk
```

Example:

```text
          LEARNING PULSE

Performance       76%
Attendance        82%
Progress          74%
Engagement        71%

Trend             ↑ Improving
Risk              Moderate
```

Use this component consistently on the student dashboard and faculty student-detail pages.

---

# 61. SIGNATURE CLOSED-LOOP COMPONENT

Create a visual component:

```text
Detect
  ↓
Understand
  ↓
Recommend
  ↓
Intervene
  ↓
Measure
  ↓
Improve
```

Use it on:

* Student Learning Insights
* Faculty Academic Intelligence
* Project overview/landing page

This should visually communicate the unique value of EduPulse.

---

# 62. LANDING PAGE

Create a public landing page.

Hero:

```text
Turn Academic Data
Into Better Learning.

EduPulse connects learning,
performance, intelligence,
and intervention in one platform.

[Get Started]
[Explore Platform]
```

Supporting visual:

```text
Student Activity
       ↓
Performance Analytics
       ↓
Learning Insights
       ↓
Personalized Support
       ↓
Improvement
```

---

# 63. LANDING PAGE FEATURES

Show:

### Digital Learning

Organize courses and learning materials.

### Smart Assessment

Assignments and quizzes connected to topic performance.

### Performance Analytics

Understand academic progress.

### Academic Intelligence

Identify areas requiring attention.

### Personalized Recommendations

Know what to study next.

### Faculty Intervention

Turn insights into action.

### Improvement Tracking

Measure whether support actually helped.

---

# 64. LANDING PAGE DIFFERENTIATOR

Use this headline:

> **From Academic Activity to Measurable Improvement.**

Supporting text:

> EduPulse doesn't just record attendance, assignments, and grades. It connects academic signals to identify areas requiring attention, recommend focused actions, coordinate faculty support, and measure improvement over time.

---

# 65. DESIGN CONSISTENCY

Every screen must share:

* Same sidebar
* Same header
* Same typography
* Same button styles
* Same status badges
* Same spacing system
* Same border radius
* Same chart styling
* Same empty states
* Same form patterns

Do not design each page as a separate product.

---

# 66. IMPORTANT PRODUCT LOGIC TO REFLECT IN UI

The UI should clearly communicate these relationships:

```text
Quiz Question
      ↓
Topic Performance
      ↓
Learning Gap
      ↓
Recommendation
      ↓
Faculty Intervention
      ↓
Student Action
      ↓
Outcome
      ↓
Improvement
```

This is the core product story.

---

# 67. DO NOT CREATE

Do NOT create:

* E-commerce UI
* Social-media-style feed
* Excessive gamification
* Leaderboards
* Public student rankings
* Student-to-student risk comparisons
* Punitive risk indicators
* Fake AI chatbot everywhere
* Excessive animations
* Generic template dashboards

The system should feel like a serious academic product.

---

# 68. DESIGN OUTPUT

Generate the complete UI/UX design system and screens for:

### Public

```text
Landing
Login
Register
```

### Student

```text
Dashboard
Courses
Course Details
Learning Material
Assignments
Assignment Details
Quiz
Quiz Results
Attendance
Discussions
Analytics
Learning Insights
Recommendations
Interventions
Intervention Details
Improvement
Profile
Notifications
```

### Faculty

```text
Dashboard
Courses
Course Management
Course Analytics
Student Performance
Academic Intelligence
Student Intelligence Detail
Create Intervention
Intervention Center
Intervention Detail
Outcome Review
Intervention Analytics
Profile
Notifications
```

### Admin

```text
Dashboard
Users
Students
Faculty
Courses
Departments
Institution Analytics
Institution Intelligence
Interventions
Intervention Analytics
Profile
Settings
```

---

# 69. FINAL UX PRINCIPLE

The product should make the following journey effortless:

```text
STUDENT

"I completed my work."
        ↓
"How am I performing?"
        ↓
"What am I struggling with?"
        ↓
"Why am I struggling?"
        ↓
"What should I do?"
        ↓
"I completed the recommendation."
        ↓
"Did I improve?"

---------------------------------

FACULTY

"Which students need attention?"
        ↓
"Why?"
        ↓
"What support should I provide?"
        ↓
"Did the student respond?"
        ↓
"Did performance improve?"

---------------------------------

ADMIN

"How is the institution performing?"
        ↓
"Where are the academic attention areas?"
        ↓
"Are interventions happening?"
        ↓
"Are they producing measurable improvement?"
```

The UI/UX must make these workflows obvious, fast, and intuitive.

---

# 70. FINAL DESIGN QUALITY BAR

The final result should look like a **real production SaaS product**, not a college-project template.

Prioritize:

```text
Visual hierarchy
Consistency
Whitespace
Readability
Data visualization
Accessibility
Responsive design
Clear navigation
Actionable insights
Explainability
User trust
```

The final visual identity should communicate:

**EduPulse = Learn + Analyze + Improve**

Generate all screens as one cohesive design system with consistent components, layouts, interactions, spacing, typography, colors, and responsive behavior.
