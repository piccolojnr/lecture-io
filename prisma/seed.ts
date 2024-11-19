import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

  // Create topics
  const networkingTopic = await prisma.topic.upsert({
    where: { name: 'Computer Networking' },
    update: {},
    create: { name: 'Computer Networking' },
  });

  const osTopic = await prisma.topic.upsert({
    where: { name: 'Operating Systems' },
    update: {},
    create: { name: 'Operating Systems' },
  });

  // Create lectures with flashcards and quizzes
  const networkingLecture = await prisma.lecture.create({
    data: {
      title: 'Introduction to TCP/IP',
      userId: user.id,
      content: 'This lecture covers the basics of the TCP/IP protocol suite',
      flashcards: {
        create: [
          {
            question: 'What is TCP/IP?',
            answer: 'TCP/IP is a suite of communication protocols used to interconnect network devices on the internet.',
            additionalNotes: 'TCP/IP stands for Transmission Control Protocol/Internet Protocol',
            confidence: 0,
            lastReviewed: null,
            nextReview: null,
            topicId: networkingTopic.id,
          },
          {
            question: 'What are the four layers of the TCP/IP model?',
            answer: 'Application, Transport, Internet, and Network Access layers',
            additionalNotes: 'Compare this with the 7-layer OSI model',
            confidence: 0,
            lastReviewed: null,
            nextReview: null,
            topicId: networkingTopic.id,
          },
          {
            question: 'What is the purpose of the Transport layer?',
            answer: 'The Transport layer provides end-to-end communication and data flow control between applications',
            additionalNotes: 'TCP and UDP are the main protocols at this layer',
            confidence: 0,
            lastReviewed: null,
            nextReview: null,
            topicId: networkingTopic.id,
          },
        ],
      },
    },
  });

  // Create quiz for networking lecture
  const networkingQuiz = await prisma.quiz.create({
    data: {
      title: 'TCP/IP Fundamentals',
      description: 'Test your knowledge of TCP/IP basics',
      lectureId: networkingLecture.id,
      topicId: networkingTopic.id,
      questions: {
        create: [
          {
            question: 'Which protocol operates at the Transport layer?',
            options: JSON.stringify(['TCP', 'IP', 'HTTP', 'FTP']),
            answer: 0,
            explanation: 'TCP (Transmission Control Protocol) operates at the Transport layer and provides reliable, ordered data delivery.',
          },
          {
            question: 'What is the main function of IP?',
            options: JSON.stringify([
              'Data encryption',
              'Packet addressing and routing',
              'Flow control',
              'Error correction',
            ]),
            answer: 1,
            explanation: 'IP (Internet Protocol) handles addressing and routing of packets across networks.',
          },
        ],
      },
      options: {
        create: [
          { value: 'TCP', correct: true },
          { value: 'IP', correct: false },
          { value: 'HTTP', correct: false },
          { value: 'FTP', correct: false },
          { value: 'Data encryption', correct: false },
          { value: 'Packet addressing and routing', correct: true },
          { value: 'Flow control', correct: false },
          { value: 'Error correction', correct: false },
        ],
      },
    },
  });

  // Create OS lecture
  const osLecture = await prisma.lecture.create({
    data: {
      title: 'Process Management in OS',
      userId: user.id,
      content: 'This lecture covers the basics of process management in operating systems',
      flashcards: {
        create: [
          {
            question: 'What is a process?',
            answer: 'A process is a program in execution that includes the program code and its current activity.',
            additionalNotes: 'Each process has its own memory space and resources',
            confidence: 0,
            lastReviewed: null,
            nextReview: null,
            topicId: osTopic.id,
          },
          {
            question: 'What are the different states of a process?',
            answer: 'New, Ready, Running, Waiting, and Terminated',
            additionalNotes: 'State transitions occur based on scheduler decisions and I/O operations',
            confidence: 0,
            lastReviewed: null,
            nextReview: null,
            topicId: osTopic.id,
          },
        ],
      },
    },
  });

  // Create quiz for OS lecture
  const osQuiz = await prisma.quiz.create({
    data: {
      title: 'Process Management Quiz',
      description: 'Test your understanding of OS process management',
      lectureId: osLecture.id,
      topicId: osTopic.id,
      questions: {
        create: [
          {
            question: 'Which component manages process scheduling?',
            options: JSON.stringify([
              'CPU Scheduler',
              'Memory Manager',
              'File System',
              'Device Driver',
            ]),
            answer: 0,
            explanation: 'The CPU scheduler determines which process runs next and manages process state transitions.',
          },
        ],
      },
      options: {
        create: [
          { value: 'CPU Scheduler', correct: true },
          { value: 'Memory Manager', correct: false },
          { value: 'File System', correct: false },
          { value: 'Device Driver', correct: false },
        ],
      },
    },
  });

  console.log('Seed data created successfully');
  console.log('Piccolo credentials:');
  console.log('Email: piccolo@example.com');
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
