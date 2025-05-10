<template>
  <div class="p-4 max-w-6xl mx-auto font-sans">
    <!-- Header -->
    <div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <h1 class="text-3xl font-serif font-bold text-navy">Dashboard</h1>
      <div class="flex gap-4">
        <button 
          v-if="userRole === 'teacher'"
          @click="router.push('/quiz/new')"
          class="bg-navy text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium"
        >
          Create New Quiz
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
    </div>

    <!-- Teacher View -->
    <div v-else-if="userRole === 'teacher'">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Courses Card -->
        <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gold">
          <h2 class="text-xl font-serif font-semibold text-navy mb-4">Your Courses</h2>
          <div class="space-y-2">
            <div 
              v-for="course in teacherCourses" 
              :key="course.id"
              class="flex justify-between items-center p-3 hover:bg-gold/5 rounded-lg transition-colors"
            >
              <span class="text-gray-700">{{ course.name }}</span>
              <span class="text-sm text-navy/80">{{ course.studentCount }} students</span>
            </div>
          </div>
        </div>

        <!-- Recent Quizzes -->
        <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gold">
          <h2 class="text-xl font-serif font-semibold text-navy mb-4">Recent Quizzes</h2>
          <div class="space-y-3">
            <div 
              v-for="quiz in recentQuizzes"
              :key="quiz.id"
              class="p-3 border border-gray-200 rounded-lg hover:border-gold transition-colors"
            >
              <div class="flex justify-between items-center">
                <h3 class="font-medium text-navy">{{ quiz.title }}</h3>
                <span class="text-sm text-gray-600">{{ formatDate(quiz.deadline) }}</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">{{ quiz.course }}</p>
            </div>
          </div>
        </div>

        <!-- Student Performance -->
        <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gold">
          <h2 class="text-xl font-serif font-semibold text-navy mb-4">Student Performance</h2>
          <div class="space-y-3">
            <div 
              v-for="student in topStudents"
              :key="student.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium text-navy">{{ student.name }}</p>
                <p class="text-sm text-gray-600">{{ student.course }}</p>
              </div>
              <span class="bg-gold/20 text-gold-800 px-3 py-1 rounded-full text-sm">
                Avg: {{ student.average }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Student View -->
    <div v-else>
      <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gold mb-8">
        <h3 class="text-xl font-serif font-semibold text-navy mb-4">Messages with Your Tutor</h3>
        <div class="space-y-3">
          <div 
            v-for="message in recentMessages" :key="message.id" 
            class="p-3 rounded-lg"
            :class="message.sender === 'student' ? 'bg-gray-50' : 'bg-gold/10'"
          >
            <p class="text-gray-700">{{ message.content }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ formatDate(message.timestamp) }}</p>
          </div>
        </div>
        <div class="mt-4">
          <textarea 
            v-model="newMessage" 
            class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
            placeholder="Write your message..."
            rows="3"
          ></textarea>
          <button 
            @click="sendMessage"
            class="mt-2 bg-navy text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium"
          >
            Send Message
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Enrolled Courses -->
        <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gold">
          <h2 class="text-xl font-serif font-semibold text-navy mb-4">Enrolled Courses</h2>
          <div class="space-y-2">
            <div 
              v-for="course in studentCourses"
              :key="course.id"
              class="flex justify-between items-center p-3 hover:bg-gold/5 rounded-lg transition-colors"
            >
              <span class="text-gray-700">{{ course.name }}</span>
              <span class="text-sm text-navy/80">{{ course.teacher }}</span>
            </div>
          </div>
        </div>

        <!-- Upcoming Quizzes -->
        <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gold">
          <h2 class="text-xl font-serif font-semibold text-navy mb-4">Upcoming Quizzes</h2>
          <div class="space-y-3">
            <div 
              v-for="quiz in upcomingQuizzes"
              :key="quiz.id"
              class="p-3 border border-gray-200 rounded-lg hover:border-gold transition-colors"
            >
              <div class="flex justify-between items-center">
                <h3 class="font-medium text-navy">{{ quiz.title }}</h3>
                <span class="text-sm text-gray-600">{{ timeRemaining(quiz.deadline) }}</span>
              </div>
              <button 
                @click="startQuiz(quiz)"
                class="mt-2 text-navy hover:text-gold font-medium flex items-center gap-1 transition-colors"
              >
                <span>Start Quiz</span>
                <ArrowRightIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Recent Results -->
        <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gold">
          <h2 class="text-xl font-serif font-semibold text-navy mb-4">Recent Results</h2>
          <div class="space-y-3">
            <div 
              v-for="result in recentResults"
              :key="result.id"
              class="p-3 border border-gray-200 rounded-lg hover:border-gold transition-colors"
            >
              <div class="flex justify-between items-center">
                <h3 class="font-medium text-navy">{{ result.quizTitle }}</h3>
                <span 
                  :class="result.score >= 50 ? 'text-gold-800 bg-gold/20' : 'text-red-600 bg-red-100'"
                  class="px-3 py-1 rounded-full text-sm font-medium"
                >
                  {{ result.score }}%
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-1">{{ result.course }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { db } from '../firebase';
  import { ArrowRightIcon } from '@heroicons/vue/24/outline';
  import { getCurrentUserRole, getCurrentUserId } from '../services/auth';
  import { 
    collection, 
    query, 
    where, 
    getDocs,
    doc,
    getDoc,
    orderBy,
    limit,
    serverTimestamp,
    addDoc,
    onSnapshot
  } from 'firebase/firestore';
  
  const router = useRouter();
  const userRole = ref('');
  const loading = ref(true);
  
  // Teacher Data
  const teacherCourses = ref([]);
  const recentQuizzes = ref([]);
  const topStudents = ref([]);
  
  // Student Data
  const studentCourses = ref([]);
  const upcomingQuizzes = ref([]);
  const recentResults = ref([]);

  const newMessage = ref('');
  const recentMessages = ref([]);
  const currentTutorId = ref(null); 
  const tutorId = ref('ZQup1gXnU0S9ebRETyTtWCMebcI2'); // Replace with actual tutor ID

  const sendMessage = async () => {
    if (newMessage.value.trim()) {
      await addDoc(collection(db, 'messages'), {
        studentId: getCurrentUserId(),
        tutorId: tutorId.value,
        content: newMessage.value,
        timestamp: serverTimestamp(),
        read: false,
        sender: 'student'
      });
      newMessage.value = '';
    }
  };

  onMounted(async () => {
    const q = query(
      collection(db, 'messages'),
      where('studentId', '==', getCurrentUserId()),
      where('tutorId', '==', tutorId.value),
      orderBy('timestamp', 'desc'),
      limit(3)
    );
    try {
      userRole.value = await getCurrentUserRole();
      const userId = getCurrentUserId();
      
      if (userRole.value === 'teacher') {
        await loadTeacherData(userId);
      } else {
        await loadStudentData(userId);
      }
      
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      loading.value = false;
    }
    onSnapshot(q, (snapshot) => {
      recentMessages.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })).reverse();
    });
  });
  

  async function loadTeacherData(teacherId) {
  // Load courses with student count
  const coursesQuery = query(
    collection(db, 'courses'), 
    where('teacherId', '==', doc(db, 'users', teacherId))
  );
  const coursesSnapshot = await getDocs(coursesQuery);
  
  teacherCourses.value = await Promise.all(coursesSnapshot.docs.map(async courseDoc => {
    // Get students from enrolledCourses array instead of subcollection
    const courseData = courseDoc.data();
    const studentIds = courseData.students || [];
    const studentCount = studentIds.length;

    // Get quizzes for average calculation
    const quizzesSnapshot = await getDocs(query(
      collection(db, 'quizzes'),
      where('courseId', '==', courseDoc.id)
    ));
    
    let totalScores = 0;
    let submissionCount = 0;
    
    // Check if there are any quizzes first
    if (quizzesSnapshot.size > 0) {
      const submissions = await getDocs(query(
        collection(db, 'submissions'),
        where('quizId', 'in', quizzesSnapshot.docs.map(q => q.id))
      ));
      
      submissions.docs.forEach(subDoc => {
        const data = subDoc.data();
        // Add safety checks for valid numbers
        if (typeof data.score === 'number' && 
            typeof data.totalMarks === 'number' && 
            data.totalMarks > 0) {
          totalScores += (data.score / data.totalMarks) * 100;
          submissionCount++;
        }
      });
    }

    return {
      id: courseDoc.id,
      ...courseData,
      studentCount: studentCount,
      averageScore: submissionCount > 0 ? (totalScores / submissionCount) : 0
    };
  }));

  // Load recent quizzes
  const quizzesQuery = query(
    collection(db, 'quizzes'),
    where('courseId', 'in', teacherCourses.value.map(c => c.id)),
    orderBy('createdAt', 'desc'),
    limit(5)
  );
  const quizzesSnapshot = await getDocs(quizzesQuery);
  recentQuizzes.value = quizzesSnapshot.docs.map(quizDoc => {
    const course = teacherCourses.value.find(c => c.id === quizDoc.data().courseId);
    return {
      id: quizDoc.id,
      ...quizDoc.data(),
      deadline: quizDoc.data().deadline,
      course: course?.name || 'Deleted Course'
    };
  });

  // Load top students
  const allSubmissions = await getDocs(query(
    collection(db, 'submissions'),
    where('quizId', 'in', recentQuizzes.value.map(q => q.id))
  ));
  
  const studentPerformance = new Map();
  allSubmissions.forEach(subDoc => {
    const { studentId, score, totalMarks } = subDoc.data();

    // Add number validation and division guard
    if (typeof score === 'number' && 
        typeof totalMarks === 'number' &&
        totalMarks > 0) {
      const percentage = (score / totalMarks) * 100;
      const student = studentPerformance.get(studentId) || { total: 0, count: 0 };
      
      studentPerformance.set(studentId, {
        total: student.total + percentage,
        count: student.count + 1
      });
    }
  });


  topStudents.value = await Promise.all(
    Array.from(studentPerformance.entries())
      .sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))
      .slice(0, 5)
      .map(async ([studentId, { total, count }]) => {
        const userDoc = await getDoc(doc(db, 'users', studentId));
        return {
          id: studentId,
          name: userDoc.data()?.name || 'Unknown Student',
          course: teacherCourses.value[0]?.name || 'General',
          average: (total / count).toFixed(1)
        };
      })
  );
}

