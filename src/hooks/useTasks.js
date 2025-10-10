'use client';

import { useState, useCallback } from 'react';
import { tasksAPI } from '../data/tasks';

export function useTasks(gameId) {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch tasks for a specific game
  const fetchTasks = useCallback(async (page = 1, search = '', limit = 10) => {
    if (!gameId) {
      console.error('No gameId provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        search
      };

      const response = await tasksAPI.getTasksForGame(gameId, params);

      setTasks(response.tasks);
      setPagination(response.pagination);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Create task
  const createTask = useCallback(async (taskData) => {
    if (!gameId) {
      console.error('No gameId provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newTask = await tasksAPI.createTask(gameId, taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError('Failed to create task. Please try again.');
      console.error('Error creating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Update task
  const updateTask = useCallback(async (taskId, taskData) => {
    setLoading(true);
    setError(null);

    try {
      const updatedTask = await tasksAPI.updateTask(taskId, taskData);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error updating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (taskId) => {
    setLoading(true);
    setError(null);

    try {
      await tasksAPI.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return true;
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tasks,
    pagination,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  };
}
