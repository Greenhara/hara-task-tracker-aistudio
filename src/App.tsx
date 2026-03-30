import { useEffect, useState } from "react";
import { UseTaskContext } from "./context/TaskContext";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Plus, Search, Star, LayoutGrid, LayoutList, Moon, Sun, Trash2, Edit2, Dice5, ChevronRight, ChevronDown } from "lucide-react";

function App() {
  const {
    theme,
    toggleTheme,
    toggleImportant,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    lists,
    activeListId,
    setActiveListId,
    updateTaskTitle,
    updateListTitle,
    addList,
    deleteList,
    moveTask,
    setTaskDeadline,
    clearCompleted,
    toggleListVisibility,
  } = UseTaskContext();

  const [isCompletedOpen, setIsCompletedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedTask, setHighlightedTask] = useState<string | null>(null);
  const [hoveredListId, setHoveredListId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [expandedCompletedListId, setExpandedCompletedListId] = useState<string | null>(null);
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingHeaderListId, setEditingHeaderListId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [headerEditValue, setHeaderEditValue] = useState("");

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [diceMessage, setDiceMessage] = useState(false);

  const activeList = lists.find((l) => l.id === activeListId);
  const filteredTasks = (
    activeListId === "all" || activeListId === "dashboard"
      ? tasks
      : activeListId === "starred"
        ? tasks.filter((t) => t.important)
        : tasks.filter((t) => t.listId === activeListId)
  )
    .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.important !== b.important) return a.important ? -1 : 1;
      return 0;
    });

  const getTaskCount = (listId: string) => {
    if (listId === "all") return tasks.length;
    if (listId === "starred") return tasks.filter((t) => t.important).length;
    return tasks.filter((t) => t.listId === listId).length;
  };

  const pickRandomTask = () => {
    const activeTasks = filteredTasks.filter((t) => !t.completed);
    if (activeTasks.length === 0) {
      setDiceMessage(true);
      setTimeout(() => setDiceMessage(false), 3000);
      return;
    }

    const randomTask =
      activeTasks[Math.floor(Math.random() * activeTasks.length)];

    setHighlightedTask(randomTask.id);
    
    setTimeout(() => {
      const element = document.getElementById(`task-${randomTask.id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);

    setTimeout(() => {
      setHighlightedTask(null);
    }, 3000);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8 pr-12 lg:pr-0">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-black/5 rounded-full transition-colors hover:cursor-pointer"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <h1 className="text-xl font-bold">My Tasks</h1>
        </div>
      </div>
      <button
        onClick={() => setIsAddListModalOpen(true)}
        className="mb-6 w-full py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20"
      >
        <Plus size={20} />
        <span>New List</span>
      </button>

      <nav className="space-y-1 flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div
          onClick={() => {
            setActiveListId("all");
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
          className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${activeListId === "all" ? "bg-[var(--highlight)] shadow-sm" : "hover:bg-black/5"}`}
        >
          <LayoutList size={18} className="text-blue-500" />
          <span className="text-sm font-medium">All Tasks</span>
          <span className="ml-auto text-xs opacity-40">{getTaskCount("all")}</span>
        </div>

        <div
          onClick={() => {
            setActiveListId("dashboard");
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
          className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${activeListId === "dashboard" ? "bg-[var(--highlight)] shadow-sm" : "hover:bg-black/5"}`}
        >
          <LayoutGrid size={18} className="text-purple-500" />
          <span className="text-sm font-medium">All Lists</span>
          <span className="ml-auto text-xs opacity-40">{lists.length}</span>
        </div>

        <div
          onClick={() => {
            setActiveListId("starred");
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
          className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${activeListId === "starred" ? "bg-[var(--highlight)] shadow-sm" : "hover:bg-black/5"}`}
        >
          <Star size={18} className="text-yellow-500" />
          <span className="text-sm font-medium">Starred</span>
          <span className="ml-auto text-xs opacity-40">{getTaskCount("starred")}</span>
        </div>

        <div className="text-[10px] font-bold opacity-80 mt-6 mb-2 uppercase tracking-widest px-3">
          Your Lists
        </div>

        {lists.map((list) => (
          <div
            key={list.id}
            onClick={() => {
              setActiveListId(list.id);
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            onMouseEnter={() => setHoveredListId(list.id)}
            onMouseLeave={() => setHoveredListId(null)}
            className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${activeListId === list.id ? "bg-[var(--highlight)] shadow-sm" : hoveredListId === list.id ? "bg-black/5" : "hover:bg-black/5"}`}
          >
            <input
              type="checkbox"
              checked={list.visible !== false}
              onClick={(e) => e.stopPropagation()}
              onChange={() => toggleListVisibility(list.id)}
              className="w-4 h-4 accent-[var(--primary)] cursor-pointer shrink-0"
            />
            {editingListId === list.id ? (
              <input
                autoFocus
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  if (editValue && editValue !== list.title) updateListTitle(list.id, editValue);
                  setEditingListId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (editValue && editValue !== list.title) updateListTitle(list.id, editValue);
                    setEditingListId(null);
                  }
                  if (e.key === "Escape") setEditingListId(null);
                }}
                className="bg-black/5 rounded px-1 outline-none w-full text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate text-sm font-medium flex-1">{list.title}</span>
            )}
            <span className="ml-2 text-[10px] opacity-40 shrink-0">{getTaskCount(list.id)}</span>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditValue(list.title);
                  setEditingListId(list.id);
                }}
                className="p-1 hover:bg-black/10 rounded-lg opacity-40 hover:opacity-100 transition-all cursor-pointer"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setListToDelete(list.id);
                }}
                className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-red-500 p-1 hover:bg-red-50 rounded transition-all cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen || window.innerWidth >= 1024 ? 0 : -280,
          width: window.innerWidth >= 1024 ? 280 : 280,
        }}
        className={`fixed lg:relative top-0 bottom-0 left-0 z-50 bg-[var(--white)] p-6 border-r border-[var(--secondary)] flex flex-col shadow-xl lg:shadow-none`}
      >
        <SidebarContent />
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-6 right-4 p-2 lg:hidden hover:bg-black/5 rounded-full"
        >
          <X size={20} />
        </button>
      </motion.aside>

      {/* Main Part */}
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden w-full">
        <header className="flex items-center gap-4 mb-6 md:mb-8">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 lg:hidden hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {editingHeaderListId === activeListId &&
            activeListId !== "all" &&
            activeListId !== "starred" &&
            activeListId !== "dashboard" ? (
              <input
                autoFocus
                type="text"
                value={headerEditValue}
                onChange={(e) => setHeaderEditValue(e.target.value)}
                onBlur={() => {
                  if (headerEditValue.trim() && headerEditValue !== activeList?.title) {
                    updateListTitle(activeListId, headerEditValue.trim());
                  }
                  setEditingHeaderListId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (headerEditValue.trim() && headerEditValue !== activeList?.title) {
                      updateListTitle(activeListId, headerEditValue.trim());
                    }
                    setEditingHeaderListId(null);
                  }
                  if (e.key === "Escape") {
                    setEditingHeaderListId(null);
                  }
                }}
                className="text-2xl md:text-3xl font-black bg-black/5 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-[var(--primary)] w-full"
              />
            ) : (
              <div className="flex items-center gap-3 group">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  {activeListId === "all"
                    ? "All Tasks"
                    : activeListId === "starred"
                      ? "Starred"
                      : activeListId === "dashboard"
                        ? "Dashboard"
                        : activeList?.title}
                </h1>
                {activeListId !== "all" &&
                  activeListId !== "starred" &&
                  activeListId !== "dashboard" && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHeaderEditValue(activeList?.title || "");
                          setEditingHeaderListId(activeListId);
                        }}
                        className="p-2 hover:bg-black/10 rounded-xl transition-all cursor-pointer"
                      >
                        <Edit2 size={20} className="text-[var(--primary)]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setListToDelete(activeListId);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  )}
              </div>
            )}
          </div>
        </header>

        {/* Progress Bar Section */}
        {activeListId !== "dashboard" && (
          <div className="flex flex-col gap-4 mb-6">
            {filteredTasks.length > 0 && (
              <div className="p-4 bg-[var(--white)] rounded-2xl border border-[var(--highlight)] shadow-sm">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Progress</p>
                    <h2 className="text-lg font-bold">
                      {filteredTasks.filter((t) => t.completed).length} / {filteredTasks.length}
                    </h2>
                  </div>
                  <span className="text-sm font-bold text-[var(--primary)]">
                    {Math.round((filteredTasks.filter((t) => t.completed).length / filteredTasks.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(filteredTasks.filter((t) => t.completed).length / filteredTasks.length) * 100}%`,
                    }}
                    className="h-full bg-[var(--primary)]"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search Task"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-black/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg"
                />
              </div>

              <div className="flex-1 relative">
                <Plus
                  className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Press enter to add Task"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTaskTitle) {
                      addTask(
                        newTaskTitle,
                        activeListId === "all" || activeListId === "starred"
                          ? "all"
                          : activeListId,
                      );
                      setNewTaskTitle("");
                    }
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-[var(--white)] rounded-2xl shadow-sm border border-[var(--secondary)] outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {activeListId === "dashboard" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 pt-2">
              {lists
                .filter((list) => list.visible !== false)
                .map((list) => {
                  const listActiveTasks = tasks.filter((t) => t.listId === list.id && !t.completed);
                  const listCompletedTasks = tasks.filter((t) => t.listId === list.id && t.completed);
                  return (
                    <motion.div
                      layout
                      key={list.id}
                      onClick={() => setActiveListId(list.id)}
                      className="p-5 bg-[var(--white)] rounded-2xl border border-[var(--highlight)] shadow-sm hover:shadow-md hover:border-[var(--primary)]/30 transition-all cursor-pointer group flex flex-col h-fit max-h-[400px]"
                    >
                      <div className="flex justify-between items-start mb-4 shrink-0">
                        <h3 className="text-lg font-bold group-hover:text-[var(--primary)] transition-colors truncate pr-2">
                          {list.title}
                        </h3>
                        <span className="text-[10px] font-bold opacity-30 bg-[var(--highlight)] px-2 py-1 rounded-lg">
                          {getTaskCount(list.id)}
                        </span>
                      </div>

                      <input
                        type="text"
                        placeholder="+ Add task"
                        onClick={(e) => e.stopPropagation()}
                        className="mb-4 p-2 text-xs bg-black/5 rounded-lg outline-none focus:ring-1 focus:ring-[var(--primary)] border-none shrink-0"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value) {
                            e.stopPropagation();
                            addTask(e.currentTarget.value, list.id);
                            e.currentTarget.value = "";
                          }
                        }}
                      />

                      <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                        {listActiveTasks.length > 0 ? (
                          listActiveTasks.map((t) => {
                            const isHighLighted = highlightedTask === t.id;
                            return (
                              <div
                                key={t.id}
                                id={`task-${t.id}`}
                                className={`text-sm flex items-center gap-2 group/item p-1 rounded transition-all ${isHighLighted ? "bg-[var(--primary)] text-white font-bold scale-[1.02] shadow-sm" : ""}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={t.completed}
                                  onChange={() => toggleTask(t.id)}
                                  className="w-4 h-4 accent-[var(--primary)] cursor-pointer shrink-0"
                                />
                                <span className="break-words leading-tight flex-1">{t.title}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(t.id);
                                  }}
                                  className={`text-red-500 p-1 hover:bg-red-50 rounded transition-all ${isHighLighted ? "opacity-100 bg-white/20" : "opacity-0 group-hover/item:opacity-100"}`}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs italic opacity-40">No active tasks</p>
                        )}

                        {listCompletedTasks.length > 0 && (
                          <div className="mt-4 pt-2 border-t border-black/5">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedCompletedListId(expandedCompletedListId === list.id ? null : list.id);
                                }}
                                className="flex items-center justify-between flex-1 text-[10px] font-bold opacity-60 uppercase hover:opacity-100 transition-opacity bg-black/5 p-1.5 rounded-lg"
                              >
                                <span>Completed ({listCompletedTasks.length})</span>
                                <ChevronDown size={12} className={`transition-transform ${expandedCompletedListId === list.id ? "rotate-180" : ""}`} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Clear all completed tasks in "${list.title}"?`)) {
                                    clearCompleted(list.id);
                                  }
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Clear completed"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <AnimatePresence>
                              {expandedCompletedListId === list.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="space-y-1 opacity-50 pb-2">
                                    {listCompletedTasks.map((t) => (
                                      <div key={t.id} className="text-xs flex items-center gap-2 group/comp" onClick={(e) => e.stopPropagation()}>
                                        <input
                                          type="checkbox"
                                          checked={t.completed}
                                          onChange={() => toggleTask(t.id)}
                                          className="w-3 h-3 accent-[var(--primary)] cursor-pointer shrink-0"
                                        />
                                        <span className="line-through truncate flex-1">{t.title}</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteTask(t.id);
                                          }}
                                          className="opacity-100 text-red-500 p-1.5 hover:bg-red-50 rounded transition-all"
                                          title="Delete Task"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTasks
                  .filter((t) => !t.completed)
                  .map((task) => {
                    const isDuplicate =
                      filteredTasks.filter((t) => t.title.toLowerCase().trim() === task.title.toLowerCase().trim()).length > 1;
                    const isOverdue =
                      task.deadline &&
                      new Date(task.deadline).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) &&
                      !task.completed;
                    const isHighLighted = highlightedTask === task.id;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={task.id}
                        className={`group p-3 md:p-4 rounded-xl shadow-sm border transition-all duration-300 flex items-center justify-between ${
                          isHighLighted
                            ? "bg-[var(--primary)] text-white scale-[1.02] shadow-lg border-transparent ring-4 ring-[var(--primary)]/30"
                            : isDuplicate
                              ? "bg-[var(--highlight)] border-[var(--primary)]/30"
                              : "bg-[var(--white)] border-[var(--highlight)]"
                        } ${isOverdue ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : ""}`}
                      >
                        <div id={`task-${task.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="w-5 h-5 accent-[var(--primary)] cursor-pointer shrink-0"
                          />
                          {editingTaskId === task.id ? (
                            <input
                              autoFocus
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => {
                                if (editValue && editValue !== task.title) updateTaskTitle(task.id, editValue);
                                setEditingTaskId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  if (editValue && editValue !== task.title) updateTaskTitle(task.id, editValue);
                                  setEditingTaskId(null);
                                }
                                if (e.key === "Escape") setEditingTaskId(null);
                              }}
                              className="bg-black/5 rounded px-1 outline-none w-full text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span
                              onClick={() => {
                                setEditValue(task.title);
                                setEditingTaskId(task.id);
                              }}
                              className={`cursor-pointer transition-colors truncate ${task.completed ? "line-through opacity-50" : ""} ${
                                isHighLighted ? "text-white font-bold" : "hover:text-[var(--primary)]"
                              }`}
                            >
                              {task.title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 shrink-0">
                          <select
                            value={task.listId}
                            onChange={(e) => moveTask(task.id, e.target.value)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] bg-[var(--highlight)] rounded p-1 outline-none cursor-pointer transition-all max-w-[70px] md:max-w-[100px] truncate"
                            title="Move to list"
                          >
                            <option value="all">No List</option>
                            {lists.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="date"
                            value={task.deadline || ""}
                            onChange={(e) => setTaskDeadline(task.id, e.target.value)}
                            className={`text-[10px] bg-[var(--highlight)] rounded p-1 outline-none cursor-pointer transition-all ${isOverdue ? "text-red-500 font-bold opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          />
                          <button
                            onClick={() => toggleImportant(task.id)}
                            className={`p-1 transition-all hover:scale-125 ${
                              task.important ? "text-yellow-400" : "text-gray-300 opacity-0 group-hover:opacity-100"
                            }`}
                          >
                            {task.important ? <Star size={16} fill="currentColor" /> : <Star size={16} />}
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:scale-110 transition-all p-1 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>

              {filteredTasks.some((t) => t.completed) && (
                <div className="mt-8 border-t border-[var(--highlight)] pt-4">
                  <button
                    onClick={() => setIsCompletedOpen(!isCompletedOpen)}
                    className="flex items-center gap-2 text-sm font-bold opacity-50 hover:opacity-100 transition-all mb-4 cursor-pointer"
                  >
                    {isCompletedOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    Completed ({filteredTasks.filter((t) => t.completed).length})
                  </button>
                  <AnimatePresence>
                    {isCompletedOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        {filteredTasks
                          .filter((t) => t.completed)
                          .map((task) => (
                            <div
                              key={task.id}
                              className="group p-3 md:p-4 bg-[var(--white)] rounded-xl shadow-sm border border-[var(--highlight)] flex items-center justify-between opacity-60"
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => toggleTask(task.id)}
                                  className="w-5 h-5 accent-[var(--primary)] cursor-pointer"
                                />
                                <span className="line-through truncate">{task.title}</span>
                              </div>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 text-red-500 p-1 cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        <button
                          onClick={() => setIsClearModalOpen(true)}
                          className="w-full py-3 text-xs text-red-500 border border-dashed border-red-200 rounded-xl hover:bg-red-50 transition-all mt-4 cursor-pointer font-bold"
                        >
                          Clear all completed tasks
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {filteredTasks.length === 0 && <p className="text-center opacity-60 mt-10">No tasks in this list yet</p>}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={pickRandomTask}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center text-2xl z-50 border-4 border-white/20"
      >
        <Dice5 size={28} />
      </motion.button>
      {/* Clear Completed Tasks Modal */}
      <AnimatePresence>
        {isClearModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsClearModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[var(--white)] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-2">Clear Completed Tasks?</h2>
              <p className="text-sm opacity-60 mb-6">This will permanently delete all completed tasks in this list. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsClearModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-medium hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearCompleted(activeListId !== "all" && activeListId !== "starred" && activeListId !== "dashboard" ? activeListId : undefined);
                    setIsClearModalOpen(false);
                  }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {listToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setListToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[var(--white)] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-2">Delete List?</h2>
              <p className="text-sm opacity-60 mb-6">This will permanently delete this list and all its tasks. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setListToDelete(null)}
                  className="flex-1 py-3 rounded-xl font-medium hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteList(listToDelete);
                    setListToDelete(null);
                  }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAddListModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddListModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[var(--white)] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-4">Create New List</h2>
              <input
                autoFocus
                type="text"
                placeholder="List Name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newListName) {
                    addList(newListName);
                    setNewListName("");
                    setIsAddListModalOpen(false);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }
                }}
                className="w-full p-3 rounded-xl bg-black/5 border-none outline-none focus:ring-2 focus:ring-[var(--primary)] mb-6"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAddListModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-medium hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newListName) {
                      addList(newListName);
                      setNewListName("");
                      setIsAddListModalOpen(false);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }
                  }}
                  className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Create List
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {diceMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--text)] text-[var(--bg)] px-6 py-3 rounded-full shadow-2xl z-50 font-medium whitespace-nowrap"
          >
            There is no task to choose from
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
