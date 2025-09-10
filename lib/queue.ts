export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Task<T = any> {
  id: string;
  name: string;
  data: T;
  status: TaskStatus;
  priority: number;
  retries: number;
  maxRetries: number;
  createdAt: Date;
  processedAt?: Date;
  error?: Error;
}

export type TaskHandler<T = any> = (task: Task<T>) => Promise<void>;

export class InMemoryQueue {
  private tasks: Task[] = [];
  private handlers: Map<string, TaskHandler> = new Map();
  private isProcessing: boolean = false;
  private concurrency: number;
  private retryDelay: number;

  constructor(options?: { concurrency?: number; retryDelay?: number }) {
    this.concurrency = options?.concurrency || 1;
    this.retryDelay = options?.retryDelay || 1000;
  }

  registerHandler<T>(taskName: string, handler: TaskHandler<T>) {
    this.handlers.set(taskName, handler);
  }

  addTask<T>(name: string, data: T, options?: { priority?: number; maxRetries?: number }): Task<T> {
    const task: Task<T> = {
      id: this.generateId(),
      name,
      data,
      status: 'pending',
      priority: options?.priority || 0,
      retries: 0,
      maxRetries: options?.maxRetries || 3,
      createdAt: new Date(),
    };

    // Insert task in priority order (higher priority first)
    const insertIndex = this.tasks.findIndex(t => t.priority < task.priority);
    if (insertIndex === -1) {
      this.tasks.push(task);
    } else {
      this.tasks.splice(insertIndex, 0, task);
    }

    this.processQueue();
    return task;
  }

  addTasks<T>(name: string, dataArray: T[], options?: { priority?: number; maxRetries?: number }): Task<T>[] {
    return dataArray.map(data => this.addTask(name, data, options));
  }

  getPendingTasks(): Task[] {
    return this.tasks.filter(task => task.status === 'pending');
  }

  getProcessingTasks(): Task[] {
    return this.tasks.filter(task => task.status === 'processing');
  }

  getCompletedTasks(): Task[] {
    return this.tasks.filter(task => task.status === 'completed');
  }

  getFailedTasks(): Task[] {
    return this.tasks.filter(task => task.status === 'failed');
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.tasks.some(task => task.status === 'pending')) {
      const processingTasks = this.tasks.filter(task => task.status === 'processing').length;
      const availableSlots = this.concurrency - processingTasks;

      if (availableSlots > 0) {
        const pendingTasks = this.tasks
          .filter(task => task.status === 'pending')
          .sort((a, b) => b.priority - a.priority)
          .slice(0, availableSlots);

        const processPromises = pendingTasks.map(task => this.processTask(task));
        await Promise.all(processPromises);
      }

      // Small delay to prevent busy waiting
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.isProcessing = false;
  }

  private async processTask(task: Task) {
    task.status = 'processing';
    task.processedAt = new Date();

    const handler = this.handlers.get(task.name);
    if (!handler) {
      task.status = 'failed';
      task.error = new Error(`No handler registered for task: ${task.name}`);
      return;
    }

    try {
      await handler(task);
      task.status = 'completed';
    } catch (error) {
      task.retries++;
      if (task.retries <= task.maxRetries) {
        // Retry after delay
        setTimeout(() => {
          task.status = 'pending';
          this.processQueue();
        }, this.retryDelay * Math.pow(2, task.retries)); // Exponential backoff
      } else {
        task.status = 'failed';
        task.error = error as Error;
      }
    }
  }

  async waitForCompletion(): Promise<void> {
    return new Promise(resolve => {
      const checkCompletion = () => {
        if (!this.isProcessing && !this.tasks.some(task => task.status === 'pending')) {
          resolve();
        } else {
          setTimeout(checkCompletion, 100);
        }
      };
      checkCompletion();
    });
  }

  clearCompletedTasks() {
    this.tasks = this.tasks.filter(task => task.status !== 'completed');
  }

  getStats() {
    return {
      total: this.tasks.length,
      pending: this.getPendingTasks().length,
      processing: this.getProcessingTasks().length,
      completed: this.getCompletedTasks().length,
      failed: this.getFailedTasks().length,
    };
  }
}