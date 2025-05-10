<template>
  <div class="max-w-4xl mx-auto p-4 space-y-8 font-sans">
    <!-- Profile Section -->
    <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gold">
      <h2 class="text-2xl font-serif font-bold mb-6 text-navy">Profile Settings</h2>
      <form @submit.prevent="updateProfile" class="space-y-4">
        <div>
          <label class="block text-gray-700 mb-2 font-medium">Full Name</label>
          <input 
            v-model="userDetails.name" 
            type="text"
            class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
          >
        </div>

        <div>
          <label class="block text-gray-700 mb-2 font-medium">Email</label>
          <input 
            v-model="userDetails.email" 
            type="email" 
            disabled
            class="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
          >
        </div>

        <button 
          type="submit" 
          :disabled="updatingProfile"
          class="bg-navy text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium"
        >
          {{ updatingProfile ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>

    <!-- Tutor Course Management Section -->
    <div v-if="userRole === 'teacher'" class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gold">
      <h3 class="text-xl font-serif font-bold mb-6 text-navy">Course Management</h3>
      
      <form @submit.prevent="createCourse" class="mb-8 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700 mb-2 font-medium">Course Name</label>
            <input 
              v-model="newCourse.name" 
              required 
              class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
            >
          </div>
          <div>
            <label class="block text-gray-700 mb-2 font-medium">Grade Level</label>
            <select 
              v-model="newCourse.grade" 
              required 
              class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
            >
              <option v-for="grade in 12" :value="grade">Grade {{ grade }}</option>
            </select>
          </div>
          <div>
            <label class="block text-gray-700 mb-2 font-medium">Subject</label>
            <input 
              v-model="newCourse.subject" 
              required 
              class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
            >
          </div>
          <div>
            <label class="block text-gray-700 mb-2 font-medium">Join Code (optional)</label>
            <input 
              v-model="newCourse.joinCode" 
              class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
            >
          </div>
        </div>
        <button 
          type="submit" 
          :disabled="creatingCourse"
          class="bg-navy text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium"
        >
          {{ creatingCourse ? 'Creating...' : 'Create Course' }}
        </button>
      </form>

      <div class="border-t border-gold/20 pt-6">
        <h4 class="text-lg font-serif font-semibold mb-4 text-navy">Your Courses</h4>
        <div v-if="teacherCourses.length === 0" class="text-gray-500">
          No courses created yet
        </div>
        <div v-else class="space-y-4">
          <div 
            v-for="course in teacherCourses" 
            :key="course.id" 
            class="border border-gray-200 rounded-xl p-4 hover:bg-gold/5 transition-colors"
          >
            <div class="flex justify-between items-start">
              <div>
                <h5 class="font-medium text-navy">{{ course.name }}</h5>
                <p class="text-sm text-gray-600 mt-1">
                  Grade {{ course.grade }} {{ course.subject }}
                  <span v-if="course.joinCode" class="ml-2 text-gold font-medium">
                    Join Code: {{ course.joinCode }}
                  </span>
                </p>
                <p class="text-sm text-gray-500 mt-2">
                  {{ course.studentCount }} students enrolled
                </p>
              </div>
              <button 
                @click="deleteCourse(course.id)" 
                class="text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <TrashIcon class="w-5 h-5" />
                <span class="sr-only">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Course Enrollment -->
    <div v-else class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gold">
      <h3 class="text-xl font-serif font-bold mb-6 text-navy">Enrolled Courses</h3>
      
      <form @submit.prevent="joinCourse" class="mb-6">
        <div class="flex flex-col md:flex-row gap-2">
          <input 
            v-model="courseJoinCode" 
            placeholder="Enter course join code"
            class="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
          >
          <button 
            type="submit" 
            :disabled="joiningCourse"
            class="bg-navy text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium"
          >
            {{ joiningCourse ? 'Joining...' : 'Join Course' }}
          </button>
        </div>
      </form>

      <div class="space-y-3">
        <div 
          v-for="course in studentCourses" 
          :key="course.id" 
          class="border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:bg-gold/5 transition-colors"
        >
          <div>
            <h5 class="font-medium text-navy">{{ course.name }}</h5>
            <p class="text-sm text-gray-600 mt-1">
              Grade {{ course.grade }} {{ course.subject }} · 
              <span class="text-gold">Taught by {{ course.teacherName }}</span>
            </p>
          </div>
          <button 
            @click="leaveCourse(course.id)" 
            class="text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <XMarkIcon class="w-5 h-5" />
            <span class="sr-only">Leave</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Password Change Section -->
    <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gold">
      <h3 class="text-xl font-serif font-bold mb-6 text-navy">Change Password</h3>
      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label class="block text-gray-700 mb-2 font-medium">Current Password</label>
          <input 
            v-model="password.current" 
            type="password"
            class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
          >
        </div>

        <div>
          <label class="block text-gray-700 mb-2 font-medium">New Password</label>
          <input 
            v-model="password.new" 
            type="password"
            class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
          >
        </div>

        <button 
          type="submit" 
          :disabled="changingPassword"
          class="bg-navy text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium"
        >
          {{ changingPassword ? 'Updating...' : 'Update Password' }}
        </button>
      </form>
    </div>

    <!-- Logout Button -->
    <div class="text-center">
      <button 
        @click="logout" 
        class="text-red-600 hover:text-red-700 font-medium flex items-center justify-center gap-2"
      >
        <ArrowRightOnRectangleIcon class="w-5 h-5" />
        Log Out
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TrashIcon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/vue/24/outline';
import { auth, db } from '../firebase'
import { 
  updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider 
} from 'firebase/auth'
import { 
  doc, getDoc, updateDoc, collection, addDoc, deleteDoc,
  query, where, getDocs, arrayUnion, arrayRemove, writeBatch , documentId
} from 'firebase/firestore'

// User Profile and Auth State
const userDetails = ref({ name: '', email: '' })
const password = ref({ current: '', new: '' })
const updatingProfile = ref(false)
const changingPassword = ref(false)

// Course Management State
const userRole = ref('')
const newCourse = ref({ name: '', grade: 10, subject: '', joinCode: '' })
const teacherCourses = ref([])
const studentCourses = ref([])
const courseJoinCode = ref('')
const creatingCourse = ref(false)
const joiningCourse = ref(false)

// Combined initialization
onMounted(async () => {
  const user = auth.currentUser
  if (user) {
    const userDoc = await getDoc(doc(db, 'users', user.uid))
    if (userDoc.exists()) {
      userRole.value = userDoc.data().role
      userDetails.value = { ...userDoc.data(), email: user.email }
    }
    await fetchCourses()
  }
})

// Course Management Functions
async function fetchCourses() {
  const user = auth.currentUser
  if (userRole.value === 'teacher') {
    // Fix teacher courses query
    const q = query(
      collection(db, 'courses'), 
      where('teacherId', '==', doc(db, 'users', user.uid))
    )
    const snapshot = await getDocs(q)
    teacherCourses.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } else {
    // Get user's enrolled course IDs
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const enrolledCourseIds = userDoc.data()?.enrolledCourses || [];

    if (enrolledCourseIds.length === 0) {
      studentCourses.value = [];
      return;
    }

    // Get courses where ID is in enrolledCourseIds
    const q = query(
      collection(db, 'courses'),
      where(documentId(), 'in', enrolledCourseIds)
    );
    
    const snapshot = await getDocs(q);
    studentCourses.value = await Promise.all(snapshot.docs.map(async doc => {
      const courseData = doc.data();
      const teacherDoc = await getDoc(courseData.teacherId);
      return {
        id: doc.id,
        ...courseData,
        teacherName: teacherDoc.data()?.name || 'Unknown Teacher'
      }
    }))
  }
}

// Profile Management Functions
const updateProfile = async () => {
  try {
    updatingProfile.value = true
    const user = auth.currentUser
    await updateDoc(doc(db, 'users', user.uid), { name: userDetails.value.name })
    
    if (user.email !== userDetails.value.email) {
      await updateEmail(user, userDetails.value.email)
    }
    alert('Profile updated successfully!')
  } catch (error) {
    alert(`Error updating profile: ${error.message}`)
  } finally {
    updatingProfile.value = false
  }
}

const changePassword = async () => {
  try {
    changingPassword.value = true
    const user = auth.currentUser
    const credential = EmailAuthProvider.credential(user.email, password.value.current)
    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, password.value.new)
    
    alert('Password updated successfully!')
    password.value = { current: '', new: '' }
  } catch (error) {
    alert(`Error changing password: ${error.message}`)
  } finally {
    changingPassword.value = false
  }
}

const logout = async () => {
  try {
    await auth.signOut()
    window.location.href = '/login'
  } catch (error) {
    alert(`Error logging out: ${error.message}`)
  }
}

// Course CRUD Operations
const createCourse = async () => {
  try {
    creatingCourse.value = true
    const user = auth.currentUser
    
    const courseData = {
      ...newCourse.value,
      teacherId: doc(db, 'users', user.uid),  // Store as DocumentReference
      students: [],
      studentCount: 0,
      createdAt: new Date(),
      joinCode: newCourse.value.joinCode.trim().toUpperCase() // Normalize join code
    }

    const docRef = await addDoc(collection(db, 'courses'), courseData)
    // Store the generated document ID as course code if empty
    if (!courseData.joinCode) {
      await updateDoc(docRef, { joinCode: docRef.id })
    }
    
    newCourse.value = { name: '', grade: 10, subject: '', joinCode: '' }
    await fetchCourses()
  } catch (error) {
    alert(`Error creating course: ${error.message}`)
  } finally {
    creatingCourse.value = false
  }
}


const deleteCourse = async (courseId) => {
  if (confirm('Are you sure you want to delete this course?')) {
    try {
      await deleteDoc(doc(db, 'courses', courseId))
      teacherCourses.value = teacherCourses.value.filter(c => c.id !== courseId)
    } catch (error) {
      alert(`Error deleting course: ${error.message}`)
    }
  }
}

const joinCourse = async () => {
  try {
    joiningCourse.value = true;
    const user = auth.currentUser;
    const joinCode = courseJoinCode.value.trim().toUpperCase();
    
    if (!joinCode) {
      alert('Please enter a join code');
      return;
    }

    const q = query(
      collection(db, 'courses'), 
      where('joinCode', '==', joinCode)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert('No course found with this join code');
      return;
    }

    const courseDoc = snapshot.docs[0];
    const courseData = courseDoc.data();
    
    // Check if already enrolled
    if (courseData.students.includes(user.uid)) {
      alert('You are already enrolled in this course');
      return;
    }

    // Update both course and user documents
    const batch = writeBatch(db);
    
    // Add student to course
    batch.update(courseDoc.ref, {
      students: arrayUnion(user.uid),
      studentCount: courseData.studentCount + 1
    });
    
    // Add course to user's enrolledCourses
    const userRef = doc(db, 'users', user.uid);
    batch.update(userRef, {
      enrolledCourses: arrayUnion(courseDoc.id)
    });

    await batch.commit();
    
    courseJoinCode.value = '';
    await fetchCourses();
    alert('Successfully joined course!');
  } catch (error) {
    alert(`Error joining course: ${error.message}`);
  } finally {
    joiningCourse.value = false;
  }
};

const leaveCourse = async (courseId) => {
  if (confirm('Are you sure you want to leave this course?')) {
    try {
      const user = auth.currentUser;
      const batch = writeBatch(db);
      
      // Remove student from course
      const courseRef = doc(db, 'courses', courseId);
      batch.update(courseRef, {
        students: arrayRemove(user.uid),
        studentCount: (await getDoc(courseRef)).data().studentCount - 1
      });
      
      // Remove course from user's enrolledCourses
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        enrolledCourses: arrayRemove(courseId)
      });

      await batch.commit();
      await fetchCourses();
    } catch (error) {
      alert(`Error leaving course: ${error.message}`);
    }
  }
};
</script>

<style>
.text-navy { color: #2C3E50; }
.bg-teal { background-color: #3498DB; }
.hover\:bg-teal-dark:hover { background-color: #2980B9; }
.bg-orange { background-color: #E67E22; }
.hover\:bg-orange-dark:hover { background-color: #D35400; }
</style>