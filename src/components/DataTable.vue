<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Modal from "./EditForum.vue";
import prevIcon from "../assets/next-btn.svg";
import { useToast } from "vue-toast-notification"; // Importing vue-toast-notification

// Define reactive variables and ensure proper types
const comments = ref<{ id: number; email: string; body: string }[]>([]);
const searchQuery = ref<string>("");
const sortColumn = ref<string>("");
const sortOrder = ref<"asc" | "desc">("asc");
const currentPage = ref<number>(1);
const rowsPerPage = ref<number | string>(10);
const loading = ref<boolean>(true);

// Modal state
const showModal = ref<boolean>(false);
const editingComment = ref<{ id: number; email: string; body: string } | null>(
  null
);

// Initialize vue-toast-notification's toast
const toast = useToast();

// Fetch comments from the API
const fetchComments = async () => {
  loading.value = true;
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/comments"
    );
    comments.value = await response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);
  } finally {
    loading.value = false;
  }
};

// Computed property to filter comments based on search query
const filteredData = computed(() => {
  return comments.value.filter((comment) =>
    comment.body.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Computed property to sort the filtered comments
const sortedData = computed(() => {
  type CommentKeys = keyof { id: number; email: string; body: string };
  if (sortColumn.value) {
    return [...filteredData.value].sort((a, b) => {
      const key = sortColumn.value as CommentKeys;
      if (sortOrder.value === "asc") {
        return a[key] > b[key] ? 1 : -1;
      } else {
        return a[key] < b[key] ? 1 : -1;
      }
    });
  }
  return filteredData.value;
});

// Computed property to paginate the sorted comments
const paginatedData = computed(() => {
  if (rowsPerPage.value === "all") {
    return sortedData.value;
  }
  const numRows =
    typeof rowsPerPage.value === "string"
      ? parseInt(rowsPerPage.value)
      : rowsPerPage.value;
  const start = (currentPage.value - 1) * numRows;
  const end = start + numRows;
  return sortedData.value.slice(start, end);
});

// Computed property to determine the total number of pages
const totalPages = computed(() => {
  if (rowsPerPage.value === "all") {
    return 1;
  }
  const numRows =
    typeof rowsPerPage.value === "string"
      ? parseInt(rowsPerPage.value)
      : rowsPerPage.value;
  return Math.ceil(sortedData.value.length / numRows);
});

// Computed property to check if there's a next page
const hasNextPage = computed(() => {
  if (rowsPerPage.value === "all") {
    return false; // No next page if 'all' is selected
  }
  return currentPage.value < totalPages.value;
});

// Function to go to the next page
const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++;
  }
};

// Function to go to the previous page
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Function to sort the comments by a specific column
const sortBy = (column: string) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortOrder.value = "asc";
  }
};

// Function to open the edit modal and set the comment to be edited
const openEditModal = (comment: {
  id: number;
  email: string;
  body: string;
}) => {
  editingComment.value = { ...comment };
  showModal.value = true;
};

const saveEdit = (id: number, email: string, body: string) => {
  const comment = comments.value.find((comment) => comment.id === id);
  if (comment) {
    comment.email = email;
    comment.body = body;
    toast.success("Comment updated successfully!");
  }
  showModal.value = false;
};

// Function to remove a comment
const removeComment = (id: number) => {
  comments.value = comments.value.filter((comment) => comment.id !== id);
  // Show a success notification
  toast.success("Comment removed successfully!");
};

// Watch rowsPerPage and reset currentPage if it changes
watch(rowsPerPage, () => {
  currentPage.value = 1; // Reset to first page whenever rowsPerPage changes
});

// Fetch comments on component mount
onMounted(fetchComments);
</script>

<template>
  <div>
    <!-- Search and Pagination Controls -->
    <div class="search-bar">
      <input
        class="search-input"
        type="text"
        v-model="searchQuery"
        placeholder="Search body..."
      />
      <div class="select-container">
        <select v-model="rowsPerPage">
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="all">All</option>
        </select>
      </div>
    </div>

    <!-- Comments Table -->
    <div class="container">
      <table>
        <thead>
          <tr>
            <th @click="sortBy('id')">ID</th>
            <th @click="sortBy('email')">Email</th>
            <th>Body</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comment in paginatedData" :key="comment.id">
            <td>{{ comment.id }}</td>
            <td>{{ comment.email }}</td>
            <td>{{ comment.body }}</td>
            <td>
              <button @click="openEditModal(comment)">Edit</button>
            </td>
            <td><button @click="removeComment(comment.id)">Remove</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div class="bottom-btn">
      <button
        class="bottom-btn-1"
        @click="prevPage"
        :disabled="currentPage === 1 || rowsPerPage === 'all'"
      >
        <img class="pre-icon" :src="prevIcon" alt="Previous" />
        Prev
      </button>
      <button
        class="bottom-btn-1"
        @click="nextPage"
        :disabled="!hasNextPage || rowsPerPage === 'all'"
      >
        Next
        <img class="next-icon" :src="prevIcon" alt="Next" />
      </button>
    </div>

    <!-- Edit Modal -->
    <Modal
      v-if="showModal && editingComment"
      :id="editingComment!.id"
      :email="editingComment!.email"
      :body="editingComment!.body"
      @save="saveEdit"
      @close="showModal = false"
    />
  </div>
</template>

<style scoped>
/* Style for the table */
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}
th {
  cursor: pointer;
}

.select-container select {
  padding: 5px;
}
.container {
  margin-bottom: 20px;
}
</style>
