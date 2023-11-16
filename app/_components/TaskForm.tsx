"use client";

import { Button } from "@/components/ui/button";

import { FormEvent, useEffect, useState } from "react";
import { redis } from "@/lib/redis";
import { ScrollArea } from "@/components/ui/scroll-area";
import { deleteSession } from "@/lib/session";
import { DeleteIcon, EditIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface TaskFormProps {
  setAuthUser: (name: string) => void;
  authUser: string;
}

export function TaskForm({ authUser, setAuthUser }: TaskFormProps) {
  const [task, setTask] = useState("");
  const [editTask, setEditTask] = useState("");
  const [editId, setEditId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<
    Array<{
      id: string;
      task: string;
      owner: string;
      createdAt: Date;
    }>
  >([]);

  async function onTaskSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const t = {
      id: crypto.randomUUID().toString(),
      task: task,
      owner: authUser,
      createdAt: new Date(),
    };

    if (!authUser) return;
    try {
      await redis.lpush(`todo:task-${authUser}`, JSON.stringify(t));
      setTasks((prev) => [...prev, t]);
      setTask("");
    } catch (e: any) {
      console.log(e);
    }
  }

  async function onTaskEditSubmit(e: FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();

    const editIndex = tasks.findIndex((task) => task.id === id);
    const newData = tasks.map((task) => {
      console.log(task.id, id);

      if (task.id === id) {
        task.task = editTask;
      }
      return task;
    });

    const newValue = tasks.filter((task) => task.id === id);

    const success = await redis.lset(
      `todo:task-${authUser}`,
      editIndex,
      JSON.stringify({
        id: newValue[0].id,
        task: newValue[0].task,
        owner: newValue[0].owner,
        createdAt: newValue[0].createdAt,
      })
    );

    if (success === "OK") {
      toast({
        title: "successfully edited!",
      });
      setIsOpen(false);

      setEditTask("");
      setTasks([]);

      setTasks([...newData]);
    } else {
      toast({
        title: "could not edit!",
      });
      setIsOpen(false);
      setEditTask("");
      return;
    }
  }

  function handleLogout() {
    setAuthUser("");
    deleteSession({ name: "user_log" });
  }

  useEffect(() => {
    async function fetchData() {
      const rawData = await redis.lrange<{
        id: string;
        task: string;
        owner: string;
        createdAt: Date;
      }>(`todo:task-${authUser}`, 0, -1);

      setTasks([...rawData]);
    }
    fetchData();
  }, []);

  async function handelDelete(id: string) {
    const deleteValue = tasks.filter((task) => task.id === id);

    const newTasks = tasks.filter((task) => task.id !== id);
    await redis.lrem(
      `todo:task-${authUser}`,
      1,
      JSON.stringify({
        id: deleteValue[0].id,
        task: deleteValue[0].task,
        owner: deleteValue[0].owner,
        createdAt: deleteValue[0].createdAt,
      })
    );

    setTasks([...newTasks]);
  }

  return (
    <>
      {authUser && (
        <div className=" mb-6 flex justify-center items-center gap-3">
          <h2 className="text-center text-xl">
            Welcome <strong>{authUser}</strong>
          </h2>
          <Button variant={"destructive"} onClick={handleLogout}>
            Logout
          </Button>
        </div>
      )}

      {/* to do tasks form */}
      <form
        onSubmit={onTaskSubmit}
        className="flex justify-between  items-center w-[40%] m-auto "
      >
        <input
          required
          className="w-full text-lg  flex h-10 rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="tasks to do..."
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <Button className="text-lg" size={"lg"} type="submit">
          Add
        </Button>
      </form>
      <ScrollArea className="h-[500px] m-auto w-[40%]">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="text-xl flex justify-between items-center my-3"
          >
            <h3>
              {index + 1}. {task.task}
            </h3>
            <div className="flex items-center gap-3">
              <Button
                variant={"destructive"}
                onClick={() => handelDelete(task.id)}
              >
                <DeleteIcon />{" "}
              </Button>

              <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                  setEditId(task.id);
                  setEditTask(task.task);
                  setIsOpen(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <EditIcon />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit &quot;{editTask}&quot;</DialogTitle>
                  </DialogHeader>

                  <form
                    onSubmit={(e) => onTaskEditSubmit(e, editId)}
                    className=" flex flex-col justify-between  items-center w-full m-auto gap-4"
                  >
                    <input
                      required
                      className="w-full text-lg  flex h-10 rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="edit"
                      type="text"
                      value={editTask}
                      onChange={(e) => setEditTask(e.target.value)}
                    />
                    <Button className="text-lg" size={"lg"} type="submit">
                      Edit
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </ScrollArea>
    </>
  );
}
