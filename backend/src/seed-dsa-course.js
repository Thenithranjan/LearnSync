/**
 * Seed script to build a comprehensive, full-fledged DSA Course with 5 complete lessons (modules & rich materials)
 */
require('dotenv').config();
const mongoose = require('mongoose');

const Course = require('./models/Course');
const Module = require('./models/Module');
const Material = require('./models/Material');
const User = require('./models/User');

const dsaLessons = [
  {
    moduleOrder: 1,
    title: 'Lesson 1: Foundations of Algorithms & Asymptotic Analysis',
    description: 'Master time and space complexity, Big-O, Big-Omega, Big-Theta notations, and recursive recurrence relations using the Master Theorem.',
    materials: [
      {
        title: 'Complete Guide: Big-O Notation & Complexity Analysis',
        description: 'Comprehensive notes breaking down worst-case, average-case, and best-case analysis with real-world loop examples.',
        type: 'DOCUMENT',
        url: 'https://en.wikipedia.org/wiki/Big_O_notation',
        duration: 45,
        order: 1,
        topic: 'Complexity Analysis'
      },
      {
        title: 'Video Lecture: Asymptotic Notation & Recurrence Relations',
        description: 'In-depth lecture explaining master theorem, recursion tree method, and space complexity pitfalls.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=__vX2sjlpXU',
        duration: 60,
        order: 2,
        topic: 'Asymptotics'
      },
      {
        title: 'Interactive Cheatsheet: Complexity Chart & Benchmarks',
        description: 'Visual reference for common algorithmic operations across data structures.',
        type: 'LINK',
        url: 'https://www.bigocheatsheet.com/',
        duration: 20,
        order: 3,
        topic: 'Reference'
      }
    ]
  },
  {
    moduleOrder: 2,
    title: 'Lesson 2: Linear Data Structures (Arrays, Linked Lists, Stacks & Queues)',
    description: 'Deep dive into sequential memory vs node pointers. Implement singly/doubly linked lists, dynamic arrays, monotonic stacks, and circular queues.',
    materials: [
      {
        title: 'Core Architecture: Dynamic Arrays & Memory Layout',
        description: 'Study guide detailing vector resizing amortized O(1) analysis, cache locality, and pointer dereferencing.',
        type: 'DOCUMENT',
        url: 'https://en.wikipedia.org/wiki/Dynamic_array',
        duration: 50,
        order: 1,
        topic: 'Arrays'
      },
      {
        title: 'Video Walkthrough: Linked List Manipulations & Two Pointers',
        description: 'Mastering fast & slow pointers, reversing in k-groups, and cycle detection (Floyd\'s algorithm).',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=F8AbOfQwl1c',
        duration: 75,
        order: 2,
        topic: 'Linked Lists'
      },
      {
        title: 'Lab Notes: Monotonic Stack & Queue Implementations',
        description: 'Practical guide to next greater element problems, sliding window maximum, and call stack mechanics.',
        type: 'DOCUMENT',
        url: 'https://en.wikipedia.org/wiki/Stack_(abstract_data_type)',
        duration: 40,
        order: 3,
        topic: 'Stacks & Queues'
      }
    ]
  },
  {
    moduleOrder: 3,
    title: 'Lesson 3: Trees, Binary Search Trees & Balanced Heaps',
    description: 'Explore hierarchical structures: Binary Search Trees, AVL balance factors, Red-Black tree principles, and binary min/max heaps with priority queues.',
    materials: [
      {
        title: 'Handbook: Tree Traversals & BST Invariants',
        description: 'Complete breakdown of Preorder, Inorder, Postorder, Level-Order (BFS), and BST insertion/deletion.',
        type: 'DOCUMENT',
        url: 'https://en.wikipedia.org/wiki/Binary_search_tree',
        duration: 60,
        order: 1,
        topic: 'Trees'
      },
      {
        title: 'Video Lecture: Self-Balancing Trees & Heap Sort Deep Dive',
        description: 'Visualizing tree rotations, heapify up/down operations, and building a priority queue from scratch.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=t0Cq6tVNRBA',
        duration: 80,
        order: 2,
        topic: 'Heaps'
      },
      {
        title: 'Interactive Visualizer: VisuAlgo Binary Heap & BST Animations',
        description: 'Step-through interactive simulator for BST balancing and heap sift operations.',
        type: 'LINK',
        url: 'https://visualgo.net/en/heap',
        duration: 30,
        order: 3,
        topic: 'Visualization'
      }
    ]
  },
  {
    moduleOrder: 4,
    title: 'Lesson 4: Graph Algorithms & Traversals (BFS, DFS, Dijkstra, MST)',
    description: 'Graph representation using adjacency matrices and lists. Graph exploration algorithms (BFS, DFS), cycle detection, Topological Sort, Dijkstra, and Kruskal/Prim.',
    materials: [
      {
        title: 'Deep-Dive Text: Graph Theory Fundamentals & Topological Sort',
        description: 'Representations, connected components, Kahn\'s algorithm, and bipartite graph validation.',
        type: 'DOCUMENT',
        url: 'https://en.wikipedia.org/wiki/Graph_traversal',
        duration: 55,
        order: 1,
        topic: 'Graph Theory'
      },
      {
        title: 'Video Lecture: Shortest Paths with Dijkstra & Bellman-Ford',
        description: 'Greedy approach using Priority Queues, edge relaxation, handling negative weight cycles.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=GazC3A4OQTE',
        duration: 90,
        order: 2,
        topic: 'Shortest Path'
      },
      {
        title: 'Algorithm Specification: Minimum Spanning Trees (MST)',
        description: 'Disjoint Set Union (DSU / Union-Find) data structure and Kruskal vs Prim algorithms.',
        type: 'DOCUMENT',
        url: 'https://en.wikipedia.org/wiki/Minimum_spanning_tree',
        duration: 45,
        order: 3,
        topic: 'Spanning Trees'
      }
    ]
  },
  {
    moduleOrder: 5,
    title: 'Lesson 5: Dynamic Programming, Greedy & Advanced Paradigms',
    description: 'Optimal substructure and overlapping subproblems. 1D & 2D dynamic programming, memoization vs tabulation, knapsack problems, and divide & conquer.',
    materials: [
      {
        title: 'Comprehensive Guide: The Framework to Solve Any DP Problem',
        description: '3-step method to identify state transitions, base cases, and optimize space complexity from O(N^2) to O(N).',
        type: 'DOCUMENT',
        url: 'https://en.wikipedia.org/wiki/Dynamic_programming',
        duration: 65,
        order: 1,
        topic: 'Dynamic Programming'
      },
      {
        title: 'Masterclass Video: 0/1 Knapsack, LCS, and Interval DP',
        description: 'Live coding walkthrough solving canonical Dynamic Programming patterns step by step.',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk',
        duration: 110,
        order: 2,
        topic: 'Advanced Algorithms'
      },
      {
        title: 'Practice Repository: Curated Blind 75 DSA Problem Set',
        description: 'Categorized practice list covering all 5 lessons with benchmark solutions.',
        type: 'LINK',
        url: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions',
        duration: 60,
        order: 3,
        topic: 'Practice'
      }
    ]
  }
];

