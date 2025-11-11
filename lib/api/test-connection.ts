// Simple test to verify API connection without authentication
import { ApiClient } from './generated-client';

const apiClient = new ApiClient();

// Test fetching tasks (no auth required)
async function testConnection() {
  try {
    console.log('Testing API connection...');
    console.log('Base URL:', process.env.NEXT_PUBLIC_API_URL);

    // Test 1: Get all tasks
    const tasks = await apiClient.getTasks();
    console.log('✅ Successfully fetched tasks:', tasks.length);

    // Test 2: Get all task lists
    const taskLists = await apiClient.getTaskLists();
    console.log('✅ Successfully fetched task lists:', taskLists.length);

    // Test 3: Get all todo items
    const todoItems = await apiClient.getTodoItems();
    console.log('✅ Successfully fetched todo items:', todoItems.length);

    console.log('🎉 All tests passed! API connection working.');
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
}

export { testConnection, apiClient };
