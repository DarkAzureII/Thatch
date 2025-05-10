<template>
    <div class="p-4 max-w-4xl mx-auto font-sans">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
      </div>
  
      <div v-else-if="submission">
        <div class="mb-8">
          <h2 class="text-3xl font-serif font-bold text-navy mb-2">{{ quiz?.title }} Review</h2>
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="bg-navy text-gold px-4 py-2 rounded-full text-sm font-medium">
              Score: {{ submission.score }}/{{ submission.totalMarks }}
            </div>
            <p class="text-sm text-gray-600">
              Submitted: {{ formatDate(submission.timestamp) }}
            </p>
          </div>
        </div>
  
        <div class="space-y-6">
          <div 
            v-for="(question, index) in quiz.questions" 
            :key="index" 
            class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gold"
          >
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-serif font-medium text-navy">
                Question {{ index + 1 }} <span class="text-gray-600">({{ question.marks }} marks)</span>
              </h3>
            </div>
  
            <div class="mb-6">
              <p class="font-semibold text-gray-800 mb-2">{{ question.text }}</p>
              <div v-if="question.imageUrl" class="mb-4 rounded-lg overflow-hidden">
                <img :src="question.imageUrl" class="max-w-full h-48 object-contain border border-gray-200 rounded-lg">
              </div>
            </div>
  
            <div class="grid md:grid-cols-2 gap-6 border-t pt-6">
              <div>
                <div class="flex items-center gap-2 mb-3">
                  <UserCircleIcon class="w-5 h-5 text-gold" />
                  <h4 class="text-sm font-semibold text-navy">Your Answer</h4>
                </div>
                <div class="p-4 rounded-lg bg-gold/10 border border-gold/20">
                  <template v-if="question.type === 'text'">
                    <p class="text-gray-700">{{ parsedStudentAnswer(index, 'text') || "No answer provided" }}</p>
                  </template>
                  
                  <template v-else-if="question.type === 'multiple_choice'">
                    <p class="text-gray-700">{{ parsedStudentAnswer(index, 'multiple_choice') || "No selection" }}</p>
                  </template>
                  
                  <template v-else-if="question.type === 'multi_select'">
                    <ul class="list-disc pl-4 space-y-1">
                      <li 
                        v-for="(answer, aIndex) in parsedStudentAnswer(index, 'multi_select')" 
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
                  <template v-else>
                    <ul class="list-disc pl-4 space-y-1">
                      <li 
                        v-for="answer in correctAnswers(question)" 
                        :key="answer"
                        class="text-gray-700"
                      >
                        {{ answer }}
                      </li>
                    </ul>
                  </template>
                </div>
              </div>
            </div>
  
            <div v-if="submission.feedback?.[index]" class="mt-6 p-4 rounded-lg bg-gold/5 border border-gold/20">
              <div class="flex items-center gap-2 mb-2">
                <ChatBubbleLeftIcon class="w-5 h-5 text-gold" />
                <h4 class="text-sm font-semibold text-navy">Tutor Feedback</h4>
              </div>
              <p class="text-gray-700">{{ submission.feedback[index] }}</p>
            </div>
          </div>
        </div>
      </div>
  
      <div v-else class="text-center py-12">
        <ExclamationTriangleIcon class="w-12 h-12 mx-auto text-gold mb-4" />
        <p class="text-navy font-medium">Submission not found</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { db } from '../firebase'
  import { doc, getDoc } from 'firebase/firestore'
    import { 
    UserCircleIcon, 
    CheckCircleIcon, 
    ChatBubbleLeftIcon,
    ExclamationTriangleIcon 
    } from '@heroicons/vue/24/outline';

  
  const route = useRoute()
  const submissionId = route.params.submissionId
  const submission = ref(null)
  const quiz = ref(null)
  const loading = ref(true)
  
  onMounted(async () => {
    try {
      const subDoc = await getDoc(doc(db, 'submissions', submissionId))
      submission.value = subDoc.data()
      
      const quizDoc = await getDoc(doc(db, 'quizzes', submission.value.quizId))
      quiz.value = quizDoc.data()
    } catch (error) {
      console.error('Error loading submission:', error)
    } finally {
      loading.value = false
    }
  })
  
  const formatDate = (timestamp) => {
    const date = timestamp?.toDate?.() || new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const studentAnswer = (index) => {
    return submission.value?.answers?.[index] || ''
    }

    const parsedStudentAnswer = (index, questionType) => {
        const answer = studentAnswer(index)
        
        if (questionType === 'multi_select') {
            return answer ? answer.split('|') : []
        }
        
        return answer
        }
  
  const correctAnswers = (question) => {
    return question.type === 'multi_select' 
      ? question.correctAnswers 
      : [question.correctAnswer]
  }
  
  const questionScore = (question) => {
    return submission.value.questionScores?.[question.id] ?? 'Pending'
  }
  
  const scoreClass = (question) => {
    const score = submission.value.questionScores?.[question.id]
    if (typeof score === 'number') {
      return score === question.marks ? 'text-green-600' : 'text-red-600'
    }
    return 'text-gray-500'
  }
  </script>