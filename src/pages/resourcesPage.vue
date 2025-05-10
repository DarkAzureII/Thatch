<template>
  <div class="p-4 max-w-6xl mx-auto font-sans">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <h1 class="text-3xl font-serif font-bold text-navy">Learning Resources</h1>
      <button
        v-if="userRole === 'teacher'"
        @click="showUploadModal = true"
        class="bg-navy text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium flex items-center gap-2"
      >
        <ArrowUpTrayIcon class="w-5 h-5" />
        Upload Resource
      </button>
    </div>

    <!-- Filter/Search -->
    <div class="mb-6 flex flex-col md:flex-row gap-4">
      <select 
        v-model="selectedCourse" 
        class="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
      >
        <option value="">All Courses</option>
        <option 
          v-for="course in availableCourses" 
          :key="course.id" 
          :value="course.id"
        >
          {{ course.name }}
        </option>
      </select>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search resources..."
        class="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all flex-grow"
      >
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
    </div>

    <!-- Resources List -->
    <div v-else>
      <!-- Teacher View -->
      <div v-if="userRole === 'teacher'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard
          v-for="resource in filteredResources"
          :key="resource.id"
          :resource="resource"
          :user-role="userRole"
          :courses="availableCourses"  
          @delete="deleteResource"
        />
      </div>

      <!-- Student View -->
      <div v-else class="space-y-6">
        <div 
          v-for="course in enrolledCourses" 
          :key="course.id"
          class="bg-white rounded-xl shadow-lg border-l-4 border-gold"
        >
          <div 
            @click="toggleCourse(course.id)"
            class="p-4 border-b border-gold/20 cursor-pointer flex justify-between items-center hover:bg-gold/5 transition-colors"
          >
            <h3 class="font-serif font-semibold text-navy">{{ course.name }}</h3>
            <span class="text-gold">
              {{ collapsedCourses[course.id] ? '▶' : '▼' }}
            </span>
          </div>
          
          <div v-if="!collapsedCourses[course.id]" class="p-4 grid grid-cols-1 gap-4">
            <ResourceCard
              v-for="resource in getCourseResources(course.id)"
              :key="resource.id"
              :resource="resource"
              :user-role="userRole"
              :courses="enrolledCourses"
            />
            <div 
              v-if="getCourseResources(course.id).length === 0"
              class="text-gray-400 text-center py-4"
            >
              <DocumentTextIcon class="w-12 h-12 mx-auto text-gold mb-2" />
              No resources available
            </div>
          </div>
        </div>
        <div v-if="enrolledCourses.length === 0" class="text-center py-8 text-gray-500">
          You are not enrolled in any courses
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-xl p-6 border-l-4 border-gold">
        <h2 class="text-2xl font-serif font-bold mb-6 text-navy">Upload New Resource</h2>
        <form @submit.prevent="uploadResource" class="space-y-6">
          <div class="space-y-4">
            <div>
              <label class="block mb-3 font-medium text-navy">Title</label>
              <input 
                v-model="newResource.title" 
                required 
                class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
              >
            </div>

            <div>
              <label class="block mb-3 font-medium text-navy">Course</label>
              <select 
                v-model="newResource.courseId" 
                required 
                class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
                v-if="teacherCourses.length > 0"
              >
                <option v-for="course in teacherCourses" :key="course.id" :value="course.id">
                  {{ course.name }} (Grade {{ course.grade }} {{ course.subject }})
                </option>
              </select>
              <div v-else class="text-red-600 p-3 bg-red-50 rounded-lg">
                Create courses first to upload resources
              </div>
            </div>

            <!-- Resource Type Toggle -->
            <div class="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                @click="resourceType = 'file'"
                :class="{'bg-gold/20 border-gold': resourceType === 'file'}"
                class="p-3 border border-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ArrowUpTrayIcon class="w-5 h-5" />
                Upload File
              </button>
              <button
                type="button"
                @click="resourceType = 'link'"
                :class="{'bg-gold/20 border-gold': resourceType === 'link'}"
                class="p-3 border border-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LinkIcon class="w-5 h-5" />
                Add Link
              </button>
            </div>

            <!-- File Upload Section -->
            <div v-if="resourceType === 'file'">
              <div
                @dragover.prevent="dragOver = true"
                @dragleave="dragOver = false"
                @drop.prevent="handleFileDrop"
                :class="{'border-gold bg-gold/10': dragOver}"
                class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  ref="fileInput"
                  @change="handleFileSelect"
                  class="hidden"
                  accept=".pdf,.doc,.docx,.mp4,.jpg,.png"
                >
                <div class="space-y-2">
                  <DocumentArrowUpIcon class="w-12 h-12 mx-auto text-gold" />
                  <p v-if="!newResource.file" class="text-gray-600">
                    Drag & drop files or click to browse
                  </p>
                  <p v-else class="text-navy font-medium">
                    {{ newResource.file.name }}
                    <span class="block text-sm text-gray-500">{{ formatFileSize(newResource.file.size) }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Link Input Section -->
            <div v-else>
              <label class="block mb-3 font-medium text-black">Link URL</label>
              <input
                v-model="newResource.link"
                type="url"
                placeholder="https://example.com"
                class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
              >
            </div>

            <div class="flex flex-col md:flex-row justify-end gap-4 mt-6">
              <button
                @click="showUploadModal = false"
                type="button"
                class="px-6 py-3 text-gray-600 hover:text-navy transition-colors font-medium border border-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="uploading"
                class="bg-navy text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium disabled:opacity-50"
              >
                <span v-if="uploading">
                  <span class="animate-pulse">Uploading</span> {{ uploadProgress }}%
                </span>
                <span v-else>Upload Resource</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { db, auth, storage } from '../firebase';
  import { getCurrentUserRole, getCurrentUserId } from '../services/auth';
  import { ArrowUpTrayIcon, LinkIcon, DocumentArrowUpIcon, DocumentTextIcon } from '@heroicons/vue/24/outline';
  import { 
    collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc 
  } from 'firebase/firestore';
  import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
  import ResourceCard from '../components/ResourceCard.vue';
  import { documentId } from 'firebase/firestore';
  
  const userRole = ref('');
  const collapsedCourses = ref({});
  const loading = ref(true);
  const resources = ref([]);
  const resourceType = ref('file'); 
  const enrolledCourses = ref([]);
  const teacherCourses = ref([]);
  const showUploadModal = ref(false);
  const newResource = ref({
    title: '',
    courseId: '',
    file: null,
    link: '',
    type: 'file' // 'file' or 'link'
  });
  const dragOver = ref(false);
  const uploading = ref(false);
  const uploadProgress = ref(0);
  const searchQuery = ref('');
  const selectedCourse = ref('');
  
  // Fetch initial data
  onMounted(async () => {
    try {
      userRole.value = await getCurrentUserRole();
      const user = auth.currentUser;

      if (!user) {
        console.error('No authenticated user');
        return;
      }

      // Common variables
      let enrolledCourseIds = [];
      let coursesQuery;

      if (userRole.value === 'teacher') {
        // Teacher-specific data fetching
        const teacherRef = doc(db, 'users', user.uid);
        
        // Fetch teacher's courses
        coursesQuery = query(
          collection(db, 'courses'), 
          where('teacherId', '==', teacherRef)
        );
        const coursesSnapshot = await getDocs(coursesQuery);
        teacherCourses.value = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch teacher's resources
        const resourcesQuery = query(
          collection(db, 'resources'),
          where('uploadedBy', '==', user.uid)
        );
        const resourcesSnapshot = await getDocs(resourcesQuery);
        resources.value = resourcesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

      } else {
        // Student-specific data fetching
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        enrolledCourseIds = userDoc.data()?.enrolledCourses || [];

        // Only proceed if student has enrolled courses
        if (enrolledCourseIds.length > 0) {
          // Fetch enrolled courses
          coursesQuery = query(
            collection(db, 'courses'),
            where(documentId(), 'in', enrolledCourseIds)
          );
          const coursesSnapshot = await getDocs(coursesQuery);
          enrolledCourses.value = coursesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // Initialize collapsed state
          enrolledCourses.value.forEach(course => {
            collapsedCourses.value[course.id] = false;
          });

          // Fetch student's resources
          const resourcesQuery = query(
            collection(db, 'resources'),
            where('courseId', 'in', enrolledCourseIds)
          );
          const resourcesSnapshot = await getDocs(resourcesQuery);
          resources.value = resourcesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        }
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      loading.value = false;
    }
  });
  
  // File handling
  const handleFileSelect = (e) => {
    newResource.value.file = e.target.files[0];
  };

  const toggleCourse = (courseId) => {
    collapsedCourses.value = {
      ...collapsedCourses.value,
      [courseId]: !collapsedCourses.value[courseId]
    };
  };

  const availableCourses = computed(() => {
    return userRole.value === 'teacher' ? teacherCourses.value : enrolledCourses.value;
  });

  const filteredResources = computed(() => {
    const filtered = resources.value.filter(resource => {
      const matchesCourse = selectedCourse.value ? 
        resource.courseId === selectedCourse.value : true;
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (resource.link && resource.link.toLowerCase().includes(searchQuery.value.toLowerCase()));
      return matchesCourse && matchesSearch;
    });

    // For teachers: only show resources from their courses
    if (userRole.value === 'teacher') {
      const teacherCourseIds = teacherCourses.value.map(c => c.id);
      return filtered.filter(r => teacherCourseIds.includes(r.courseId));
    }

    if (userRole.value === 'student') {
      return filtered.filter(r => 
        enrolledCourses.value.some(c => c.id === r.courseId)
      );
    }
    return filtered;
  });

  // Add course resources getter
  const getCourseResources = (courseId) => {
    return resources.value.filter(resource => 
      resource.courseId === courseId &&
      (resource.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (resource.link && resource.link.toLowerCase().includes(searchQuery.value.toLowerCase())))
    );
  };

  
  const handleFileDrop = (e) => {
    dragOver.value = false;
    newResource.value.file = e.dataTransfer.files[0];
  };
  
  // Upload resource
  const uploadResource = async () => {
    try {
      if (userRole.value !== 'teacher') {
        throw new Error('Only teachers can upload resources');
      }
      const user = auth.currentUser;
      uploading.value = true;
      
      const resourceData = {
        title: newResource.value.title,
        courseId: newResource.value.courseId,
        type: resourceType.value,
        uploadedBy: user.uid,
        uploadedAt: new Date(),
        // Common metadata for both types
        metadata: {
          uploadedBy: user.uid,
          role: userRole.value
        }
      };


      if (resourceType.value === 'file') {
        if (!newResource.value.file) {
          alert('Please select a file');
          return;
        }
        
        const filePath = `resources/${user.uid}/${Date.now()}_${newResource.value.file.name}`;
        const fileRef = storageRef(storage, filePath);
        const uploadTask = uploadBytesResumable(
          fileRef, 
          newResource.value.file, 
          { customMetadata: resourceData.metadata }
        );

        const snapshot = await uploadTask;
        resourceData.fileUrl = await getDownloadURL(snapshot.ref);
        resourceData.fileName = newResource.value.file.name;
        resourceData.fileType = newResource.value.file.type;
        resourceData.size = newResource.value.file.size;
      } else {
        if (!newResource.value.link) {
          alert('Please enter a valid URL');
          return;
        }
        resourceData.link = newResource.value.link;
        resourceData.metadata.resourceType = 'link';
      }

      await addDoc(collection(db, 'resources'), resourceData);
      
      // Reset form and refresh
      showUploadModal.value = false;
      newResource.value = { 
        title: '', 
        courseId: '', 
        file: null, 
        link: '', 
        type: 'file' 
      };
      
      // Refresh resources list
      const newSnapshot = await getDocs(collection(db, 'resources'));
      resources.value = newSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error uploading resource:', error);
    } finally {
      uploading.value = false;
    }
  };
  
  // Delete resource
  const deleteResource = async (resourceId, fileUrl) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, 'resources', resourceId));
        
        // Delete from Storage
        const fileRef = storageRef(storage, fileUrl);
        await deleteObject(fileRef);
  
        // Update local resources
        resources.value = resources.value.filter(r => r.id !== resourceId);
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };
  
  // Helpers
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  </script>