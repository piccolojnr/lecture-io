import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();


async function lecture1(user: User) {
  const lecture1 = await prisma.lecture.create({
    data: {
      title: "Introduction to Operating Systems",
      description: "Overview of OS concepts, architecture, and functionality",
      userId: user.id,
    },
  });


  const topic1 = await prisma.topic.create({
    data: {
      title: "Process Management",
      description: "Understanding process states, scheduling, and operations",
      lectureId: lecture1.id,
    },
  });

  const topic2 = await prisma.topic.create({
    data: {
      title: "Memory Management",
      description: "Memory allocation, paging, and segmentation",
      lectureId: lecture1.id,
    },
  });


  const set1 = await prisma.flashcardSet.create({
    data: {
      title: "Process Management Flashcards",
      description: "Flashcards covering the basics of process management",
      lectureId: lecture1.id,
      flashcards: {
        create: [
          {
            question: "What is an operating system?",
            answer: "An operating system is system software that manages computer hardware, software resources, and provides common services for computer programs.",
            additionalNotes: "OS functions include process management, memory management, and file system management.",
            confidence: 0,
            lastReviewed: null,
            nextReview: null,
            topicId: topic1.id,
          },
          {
            question: "What is process management?",
            answer: "Process management involves creating, scheduling, and terminating processes, as well as managing process states and resources.",
            additionalNotes: "The CPU scheduler determines which process runs next based on scheduling algorithms.",
            confidence: 0,
            lastReviewed: null,
            nextReview: null,
            topicId: topic1.id,
          },
        ],
      },
    },
  });

  await prisma.flashcardSet.create({
    data: {
      title: "Memory Management Flashcards",
      description: "Flashcards covering memory management concepts",
      lectureId: lecture1.id,
      flashcards: {
        create: [
          {
            question: "What is memory management?",
            answer: "Memory management is the process of controlling and coordinating computer memory, assigning portions called blocks to various running programs to optimize overall system performance.",
            additionalNotes: "Memory management techniques include paging, segmentation, and virtual memory.",
            confidence: 0,
            lastReviewed: null,
            nextReview: null,
            topicId: topic2.id,
          },
          {
            question: "What is virtual memory?",
            answer: "Virtual memory is a memory management technique that uses hardware and software to allow a computer to compensate for physical memory shortages, temporarily transferring data from RAM to disk storage.",
            additionalNotes: "Virtual memory enables multitasking and efficient memory allocation.",
            confidence: 0,
            lastReviewed: null,
            nextReview: null,
            topicId: topic2.id,
          },
        ],
      }
    },
  });


  await prisma.quiz.create({
    data: {
      title: "Process Management Quiz",
      description: "Quiz on the basics of process management",
      lectureId: lecture1.id,
      setId: set1.id,
      questions: {
        create: [
          {
            question: "Which component manages process scheduling?",

            explanation: "The CPU scheduler determines which process runs next and manages process state transitions.",
            topicId: topic1.id,
            options: {
              create: [
                { value: "CPU Scheduler", correct: true },
                { value: "Memory Manager", correct: false },
                { value: "File System", correct: false },
                { value: "Device Driver", correct: false },
              ],
            },
          },
          {
            question: "What is the purpose of the Memory Manager?",

            explanation: "The Memory Manager allocates and deallocates memory blocks to processes, optimizing memory usage.",
            topicId: topic2.id,
            options: {
              create: [
                { value: "CPU Scheduler", correct: false },
                { value: "Memory Manager", correct: true },
                { value: "File System", correct: false },
                { value: "Device Driver", correct: false },
              ],
            }
          },
        ],
      },
    },
  });

  await prisma.quiz.create({
    data: {
      title: "Memory Management Quiz",
      description: "Quiz on memory management concepts",
      lectureId: lecture1.id,
      questions: {
        create: [
          {
            question: "What is memory allocation?",

            explanation: "Memory allocation involves assigning memory blocks to processes based on their memory requirements.",
            topicId: topic2.id,
            options: {
              create: [
                { value: "Memory Deallocation", correct: false },
                { value: "Memory Fragmentation", correct: false },
                { value: "Memory Allocation", correct: true },
                { value: "Memory Segmentation", correct: false },
              ],
            },
          },
          {
            question: "What is memory fragmentation?",

            explanation: "Memory fragmentation occurs when free memory is broken into small blocks that are unusable due to their size.",
            topicId: topic2.id,
            options: {
              create: [
                { value: "Memory Allocation", correct: false },
                { value: "Memory Deallocation", correct: false },
                { value: "Memory Segmentation", correct: false },
                { value: "Memory Fragmentation", correct: true },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Lecture 1 created successfully');
}

async function lecture2(user: User) {
  const lecture2 = await prisma.lecture.create({
    data: {
      title: "Computer Networking Basics",
      description: "Introduction to computer networking concepts and protocols",
      userId: user.id,
    },
  });

  const topic3 = await prisma.topic.create({
    data: {
      title: "Networking Basics",
      description: "Introduction to computer networking concepts and protocols",
      lectureId: lecture2.id,
    },
  });

  const topic4 = await prisma.topic.create({
    data: {
      title: "OSI Model",
      description: "Understanding the OSI model layers and functions",
      lectureId: lecture2.id,
    },
  });

  const set3 = await prisma.flashcardSet.create({
    data: {
      title: "Networking Basics Flashcards",
      description: "Flashcards covering networking fundamentals",
      lectureId: lecture2.id,
      flashcards: {
        create: [
          {
            question: "What is a network?",
            answer: "A network is a collection of computers, servers, mainframes, network devices, and other devices connected to one another to allow data sharing.",
            additionalNotes: "Networks can be classified based on their size, topology, and purpose.",
            confidence: 0,
            lastReviewed: null,
            nextReview: null,
            topicId: topic3.id,
          },
          {
            question: "What is a protocol?",
            answer: "A protocol is a set of rules that govern data communication, including error detection, correction, and data formatting.",
            additionalNotes: "Common network protocols include TCP/IP, HTTP, and FTP.",
            confidence: 0,
            lastReviewed: null,
            nextReview: null,
            topicId: topic3.id,
          },
        ],
      },
    },
  });

  await prisma.flashcardSet.create({
    data: {
      title: "OSI Model Flashcards",
      description: "Flashcards covering the OSI model layers",
      lectureId: lecture2.id,
      flashcards: {
        create: [
          {
            question: "What is the OSI model?",
            answer: "The OSI (Open Systems Interconnection) model is a conceptual framework that standardizes the functions of a telecommunication or computing system into seven abstraction layers.",
            additionalNotes: "Each layer has specific functions and interacts with adjacent layers.",
            confidence: 0,
            lastReviewed: null,
            nextReview: null,
            topicId: topic4.id,
          },
          {
            question: "What are the seven layers of the OSI model?",
            answer: "Physical, Data Link, Network, Transport, Session, Presentation, Application",
            additionalNotes: "Each layer performs specific functions and interacts with adjacent layers.",
            confidence: 0,
            lastReviewed: null,
            nextReview: null,
            topicId: topic4.id,
          },
        ],
      },
    },
  });

  await prisma.quiz.create({
    data: {
      title: "Networking Basics Quiz",
      description: "Test your knowledge of networking fundamentals",
      lectureId: lecture2.id,
      setId: set3.id,
      questions: {
        create: [
          {
            question: "What is the purpose of a router?",

            explanation: "Routers forward data packets between computer networks, ensuring that data reaches its destination.",
            topicId: topic3.id,
            options: {
              create: [
                { value: "Physical", correct: false },
                { value: "Data Link", correct: false },
                { value: "Network", correct: true },
                { value: "Transport", correct: false },
              ],
            },
          },
          {
            question: "Which layer of the OSI model is responsible for logical addressing?",

            explanation: "The Network layer is responsible for logical addressing, such as IP addresses.",
            topicId: topic3.id,
            options: {
              create: [
                { value: "Physical", correct: false },
                { value: "Data Link", correct: false },
                { value: "Network", correct: true },
                { value: "Transport", correct: false },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.quiz.create({
    data: {
      title: "OSI Model Quiz",
      description: "Test your knowledge of the OSI model layers",
      lectureId: lecture2.id,
      questions: {
        create: [
          {
            question: "Which OSI layer is responsible for data encryption and decryption?",

            explanation: "The Presentation layer is responsible for data encryption, decryption, and data formatting.",
            topicId: topic4.id,
            options: {
              create: [
                { value: "Physical", correct: false },
                { value: "Data Link", correct: false },
                { value: "Presentation", correct: true },
                { value: "Application", correct: false },
              ],
            },
          },
          {
            question: "Which OSI layer establishes, maintains, and terminates connections?",

            explanation: "The Session layer manages session establishment, maintenance, and termination between applications.",
            topicId: topic4.id,
            options: {
              create: [
                { value: "Transport", correct: false },
                { value: "Session", correct: true },
                { value: "Presentation", correct: false },
                { value: "Application", correct: false },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Lecture 2 created successfully');
}

async function main() {
  // Create a test user
  const hashedPassword = await bcrypt.hash('hummer64', 10);
  const user = await prisma.user.upsert({
    where: { email: 'piccolo@gmail.com' },
    update: {},
    create: {
      email: 'piccolo@gmail.com',
      name: 'Piccolo',
      password: hashedPassword,
    },
  });



  await lecture1(user);
  await lecture2(user);

  console.log('Seed data created successfully');
  console.log('Piccolo credentials:');
  console.log('Email: piccolo@gmail.com');
  console.log('Password: hummer64');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
