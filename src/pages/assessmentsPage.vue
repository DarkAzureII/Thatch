<template>
  <div class="p-4 max-w-4xl mx-auto font-sans">
    <!-- Teacher View -->
    <div v-if="userRole === 'teacher'" class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 class="text-3xl font-serif font-bold text-gold">Manage Assessments</h2>
        <button 
          @click="showCreateModal = true"
          class="bg-navy text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium whitespace-nowrap"
        >
          Create New Quiz
        </button>
      </div>

      <!-- Courses with Quizzes -->
      <div class="space-y-8">
        <div 
          v-for="course in teacherCourses" 
          :key="course.id"
          class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-gold"
        >
          <div class="border-b border-gold/20 pb-4 mb-6">
            <h3 class="text-xl font-serif font-semibold text-navy">
              {{ course.name }} (Grade {{ course.grade }} {{ course.subject }})
            </h3>
            <p class="text-sm text-gray-600 mt-2">
              {{ course.quizzes.length }} quizzes · Join Code: {{ course.joinCode }}
            </p>
          </div>

          <!-- Quizzes in this course -->
          <div class="space-y-4">
            <div 
              v-for="quiz in course.quizzes" 
              :key="quiz.id"
              class="bg-gray-50 p-4 rounded-lg border-l-4 border-navy hover:border-gold transition-colors"
            >
              <div class="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h4 class="font-medium text-navy">{{ quiz.title }}</h4>
                  <p class="text-sm text-gray-600 mt-1">
                    Due: {{ formatDeadline(quiz.deadline) }} · 
                    {{ quiz.totalMarks }} Marks
                  </p>
                </div>
                <div class="flex gap-3">
                  <button 
                    @click="viewSubmissions(quiz.id)"
                    class="text-navy hover:text-gold font-medium text-sm flex items-center gap-1 transition-colors"
                  >
                    <EyeIcon class="w-5 h-5" />
                    Submissions
                  </button>
                  <button 
                    @click="deleteQuiz(quiz.id)"
                    class="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1 transition-colors"
                  >
                    <TrashIcon class="w-5 h-5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="course.quizzes.length === 0" class="text-gray-400 text-sm">
            No quizzes created for this course yet
          </div>
        </div>
      </div>
    </div>

    <!-- Student View -->
    <div v-else class="space-y-8">
      <h2 class="text-3xl font-serif font-bold text-gold mb-8">Your Assessments</h2>
      
      <div class="space-y-8">
        <div 
          v-for="course in studentCourses"
          :key="course.id"
          class="bg-white p-6 rounded-xl shadow-lg border-t-4 border-gold"
        >
          <h3 class="text-xl font-serif font-semibold text-navy mb-6">
            {{ course.name }} (Grade {{ course.grade }} {{ course.subject }})
          </h3>
          
          <!-- Active Quizzes -->
          <div class="mb-6">
            <h4 class="font-medium text-navy mb-4">Pending Quizzes</h4>
            <div class="space-y-4">
              <div 
                v-for="quiz in course.activeQuizzes"
                :key="quiz.id"
                class="bg-gray-50 p-4 rounded-lg border-l-4 border-navy hover:border-gold transition-colors"
              >
                <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <p class="font-medium text-navy">{{ quiz.title }}</p>
                    <p class="text-sm text-gray-600 mt-1">
                      Due: {{ formatDeadline(quiz.deadline) }}
                    </p>
                  </div>
                  <div v-if="quiz.attemptsRemaining > 0">
                    <button 
                      @click="startQuiz(quiz)"
                      class="bg-navy text-white px-6 py-2 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium"
                    >
                      Start ({{ quiz.attemptsRemaining }} attempts left)
                    </button>
                  </div>
                  <div v-else class="text-red-600 font-medium">
                    Max attempts reached
                  </div>
                </div>
              </div>
              <div v-if="course.activeQuizzes.length === 0" class="text-gray-400 text-sm">
                No pending quizzes
              </div>
            </div>
          </div>

          <!-- Completed Quizzes -->
          <div>
            <h4 class="font-medium text-navy mb-4">Completed Assessments</h4>
            <div class="space-y-4">
              <div 
                v-for="submission in course.completedSubmissions"
                :key="submission.id"
                class="bg-gray-50 p-4 rounded-lg hover:border-l-4 border-gold transition-colors"
              >
                <router-link 
                  :to="`/submissions/${submission.id}/review`"
                  class="hover:text-gold transition-colors"
                >
                  <div class="flex justify-between items-center gap-4">
                    <div>
                      <p class="font-medium text-navy">{{ submission.quizTitle }}</p>
                      <p class="text-sm text-gray-600 mt-1">
                        Score: {{ submission.score }}/{{ submission.totalMarks }}
                      </p>
                    </div>
                    <span class="text-sm text-gray-600 whitespace-nowrap">
                      {{ formatDate(submission.timestamp) }}
                    </span>
                  </div>
                </router-link>
              </div>
              <div v-if="course.completedSubmissions.length === 0" class="text-gray-400 text-sm">
                No completed assessments
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="userRole !== 'teacher' && studentCourses.length === 0" 
         class="text-center py-12 text-gray-500 text-lg">
      You are not enrolled in any courses yet
    </div>

    <CreateQuizModal 
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="loadQuizzes"
    />
  </div>
