<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Modal from "./EditForum.vue";

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

const sortedData = computed(() => {
  // Define a type for the valid keys of a comment
  type CommentKeys = keyof { id: number; email: string; body: string };

  if (sortColumn.value) {
    return [...filteredData.value].sort((a, b) => {
      const key = sortColumn.value as CommentKeys; // Assert sortColumn as CommentKeys
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
    return sortedData.value; // Return all data if 'all' is selected
  }
  const numRows =
    typeof rowsPerPage.value === "string"
      ? parseInt(rowsPerPage.value)
      : rowsPerPage.value;
  const start = (currentPage.value - 1) * numRows;
  const end = start + numRows;
  return sortedData.value.slice(start, end);
});

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

const hasNextPage = computed(() => {
  if (rowsPerPage.value === "all") {
    return false;
  }
  return currentPage.value < totalPages.value;
});

const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const sortBy = (column: string) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortOrder.value = "asc";
  }
};

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
  }
  showModal.value = false;
};

const removeComment = (id: number) => {
  comments.value = comments.value.filter((comment) => comment.id !== id);
};

watch(rowsPerPage, () => {
  currentPage.value = 1;
});

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
        placeholder="Search comments..."
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
        Prev
      </button>
      <button
        class="bottom-btn-1"
        @click="nextPage"
        :disabled="!hasNextPage || rowsPerPage === 'all'"
      >
        Next
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
</style>
