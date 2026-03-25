export interface Task {
  id: string;
  listId: string;
  title: string;
  completed: boolean;
  important: boolean;
  deadline?: string;
}

export interface TaskList {
  id: string;
  title: string;
}
