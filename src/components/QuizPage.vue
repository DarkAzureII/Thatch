<template>
  <div class="p-4 max-w-4xl mx-auto font-sans">
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
    </div>

    <div v-else-if="quiz">
      <div class="mb-8">
        <h1 class="text-3xl font-serif font-bold text-navy">{{ quiz.title }}</h1>
        <div class="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div class="bg-navy text-gold px-4 py-1 rounded-full text-sm font-medium">
            {{ quiz.course }}
          </div>
          <div v-if="formattedTime" class="flex items-center gap-2 text-navy font-medium">
            <ClockIcon class="w-5 h-5 text-gold" />
            <span>Time Remaining: {{ formattedTime }}</span>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitQuiz" class="space-y-8">
        <div 
          v-for="(question, index) in quiz.questions" 
          :key="index"
          class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gold"
        >
          <h3 class="font-serif font-semibold text-navy mb-4">
            Question {{ index + 1 }} <span class="text-gray-600">({{ question.marks }} marks)</span>
          </h3>
          
          <div class="mb-6">
            <img 
              v-if="question.imageUrl"
              :src="question.imageUrl"
              alt="Question image"
              class="max-w-full mx-auto mb-4 border border-gray-200 rounded-lg"
              style="max-height: 300px; object-fit: contain;"
            >
            <p class="text-gray-800 leading-relaxed">{{ question.text }}</p>
          </div>

          <!-- Text Answer -->
          <input
            v-if="question.type === 'text'"
            v-model="answers[index]"
            type="text"
            placeholder="Type your answer here..."
            class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
            required
          >

          <!-- Multiple Choice -->
          <div v-if="question.type === 'multiple_choice'" class="space-y-2">
            <label
              v-for="(option, oIndex) in question.options"
              :key="oIndex"
              class="flex items-center gap-3 p-3 hover:bg-gold/5 rounded-lg transition-colors"
            >
              <input
                type="radio"
                :name="'question_' + index"
                :value="option.text"
                v-model="answers[index]"
                required
                class="h-5 w-5 text-gold border-gray-300 focus:ring-gold"
              >
              <span class="text-gray-700">{{ option.text }}</span>
            </label>
          </div>

          <!-- Multi-Select -->
          <div v-if="question.type === 'multi_select'" class="space-y-2">
            <label
              v-for="(option, oIndex) in question.options"
              :key="oIndex"
              class="flex items-center gap-3 p-3 hover:bg-gold/5 rounded-lg transition-colors"
            >
              <input
                type="checkbox"
                :value="option.text"
                v-model="answers[index]"
                class="h-5 w-5 text-gold border-gray-300 rounded focus:ring-gold"
              >
              <span class="text-gray-700">{{ option.text }}</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-navy text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium flex items-center justify-center gap-2"
        >
          <ArrowRightIcon class="w-5 h-5" />
          Submit Quiz
        </button>
      </form>
    </div>

    <div v-else class="text-center py-12">
      <ExclamationTriangleIcon class="w-12 h-12 mx-auto text-gold mb-4" />
      <p class="text-navy font-medium">Quiz not found or expired</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { db } from '../firebase';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { getCurrentUserId } from '../services/auth';
import { ClockIcon, ArrowRightIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';


const route = useRoute();
const router = useRouter();
const quiz = ref(null);
const answers = ref([]);
const loading = ref(true);
const quizId = route.params.id;
const timeLeft = ref(0);
const timer = ref(null);

onMounted(async () => {
  try {
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    if (quizDoc.exists()) {
      quiz.value = quizDoc.data();
      // Initialize timer after quiz data is loaded
      timeLeft.value = quiz.value.timeLimit * 60;
      
      timer.value = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--;
        } else {
          submitQuiz();
          clearInterval(timer.value);
        }
      }, 1000);

      // Initialize answers based on question types
      answers.value = quiz.value.questions.map(question => {
        if (question.type === 'multi_select') return [];
        return '';
      });
    }
  } catch (error) {
    console.error('Error loading quiz:', error);
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  clearInterval(timer.value);
});

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Remove the old timeRemaining computed property
// Keep only the formattedTime computed property

async function submitQuiz() {
  try {
    // Clear timer when submitting
    clearInterval(timer.value);
    
    // Convert array answers to pipe-separated strings
    const firestoreAnswers = answers.value.map(answer => {
      return Array.isArray(answer) ? answer.join('|') : answer;
    });

    const submissionRef = await addDoc(collection(db, 'submissions'), {
      quizId: quizId,
      studentId: getCurrentUserId(),
      answers: firestoreAnswers,
      timestamp: new Date(),
      score: 0,
      totalMarks: quiz.value.totalMarks,
      quizTitle: quiz.value.title,
      status: 'pending',
      questionScores: [],
      feedback: []
    });

    router.push({
      name: 'Dashboard',
      query: { quizSubmitted: true }
    });
  } catch (error) {
    console.error('Submission failed:', error);
  }
}

// Remove unused arraysEqual function
</script>