async function seedDsaCourse() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const faculty = await User.findOne({ role: 'FACULTY' });
    const admin = await User.findOne({ role: 'ADMIN' });
    const creatorId = faculty ? faculty._id : admin._id;

    // Find existing CS201 course or create
    let course = await Course.findOne({ code: 'CS201' });

    if (!course) {
      console.log('Creating new DSA course...');
      course = await Course.create({
        title: 'Data Structures & Algorithms (Mastery)',
        description: 'Comprehensive course covering asymptotic analysis, linear structures, trees, graphs, and dynamic programming.',
        code: 'CS201',
        department: 'Computer Science',
        faculty: faculty ? faculty._id : null,
        thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc13c6b6c23?auto=format&fit=crop&w=800&q=80',
        status: 'PUBLISHED',
        createdBy: creatorId
      });
    } else {
      console.log('Found existing DSA course:', course.title);
      course.status = 'PUBLISHED';
      course.thumbnail = course.thumbnail || 'https://images.unsplash.com/photo-1516116211227-bbc13c6b6c23?auto=format&fit=crop&w=800&q=80';
      await course.save();
    }

    // Clean up old modules and materials for CS201 to make it a pristine 5-lesson curriculum
    const existingModules = await Module.find({ courseId: course._id });
    const moduleIds = existingModules.map(m => m._id);
    if (moduleIds.length > 0) {
      await Material.deleteMany({ moduleId: { $in: moduleIds } });
      await Module.deleteMany({ courseId: course._id });
      console.log(`Cleaned up ${moduleIds.length} previous module(s) and their materials.`);
    }

    // Create 5 structured lessons (modules) with comprehensive materials
    for (const lesson of dsaLessons) {
      const createdModule = await Module.create({
        courseId: course._id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.moduleOrder,
        isPublished: true
      });

      console.log(`Created Module ${lesson.moduleOrder}: ${createdModule.title}`);

      for (const mat of lesson.materials) {
        await Material.create({
          moduleId: createdModule._id,
          title: mat.title,
          description: mat.description,
          type: mat.type,
          url: mat.url,
          duration: mat.duration,
          order: mat.order,
          isPublished: true,
          topic: mat.topic,
          createdBy: creatorId
        });
      }
    }

    // Ensure all existing students are enrolled in this DSA course so they can view and learn immediately
    const Enrollment = require('./models/Enrollment');
    const students = await User.find({ role: 'STUDENT' });
    let newlyEnrolled = 0;

    for (const student of students) {
      const existing = await Enrollment.findOne({ studentId: student._id, courseId: course._id });
      if (!existing) {
        await Enrollment.create({
          studentId: student._id,
          courseId: course._id,
          status: 'ACTIVE',
          enrolledAt: new Date()
        });
        newlyEnrolled++;
      }
    }

    console.log(`Enrolled ${newlyEnrolled} student(s) into ${course.title}. Total students checked: ${students.length}.`);
    console.log('DSA Course successfully updated with 5 comprehensive lessons and 15 materials!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding DSA course:', err);
    process.exit(1);
  }
}

seedDsaCourse();
