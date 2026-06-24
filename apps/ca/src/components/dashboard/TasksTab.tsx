"use client";

import { useEffect, useState } from "react";
import { addData, getAllDocs, getDate, queryData, time } from "@repo/firebase";
import { useStore } from "@repo/store";
import toast from "react-hot-toast";

interface Task {
  uid: string;
  desc: string;
  points: string;
  deadline: time;
  award: string | undefined;
  link: string | undefined;
}

export function TasksTab() {
  const { user } = useStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [link, setLink] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const getAllTasks = async () => {
    try {
      const allTasks = await getAllDocs("tasksCA26");
      const submissions = await queryData("CAsSubmissions26", "id", user?.details?.id);

      if (submissions != null && allTasks != null) {
        const fetchedTasks: Task[] = [];
        allTasks.forEach((task: any) => {
          let newTask: Task;
          const submission = submissions.find((sub: any) => sub.data.taskId === task.uid);

          if (submission !== undefined) {
            newTask = {
              uid: task.uid,
              desc: task.data.desc,
              points: task.data.points,
              deadline: task.data.deadline,
              award: submission.data.award,
              link: submission.data.link,
            };
          } else {
            newTask = {
              uid: task.uid,
              desc: task.data.desc,
              points: task.data.points,
              deadline: task.data.deadline,
              award: undefined,
              link: undefined,
            };
          }
          fetchedTasks.push(newTask);
        });
        setTasks(fetchedTasks);
      }
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.details?.id) {
      getAllTasks();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const submit = async (task: Task) => {
    try {
      if (link !== "") {
        // [SECURITY] Validate the link is a proper https:// URL to prevent XSS via javascript: URIs
        if (!/^https:\/\/.+/.test(link.trim())) {
          toast.error("Please provide a valid https:// link as proof.");
          return;
        }
        // [SECURITY] Enforce max length to prevent storage abuse
        if (link.trim().length > 500) {
          toast.error("Link is too long. Please use a shortened URL.");
          return;
        }
        const data = {
          taskId: task.uid,
          taskDesc: task.desc,
          taskPoints: task.points,
          uid: user?.user.uid,
          id: user?.details.id,
          name: user?.details.name,
          email: user?.details.email,
          phone: user?.details.phone,
          link: link.trim(),
          college: user?.details.college,
          collegeCity: user?.details.collegeCity,
        };
        await addData("CAsSubmissions26", data);
        toast.success("Submission Accepted!");
        setLink("");
        getAllTasks();
        setIsOpen(false);
        setCurrentTask(null);
      } else {
        toast.error("Provide Link");
      }
    } catch (error) {
      // [SECURITY] Do not expose raw error to user
      console.error("Task submission error:", error);
      toast.error("Submission failed. Please try again.");
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-xl p-6 md:p-8 relative min-h-[400px]">
      
      {/* Modal Overlay */}
      {isOpen && currentTask && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl p-4">
          <div className="bg-[#111] border border-white/10 rounded-lg p-6 w-full max-w-md shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-white/40 hover:text-white"
              onClick={() => {
                setIsOpen(false);
                setCurrentTask(null);
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-sans font-bold text-white mb-4">Submit Proof</h3>
            <p className="text-sm text-white/60 mb-4 line-clamp-2">{currentTask.desc}</p>
            <div className="flex flex-col gap-2 mb-6">
              <label htmlFor="link" className="text-xs font-sans font-semibold tracking-wider text-white/40 uppercase">
                Link of Proof *
              </label>
              <input
                id="link"
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-accent"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <button
              onClick={() => submit(currentTask)}
              className="w-full py-2.5 bg-accent hover:bg-red-600 text-[12px] font-sans font-bold uppercase tracking-wider text-white rounded-md transition-colors duration-200"
            >
              SUBMIT
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/50 text-sm">Loading Tasks...</div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/50 text-sm">No tasks available.</div>
        </div>
      ) : (
      <div className="flex flex-col w-full">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 text-[11px] font-sans font-semibold tracking-[0.18em] text-white/40 uppercase pb-5 px-6 md:px-8 border-b border-white/5">
          <div className="col-span-6">DESCRIPTION</div>
          <div className="col-span-3">DEADLINE</div>
          <div className="col-span-1 text-center">POINTS</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col mt-2">
          {tasks.map((task) => (
            <div
              key={task.uid}
              className="grid grid-cols-12 items-center py-4.5 px-6 md:px-8 border-b border-white/5 last:border-none min-h-[72px] gap-3 md:gap-0 transition-all duration-200 hover:bg-white/[0.015]"
            >
              {/* Description */}
              <div className="col-span-12 md:col-span-6 pr-0 md:pr-6">
                <span className="text-[14px] md:text-[15px] font-sans font-medium text-white leading-relaxed break-words">
                  {task.desc}
                </span>
              </div>

              {/* Deadline */}
              <div className="col-span-6 md:col-span-3 flex items-center">
                <svg
                  className="w-4 h-4 text-white/40 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
                <span className="text-[13px] font-sans font-medium text-white/60">
                  {task.deadline ? getDate(task.deadline).toString() : "No Deadline"}
                </span>
              </div>

              {/* Points */}
              <div className="col-span-2 md:col-span-1 text-center md:text-center flex justify-start md:justify-center">
                <span className="text-[14px] md:text-[15px] font-sans font-semibold text-white/90">
                  {task.points}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-4 md:col-span-2 text-right">
                {task.link !== undefined ? (
                  <span className="text-[12px] font-sans font-bold uppercase tracking-wider text-white/70">
                    {task.award !== undefined ? `Awarded: ${task.award}` : "In Review"}
                  </span>
                ) : (
                  <button 
                    onClick={() => {
                      setCurrentTask(task);
                      setIsOpen(true);
                    }}
                    className="w-full max-w-[96px] md:max-w-none md:w-28 py-2 bg-accent hover:bg-red-600 active:bg-accent text-[11px] font-sans font-bold uppercase tracking-wider text-white rounded-md transition-colors duration-200 shadow-lg shadow-accent/10"
                  >
                    SUBMIT
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}