</template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { db } from '../firebase';
  import { collection, getDoc, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
  import { getCurrentUserRole, getCurrentUserId } from '../services/auth';
  import { useRouter } from 'vue-router';
  import CreateQuizModal from '../components/CreateQuizModal.vue';
  import { EyeIcon, TrashIcon } from '@heroicons/vue/24/outline';
  
  // Data
  const userRole = ref('');
  const teacherCourses = ref([]);
  const studentCourses = ref([]);
  const activeQuizzes = ref([]);
  const studentSubmissions = ref([]);
  const showCreateModal = ref(false);
  const newQuiz = ref({
    title: '',
    course: '',
    deadline: '',
    questions: []
  });
  
  // Initialize
  onMounted(async () => {
    userRole.value = await getCurrentUserRole();
    if (userRole.value === 'teacher') await loadTeacherData();
    else await loadStudentData();
  });

  const router = useRouter();
  // Load appropriate data based on role
async function loadTeacherData() {
  const userId = getCurrentUserId();
  
  const coursesQuery = query(
    collection(db, 'courses'), 
    where('teacherId', '==', doc(db, 'users', userId))
  );
  const coursesSnapshot = await getDocs(coursesQuery);
  
  const quizzesSnapshot = await getDocs(collection(db, 'quizzes'));
  
  teacherCourses.value = coursesSnapshot.docs.map(courseDoc => {
    const courseData = courseDoc.data();
    return {
      id: courseDoc.id,
      ...courseData,
      quizzes: quizzesSnapshot.docs
        .filter(quizDoc => quizDoc.data().courseId === courseDoc.id)
        .map(quizDoc => {
          const data = quizDoc.data();
          // Proper timestamp conversion
          return {
            id: quizDoc.id,
            ...data,
            deadline: data.deadline?.toDate?.() || new Date(data.deadline)
          };
        })
    };
  });
}

async function loadStudentData() {
  const userId = getCurrentUserId();
  
  // 1. Get student's enrolled courses
  const userDoc = await getDoc(doc(db, 'users', userId));
  const enrolledCourseIds = userDoc.data()?.enrolledCourses || [];

  // Handle empty enrolled courses
  if (enrolledCourseIds.length === 0) {
    studentCourses.value = [];
    return;
  }

  // 2. Get enrolled courses data
  const courses = await Promise.all(enrolledCourseIds.map(async courseId => {
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    return { id: courseId, ...courseDoc.data() };
  }));
  
  // 3. Get all quizzes and submissions
  const [quizzesSnapshot, submissionsSnapshot] = await Promise.all([
    getDocs(query(
      collection(db, 'quizzes'), 
      where('courseId', 'in', enrolledCourseIds)
    )),
    getDocs(query(
      collection(db, 'submissions'), 
      where('studentId', '==', userId)
    ))
  ]);
  
  // 4. Organize data by course with proper timestamp handling
  studentCourses.value = courses.map(course => {
    const courseQuizzes = quizzesSnapshot.docs
      .filter(quizDoc => quizDoc.data().courseId === course.id)
      .map(quizDoc => {
        const data = quizDoc.data();
        const attempts = submissionsSnapshot.docs
        .filter(sub => sub.data().quizId === quizDoc.id).length;
        return {
          id: quizDoc.id,
          ...data,
          deadline: data.deadline?.toDate?.() || new Date(data.deadline),
          deadline: data.deadline?.toDate?.() || new Date(data.deadline),
          attemptsRemaining: Math.max(data.maxAttempts - attempts, 0)
        };
      });

      const courseSubmissions = submissionsSnapshot.docs
      .filter(subDoc => courseQuizzes.some(q => q.id === subDoc.data().quizId))
      .map(subDoc => {
        const data = subDoc.data();
        return {
          id: subDoc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
          // Get totalMarks from submission data
          totalMarks: data.totalMarks || 0,
          // Use stored quizTitle instead of looking it up
          quizTitle: data.quizTitle
        };
      });

    return {
      ...course,
      activeQuizzes: courseQuizzes.filter(q => q.deadline > new Date() && q.attemptsRemaining > 0),
      completedSubmissions: courseSubmissions.map(sub => ({
        ...sub,
        quizTitle: courseQuizzes.find(q => q.id === sub.quizId)?.title || 'Deleted Quiz'
      }))
    };
  });
}
  
  
  // Student Actions
  function startQuiz(quiz) {
    // Navigate to quiz taking interface
    router.push(`/quiz/${quiz.id}`);
  }
  
  // Helpers
  const viewSubmissions = (quizId) => {
    router.push(`/quizzes/${quizId}/submissions`);
  };
  function formatDeadline(timestamp) {
  if (timestamp?.toDate) {
    return timestamp.toDate().toLocaleDateString();
  }
  return new Date(timestamp).toLocaleDateString();
}
const formatDate = (timestamp) => {
  // Handle both Firestore Timestamp and Date objects
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
  
  async function deleteQuiz(quizId) {
    if (confirm('Are you sure you want to delete this quiz?')) {
      await deleteDoc(doc(db, 'quizzes', quizId));
      await loadTeacherData();
    }
  }
  </script>
  
  <style scoped>
  /* Add custom styles if needed */
  </style>