async function loadStudentData(studentId) {
  // Load enrolled courses
  const userDoc = await getDoc(doc(db, 'users', studentId));
  const enrolledCourses = userDoc.data()?.enrolledCourses || [];
  
  // Handle empty enrolled courses early
  if (enrolledCourses.length === 0) {
    studentCourses.value = [];
    return;
  }
  
  const coursesSnapshot = await getDocs(query(
    collection(db, 'courses'),
    where('__name__', 'in', enrolledCourses)
  ));
  
  studentCourses.value = await Promise.all(coursesSnapshot.docs.map(async courseDoc => {
    const teacherDoc = await getDoc(courseDoc.data().teacherId);
    return {
      id: courseDoc.id,
      ...courseDoc.data(),
      teacher: teacherDoc.data()?.name || 'Unknown Teacher'
    };
  }));

  // Load upcoming quizzes
  const quizzesQuery = query(
    collection(db, 'quizzes'),
    where('courseId', 'in', enrolledCourses),
    where('deadline', '>', new Date()),
    orderBy('deadline', 'asc')
  );
  const quizzesSnapshot = await getDocs(quizzesQuery);
  upcomingQuizzes.value = quizzesSnapshot.docs.map(quizDoc => {
    const course = studentCourses.value.find(c => c.id === quizDoc.data().courseId);
    return {
      id: quizDoc.id,
      ...quizDoc.data(),
      course: course?.name || 'Deleted Course'
    };
  });

  // Load recent results
  const resultsQuery = query(
    collection(db, 'submissions'),
    where('studentId', '==', studentId),
    orderBy('timestamp', 'desc'),
    limit(2)
  );
  const resultsSnapshot = await getDocs(resultsQuery);
  recentResults.value = await Promise.all(resultsSnapshot.docs.map(async subDoc => {
  try {
    const subData = subDoc.data();
    const quizDoc = await getDoc(doc(db, 'quizzes', subData.quizId));
    
    // Check if quiz exists
    if (!quizDoc.exists()) {
      return {
        id: subDoc.id,
        quizTitle: 'Deleted Quiz',
        score: 0,
        course: 'N/A'
      };
    }

    const course = studentCourses.value.find(c => c.id === quizDoc.data().courseId);
    
    return {
      id: subDoc.id,
      quizTitle: quizDoc.data().title,
      score: ((subData.score / subData.totalMarks) * 100).toFixed(1),
      course: course?.name || 'Deleted Course'
    };
  } catch (error) {
    console.error('Error processing submission:', error);
    return {
      id: subDoc.id,
      quizTitle: 'Error Loading Quiz',
      score: 'N/A',
      course: 'Error'
    };
  }
}));
}

// Utility functions
const formatDate = (timestamp) => {
  const date = timestamp?.toDate?.() || new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const timeRemaining = (deadline) => {
  const now = new Date();
  const diff = (deadline?.toDate?.() || new Date(deadline)) - now;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m remaining`;
};
  </script>
  
  <style scoped>
  /* Add custom styles if needed */
  </style>