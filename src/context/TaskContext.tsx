import React, { createContext, useContext, useState, useEffect } from "react";
import type { Task, TaskList } from "../types";

interface TaskContextType {
  lists: (TaskList & { visible: boolean })[];
  tasks: Task[];
  activeListId: string;
  setActiveListId: (id: string) => void;

  addTask: (title: string, listId?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleListVisibility: (id: string) => void;
  updateListTitle: (id: string, title: string) => void;
  updateTaskTitle: (id: string, title: string) => void;
  toggleImportant: (id: string) => void;
  moveTask: (taskId: string, newListId: string) => void;
  setTaskDeadline: (taskId: string, date: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  addList: (title: string) => void;
  deleteList: (id: string) => void;
  clearCompleted: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [lists, setLists] = useState<(TaskList & { visible: boolean })[]>(
    () => {
      const saved = localStorage.getItem("lists");
      return saved
        ? JSON.parse(saved)
        : [{ id: "1", title: "My Tasks", visible: true }];
    },
  );
  const [activeListId, setActiveListId] = useState("all");

  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light",
  );

  //   Saving tasks when changing them
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  //   Saving lists when changing them
  useEffect(() => {
    localStorage.setItem("lists", JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const addTask = (title: string, listId?: string) => {
    let targetListId = listId;
    if (!targetListId) {
      const systemLists = ["all", "starred", "dashboard"];
      if (systemLists.includes(activeListId)) {
        // Try to find the first available real list
        if (lists.length > 0) {
          targetListId = lists[0].id;
        } else {
          // If no lists exist, create one first
          const newListId = Date.now().toString();
          setLists([{ id: newListId, title: "My Tasks", visible: true }]);
          targetListId = newListId;
        }
      } else {
        // Check if current activeListId still exists in lists
        if (lists.some(l => l.id === activeListId)) {
          targetListId = activeListId;
        } else {
          targetListId = lists.length > 0 ? lists[0].id : "1";
        }
      }
    }
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      important: activeListId === "starred",
      listId: targetListId,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const toggleListVisibility = (id: string) => {
    setLists((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const isVisible = l.visible !== false;
          return { ...l, visible: !isVisible };
        }
        return l;
      }),
    );
  };

  const updateListTitle = (id: string, title: string) => {
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, title } : l)));
  };

  const addList = (title: string) => {
    const newList = { id: Date.now().toString(), title, visible: true };
    setLists((prev) => [...prev, newList]);
    setActiveListId(newList.id);
  };

  const deleteList = (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
    setTasks((prev) => prev.filter((t) => t.listId !== id));
    if (activeListId === id) setActiveListId("all");
  };
  const updateTaskTitle = (id: string, title: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, title } : task)),
    );
  };

  const toggleImportant = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, important: !task.important } : task,
      ),
    );
  };

  const moveTask = (taskId: string, newListId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, listId: newListId } : task,
      ),
    );
  };

  const setTaskDeadline = (taskId: string, date: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, deadline: date } : task,
      ),
    );
  };

  const clearCompleted = (listId?: string) => {
    setTasks((prev) =>
      prev.filter((task) => {
        if (task.completed) {
          if (listId) return task.listId !== listId;
          return false;
        }
        return true;
      }),
    );
  };

  return (
    <TaskContext.Provider
      value={
        {
          tasks,
          lists,
          activeListId,
          theme,
          setActiveListId,
          addTask,
          toggleTask,
          deleteTask,
          toggleTheme,
          toggleListVisibility,
          updateListTitle,
          addList,
          deleteList,
          updateTaskTitle,
          toggleImportant,
          moveTask,
          setTaskDeadline,
          clearCompleted,
        } as TaskContextType
      }
    >
      {children}
    </TaskContext.Provider>
  );
};

export const UseTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
