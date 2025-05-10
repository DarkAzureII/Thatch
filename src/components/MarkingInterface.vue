<template>
    <div class="p-4 max-w-4xl mx-auto font-sans">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
      </div>
  
      <div v-else>
        <div class="mb-8">
          <h2 class="text-3xl font-serif font-bold text-navy mb-2">{{ quiz?.title }} Marking</h2>
          <div class="flex items-center gap-4 mb-4">
            <span class="text-sm px-3 py-1 rounded-full" 
                  :class="markingStatusClass">
              {{ markingStatusText }}
            </span>
            <div>
              <p class="text-gray-600">Student: <span class="font-medium text-navy">{{ submission.studentName }}</span></p>
              <p class="text-sm text-gray-500">Submitted: {{ formatDate(submission.timestamp) }}</p>
            </div>
          </div>
        </div>
  
        <div class="space-y-8">
          <div 
            v-for="(question, index) in quiz.questions" 
            :key="index" 
            class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gold"
          >
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 class="font-serif font-medium text-navy">
                Question {{ index + 1 }} <span class="text-gray-600">({{ question.marks }} marks)</span>
              </h3>
              <input 
                v-model="marks[index]" 
                type="number"
                min="0"
                :max="question.marks"
                class="w-24 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
                :disabled="question.autoMarked"
              >
            </div>
  
            <div class="mb-6">
              <p class="font-semibold text-gray-800 mb-2">{{ question.text }}</p>
              <div v-if="question.imageUrl" class="mb-4 rounded-lg overflow-hidden border border-gray-200">
                <img :src="question.imageUrl" class="max-w-full h-48 object-contain">
              </div>
            </div>
  
            <div class="grid md:grid-cols-2 gap-6 border-t pt-6">
              <div>
                <div class="flex items-center gap-2 mb-3">
                  <UserCircleIcon class="w-5 h-5 text-gold" />
                  <h4 class="text-sm font-semibold text-navy">Student Answer</h4>
                </div>
                <div class="p-4 rounded-lg bg-gold/10 border border-gold/20">
                  <template v-if="question.type === 'text'">
                    <p class="text-gray-700">{{ studentAnswer(index) || "No answer provided" }}</p>
                  </template>
                  <template v-else-if="question.type === 'multiple_choice'">
                    <p class="text-gray-700">{{ studentAnswer(index) || "No selection" }}</p>
                  </template>
                  <template v-else-if="question.type === 'multi_select'">
                    <ul class="list-disc pl-4 space-y-1">
                      <li 
                        v-for="(answer, aIndex) in parsedStudentAnswers(index)" 
                        :key="aIndex"
                        class="text-gray-700"
                      >
                        {{ answer }}
                      </li>
                    </ul>
                  </template>
                </div>
              </div>
  
              <div>
                <div class="flex items-center gap-2 mb-3">
                  <CheckCircleIcon class="w-5 h-5 text-navy" />
                  <h4 class="text-sm font-semibold text-navy">Correct Answer</h4>
                </div>
                <div class="p-4 rounded-lg bg-navy/5 border border-navy/20">
                  <template v-if="question.type === 'text'">
                    <p class="text-gray-700">{{ question.correctAnswer }}</p>
                  </template>
                  <template v-else-if="question.type === 'multiple_choice'">
                    <p class="text-gray-700">{{ question.correctAnswer }}</p>
                  </template>
                  <template v-else-if="question.type === 'multi_select'">
                    <ul class="list-disc pl-4 space-y-1">
                      <li 
                        v-for="(answer, aIndex) in question.correctAnswers" 
                        :key="aIndex"
                        class="text-gray-700"
                      >
                        {{ answer }}
                      </li>
                    </ul>
                  </template>
                </div>
              </div>
            </div>
  
            <div class="mt-6">
              <div class="flex items-center gap-2 mb-3">
                <ChatBubbleLeftIcon class="w-5 h-5 text-gold" />
                <h4 class="text-sm font-semibold text-navy">Feedback</h4>
              </div>
              <textarea 
                v-model="feedback[index]"
                placeholder="Add feedback..."
                class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all min-h-[100px]"
              ></textarea>
            </div>
          </div>
        </div>
  
        <div class="mt-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t pt-6">
          <div class="text-xl font-serif font-semibold text-navy">
            Total Score: {{ totalScore }}/{{ quiz.totalMarks }}
          </div>
          <button 
            @click="saveMarks" 
            class="bg-navy text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium"
          >
            Save Marks
          </button>
        </div>
      </div>
    </div>
  </template>  
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, onBeforeRouteLeave } from 'vue-router'
  import { db } from '../firebase'
  import { doc, getDoc, updateDoc } from 'firebase/firestore'
  import { UserCircleIcon, CheckCircleIcon, ChatBubbleLeftIcon } from '@heroicons/vue/24/outline';

  
  const route = useRoute()
  const submissionId = route.params.submissionId
  const submission = ref(null)
  const quiz = ref(null)
  const marks = ref([])
  const feedback = ref([])
  const loading = ref(true)

  const isDirty = ref(false);

// Watch for changes
watch([marks, feedback], () => {
  isDirty.value = true;
});

// Navigation guard
onBeforeRouteLeave((to, from, next) => {
  if (isDirty.value) {
    const confirmLeave = window.confirm(
      'You have unsaved changes. Are you sure you want to leave?'
    );
    if (confirmLeave) next();
    else next(false);
  } else {
    next();
  }
});
  
  onMounted(async () => {
    try {
      const subDoc = await getDoc(doc(db, 'submissions', submissionId))
      submission.value = subDoc.data()
      
      const quizDoc = await getDoc(doc(db, 'quizzes', submission.value.quizId))
      quiz.value = quizDoc.data()
      
      // Initialize marks and feedback
      marks.value = [...(submission.value.questionScores || [])]
      feedback.value = [...(submission.value.feedback || [])]
    } catch (error) {
      console.error('Error loading submission:', error)
    } finally {
      loading.value = false
    }
  })
  
  const totalScore = computed(() => {
    return marks.value.reduce((sum, mark) => sum + (parseFloat(mark) || 0), 0)
  })

  onBeforeRouteLeave((to, from, next) => {
  if (isDirty.value) {
    const confirmLeave = window.confirm(
      'You have unsaved changes. Are you sure you want to leave?'
    );
    if (confirmLeave) next();
    else next(false);
  } else {
    next();
  }
});

const markingStatusText = computed(() => {
  return submission.value.status === 'marked' 
    ? 'Marking Complete' 
    : 'Pending Marking';
});

const markingStatusClass = computed(() => {
  return submission.value.status === 'marked'
    ? 'bg-green-100 text-green-800'
    : 'bg-yellow-100 text-yellow-800';
});

// Update saveMarks method
const saveMarks = async () => {
  try {
    await updateDoc(doc(db, 'submissions', submissionId), {
      questionScores: marks.value,
      feedback: feedback.value,
      score: totalScore.value,
      status: 'marked'
    });
    isDirty.value = false;
    alert('Marks saved successfully!');
  } catch (error) {
    console.error('Error saving marks:', error);
    alert('Failed to save marks');
  }
};
  
  const formatDate = (timestamp) => {
    // Same as previous component
  }

  const studentAnswer = (index) => {
  return submission.value.answers[index];
}

const parsedStudentAnswers = (index) => {
  const answer = submission.value.answers[index];
  return typeof answer === 'string' ? answer.split('|') : answer;
}

  </script>

